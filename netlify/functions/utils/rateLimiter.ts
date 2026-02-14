/**
 * Distributed Rate Limiter
 * 
 * Supports both in-memory (fallback) and Redis/Upstash (distributed)
 * 
 * Priority: Redis > In-Memory
 */

interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
  error?: string;
  remaining?: number;
  resetAt?: number;
}

interface RateLimitConfig {
  perMinute: number;
  perHour: number;
  perDay: number;
  minDelay: number;
  maxDailyRequests?: number;
}

/**
 * Distributed rate limiting with Redis/Upstash fallback to in-memory
 */
export async function checkDistributedRateLimit(
  ip: string,
  fingerprint: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  // Try Redis/Upstash if configured
  if (upstashUrl && upstashToken) {
    try {
      return await checkRateLimitRedis(ip, fingerprint, config, upstashUrl, upstashToken);
    } catch (error) {
      console.warn('[Rate Limiter] Redis error, falling back to memory:', error);
      // Fall through to in-memory
    }
  }
  
  // Fallback to in-memory rate limiting
  return checkRateLimitMemory(ip, config);
}

/**
 * Redis/Upstash-based distributed rate limiting
 */
async function checkRateLimitRedis(
  ip: string,
  fingerprint: string,
  config: RateLimitConfig,
  redisUrl: string,
  redisToken: string
): Promise<RateLimitResult> {
  const now = Date.now();
  const minute = Math.floor(now / 60000);
  const hour = Math.floor(now / 3600000);
  const day = Math.floor(now / 86400000);
  
  const keys = {
    minute: `rate:${ip}:${fingerprint}:minute:${minute}`,
    hour: `rate:${ip}:${fingerprint}:hour:${hour}`,
    day: `rate:${ip}:${fingerprint}:day:${day}`,
    global: `rate:global:day:${day}`,
    lastRequest: `rate:${ip}:${fingerprint}:last`,
  };
  
  try {
    // Use Upstash REST API for atomic operations
    const pipeline = [
      ['INCR', keys.minute],
      ['EXPIRE', keys.minute, '60'],
      ['INCR', keys.hour],
      ['EXPIRE', keys.hour, '3600'],
      ['INCR', keys.day],
      ['EXPIRE', keys.day, '86400'],
      ['GET', keys.lastRequest],
      ['SET', keys.lastRequest, now.toString()],
      ['EXPIRE', keys.lastRequest, '3600'],
    ];
    
    if (config.maxDailyRequests) {
      pipeline.push(['INCR', keys.global]);
      pipeline.push(['EXPIRE', keys.global, '86400']);
    }
    
    // Execute via Upstash REST API
    // Format: POST to base URL with body ["COMMAND", "arg1", "arg2", ...]
    // See: https://upstash.com/docs/redis/features/restapi
    const responses = await Promise.all(
      pipeline.map(([command, ...args]) =>
        fetch(redisUrl.replace(/\/$/, ''), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${redisToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([command, ...args]),
        }).then(r => r.json())
      )
    );
    
    const minuteCount = responses[0].result || 0;
    const hourCount = responses[2].result || 0;
    const dayCount = responses[4].result || 0;
    const lastRequest = responses[6].result ? parseInt(responses[6].result) : 0;
    const globalCount = config.maxDailyRequests ? (responses[8]?.result || 0) : 0;
    
    // Check global daily limit
    if (config.maxDailyRequests && globalCount >= config.maxDailyRequests) {
      return {
        allowed: false,
        error: 'Global daily request limit reached. Please try again tomorrow.',
        resetAt: (day + 1) * 86400000,
      };
    }
    
    // Check per-minute limit
    if (minuteCount > config.perMinute) {
      const resetAt = (minute + 1) * 60000;
      return {
        allowed: false,
        retryAfter: Math.ceil((resetAt - now) / 1000),
        error: `Rate limit exceeded: ${config.perMinute} requests per minute`,
        remaining: 0,
        resetAt,
      };
    }
    
    // Check per-hour limit
    if (hourCount > config.perHour) {
      const resetAt = (hour + 1) * 3600000;
      return {
        allowed: false,
        retryAfter: Math.ceil((resetAt - now) / 1000),
        error: `Rate limit exceeded: ${config.perHour} requests per hour`,
        remaining: 0,
        resetAt,
      };
    }
    
    // Check per-day limit
    if (dayCount > config.perDay) {
      const resetAt = (day + 1) * 86400000;
      return {
        allowed: false,
        error: `Rate limit exceeded: ${config.perDay} requests per day`,
        remaining: 0,
        resetAt,
      };
    }
    
    // Check minimum delay
    if (lastRequest > 0 && (now - lastRequest) < config.minDelay) {
      const retryAfter = Math.ceil((config.minDelay - (now - lastRequest)) / 1000);
      return {
        allowed: false,
        retryAfter,
        error: `Please wait ${retryAfter} seconds between requests`,
        remaining: config.perMinute - minuteCount,
      };
    }
    
    return {
      allowed: true,
      remaining: config.perMinute - minuteCount,
      resetAt: (minute + 1) * 60000,
    };
  } catch (error) {
    console.error('[Rate Limiter] Redis error:', error);
    throw error; // Will fall back to in-memory
  }
}

/**
 * In-memory rate limiting (fallback)
 */
const memoryStore = new Map<string, {
  requests: number[];
  dailyCount: number;
  lastReset: number;
  lastRequest: number;
}>();

function checkRateLimitMemory(ip: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  
  // Get or create rate limit data
  let data = memoryStore.get(ip);
  if (!data) {
    data = {
      requests: [],
      dailyCount: 0,
      lastReset: now,
      lastRequest: 0,
    };
    memoryStore.set(ip, data);
  }
  
  // Reset daily counter if needed
  if (now - data.lastReset > 24 * 60 * 60 * 1000) {
    data.dailyCount = 0;
    data.lastReset = now;
  }
  
  // Clean old requests (older than 1 hour)
  data.requests = data.requests.filter(timestamp => now - timestamp < 60 * 60 * 1000);
  
  // Check per-minute limit
  const requestsLastMinute = data.requests.filter(timestamp => now - timestamp < 60 * 1000).length;
  if (requestsLastMinute >= config.perMinute) {
    const resetAt = now + 60000;
    return {
      allowed: false,
      retryAfter: 60,
      error: `Rate limit exceeded: ${config.perMinute} requests per minute`,
      remaining: 0,
      resetAt,
    };
  }
  
  // Check per-hour limit
  if (data.requests.length >= config.perHour) {
    const resetAt = now + 3600000;
    return {
      allowed: false,
      retryAfter: 3600,
      error: `Rate limit exceeded: ${config.perHour} requests per hour`,
      remaining: 0,
      resetAt,
    };
  }
  
  // Check per-day limit
  if (data.dailyCount >= config.perDay) {
    const resetAt = data.lastReset + 24 * 60 * 60 * 1000;
    return {
      allowed: false,
      error: `Rate limit exceeded: ${config.perDay} requests per day`,
      remaining: 0,
      resetAt,
    };
  }
  
  // Check minimum delay
  if (data.lastRequest > 0 && (now - data.lastRequest) < config.minDelay) {
    const retryAfter = Math.ceil((config.minDelay - (now - data.lastRequest)) / 1000);
    return {
      allowed: false,
      retryAfter,
      error: `Please wait ${retryAfter}ms between requests`,
      remaining: config.perMinute - requestsLastMinute,
    };
  }
  
  // All checks passed - add request
  data.requests.push(now);
  data.dailyCount++;
  data.lastRequest = now;
  
  return {
    allowed: true,
    remaining: config.perMinute - requestsLastMinute - 1,
    resetAt: now + 60000,
  };
}


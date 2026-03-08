import { db } from './database-client';
import type { Database } from '@/lib/supabase';

type OwnerAvailabilityRow = Database['public']['Tables']['owner_availability']['Row'];
type ConsultationBookingRow = Database['public']['Tables']['consultation_bookings']['Row'];

export type AvailabilitySchedule = Record<string, { start: string; end: string }>;

export interface CreateBookingInput {
  fullName?: string;
  phone?: string;
  email?: string;
  notes?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24h)
}

/**
 * Load owner availability as a simple date → {start, end} map.
 */
export async function getOwnerAvailabilitySchedule(): Promise<AvailabilitySchedule> {
  const rows = await db.select<OwnerAvailabilityRow>('owner_availability', {
    orderBy: { column: 'availability_date', ascending: true },
  });

  const schedule: AvailabilitySchedule = {};
  for (const row of rows) {
    const date = row.availability_date;
    // Normalize times to HH:MM
    const start = row.start_time.slice(0, 5);
    const end = row.end_time.slice(0, 5);
    schedule[date] = { start, end };
  }
  return schedule;
}

/**
 * Upsert a single-day availability window.
 */
export async function upsertOwnerAvailability(date: string, start: string, end: string): Promise<void> {
  // Normalize to 5-char HH:MM, then to HH:MM:SS for storage
  const normalize = (t: string) => (t.length === 5 ? `${t}:00` : t);

  // Try to find existing row for that date
  const existing = await db.selectOne<OwnerAvailabilityRow>('owner_availability', {
    availability_date: date,
  });

  if (existing) {
    await db.update<OwnerAvailabilityRow>('owner_availability', { id: existing.id }, {
      start_time: normalize(start),
      end_time: normalize(end),
    });
  } else {
    await db.insert<OwnerAvailabilityRow>('owner_availability', {
      availability_date: date,
      start_time: normalize(start),
      end_time: normalize(end),
    });
  }
}

/**
 * Remove availability for a given date.
 */
export async function deleteOwnerAvailability(date: string): Promise<void> {
  await db.delete('owner_availability', { availability_date: date });
}

/**
 * Fetch consultation bookings that are relevant for availability:
 * current and future bookings (older ones are ignored on the client).
 */
export async function getAllConsultationBookings(): Promise<ConsultationBookingRow[]> {
  const rows = await db.select<ConsultationBookingRow>('consultation_bookings', {
    orderBy: { column: 'scheduled_date', ascending: true },
  });
  return Array.isArray(rows) ? rows : [];
}

/**
 * Create a consultation booking for a specific date/time slot.
 * This is called from the Wedding & Events page.
 */
export async function createConsultationBooking(input: CreateBookingInput): Promise<ConsultationBookingRow> {
  const normalize = (t: string) => (t.length === 5 ? `${t}:00` : t);

  const payload = {
    full_name: input.fullName?.trim() || null,
    phone: input.phone?.trim() || null,
    email: input.email?.trim().toLowerCase() || null,
    notes: input.notes?.trim() || null,
    scheduled_date: input.date,
    scheduled_time: normalize(input.time),
  };

  const row = await db.insert<ConsultationBookingRow>('consultation_bookings', payload, {
    select: 'id, full_name, phone, email, notes, scheduled_date, scheduled_time, created_at',
  });

  return row;
}


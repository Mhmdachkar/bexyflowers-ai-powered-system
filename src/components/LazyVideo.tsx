'use client';

import { useEffect, useRef, useState, useMemo, CSSProperties } from 'react';

interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  style?: CSSProperties;
  /** Root margin for IntersectionObserver — how far ahead to start loading (default 300px) */
  rootMargin?: string;
  /** aria-label for accessibility */
  ariaLabel?: string;
}

/**
 * LazyVideo
 *
 * A mobile-optimised background video component that:
 * - Skips entirely on iOS (no WebM / autoplay restrictions)
 * - Skips on slow connections (2G / slow-3G via Network Information API)
 * - Starts loading 300 px before the element enters the viewport so video
 *   is already buffering by the time the user sees it
 * - Uses preload="metadata" so the browser knows the duration/dimensions
 *   immediately and can allocate the frame buffer before data arrives
 * - Shows the poster image while buffering and fades the video in when
 *   it can play without stalling (canplaythrough)
 * - Pauses when scrolled out of view to save CPU / battery
 */
const LazyVideo = ({
  src,
  poster,
  className = '',
  style,
  rootMargin = '300px',
  ariaLabel = 'Background video',
}: LazyVideoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const shouldSkip = useMemo(() => {
    if (typeof navigator === 'undefined') return true;

    // Skip on iOS — Safari does not support WebM and has strict autoplay rules
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) return true;

    // Skip on slow connections (2G / slow-3G) — video will never play smoothly
    const nav = navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean };
    };
    const conn = nav.connection;
    if (conn) {
      if (conn.saveData) return true; // Honour "Data Saver" mode
      if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') return true;
    }

    return false;
  }, []);

  // IntersectionObserver: start loading well before visible, pause off-screen
  useEffect(() => {
    if (shouldSkip) return;
    const target = containerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = videoRef.current;
          if (entry.isIntersecting) {
            setShouldLoad(true);
            if (video && video.readyState >= 3) {
              video.play().catch(() => {});
            }
          } else {
            if (video && !video.paused) {
              video.pause();
            }
          }
        });
      },
      { root: null, rootMargin, threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [shouldSkip, rootMargin]);

  // Once the source is in the DOM, load & play
  useEffect(() => {
    if (!shouldLoad || shouldSkip) return;
    const video = videoRef.current;
    if (!video) return;

    video.load();

    const onCanPlay = () => {
      setIsPlaying(true);
      video.play().catch(() => {});
    };

    video.addEventListener('canplaythrough', onCanPlay, { once: true });
    // Fallback: if canplaythrough fires late, start on canplay too
    video.addEventListener('canplay', onCanPlay, { once: true });

    return () => {
      video.removeEventListener('canplaythrough', onCanPlay);
      video.removeEventListener('canplay', onCanPlay);
    };
  }, [shouldLoad, shouldSkip]);

  // On iOS or slow connections render only the poster as a static background fallback
  if (shouldSkip) {
    if (!poster) return null;
    return (
      <div className={`lazy-video-wrapper ${className}`} style={style} aria-hidden="true">
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className="lazy-video-poster"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`lazy-video-wrapper ${className}`} style={style} aria-hidden="true">
      {/* Poster shown while video buffers */}
      {poster && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className="lazy-video-poster"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: isPlaying ? 0 : 1,
            transition: 'opacity 0.6s ease',
            zIndex: 1,
          }}
        />
      )}

      <video
        ref={videoRef}
        className="lazy-video-el"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          opacity: isPlaying ? 1 : 0,
          transition: 'opacity 0.6s ease',
          zIndex: 2,
        }}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={ariaLabel}
        disablePictureInPicture
      >
        {shouldLoad && <source src={src} type="video/webm" />}
      </video>
    </div>
  );
};

export default LazyVideo;

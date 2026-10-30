'use client';
import React from 'react';

export default function Watermark() {
  return (
    <>
      {/* ── 1. Subtle, Unobtrusive Repeating Diagonal Watermark across all pages ── */}
      <div
        aria-hidden="true"
        className="astrology-watermark-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 9999,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          opacity: 0.05,
          userSelect: 'none',
        }}
      >
        {Array.from({ length: 8 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: 'flex',
              whiteSpace: 'nowrap',
              transform: 'rotate(-20deg) scale(1.1)',
              transformOrigin: 'center center',
              gap: '4rem',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--foreground, #1a1a2e)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            {Array.from({ length: 6 }).map((_, colIndex) => (
              <span key={colIndex}>
                ॐ पंडित जी ज्योतिष संस्थान • PT. JI ASTROLOGY PLATFORM •
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* ── 2. Fixed Corner Branding Watermark Badge (Clearly visible on screen) ── */}
      <div
        className="astrology-watermark-badge"
        style={{
          position: 'fixed',
          bottom: '12px',
          right: '16px',
          zIndex: 1000,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(224, 123, 57, 0.35)',
          padding: '4px 10px',
          borderRadius: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          fontSize: '0.72rem',
          color: 'var(--foreground-muted, #64647a)',
          fontWeight: 600,
          letterSpacing: '0.02em',
        }}
      >
        <span style={{ color: 'var(--primary-saffron, #e07b39)', fontSize: '0.9rem' }}>ॐ</span>
        <span>पं. जी वैदिक ज्योतिष शोध पीठ</span>
        <span style={{ opacity: 0.4 }}>|</span>
        <span style={{ color: 'var(--primary-saffron, #e07b39)' }}>Licensed Edition</span>
      </div>
    </>
  );
}

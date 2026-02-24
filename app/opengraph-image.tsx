import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Ontos × SentimenTrader — Compiled Reasoning for 3,100 Indicators';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0E17',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 800,
            height: 400,
            background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)',
          }}
        />
        {/* Logo */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 14,
            background: '#6366F1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 32,
            color: '#fff',
            marginBottom: 24,
          }}
        >
          O
        </div>
        {/* Title */}
        <div style={{ fontSize: 48, fontWeight: 700, color: '#F9FAFB', marginBottom: 16, textAlign: 'center' }}>
          Ontos × SentimenTrader
        </div>
        <div style={{ fontSize: 22, color: '#8B949E', marginBottom: 40, textAlign: 'center' }}>
          Compiled Reasoning for Financial Markets
        </div>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 48 }}>
          {[
            { value: '3,100', label: 'Indicators', color: '#6366F1' },
            { value: '28,400', label: 'Relationships', color: '#58A6FF' },
            { value: '847', label: 'Rules', color: '#D29922' },
            { value: '0.42ms', label: 'Execution', color: '#3FB950' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 14, color: '#484F58', fontFamily: 'monospace', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}

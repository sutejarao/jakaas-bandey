'use client';

export default function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0f0f10',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏏</div>
        <div style={{ color: '#52525a', fontSize: 14, fontWeight: 600 }}>Loading…</div>
      </div>
    </div>
  );
}

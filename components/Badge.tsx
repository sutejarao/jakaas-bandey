'use client';

type Variant = 'mvp' | 'active' | 'pending' | 'guest' | 'admin';

const variants: Record<Variant, { bg: string; color: string; border: string; label: string }> = {
  mvp: { bg: 'rgba(255,179,0,0.15)', color: '#FFB300', border: '#FFB300', label: '🏆 MVP' },
  active: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '#22c55e', label: 'Active' },
  pending: { bg: 'rgba(161,161,170,0.12)', color: '#a1a1aa', border: '#52525a', label: 'Pending' },
  guest: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '#818cf8', label: 'Guest' },
  admin: { bg: 'rgba(255,179,0,0.15)', color: '#FFB300', border: '#FFB300', label: '⚡ Admin' },
};

export default function Badge({ variant }: { variant: Variant }) {
  const v = variants[variant];
  return (
    <span
      style={{
        background: v.bg,
        color: v.color,
        border: `1.5px solid ${v.border}`,
        borderRadius: 999,
        padding: '2px 12px',
        fontSize: 13,
        fontWeight: 700,
        display: 'inline-block',
      }}
    >
      {v.label}
    </span>
  );
}

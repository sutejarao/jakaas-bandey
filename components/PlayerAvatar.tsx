'use client';

type Props = {
  initial: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  accent?: boolean;
};

const sizes = {
  sm: { outer: 36, font: 14 },
  md: { outer: 48, font: 18 },
  lg: { outer: 64, font: 24 },
  xl: { outer: 96, font: 36 },
};

export default function PlayerAvatar({ initial, size = 'md', accent = false }: Props) {
  const { outer, font } = sizes[size];
  return (
    <div
      style={{
        width: outer,
        height: outer,
        borderRadius: '50%',
        background: accent ? 'rgba(255,179,0,0.15)' : '#222226',
        border: `2px solid ${accent ? '#FFB300' : '#3a3a40'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: font,
        fontWeight: 800,
        color: accent ? '#FFB300' : '#a1a1aa',
        flexShrink: 0,
        boxShadow: accent ? '3px 3px 0 #FF8F00' : 'none',
      }}
    >
      {initial?.toUpperCase() || '?'}
    </div>
  );
}

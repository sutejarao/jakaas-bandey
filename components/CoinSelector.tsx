'use client';

type Props = {
  value: number | null;
  onChange: (val: number) => void;
};

export default function CoinSelector({ value, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const filled = value !== null && n <= value;
        const selected = value === n;
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: filled ? '#FFB300' : 'transparent',
              color: filled ? '#1a0a00' : '#a1a1aa',
              border: `2px solid ${filled ? '#FF8F00' : '#3a3a40'}`,
              fontWeight: selected ? 900 : 700,
              fontSize: selected ? 17 : 15,
              cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif",
              boxShadow: selected ? '3px 3px 0 #FF8F00' : filled ? '2px 2px 0 #FF8F00' : '2px 2px 0 #3a3a40',
              transform: selected ? 'scale(1.15)' : 'scale(1)',
              transition: 'all 0.12s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

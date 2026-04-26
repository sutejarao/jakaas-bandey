'use client';

type Props = {
  emoji: string;
  label: string;
  selected: boolean;
  onClick: () => void;
};

export default function CategoryPill({ emoji, label, selected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        background: selected ? '#FFB300' : '#1a1a1d',
        color: selected ? '#1a0a00' : '#ffffff',
        border: `2px solid ${selected ? '#1a0a00' : '#3a3a40'}`,
        borderRadius: 999,
        padding: '8px 16px',
        fontSize: 14,
        fontWeight: selected ? 800 : 600,
        cursor: 'pointer',
        fontFamily: "'Nunito', sans-serif",
        boxShadow: selected ? '3px 3px 0 #FF8F00' : '2px 2px 0 #3a3a40',
        transition: 'all 0.15s ease',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        whiteSpace: 'nowrap',
      }}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  );
}

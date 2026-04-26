'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type Props = {
  categoryEmoji: string;
  categoryLabel: string;
  coins: number;
  fromName: string;
  note?: string | null;
  createdAt: string;
};

export default function NominationCard({
  categoryEmoji,
  categoryLabel,
  coins,
  fromName,
  note,
  createdAt,
}: Props) {
  const [date, setDate] = useState('');

  useEffect(() => {
    setDate(
      new Date(createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      })
    );
  }, [createdAt]);

  return (
    <div className="card" style={{ padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              background: 'rgba(255,179,0,0.12)',
              border: '1.5px solid #FFB300',
              borderRadius: 999,
              padding: '2px 10px',
              fontSize: 13,
              fontWeight: 700,
              color: '#FFB300',
            }}
          >
            {categoryEmoji} {categoryLabel}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Image src="/jakaas_bandey/logo-coin.png" alt="coins" width={18} height={18} />
          <span style={{ fontWeight: 800, fontSize: 15, color: '#FFB300' }}>+{coins}</span>
        </div>
      </div>
      <div style={{ color: '#a1a1aa', fontSize: 13 }}>
        From <span style={{ color: '#ffffff', fontWeight: 700 }}>{fromName}</span>
        {date && <span style={{ color: '#71717a', marginLeft: 8 }}>{date}</span>}
      </div>
      {note && (
        <div
          style={{
            marginTop: 8,
            background: '#222226',
            borderRadius: 10,
            padding: '8px 12px',
            fontSize: 13,
            color: '#a1a1aa',
            fontStyle: 'italic',
          }}
        >
          &ldquo;{note}&rdquo;
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { daysUntilReset } from '@/lib/supabase';

export default function MonthBanner() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(daysUntilReset());
  }, []);

  return (
    <div
      className="card-accent"
      style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}
    >
      <span style={{ fontSize: 20 }}>⏳</span>
      <span style={{ color: '#FFB300', fontWeight: 700, fontSize: 14 }}>
        {days === null ? (
          <span style={{ color: '#a1a1aa', fontWeight: 400 }}>Loading…</span>
        ) : (
          <>
            Resets in <strong>{days} day{days !== 1 ? 's' : ''}</strong>
            <span style={{ color: '#a1a1aa', fontWeight: 400 }}> — nominate before the month ends!</span>
          </>
        )}
      </span>
    </div>
  );
}

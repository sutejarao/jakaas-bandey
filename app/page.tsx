'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import AppShell from '@/components/AppShell';
import MonthBanner from '@/components/MonthBanner';
import LeaderboardRow from '@/components/LeaderboardRow';

type PlayerWithCoins = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  totalCoins: number;
};

export default function HomePage() {
  const { player } = useAuth();
  const [entries, setEntries] = useState<PlayerWithCoins[]>([]);
  const [fetching, setFetching] = useState(true);
  const [monthLabel, setMonthLabel] = useState('');

  useEffect(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    setMonthLabel(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));

    async function fetchLeaderboard() {
      const { data: players } = await supabase
        .from('players')
        .select('id, name, email, role, avatar_url')
        .in('role', ['active', 'admin'])
        .order('name');

      const { data: nominations } = await supabase
        .from('nominations')
        .select('nominee_id, coins')
        .eq('month', currentMonth);

      const playerCoins: PlayerWithCoins[] = (players ?? []).map((p) => ({
        ...p,
        totalCoins: (nominations ?? [])
          .filter((n) => n.nominee_id === p.id)
          .reduce((sum, n) => sum + n.coins, 0),
      })).sort((a, b) => b.totalCoins - a.totalCoins);

      setEntries(playerCoins);
      setFetching(false);
    }

    fetchLeaderboard();
  }, []);

  return (
    <AppShell>
      <div style={{ padding: '20px 16px 0' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', margin: 0 }}>
            🏏 JB Rewards
          </h1>
          <span
            style={{
              background: '#222226',
              border: '1.5px solid #3a3a40',
              borderRadius: 999,
              padding: '4px 12px',
              fontSize: 13,
              fontWeight: 700,
              color: '#a1a1aa',
            }}
          >
            {monthLabel}
          </span>
        </div>

        {/* Month banner */}
        <MonthBanner />

        {/* Leaderboard */}
        <h2
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: '#ffffff',
            margin: '20px 0 12px',
          }}
        >
          Leaderboard
        </h2>

        {fetching ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#52525a' }}>Loading…</div>
        ) : (
          entries.map((entry, i) => (
            <LeaderboardRow
              key={entry.id}
              rank={i + 1}
              name={entry.name}
              initial={entry.name.charAt(0).toUpperCase()}
              coins={entry.totalCoins}
              isMe={entry.id === player?.id}
            />
          ))
        )}
      </div>

      {/* Sticky CTA */}
      <div
        style={{
          position: 'sticky',
          bottom: 80,
          padding: '12px 16px',
          background: 'linear-gradient(to top, #0f0f10 70%, transparent)',
        }}
      >
        <Link href={player ? '/nominate' : '/auth'} style={{ display: 'block' }}>
          <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: 16 }}>
            + Nominate someone
          </button>
        </Link>
      </div>
    </AppShell>
  );
}

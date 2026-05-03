'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import AppShell from '@/components/AppShell';
import MonthBanner from '@/components/MonthBanner';
import LeaderboardRow from '@/components/LeaderboardRow';
import { currentMonthYear } from '@/lib/supabase';

type PlayerWithCoins = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_initial: string | null;
  coins: number | null;
};

export default function HomePage() {
  const { player } = useAuth();
  const [entries, setEntries] = useState<PlayerWithCoins[]>([]);
  const [fetching, setFetching] = useState(true);
  const [monthLabel, setMonthLabel] = useState('');

  useEffect(() => {
    const monthYear = currentMonthYear();
    setMonthLabel(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));

    async function fetchLeaderboard() {
      const { data: allPlayers } = await supabase
        .from('players')
        .select('id, name, email, role, avatar_initial')
        .order('created_at', { ascending: true });

      const { data: nominations } = await supabase
        .from('nominations')
        .select('to_player_id, coins')
        .eq('month_year', monthYear);

      const playerCoins: PlayerWithCoins[] = (allPlayers ?? []).map((p) => {
        if (p.role === 'pending') return { ...p, coins: null };
        const playerNoms = (nominations ?? []).filter((n) => n.to_player_id === p.id);
        const total = playerNoms.reduce((sum, n) => sum + n.coins, 0);
        return { ...p, coins: total };
      });

      const sorted = [
        ...playerCoins.filter((p) => p.role !== 'pending').sort((a, b) => (b.coins ?? 0) - (a.coins ?? 0)),
        ...playerCoins.filter((p) => p.role === 'pending'),
      ];

      setEntries(sorted);
      setFetching(false);
    }

    fetchLeaderboard();
  }, []);

  const activeEntries = entries.filter((e) => e.role !== 'pending');
  const pendingEntries = entries.filter((e) => e.role === 'pending');

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
            JB Rewards
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
          <>
            {activeEntries.map((entry, i) => (
              <LeaderboardRow
                key={entry.id}
                rank={i + 1}
                name={entry.name}
                initial={(entry.avatar_initial || entry.name.charAt(0)).toUpperCase()}
                coins={entry.coins}
                isMe={entry.id === player?.id}
              />
            ))}
            {pendingEntries.map((entry) => (
              <LeaderboardRow
                key={entry.id}
                rank={0}
                name={entry.name}
                initial={(entry.avatar_initial || entry.name.charAt(0)).toUpperCase()}
                coins={null}
                isMe={entry.id === player?.id}
                isPending
              />
            ))}
          </>
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
        <Link href={player && player.role !== 'pending' ? '/nominate' : '/auth'} style={{ display: 'block' }}>
          <button
            className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: 16 }}
            disabled={player?.role === 'pending'}
          >
            + Nominate someone
          </button>
        </Link>
      </div>
    </AppShell>
  );
}

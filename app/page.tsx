'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, currentMonthYear, formatMonthYear } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import AppShell from '@/components/AppShell';
import MonthBanner from '@/components/MonthBanner';
import LeaderboardRow from '@/components/LeaderboardRow';

type LeaderboardEntry = {
  player_id: string;
  name: string;
  initial: string;
  coins: number;
};

export default function HomePage() {
  const { player } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [fetching, setFetching] = useState(true);
  const [monthLabel, setMonthLabel] = useState('');

  useEffect(() => {
    const my = currentMonthYear();
    setMonthLabel(formatMonthYear(my));

    async function fetchLeaderboard() {
      const [playersRes, nominationsRes] = await Promise.all([
        supabase.from('players').select('id, name, avatar_initial, role'),
        supabase.from('nominations').select('to_player_id, coins').eq('month_year', my),
      ]);

      const players = playersRes.data ?? [];
      const active = players.filter((p) => p.role === 'active' || p.role === 'admin');

      const coinsMap = new Map<string, number>();
      for (const nom of nominationsRes.data ?? []) {
        coinsMap.set(nom.to_player_id, (coinsMap.get(nom.to_player_id) ?? 0) + nom.coins);
      }

      const all: LeaderboardEntry[] = active.map((p) => ({
        player_id: p.id,
        name: p.name,
        initial: p.avatar_initial || p.name.charAt(0),
        coins: coinsMap.get(p.id) ?? 0,
      }));

      all.sort((a, b) => b.coins - a.coins);
      setEntries(all);
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
              key={entry.player_id}
              rank={i + 1}
              name={entry.name}
              initial={entry.initial}
              coins={entry.coins}
              isMe={entry.player_id === player?.id}
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

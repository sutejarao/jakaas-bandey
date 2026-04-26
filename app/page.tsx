'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
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
  const [monthYear, setMonthYear] = useState('');
  const [monthLabel, setMonthLabel] = useState('');

  useEffect(() => {
    const my = currentMonthYear();
    setMonthYear(my);
    setMonthLabel(formatMonthYear(my));
  }, []);

  useEffect(() => {
    if (!monthYear) return;
    async function fetchLeaderboard() {
      const { data } = await supabase
        .from('nominations')
        .select('to_player_id, coins, players!nominations_to_player_id_fkey(name, avatar_initial)')
        .eq('month_year', monthYear);

      if (!data) { setFetching(false); return; }

      const map = new Map<string, LeaderboardEntry>();
      for (const row of data) {
        const p = (Array.isArray(row.players) ? row.players[0] : row.players) as { name: string; avatar_initial: string } | null;
        if (!p) continue;
        const existing = map.get(row.to_player_id);
        if (existing) {
          existing.coins += row.coins;
        } else {
          map.set(row.to_player_id, {
            player_id: row.to_player_id,
            name: p.name,
            initial: p.avatar_initial || p.name.charAt(0),
            coins: row.coins,
          });
        }
      }

      const sorted = Array.from(map.values()).sort((a, b) => b.coins - a.coins);
      setEntries(sorted);
      setFetching(false);
    }
    fetchLeaderboard();
  }, [monthYear]);

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
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Image
              src="/jakaas_bandey/illustrations/illus-empty-leaderboard.png"
              alt="No nominations yet"
              width={200}
              height={160}
              style={{ objectFit: 'contain', margin: '0 auto 16px', display: 'block' }}
            />
            <p style={{ color: '#71717a', fontSize: 15, fontWeight: 600 }}>
              No nominations yet this month
            </p>
            <p style={{ color: '#52525a', fontSize: 13 }}>Be the first to nominate a teammate!</p>
          </div>
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

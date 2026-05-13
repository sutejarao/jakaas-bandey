'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import AppShell from '@/components/AppShell';
import MonthBanner from '@/components/MonthBanner';
import LeaderboardRow from '@/components/LeaderboardRow';
import { currentMonthYear } from '@/lib/supabase';

type NominationDetail = {
  nominator_id: string;
  nominatorName: string;
  coins: number;
  note: string | null;
  categoryName: string;
  categoryEmoji: string;
};

type PlayerWithCoins = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  coins: number | null;
  nominations: NominationDetail[];
  categories: Array<{ name: string; emoji: string }>;
};

export default function HomePage() {
  const { player, loading } = useAuth();
  const [entries, setEntries] = useState<PlayerWithCoins[]>([]);
  const [fetching, setFetching] = useState(true);
  const [monthLabel, setMonthLabel] = useState('');

  useEffect(() => {
    if (loading) return;
    const monthYear = currentMonthYear();
    setMonthLabel(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));

    async function fetchLeaderboard() {
      const { data: allPlayers } = await supabase
        .from('players')
        .select('id, name, email, role, avatar_url');

      const { data: nominations } = await supabase
        .from('nominations')
        .select('nominee_id, coins, note, nominator_id, nominator:players!nominations_nominator_id_fkey(name), category:categories!nominations_category_id_fkey(name, emoji)')
        .eq('month', monthYear);

      const playerCoins: PlayerWithCoins[] = (allPlayers ?? []).map((p) => {
        const playerNoms = (nominations ?? []).filter((n) => n.nominee_id === p.id);
        const total = playerNoms.reduce((sum, n) => sum + n.coins, 0);
        const displayName = p.name.includes('@')
          ? p.name.split('@')[0].charAt(0).toUpperCase() + p.name.split('@')[0].slice(1)
          : p.name;

        const nominationDetails: NominationDetail[] = playerNoms.map((n) => {
          const nominator = Array.isArray(n.nominator) ? n.nominator[0] : n.nominator;
          const category = Array.isArray(n.category) ? n.category[0] : n.category;
          return {
            nominator_id: n.nominator_id,
            nominatorName: (nominator as { name: string } | null)?.name || 'Someone',
            coins: n.coins,
            note: n.note ?? null,
            categoryName: (category as { name: string; emoji: string } | null)?.name || '',
            categoryEmoji: (category as { name: string; emoji: string } | null)?.emoji || '🏅',
          };
        });

        const seen = new Set<string>();
        const categories = nominationDetails
          .map((n) => ({ name: n.categoryName, emoji: n.categoryEmoji }))
          .filter((c) => { if (seen.has(c.name)) return false; seen.add(c.name); return true; });

        return { ...p, name: displayName, coins: total, nominations: nominationDetails, categories };
      });

      const sorted = [
        ...playerCoins.filter((p) => p.role !== 'pending').sort((a, b) => (b.coins ?? 0) - (a.coins ?? 0)),
        ...playerCoins.filter((p) => p.role === 'pending'),
      ];

      setEntries(sorted);
      setFetching(false);
    }

    fetchLeaderboard();
  }, [loading]);

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
                initial={(entry.avatar_url || entry.name.charAt(0)).toUpperCase()}
                coins={entry.coins}
                isMe={entry.id === player?.id}
                nominations={entry.nominations}
                categories={entry.categories}
              />
            ))}
            {pendingEntries.map((entry) => (
              <LeaderboardRow
                key={entry.id}
                rank={0}
                name={entry.name}
                initial={(entry.avatar_url || entry.name.charAt(0)).toUpperCase()}
                coins={null}
                isMe={entry.id === player?.id}
                isPending
                nominations={entry.nominations}
                categories={entry.categories}
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

      {/* Pending message */}
      {player?.role === 'pending' && (
        <div style={{ padding: '0 16px 24px' }}>
          <div
            style={{
              background: 'rgba(255,179,0,0.07)',
              border: '1.5px solid #FFB300',
              borderRadius: 14,
              padding: '14px 16px',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 15, color: '#FFB300', marginBottom: 4 }}>
              ⏳ You're on the bench for now!
            </div>
            <div style={{ fontSize: 13, color: '#71717a', lineHeight: 1.5 }}>
              Once the admin activates your account you'll be able to nominate your teammates. Sit tight — good things come to those who wait! 🏏
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

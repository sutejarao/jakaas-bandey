'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, currentMonthYear, formatMonthYear, Player } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import AppShell from '@/components/AppShell';
import LoadingScreen from '@/components/LoadingScreen';

type PlayerStats = {
  id: string;
  name: string;
  initial: string;
  totalCoins: number;
  nominationCount: number;
  avgCoins: number;
};

type OverviewStats = {
  totalNominations: number;
  totalPlayers: number;
  totalCoins: number;
};

export default function AdminPage() {
  const { player, loading } = useAuth();
  const router = useRouter();
  const [overview, setOverview] = useState<OverviewStats>({ totalNominations: 0, totalPlayers: 0, totalCoins: 0 });
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [monthYear, setMonthYear] = useState('');
  const [monthLabel, setMonthLabel] = useState('');

  useEffect(() => {
    const my = currentMonthYear();
    setMonthYear(my);
    setMonthLabel(formatMonthYear(my));
  }, []);

  useEffect(() => {
    if (!loading && (!player || player.role !== 'admin')) {
      router.replace('/');
    }
  }, [loading, player, router]);

  useEffect(() => {
    if (!player || player.role !== 'admin' || !monthYear) return;
    fetchData(monthYear);
  }, [player, monthYear]);

  async function fetchData(my: string) {
    setFetching(true);

    const [nominationsRes, playersRes] = await Promise.all([
      supabase
        .from('nominations')
        .select('to_player_id, coins, players!nominations_to_player_id_fkey(name, avatar_initial)')
        .eq('month_year', my),
      supabase.from('players').select('*').order('name'),
    ]);

    const nominations = nominationsRes.data || [];
    const players = playersRes.data || [];

    setAllPlayers(players);

    const map = new Map<string, PlayerStats>();
    for (const nom of nominations) {
      const p = (Array.isArray(nom.players) ? nom.players[0] : nom.players) as { name: string; avatar_initial: string } | null;
      if (!p) continue;
      const existing = map.get(nom.to_player_id);
      if (existing) {
        existing.totalCoins += nom.coins;
        existing.nominationCount += 1;
      } else {
        map.set(nom.to_player_id, {
          id: nom.to_player_id,
          name: p.name,
          initial: p.avatar_initial || p.name.charAt(0),
          totalCoins: nom.coins,
          nominationCount: 1,
          avgCoins: 0,
        });
      }
    }
    const stats = Array.from(map.values()).map((s) => ({
      ...s,
      avgCoins: Math.round((s.totalCoins / s.nominationCount) * 10) / 10,
    })).sort((a, b) => b.totalCoins - a.totalCoins);

    setPlayerStats(stats);
    setOverview({
      totalNominations: nominations.length,
      totalPlayers: players.length,
      totalCoins: nominations.reduce((acc, n) => acc + n.coins, 0),
    });
    setFetching(false);
  }

  async function handleReset() {
    if (!monthYear) return;
    setResetting(true);
    for (const stat of playerStats) {
      await supabase.from('monthly_results').upsert({
        player_id: stat.id,
        month_year: monthYear,
        total_coins: stat.totalCoins,
        rank: playerStats.indexOf(stat) + 1,
      });
    }
    await supabase.from('nominations').delete().eq('month_year', monthYear);
    setResetting(false);
    setShowResetModal(false);
    setResetDone(true);
    fetchData(monthYear);
  }

  async function updatePlayerRole(playerId: string, role: string) {
    await supabase.from('players').update({ role }).eq('id', playerId);
    if (monthYear) fetchData(monthYear);
  }

  if (loading) return <LoadingScreen />;
  if (!player || player.role !== 'admin') return null;

  return (
    <AppShell>
      <div style={{ padding: '20px 16px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', marginBottom: 4 }}>
          ⚙️ Admin Panel
        </h1>
        <p style={{ color: '#71717a', fontSize: 14, marginBottom: 20 }}>
          {monthLabel}
        </p>

        {/* Overview stats */}
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}
        >
          {[
            { label: 'Nominations', value: overview.totalNominations },
            { label: 'Players', value: overview.totalPlayers },
            { label: 'Coins', value: overview.totalCoins },
          ].map(({ label, value }) => (
            <div key={label} className="card" style={{ padding: '14px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#FFB300', marginBottom: 2 }}>{value}</div>
              <div style={{ fontSize: 12, color: '#71717a', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Player averages table */}
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>
          Player averages this month
        </h2>

        {fetching ? (
          <div style={{ color: '#52525a', textAlign: 'center', padding: '32px 0' }}>Loading…</div>
        ) : playerStats.length === 0 ? (
          <div style={{ color: '#52525a', textAlign: 'center', padding: '24px 0', fontSize: 14 }}>
            No nominations recorded yet
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #3a3a40' }}>
                  {['Player', 'Noms', 'Total', 'Avg'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 12px',
                        textAlign: h === 'Player' ? 'left' : 'center',
                        color: '#71717a',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {playerStats.map((s, i) => (
                  <tr
                    key={s.id}
                    style={{ borderBottom: i < playerStats.length - 1 ? '1px solid #222226' : 'none' }}
                  >
                    <td style={{ padding: '10px 12px', color: '#ffffff', fontWeight: 700, fontSize: 14 }}>
                      {s.name}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#a1a1aa', fontSize: 14 }}>
                      {s.nominationCount}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#FFB300', fontWeight: 800, fontSize: 14 }}>
                      {s.totalCoins}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#a1a1aa', fontSize: 14 }}>
                      {s.avgCoins}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Month reset */}
        {resetDone && (
          <div
            className="card-accent"
            style={{ padding: '12px 16px', marginBottom: 16, textAlign: 'center', color: '#FFB300', fontWeight: 700 }}
          >
            ✅ Month reset complete! Results archived.
          </div>
        )}
        <button
          onClick={() => setShowResetModal(true)}
          style={{
            width: '100%',
            padding: 16,
            background: '#2d1a1a',
            border: '2px solid #7f1d1d',
            borderRadius: 999,
            color: '#f87171',
            fontWeight: 800,
            fontSize: 16,
            fontFamily: "'Nunito', sans-serif",
            cursor: 'pointer',
            boxShadow: '4px 4px 0 #7f1d1d',
            marginBottom: 32,
          }}
        >
          🔄 Run Month Reset
        </button>

        {/* Player management */}
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>
          Player management
        </h2>

        {allPlayers.map((p) => (
          <div
            key={p.id}
            className="card"
            style={{
              padding: '12px 14px',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#222226',
                border: '2px solid #3a3a40',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 800,
                color: '#a1a1aa',
                flexShrink: 0,
              }}
            >
              {(p.avatar_initial || p.name.charAt(0)).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#ffffff' }}>{p.name}</div>
              <div style={{ fontSize: 12, color: '#71717a' }}>{p.email}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {p.role === 'pending' && (
                <button
                  onClick={() => updatePlayerRole(p.id, 'active')}
                  style={{
                    background: '#1a3a1a',
                    border: '1.5px solid #166534',
                    borderRadius: 8,
                    color: '#4ade80',
                    padding: '4px 10px',
                    fontSize: 12,
                    fontWeight: 800,
                    fontFamily: "'Nunito', sans-serif",
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Activate →
                </button>
              )}
              <select
                value={p.role}
                onChange={(e) => updatePlayerRole(p.id, e.target.value)}
                style={{
                  background: '#222226',
                  border: '1.5px solid #3a3a40',
                  borderRadius: 8,
                  color: '#ffffff',
                  padding: '4px 8px',
                  fontSize: 13,
                  fontFamily: "'Nunito', sans-serif",
                  cursor: 'pointer',
                }}
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="admin">Admin</option>
                <option value="guest">Guest</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Reset confirmation modal */}
      {showResetModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: 24,
          }}
        >
          <div
            className="card"
            style={{ maxWidth: 360, width: '100%', padding: '28px 24px', textAlign: 'center' }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', marginBottom: 8 }}>
              Reset this month?
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: 14, marginBottom: 24 }}>
              This will archive all current nominations to monthly results and clear the leaderboard for a fresh start.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowResetModal(false)}
                className="btn-secondary"
                style={{ flex: 1, padding: '12px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#7f1d1d',
                  border: '2px solid #991b1b',
                  borderRadius: 999,
                  color: '#f87171',
                  fontWeight: 800,
                  fontFamily: "'Nunito', sans-serif",
                  cursor: 'pointer',
                  fontSize: 15,
                }}
              >
                {resetting ? 'Resetting…' : '🔄 Yes, reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

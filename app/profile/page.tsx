'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase, currentMonthYear, Nomination } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import AppShell from '@/components/AppShell';
import PlayerAvatar from '@/components/PlayerAvatar';
import Badge from '@/components/Badge';
import NominationCard from '@/components/NominationCard';

type Stats = {
  totalCoins: number;
  nominationCount: number;
  categoryCount: number;
};

export default function ProfilePage() {
  const { player } = useAuth();
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [stats, setStats] = useState<Stats>({ totalCoins: 0, nominationCount: 0, categoryCount: 0 });
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!player) return;
    async function fetchNominations() {
      const { data } = await supabase
        .from('nominations')
        .select('*, from_player:players!nominations_from_player_id_fkey(name, avatar_initial)')
        .eq('to_player_id', player!.id)
        .eq('month_year', currentMonthYear())
        .order('created_at', { ascending: false });

      if (data) {
        setNominations(data);
        const totalCoins = data.reduce((acc, n) => acc + n.coins, 0);
        const categories = new Set(data.map((n) => n.category));
        setStats({ totalCoins, nominationCount: data.length, categoryCount: categories.size });
      }
      setFetching(false);
    }
    fetchNominations();
  }, [player]);

  if (!player) return null;

  const roleBadge = player.role === 'admin' ? 'admin' : player.role === 'player' ? 'active' : player.role === 'guest' ? 'guest' : 'pending';

  return (
    <AppShell>
      <div style={{ padding: '24px 16px' }}>
        {/* Avatar + name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <PlayerAvatar initial={player.avatar_initial || player.name.charAt(0)} size="xl" accent />
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', margin: '14px 0 6px' }}>
            {player.name}
          </h1>
          <Badge variant={roleBadge as 'admin' | 'active' | 'pending' | 'guest'} />
          <p style={{ color: '#71717a', fontSize: 13, marginTop: 6 }}>{player.email}</p>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            marginBottom: 24,
          }}
        >
          {[
            { label: 'Coins', value: stats.totalCoins, icon: '/jakaas_bandey/logo-coin.png' },
            { label: 'Nominations', value: stats.nominationCount, icon: null },
            { label: 'Categories', value: stats.categoryCount, icon: null },
          ].map(({ label, value, icon }) => (
            <div
              key={label}
              className="card"
              style={{ padding: '14px 8px', textAlign: 'center' }}
            >
              {icon ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 2 }}>
                  <Image src={icon} alt="coin" width={20} height={20} />
                  <span style={{ fontSize: 22, fontWeight: 900, color: '#FFB300' }}>{value}</span>
                </div>
              ) : (
                <div style={{ fontSize: 22, fontWeight: 900, color: '#FFB300', marginBottom: 2 }}>{value}</div>
              )}
              <div style={{ fontSize: 12, color: '#71717a', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Nominations received */}
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>
          Nominations received this month
        </h2>

        {fetching ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#52525a' }}>Loading…</div>
        ) : nominations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Image
              src="/jakaas_bandey/illustrations/illus-empty-feed.png"
              alt="No nominations"
              width={160}
              height={130}
              style={{ objectFit: 'contain', margin: '0 auto 12px', display: 'block' }}
            />
            <p style={{ color: '#71717a', fontSize: 14 }}>No nominations yet — keep playing well!</p>
          </div>
        ) : (
          nominations.map((nom) => {
            const fromPlayer = nom.from_player as { name: string } | null;
            return (
              <NominationCard
                key={nom.id}
                categoryEmoji={
                  nom.category === 'Best catch' ? '🏅'
                    : nom.category === 'Top scorer' ? '⭐'
                    : nom.category === 'Best banter' ? '😂'
                    : nom.category === 'Most effort' ? '💪'
                    : nom.category === 'Match winner' ? '🎯'
                    : '🤝'
                }
                categoryLabel={nom.category}
                coins={nom.coins}
                fromName={fromPlayer?.name || 'Someone'}
                note={nom.note}
                createdAt={nom.created_at}
              />
            );
          })
        )}

        {/* Actions */}
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link href="/nominate" style={{ display: 'block' }}>
            <button className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 15 }}>
              Nominate someone +
            </button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

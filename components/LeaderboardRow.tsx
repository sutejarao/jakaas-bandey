'use client';

import Image from 'next/image';
import PlayerAvatar from './PlayerAvatar';

type Props = {
  rank: number;
  name: string;
  initial: string;
  coins: number;
  isMe?: boolean;
};

const rankBadge = (rank: number) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return <span style={{ color: '#71717a', fontWeight: 700, fontSize: 15 }}>#{rank}</span>;
};

export default function LeaderboardRow({ rank, name, initial, coins, isMe = false }: Props) {
  return (
    <div
      className={isMe ? 'card-accent interactive interactive-accent' : 'card interactive'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        marginBottom: 10,
      }}
    >
      <div style={{ width: 32, textAlign: 'center', fontSize: 20, flexShrink: 0 }}>
        {rankBadge(rank)}
      </div>
      <PlayerAvatar initial={initial} size="sm" accent={isMe} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: 15,
            color: isMe ? '#FFB300' : '#ffffff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name} {isMe && <span style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>(you)</span>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <Image src="/jakaas_bandey/logo-coin.png" alt="coins" width={28} height={28} />
        <span style={{ fontWeight: 800, fontSize: 16, color: '#FFB300' }}>{coins}</span>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import PlayerAvatar from './PlayerAvatar';

type NominationDetail = {
  nominatorName: string;
  coins: number;
  note: string | null;
  categoryName: string;
  categoryEmoji: string;
};

type Props = {
  rank: number;
  name: string;
  initial: string;
  coins: number | null;
  isMe?: boolean;
  isPending?: boolean;
  nominations?: NominationDetail[];
  categories?: Array<{ name: string; emoji: string }>;
};

const rankBadge = (rank: number, isPending: boolean) => {
  if (isPending) return <span style={{ color: '#52525a', fontWeight: 700, fontSize: 15 }}>—</span>;
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return <span style={{ color: '#71717a', fontWeight: 700, fontSize: 15 }}>#{rank}</span>;
};

export default function LeaderboardRow({
  rank,
  name,
  initial,
  coins,
  isMe = false,
  isPending = false,
  nominations = [],
  categories = [],
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={isMe ? 'card-accent interactive interactive-accent' : 'card interactive'}
      style={{ padding: '12px 16px', marginBottom: 10, cursor: 'pointer' }}
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 32, textAlign: 'center', fontSize: 20, flexShrink: 0, paddingTop: 2 }}>
          {rankBadge(rank, isPending)}
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
            {name}{' '}
            {isMe && <span style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>(you)</span>}
            {isPending && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#71717a', marginLeft: 6 }}>
                ⏳ Pending
              </span>
            )}
          </div>
          {categories.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
              {categories.map((cat) => (
                <span
                  key={cat.name}
                  style={{
                    background: 'rgba(255,179,0,0.1)',
                    border: '1px solid rgba(255,179,0,0.3)',
                    borderRadius: 999,
                    padding: '2px 8px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#FFB300',
                  }}
                >
                  {cat.emoji} {cat.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {isPending ? (
            <span style={{ fontWeight: 800, fontSize: 16, color: '#52525a' }}>—</span>
          ) : (
            <>
              <Image src="/logo-coin.png" alt="coins" width={28} height={28} />
              <span style={{ fontWeight: 800, fontSize: 16, color: '#FFB300' }}>{coins}</span>
            </>
          )}
          <span
            style={{
              fontSize: 18,
              color: '#52525a',
              marginLeft: 4,
              display: 'inline-block',
              transform: expanded ? 'rotate(90deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          >
            ›
          </span>
        </div>
      </div>

      {/* Expanded nominations */}
      {expanded && (
        <div style={{ marginTop: 12, borderTop: '1px solid #222226', paddingTop: 12 }}>
          {nominations.length === 0 ? (
            <div style={{ color: '#52525a', fontSize: 13, textAlign: 'center', padding: '8px 0' }}>
              No nominations yet this month
            </div>
          ) : (
            nominations.map((nom, i) => (
              <div
                key={i}
                style={{
                  paddingTop: i > 0 ? 8 : 0,
                  marginTop: i > 0 ? 8 : 0,
                  borderTop: i > 0 ? '1px solid #222226' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#a1a1aa', fontSize: 13 }}>
                    {nom.categoryEmoji} {nom.categoryName} · {nom.nominatorName}
                  </span>
                  <span style={{ color: '#FFB300', fontWeight: 800, fontSize: 13 }}>
                    {nom.coins}🪙
                  </span>
                </div>
                {nom.note && (
                  <div style={{ color: '#71717a', fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>
                    &ldquo;{nom.note}&rdquo;
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

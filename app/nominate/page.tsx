'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase, currentMonthYear, Player, Category } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import AppShell from '@/components/AppShell';
import PlayerAvatar from '@/components/PlayerAvatar';
import CategoryPill from '@/components/CategoryPill';
import CoinSelector from '@/components/CoinSelector';

type Step = 'player' | 'category' | 'coins' | 'note' | 'success';

export default function NominatePage() {
  const { player } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>('player');
  const [players, setPlayers] = useState<Player[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [coins, setCoins] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('players')
      .select('*')
      .eq('role', 'player')
      .order('name')
      .then(({ data }) => setPlayers(data || []));

    supabase
      .from('categories')
      .select('*')
      .order('label')
      .then(({ data }) => setCategories(data || []));
  }, []);

  async function handleSubmit() {
    if (!player || !selectedPlayer || !selectedCategory || !coins) return;
    setSubmitting(true);
    setError('');
    const { error } = await supabase.from('nominations').insert({
      from_player_id: player.id,
      to_player_id: selectedPlayer.id,
      category: selectedCategory.label,
      coins,
      note: note.trim() || null,
      month_year: currentMonthYear(),
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
    } else {
      setStep('success');
      setTimeout(() => router.push('/'), 2000);
    }
  }

  if (step === 'success') {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: '#0f0f10',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        <Image
          src="/jakaas_bandey/illustrations/illus-nomination-sent.png"
          alt="Nomination sent"
          width={220}
          height={180}
          style={{ objectFit: 'contain', marginBottom: 24 }}
        />
        <h2 style={{ fontSize: 26, fontWeight: 900, color: '#FFB300', marginBottom: 8 }}>
          Nomination sent! ✅
        </h2>
        <p style={{ color: '#a1a1aa', textAlign: 'center' }}>
          Redirecting to leaderboard…
        </p>
      </div>
    );
  }

  const stepNum = { player: 1, category: 2, coins: 3, note: 4, success: 5 }[step];

  return (
    <AppShell>
      <div style={{ padding: '20px 16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => {
              if (step === 'player') router.back();
              else if (step === 'category') setStep('player');
              else if (step === 'coins') setStep('category');
              else if (step === 'note') setStep('coins');
            }}
            style={{
              background: '#222226',
              border: '2px solid #3a3a40',
              borderRadius: '50%',
              width: 38,
              height: 38,
              cursor: 'pointer',
              color: '#ffffff',
              fontSize: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            ←
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', margin: 0 }}>
            Nominate
          </h1>
          <span style={{ marginLeft: 'auto', color: '#52525a', fontSize: 13, fontWeight: 700 }}>
            {stepNum}/4
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 4,
            background: '#222226',
            borderRadius: 999,
            marginBottom: 24,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${(stepNum / 4) * 100}%`,
              background: '#FFB300',
              borderRadius: 999,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Step 1: Pick player */}
        {step === 'player' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>
              Pick a teammate
            </h2>
            <p style={{ color: '#71717a', fontSize: 14, marginBottom: 16 }}>
              Who deserves recognition this month?
            </p>
            {players.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#52525a' }}>
                No teammates available yet
              </div>
            ) : (
              players.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPlayer(p); setStep('category'); }}
                  style={{
                    width: '100%',
                    background: '#1a1a1d',
                    border: '2px solid #3a3a40',
                    borderRadius: 14,
                    padding: '12px 16px',
                    marginBottom: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    boxShadow: '3px 3px 0 #3a3a40',
                    fontFamily: "'Nunito', sans-serif",
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translate(-2px,-2px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '5px 5px 0 #3a3a40';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'none';
                    (e.currentTarget as HTMLElement).style.boxShadow = '3px 3px 0 #3a3a40';
                  }}
                >
                  <PlayerAvatar initial={p.avatar_initial || p.name.charAt(0)} size="sm" />
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#ffffff' }}>{p.name}</span>
                  <span style={{ marginLeft: 'auto', color: '#52525a', fontSize: 18 }}>→</span>
                </button>
              ))
            )}
          </div>
        )}

        {/* Step 2: Category */}
        {step === 'category' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>
              Choose a category
            </h2>
            <p style={{ color: '#71717a', fontSize: 14, marginBottom: 16 }}>
              Nominating <strong style={{ color: '#FFB300' }}>{selectedPlayer?.name}</strong> for…
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {categories.map((cat) => (
                <CategoryPill
                  key={cat.id}
                  emoji={cat.emoji}
                  label={cat.label}
                  selected={selectedCategory?.id === cat.id}
                  onClick={() => setSelectedCategory(cat)}
                />
              ))}
            </div>
            <button
              className="btn-primary"
              disabled={!selectedCategory}
              onClick={() => setStep('coins')}
              style={{ width: '100%', padding: 16, fontSize: 16, marginTop: 24 }}
            >
              Next →
            </button>
          </div>
        )}

        {/* Step 3: Coin selector */}
        {step === 'coins' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>
              How many coins?
            </h2>
            <p style={{ color: '#71717a', fontSize: 14, marginBottom: 16 }}>
              1 = nice, 10 = absolute legend
            </p>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Image
                src="/jakaas_bandey/illustrations/illus-coin-selector.png"
                alt="Coin selector"
                width={160}
                height={120}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <CoinSelector value={coins} onChange={setCoins} />
            <button
              className="btn-primary"
              disabled={!coins}
              onClick={() => setStep('note')}
              style={{ width: '100%', padding: 16, fontSize: 16, marginTop: 28 }}
            >
              Next →
            </button>
          </div>
        )}

        {/* Step 4: Note */}
        {step === 'note' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>
              Add a note
            </h2>
            <p style={{ color: '#71717a', fontSize: 14, marginBottom: 16 }}>
              Optional — tell the team why <strong style={{ color: '#FFB300' }}>{selectedPlayer?.name}</strong> deserves this
            </p>

            {/* Summary card */}
            <div className="card" style={{ padding: '12px 16px', marginBottom: 20 }}>
              <div style={{ color: '#a1a1aa', fontSize: 13, marginBottom: 6 }}>Nomination summary</div>
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: 15 }}>
                {selectedCategory?.emoji} {selectedCategory?.label} → {selectedPlayer?.name}
              </div>
              <div style={{ color: '#FFB300', fontWeight: 800, fontSize: 14, marginTop: 4 }}>
                {coins} coin{coins !== 1 ? 's' : ''}
              </div>
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Took a blinder at deep square leg!"
              rows={4}
              style={{
                width: '100%',
                background: '#1a1a1d',
                border: '2px solid #3a3a40',
                borderRadius: 12,
                padding: '12px 14px',
                fontSize: 15,
                color: '#ffffff',
                resize: 'none',
                outline: 'none',
                fontFamily: "'Nunito', sans-serif",
                boxSizing: 'border-box',
              }}
            />

            {error && (
              <p style={{ color: '#f87171', fontSize: 13, marginTop: 8 }}>{error}</p>
            )}

            <button
              className="btn-primary"
              disabled={submitting}
              onClick={handleSubmit}
              style={{ width: '100%', padding: 16, fontSize: 16, marginTop: 16 }}
            >
              {submitting ? 'Submitting…' : 'Submit nomination ✅'}
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}

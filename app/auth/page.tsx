'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#1a1a1d',
  border: '2px solid #3a3a40',
  borderRadius: 12,
  padding: '14px 16px',
  fontSize: 16,
  color: '#ffffff',
  outline: 'none',
  fontFamily: "'Nunito', sans-serif",
  boxSizing: 'border-box',
  marginBottom: 12,
};

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<'signin' | 'signup' | null>(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');

  async function handleSignIn() {
    setLoading('signin');
    setError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setError(error?.message ?? 'Sign in failed');
      setLoading(null);
      return;
    }
    router.push('/');
  }

  async function handleSignUp() {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    setLoading('signup');
    setError('');
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(null);
      return;
    }
    // Auto sign in after signup
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !data.user) {
      setError(signInError?.message ?? 'Sign in failed');
      setLoading(null);
      return;
    }
    // Ensure player row exists before navigating
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('id', data.user.id)
      .single();

    if (!existingPlayer) {
      const userEmail = data.user.email ?? '';
      const playerName = name.trim() || userEmail.split('@')[0] || 'New Player';
      const avatar_url = (userEmail[0] || 'P').toUpperCase();
      await supabase
        .from('players')
        .insert({ id: data.user.id, name: playerName, email: userEmail, role: 'pending', avatar_url })
        .select()
        .maybeSingle();
    }
    router.push('/');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0f0f10',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        maxWidth: 480,
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      <Image
        src="/logo-coin.png"
        alt="JB Coin"
        width={200}
        height={200}
        style={{ objectFit: 'cover', borderRadius: '50%', marginBottom: 24 }}
      />
      <h1 style={{ fontSize: 30, fontWeight: 900, color: '#ffffff', marginBottom: 8, textAlign: 'center' }}>
        JB Rewards
      </h1>

      <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: 20 }}>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          required
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        {error && (
          <p style={{ color: '#f87171', fontSize: 13, marginBottom: 10 }}>{error}</p>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={mode === 'signup' ? () => setMode('signin') : handleSignIn}
            disabled={loading !== null}
            className={mode === 'signup' ? 'btn-secondary' : 'btn-primary'}
            style={{ flex: 1, padding: '16px', fontSize: 16 }}
          >
            {loading === 'signin' ? 'Signing in…' : mode === 'signup' ? '← Sign in' : 'Sign in'}
          </button>
          <button
            type="button"
            onClick={mode === 'signin' ? () => setMode('signup') : handleSignUp}
            disabled={loading !== null}
            className={mode === 'signin' ? 'btn-secondary' : 'btn-primary'}
            style={{ flex: 1, padding: '16px', fontSize: 16 }}
          >
            {loading === 'signup' ? 'Signing up…' : 'Sign up'}
          </button>
        </div>
      </form>
    </div>
  );
}

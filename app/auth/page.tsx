'use client';

import { useState } from 'react';
import Image from 'next/image';
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
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      window.location.href = '/jakaas_bandey';
    }
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
        src="/jakaas_bandey/logo-coin.png"
        alt="JB Coin"
        width={800}
        height={800}
        style={{ objectFit: 'cover', borderRadius: '50%', marginBottom: 28 }}
      />
      <h1 style={{ fontSize: 30, fontWeight: 900, color: '#ffffff', marginBottom: 8, textAlign: 'center' }}>
        JB Rewards
      </h1>

      <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: 20 }}>
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
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: '100%', padding: '16px', fontSize: 16 }}
        >
          {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
        </button>
      </form>

      <button
        onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
        style={{
          marginTop: 16,
          background: 'transparent',
          border: 'none',
          color: '#a1a1aa',
          fontSize: 14,
          fontFamily: "'Nunito', sans-serif",
          cursor: 'pointer',
        }}
      >
        {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
      </button>
    </div>
  );
}

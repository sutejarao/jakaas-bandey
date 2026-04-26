'use client';

import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://theorangestudio.co.uk/jakaas_bandey/auth/callback',
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
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

      {sent ? (
        <p
          style={{
            marginTop: 20,
            color: '#FFB300',
            fontWeight: 700,
            fontSize: 17,
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          Check your email and click the link to sign in 🏏
        </p>
      ) : (
        <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: 20 }}>
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
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
            }}
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
            {loading ? 'Sending…' : 'Send magic link'}
          </button>
        </form>
      )}
    </div>
  );
}

'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const containerStyle: React.CSSProperties = {
  minHeight: '100dvh',
  background: '#0f0f10',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#71717a',
  fontSize: 16,
  fontFamily: "'Nunito', sans-serif",
};

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      router.replace('/');
      return;
    }

    (async () => {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error || !data.session) {
        router.replace('/auth');
        return;
      }

      const user = data.session.user;
      const { data: existing } = await supabase
        .from('players')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existing) {
        const email = user.email ?? '';
        const name = email.split('@')[0];
        await supabase.from('players').insert({
          id: user.id,
          email,
          name,
          role: 'pending',
          avatar_initial: name.charAt(0).toUpperCase(),
        });
      }

      router.replace('/');
    })();
  }, [searchParams, router]);

  return <div style={containerStyle}>Signing you in…</div>;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div style={containerStyle}>Signing you in…</div>}>
      <CallbackHandler />
    </Suspense>
  );
}

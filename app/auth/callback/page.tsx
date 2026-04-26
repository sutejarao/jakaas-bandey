'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // With flowType:'pkce' and detectSessionInUrl:true, the Supabase client
    // automatically exchanges the ?code= param on page load. Listen for sign-in.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        subscription.unsubscribe();
        router.replace('/jakaas_bandey');
      }
    });

    // Already signed in (e.g. code exchanged synchronously)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe();
        router.replace('/jakaas_bandey');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0f0f10',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#71717a',
        fontSize: 16,
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      Signing you in…
    </div>
  );
}

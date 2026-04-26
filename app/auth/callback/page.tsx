'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  useEffect(() => {
    // Listen for SIGNED_IN, then hard-reload so AuthProvider reinitialises
    // with the session that Supabase just stored in localStorage.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        subscription.unsubscribe();
        window.location.href = '/jakaas_bandey';
      }
    });

    // Also check if the session is already present (code exchanged synchronously)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe();
        window.location.href = '/jakaas_bandey';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Player } from './supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  player: Player | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  player: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchOrCreatePlayer(u: User) {
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('id', u.id)
      .single();

    if (data) {
      setPlayer(data);
      return;
    }

    const email = u.email ?? '';
    const name = email.split('@')[0] || 'New Player';
    const avatar_initial = (email[0] || 'P').toUpperCase();
    const { data: newPlayer, error } = await supabase
      .from('players')
      .insert({ id: u.id, name, email, role: 'pending', avatar_initial })
      .select()
      .single();

    if (newPlayer) {
      setPlayer(newPlayer);
    } else if (error?.code === '23505') {
      // Another concurrent call already inserted the row — fetch it
      const { data: existing } = await supabase
        .from('players')
        .select('*')
        .eq('id', u.id)
        .single();
      setPlayer(existing ?? null);
    }
  }

  useEffect(() => {
    // getSession() reads the persisted session immediately on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchOrCreatePlayer(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // INITIAL_SESSION duplicates getSession() above — skip it to prevent a
      // concurrent double-insert race on the players table
      if (event === 'INITIAL_SESSION') return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchOrCreatePlayer(session.user).finally(() => setLoading(false));
      } else {
        setPlayer(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, session, player, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

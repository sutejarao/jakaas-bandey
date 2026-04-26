import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Player = {
  id: string;
  name: string;
  email: string;
  role: 'player' | 'admin' | 'pending' | 'guest';
  avatar_initial: string | null;
  created_at: string;
};

export type Nomination = {
  id: string;
  from_player_id: string;
  to_player_id: string;
  category: string;
  coins: number;
  note: string | null;
  month_year: string;
  created_at: string;
  from_player?: Player;
  to_player?: Player;
};

export type Category = {
  id: string;
  emoji: string;
  label: string;
};

export type MonthlyResult = {
  id: string;
  player_id: string;
  month_year: string;
  total_coins: number;
  rank: number;
  archived_at: string;
};

export function currentMonthYear(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function daysUntilReset(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const diff = lastDay.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatMonthYear(monthYear: string): string {
  const [year, month] = monthYear.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

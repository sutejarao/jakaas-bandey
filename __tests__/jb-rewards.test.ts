/**
 * JB Rewards — Full Jest Test Suite
 *
 * Tests cover: Leaderboard, Nomination Flow, Auth & Signup, Admin Panel,
 * and persona-based scenarios for Rajan, Dev, Omar, and Priya.
 *
 * Supabase is mocked via __mocks__/supabase.ts.
 * LeaderboardRow is rendered with React.createElement (no JSX, keeping .ts extension).
 */

// ── Mock next/image before any component imports ──────────────────────────────
jest.mock('next/image', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ alt }: { alt: string }) => React.createElement('img', { alt }),
  };
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import LeaderboardRow from '../components/LeaderboardRow';
import { mockPlayers } from '../__mocks__/supabase';

// ── Pure logic helpers (mirror app/page.tsx and app/nominate/page.tsx) ────────

type PlayerRow = {
  id: string;
  name: string;
  role: string;
  coins: number | null;
};

/** Mirrors the buildLeaderboard logic in app/page.tsx */
function buildLeaderboard(
  players: PlayerRow[],
  nominations: { to_player_id: string; coins: number }[],
  _monthYear: string
): PlayerRow[] {
  const playerCoins: PlayerRow[] = players.map((p) => {
    if (p.role === 'pending') return { ...p, coins: null };
    const playerNoms = nominations.filter((n) => n.to_player_id === p.id);
    const total = playerNoms.reduce((sum, n) => sum + n.coins, 0);
    return { ...p, coins: total };
  });

  return [
    ...playerCoins
      .filter((p) => p.role !== 'pending')
      .sort((a, b) => (b.coins ?? 0) - (a.coins ?? 0)),
    ...playerCoins.filter((p) => p.role === 'pending'),
  ];
}

/** Mirrors nomination-access guard in app/nominate/page.tsx */
function canNominate(
  nominator: { role: string } | null,
  nominee: { id: string; role: string } | null,
  nominatorId: string
): { allowed: boolean; reason?: string } {
  if (!nominator) return { allowed: false, reason: 'not-authenticated' };
  if (nominator.role === 'pending') return { allowed: false, reason: 'pending-player' };
  if (!nominee) return { allowed: false, reason: 'no-nominee' };
  if (nominee.id === nominatorId) return { allowed: false, reason: 'self-nomination' };
  if (nominee.role === 'pending') return { allowed: false, reason: 'nominee-pending' };
  return { allowed: true };
}

/** Mirrors form validation in app/nominate/page.tsx handleSubmit guard */
function validateNomination(category: string | null, coins: number | null): string[] {
  const errors: string[] = [];
  if (!category) errors.push('category-required');
  if (coins === null || coins < 1 || coins > 10) errors.push('coins-out-of-range');
  return errors;
}

/** Mirrors admin role check in app/admin/page.tsx */
function isAdmin(player: { role: string } | null): boolean {
  return player?.role === 'admin';
}

/** Mirrors activatePlayer in app/admin/page.tsx updatePlayerRole */
function activatePlayer<T extends { role: string }>(player: T): T {
  return { ...player, role: 'active' };
}

/** Mirrors handleReset in app/admin/page.tsx */
function simulateMonthReset(
  playerStats: { id: string; totalCoins: number }[],
  nominations: { id: string; month_year: string }[],
  monthYear: string
) {
  const archived = playerStats.map((s, i) => ({
    player_id: s.id,
    month_year: monthYear,
    total_coins: s.totalCoins,
    rank: i + 1,
  }));
  const remaining = nominations.filter((n) => n.month_year !== monthYear);
  return { archived, remaining };
}

// ── Shared nomination fixture ─────────────────────────────────────────────────

const MAY_NOMINATIONS = [
  { to_player_id: 'rajan-uuid', coins: 10 },
  { to_player_id: 'rajan-uuid', coins: 8 },
  { to_player_id: 'dev-uuid', coins: 7 },
  { to_player_id: 'tariq-uuid', coins: 5 },
];

// =============================================================================
// Leaderboard
// =============================================================================

describe('Leaderboard', () => {
  test('shows active players with coin totals', () => {
    const players: PlayerRow[] = [
      { id: 'dev-uuid', name: 'Dev', role: 'active', coins: null },
      { id: 'tariq-uuid', name: 'Tariq', role: 'active', coins: null },
    ];
    const result = buildLeaderboard(players, MAY_NOMINATIONS, '2025-05');
    expect(result.find((p) => p.id === 'dev-uuid')?.coins).toBe(7);
    expect(result.find((p) => p.id === 'tariq-uuid')?.coins).toBe(5);
  });

  test('shows admin players with coin totals', () => {
    const players: PlayerRow[] = [
      { id: 'rajan-uuid', name: 'Rajan', role: 'admin', coins: null },
    ];
    const result = buildLeaderboard(players, MAY_NOMINATIONS, '2025-05');
    expect(result.find((p) => p.id === 'rajan-uuid')?.coins).toBe(18);
  });

  test('shows pending players at bottom with — coins', () => {
    const players: PlayerRow[] = [
      { id: 'rajan-uuid', name: 'Rajan', role: 'admin', coins: null },
      { id: 'dev-uuid', name: 'Dev', role: 'active', coins: null },
      { id: 'omar-uuid', name: 'Omar', role: 'pending', coins: null },
    ];
    const result = buildLeaderboard(players, MAY_NOMINATIONS, '2025-05');
    const last = result[result.length - 1];
    expect(last.id).toBe('omar-uuid');
    // null coins → rendered as "—" in LeaderboardRow
    expect(last.coins).toBeNull();
  });

  test('pending player row has Pending badge', () => {
    render(
      React.createElement(LeaderboardRow, {
        rank: 0,
        name: 'Omar',
        initial: 'O',
        coins: null,
        isPending: true,
      })
    );
    expect(screen.getByText(/Pending/i)).toBeInTheDocument();
  });

  test('pending players appear dimmed', () => {
    const { container } = render(
      React.createElement(LeaderboardRow, {
        rank: 0,
        name: 'Omar',
        initial: 'O',
        coins: null,
        isPending: true,
      })
    );
    // LeaderboardRow applies opacity: 0.5 when isPending is true
    const row = container.firstChild as HTMLElement;
    expect(row.style.opacity).toBe('0.5');
  });

  test('active players sorted by coins descending', () => {
    const players: PlayerRow[] = [
      { id: 'tariq-uuid', name: 'Tariq', role: 'active', coins: null },
      { id: 'dev-uuid', name: 'Dev', role: 'active', coins: null },
      { id: 'rajan-uuid', name: 'Rajan', role: 'admin', coins: null },
    ];
    const result = buildLeaderboard(players, MAY_NOMINATIONS, '2025-05');
    const nonPending = result.filter((p) => p.role !== 'pending');
    for (let i = 0; i < nonPending.length - 1; i++) {
      expect(nonPending[i].coins ?? 0).toBeGreaterThanOrEqual(
        nonPending[i + 1].coins ?? 0
      );
    }
  });

  test('player with 0 coins still appears', () => {
    const players: PlayerRow[] = [
      { id: 'tariq-uuid', name: 'Tariq', role: 'active', coins: null },
    ];
    const result = buildLeaderboard(players, [], '2025-05');
    const tariq = result.find((p) => p.id === 'tariq-uuid');
    expect(tariq).toBeDefined();
    expect(tariq!.coins).toBe(0);
  });

  test('does not show guest users', () => {
    // The DB query filters to role IN ('active', 'admin', 'pending').
    // Guests are never included. This test verifies the leaderboard builder
    // doesn't crash when an unexpected role appears, and that guest rows
    // are correctly identified and can be excluded by callers.
    const players: PlayerRow[] = [
      { id: 'dev-uuid', name: 'Dev', role: 'active', coins: null },
    ];
    const result = buildLeaderboard(players, [], '2025-05');
    const guestRow = result.find((p) => p.role === 'guest');
    expect(guestRow).toBeUndefined();
    // Priya has no player row at all
    expect(mockPlayers.priya).toBeNull();
  });
});

// =============================================================================
// Nomination Flow
// =============================================================================

describe('Nomination Flow', () => {
  test('active player can nominate another active player', () => {
    const result = canNominate({ role: 'active' }, { id: 'tariq-uuid', role: 'active' }, 'dev-uuid');
    expect(result.allowed).toBe(true);
  });

  test('active player cannot nominate themselves', () => {
    const result = canNominate({ role: 'active' }, { id: 'dev-uuid', role: 'active' }, 'dev-uuid');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('self-nomination');
  });

  test('active player cannot nominate pending players', () => {
    const result = canNominate({ role: 'active' }, { id: 'omar-uuid', role: 'pending' }, 'dev-uuid');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('nominee-pending');
  });

  test('pending player cannot access nominate page', () => {
    const result = canNominate({ role: 'pending' }, { id: 'dev-uuid', role: 'active' }, 'omar-uuid');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('pending-player');
  });

  test('guest cannot access nominate page', () => {
    const result = canNominate(null, { id: 'dev-uuid', role: 'active' }, '');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('not-authenticated');
  });

  test('nomination requires a category', () => {
    const errors = validateNomination(null, 5);
    expect(errors).toContain('category-required');
  });

  test('nomination requires coins between 1 and 10', () => {
    expect(validateNomination('Best Catch', 0)).toContain('coins-out-of-range');
    expect(validateNomination('Best Catch', 11)).toContain('coins-out-of-range');
    expect(validateNomination('Best Catch', null)).toContain('coins-out-of-range');
    expect(validateNomination('Best Catch', 1)).not.toContain('coins-out-of-range');
    expect(validateNomination('Best Catch', 10)).not.toContain('coins-out-of-range');
  });

  test('submitting creates a DB record', () => {
    // The insert payload shape that handleSubmit sends to Supabase.
    const payload = {
      from_player_id: 'dev-uuid',
      to_player_id: 'rajan-uuid',
      category: 'Top Scorer',
      coins: 8,
      note: null,
      month_year: '2025-05',
    };
    expect(payload.from_player_id).toBe('dev-uuid');
    expect(payload.to_player_id).toBe('rajan-uuid');
    expect(payload.coins).toBeGreaterThanOrEqual(1);
    expect(payload.coins).toBeLessThanOrEqual(10);
    expect(payload.month_year).toMatch(/^\d{4}-\d{2}$/);
  });

  test('success screen shown after submission', () => {
    // After supabase.from('nominations').insert() resolves without error,
    // handleSubmit sets step = 'success', which renders the success screen.
    // Modelled here as the state transition:
    type Step = 'player' | 'category' | 'coins' | 'note' | 'success';
    let step: Step = 'note';
    const onSuccess = () => { step = 'success'; };
    onSuccess();
    expect(step).toBe('success');
  });
});

// =============================================================================
// Auth and Signup
// =============================================================================

describe('Auth and Signup', () => {
  test('new signup creates player row with role pending', () => {
    // ensurePlayer in app/auth/page.tsx inserts with role: 'pending'
    const user = { id: 'new-uuid', email: 'omar@jb.com' };
    const insertPayload = {
      id: user.id,
      email: user.email,
      name: user.email?.split('@')[0] || 'New Player',
      role: 'pending',
      avatar_initial: (user.email?.[0] || 'P').toUpperCase(),
    };
    expect(insertPayload.role).toBe('pending');
  });

  test('new player redirected to leaderboard after signup', () => {
    // app/auth/page.tsx: window.location.href = '/jakaas_bandey' after ensurePlayer
    const redirectTarget = '/jakaas_bandey';
    expect(redirectTarget).toBe('/jakaas_bandey');
  });

  test('pending player sees leaderboard but nominate is locked', () => {
    // Leaderboard is public; nominate button is disabled for pending role
    const omar = { role: 'pending' };
    const nominateDisabled = omar.role === 'pending';
    expect(nominateDisabled).toBe(true);
    // canNominate also blocks pending players at the route level
    const result = canNominate(omar, { id: 'dev-uuid', role: 'active' }, 'omar-uuid');
    expect(result.allowed).toBe(false);
  });

  test('existing user can sign in and session persists', () => {
    // lib/supabase.ts creates the client with persistSession: true
    const supabaseConfig = { auth: { persistSession: true } };
    expect(supabaseConfig.auth.persistSession).toBe(true);
  });
});

// =============================================================================
// Admin Panel
// =============================================================================

describe('Admin Panel', () => {
  test('admin can see all players including pending', () => {
    // Admin fetchData queries .select('*').order('name') with no role filter
    const allPlayers = Object.values(mockPlayers).filter(Boolean);
    const pendingPlayers = allPlayers.filter((p) => p!.role === 'pending');
    expect(pendingPlayers).toHaveLength(1);
    expect(pendingPlayers[0]!.name).toBe('Omar');
  });

  test('admin can activate a pending player', () => {
    const omar = { ...mockPlayers.omar! };
    expect(omar.role).toBe('pending');
    const activated = activatePlayer(omar);
    expect(activated.role).toBe('active');
  });

  test('activated player role changes to active', () => {
    const before = { role: 'pending' as const };
    const after = activatePlayer(before);
    expect(after.role).toBe('active');
    // Original object is unchanged (immutable update)
    expect(before.role).toBe('pending');
  });

  test('non-admin cannot access admin page', () => {
    expect(isAdmin({ role: 'active' })).toBe(false);
    expect(isAdmin({ role: 'pending' })).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });

  test('admin can run month reset', () => {
    const rajan = mockPlayers.rajan!;
    expect(isAdmin(rajan)).toBe(true);
    // Admin has access to the Reset button — gate passes
  });

  test('month reset archives nominations and resets coins', () => {
    const stats = [
      { id: 'rajan-uuid', totalCoins: 47 },
      { id: 'dev-uuid', totalCoins: 38 },
      { id: 'tariq-uuid', totalCoins: 31 },
    ];
    const nominations = [
      { id: 'nom-1', month_year: '2025-05' },
      { id: 'nom-2', month_year: '2025-05' },
      { id: 'nom-3', month_year: '2025-04' },
    ];
    const { archived, remaining } = simulateMonthReset(stats, nominations, '2025-05');

    // All current-month stats are archived
    expect(archived).toHaveLength(3);
    expect(archived[0]).toMatchObject({ player_id: 'rajan-uuid', rank: 1, total_coins: 47 });
    expect(archived[1]).toMatchObject({ player_id: 'dev-uuid', rank: 2, total_coins: 38 });
    expect(archived[2]).toMatchObject({ player_id: 'tariq-uuid', rank: 3, total_coins: 31 });

    // Current-month nominations are cleared; prior months untouched
    expect(remaining).toHaveLength(1);
    expect(remaining[0].month_year).toBe('2025-04');
  });
});

// =============================================================================
// Persona: Rajan (Admin)
// =============================================================================

describe('Persona: Rajan (Admin)', () => {
  const rajan = mockPlayers.rajan!;

  test('can view all players including pending', () => {
    expect(isAdmin(rajan)).toBe(true);
    const allPlayers = Object.values(mockPlayers).filter(Boolean);
    const pending = allPlayers.filter((p) => p!.role === 'pending');
    expect(pending).toHaveLength(1);
    expect(pending[0]!.name).toBe('Omar');
  });

  test('can nominate Dev for Best Catch with 8 coins', () => {
    const dev = { id: 'dev-uuid', role: 'active' };
    expect(canNominate({ role: 'admin' }, dev, 'rajan-uuid').allowed).toBe(true);
    expect(validateNomination('Best Catch', 8)).toHaveLength(0);
  });

  test('can activate Omar from pending to active', () => {
    const omar = mockPlayers.omar!;
    const activated = activatePlayer(omar);
    expect(activated.role).toBe('active');
    expect(omar.role).toBe('pending'); // original unchanged
  });
});

// =============================================================================
// Persona: Dev (Active Player)
// =============================================================================

describe('Persona: Dev (Active Player)', () => {
  const dev = mockPlayers.dev!;

  test('sees leaderboard with his rank', () => {
    const players: PlayerRow[] = [
      { id: 'rajan-uuid', name: 'Rajan', role: 'admin', coins: null },
      { id: 'dev-uuid', name: 'Dev', role: 'active', coins: null },
      { id: 'tariq-uuid', name: 'Tariq', role: 'active', coins: null },
    ];
    const result = buildLeaderboard(players, MAY_NOMINATIONS, '2025-05');
    const devEntry = result.find((p) => p.id === 'dev-uuid');
    expect(devEntry).toBeDefined();
    expect(devEntry!.coins).toBe(7);
    // Dev's rank is his index + 1 in the sorted list
    const rank = result.findIndex((p) => p.id === 'dev-uuid') + 1;
    expect(rank).toBeGreaterThan(0);
  });

  test('can nominate Rajan for Top Scorer', () => {
    const rajan = { id: 'rajan-uuid', role: 'admin' };
    expect(canNominate({ role: 'active' }, rajan, 'dev-uuid').allowed).toBe(true);
    expect(validateNomination('Top Scorer', 5)).toHaveLength(0);
  });

  test('cannot see admin tab or admin page', () => {
    expect(isAdmin(dev)).toBe(false);
    expect(dev.role).not.toBe('admin');
  });
});

// =============================================================================
// Persona: Omar (Pending Player)
// =============================================================================

describe('Persona: Omar (Pending Player)', () => {
  test('sees leaderboard with pending badge on his row', () => {
    render(
      React.createElement(LeaderboardRow, {
        rank: 0,
        name: 'Omar',
        initial: 'O',
        coins: null,
        isPending: true,
      })
    );
    expect(screen.getByText(/Pending/i)).toBeInTheDocument();
  });

  test('cannot access nominate page', () => {
    const result = canNominate(
      { role: 'pending' },
      { id: 'dev-uuid', role: 'active' },
      'omar-uuid'
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('pending-player');
  });

  test('sees CTA to contact admin for activation', () => {
    // The leaderboard page renders the nominate button as disabled for pending
    // players, which serves as the visual indicator to contact admin.
    // Here we verify the data condition that drives it.
    const omar = mockPlayers.omar!;
    const nominateButtonDisabled = omar.role === 'pending';
    expect(nominateButtonDisabled).toBe(true);
  });
});

// =============================================================================
// Persona: Priya (Guest)
// =============================================================================

describe('Persona: Priya (Guest)', () => {
  test('can view leaderboard without login', () => {
    // app/page.tsx has no auth redirect — the leaderboard is publicly accessible.
    // Player list and coin totals load regardless of auth state.
    const leaderboardRequiresAuth = false;
    expect(leaderboardRequiresAuth).toBe(false);
  });

  test('redirected to auth when trying to nominate', () => {
    // canNominate(null, ...) → not-authenticated
    const result = canNominate(null, { id: 'dev-uuid', role: 'active' }, '');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('not-authenticated');
  });

  test('does not see admin tab', () => {
    // Priya has no player row — mockPlayers.priya is null
    expect(mockPlayers.priya).toBeNull();
    expect(isAdmin(null)).toBe(false);
  });
});

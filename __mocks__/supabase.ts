export const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  data: null,
  error: null,
};

export const mockPlayers = {
  rajan: {
    id: 'rajan-uuid',
    name: 'Rajan',
    email: 'rajan@jb.com',
    role: 'admin' as const,
    avatar_initial: 'R',
    coins: 47,
    created_at: '2024-01-01T00:00:00Z',
  },
  dev: {
    id: 'dev-uuid',
    name: 'Dev',
    email: 'dev@jb.com',
    role: 'active' as const,
    avatar_initial: 'D',
    coins: 38,
    created_at: '2024-01-02T00:00:00Z',
  },
  tariq: {
    id: 'tariq-uuid',
    name: 'Tariq',
    email: 'tariq@jb.com',
    role: 'active' as const,
    avatar_initial: 'T',
    coins: 31,
    created_at: '2024-01-03T00:00:00Z',
  },
  omar: {
    id: 'omar-uuid',
    name: 'Omar',
    email: 'omar@jb.com',
    role: 'pending' as const,
    avatar_initial: 'O',
    coins: null,
    created_at: '2024-01-04T00:00:00Z',
  },
  priya: null, // guest, no player row
};

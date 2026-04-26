import { Player } from './supabase';

export const mockUser: Player = {
  id: 'mock-user-1',
  name: 'Rajan',
  email: 'rajan@example.com',
  role: 'admin',
  avatar_initial: 'R',
  created_at: new Date().toISOString(),
};

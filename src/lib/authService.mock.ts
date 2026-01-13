// Mock auth service for E2E tests ONLY
// This bypasses Supabase during tests to avoid real network calls and auth logic
import { User } from './types';

// Mock user database
const MOCK_USERS: User[] = [
  {
    id: 'user_123',
    name: 'Moe Traveler',
    email: 'moe@example.com',
    avatar:
      'https://ui-avatars.com/api/?name=Moe+Traveler&background=0D7377&color=fff',
  },
];

const DELAY_MS = 800;

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email || !password) {
          reject(new Error('Email and password are required'));
          return;
        }

        // In test mode, we accept the test user
        const user = MOCK_USERS.find(
          (u) => u.email.toLowerCase() === email.toLowerCase(),
        );

        if (user) {
          resolve(user as User);
        } else {
          // Also accept "persisted@example.com" for the test
          const newUser: User = {
            id: `user_${Date.now()}`,
            name: email.split('@')[0] || 'Traveler',
            email,
            avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0] || 'Traveler'}&background=0D7377&color=fff`,
          };
          resolve(newUser);
        }
      }, DELAY_MS);
    });
  },

  register: async (
    name: string,
    email: string,
    password: string,
  ): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email || !password || !name) {
          reject(new Error('All fields are required'));
          return;
        }

        const newUser: User = {
          id: `user_${Date.now()}`,
          name,
          email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D7377&color=fff`,
        };
        resolve(newUser);
      }, DELAY_MS);
    });
  },

  logout: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  },

  getCurrentUser: async (): Promise<User | null> => {
    // For E2E tests, we don't persist session via this mock service
    // The persistence test relies on localStorage/Context state, which this mock doesn't handle directly
    // But the App.tsx logic handles it.
    return null;
  },
};

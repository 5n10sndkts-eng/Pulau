import { supabase } from './supabase';
import { User } from './types';
import { Database } from './database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

// Mock user database for testing/fallback
const MOCK_USERS: User[] = [
  {
    id: 'user_123',
    name: 'Moe Traveler',
    email: 'moe@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Moe+Traveler&background=0D7377&color=fff',
  },
];
const DELAY_MS = 800;
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    if (USE_MOCK_AUTH) {
      if (import.meta.env.DEV) console.log('🔐 Auth Service: Using MOCK login');
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (!email || !password) { reject(new Error('Email and password are required')); return; }

          // 1. Try to find in hardcoded MOCK_USERS
          let user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());

          // 2. If not found, check if we have a persisted session that matches (simulating a "registered" user in DB)
          if (!user) {
            try {
              const stored = localStorage.getItem('pulau_user');
              if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.email === email) {
                  user = parsed;
                }
              }
            } catch (e) {
              console.warn('Failed to parse stored user', e);
            }
          }

          if (user) {
            // Persist session
            localStorage.setItem('pulau_user', JSON.stringify(user));
            resolve(user);
          }
          else {
            // Mock mode: reject with same message as Supabase for consistency
            reject(new Error('Invalid login credentials'));
          }
        }, DELAY_MS);
      });
    }

    // Real Supabase Login
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!session?.user) throw new Error('Login failed - no user returned');

    // Fetch user profile (use maybeSingle to handle missing profile gracefully)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    const profile = data as ProfileRow | null;
    const name = profile?.full_name || email.split('@')[0] || 'User';
    const avatar = profile?.avatar_url || undefined;

    return {
      id: session.user.id,
      email: session.user.email || '',
      name: name,
      avatar: avatar,
      firstName: profile?.full_name?.split(' ')[0],
      lastName: profile?.full_name?.split(' ').slice(1).join(' '),
      emailVerified: !!session.user.email_confirmed_at,
      createdAt: session.user.created_at,
      preferences: (profile?.preferences as any) || undefined,
      saved: profile?.saved || [],
      currency: profile?.currency || 'USD',
      language: profile?.language || 'en',
    };
  },

  updateProfile: async (userId: string, updates: Partial<User>): Promise<void> => {
    if (USE_MOCK_AUTH) {
      // Update local storage
      const stored = localStorage.getItem('pulau_user');
      if (stored) {
        const user = JSON.parse(stored);
        const updatedUser = { ...user, ...updates };
        localStorage.setItem('pulau_user', JSON.stringify(updatedUser));
      }
      return;
    }

    const dbUpdates: any = {};
    if (updates.name) dbUpdates.full_name = updates.name;
    if (updates.avatar) dbUpdates.avatar_url = updates.avatar;
    if (updates.preferences) dbUpdates.preferences = updates.preferences;
    if (updates.saved) dbUpdates.saved = updates.saved;
    if (updates.currency) dbUpdates.currency = updates.currency;
    if (updates.language) dbUpdates.language = updates.language;

    if (Object.keys(dbUpdates).length === 0) return;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId);

    if (error) throw error;
  },

  register: async (name: string, email: string, password: string, firstName?: string, lastName?: string): Promise<User> => {
    if (USE_MOCK_AUTH) {
      if (import.meta.env.DEV) console.log('🔐 Auth Service: Using MOCK register');
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (!email || !password || !name) { reject(new Error('All fields are required')); return; }
          const newUser = {
            id: `user_${Date.now()}`,
            name,
            email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D7377&color=fff`,
            preferences: undefined,
            saved: [],
            currency: 'USD',
            language: 'en'
          };
          // Persist session
          localStorage.setItem('pulau_user', JSON.stringify(newUser));
          resolve(newUser);
        }, DELAY_MS);
      });
    }

    // Real Supabase Register
    const { data: { user: authUser }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D7377&color=fff`,
        },
      },
    });

    if (error) throw error;
    if (!authUser) throw new Error('Registration failed');

    // Update profile with first/last name if provided
    const derivedFirstName = firstName || name.split(' ')[0];
    const derivedLastName = lastName || name.split(' ').slice(1).join(' ');

    if (derivedFirstName || derivedLastName) {
      await supabase
        .from('profiles')
        .update({
          first_name: derivedFirstName,
          last_name: derivedLastName,
        })
        .eq('id', authUser.id);
    }

    // Return user with defaults
    return {
      id: authUser.id,
      email: authUser.email || '',
      name: name,
      avatar: (authUser.user_metadata?.avatar_url as string) || undefined,
      firstName: derivedFirstName,
      lastName: derivedLastName,
      emailVerified: false,
      createdAt: authUser.created_at,
      saved: [],
      currency: 'USD',
      language: 'en'
    };
  },

  logout: async (): Promise<void> => {
    if (USE_MOCK_AUTH) {
      localStorage.removeItem('pulau_user');
      return new Promise((resolve) => setTimeout(resolve, 500));
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  resetPassword: async (email: string): Promise<void> => {
    if (USE_MOCK_AUTH) {
      if (import.meta.env.DEV) console.log('🔐 Auth Service: Using MOCK password reset');
      return new Promise((resolve) => {
        setTimeout(() => {
          if (import.meta.env.DEV) console.log(`Password reset email sent to: ${email}`);
          resolve();
        }, DELAY_MS);
      });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  },

  updatePassword: async (newPassword: string): Promise<void> => {
    if (USE_MOCK_AUTH) {
      if (import.meta.env.DEV) console.log('🔐 Auth Service: Using MOCK password update');
      return new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  getCurrentUser: async (): Promise<User | null> => {
    if (USE_MOCK_AUTH) {
      try {
        const stored = localStorage.getItem('pulau_user');
        if (stored) {
          console.log('🔐 Auth Service: Check session - Found persisted local user');
          return JSON.parse(stored) as User;
        }
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
      return null;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    const profile = data as ProfileRow | null;

    return {
      id: session.user.id,
      email: session.user.email || '',
      name: profile?.full_name || session.user.email?.split('@')[0] || 'User',
      avatar: profile?.avatar_url || undefined,
      firstName: profile?.full_name?.split(' ')[0],
      lastName: profile?.full_name?.split(' ').slice(1).join(' '),
      emailVerified: !!session.user.email_confirmed_at,
      createdAt: session.user.created_at,
      preferences: (profile?.preferences as any) || undefined,
      saved: profile?.saved || [],
      currency: profile?.currency || 'USD',
      language: profile?.language || 'en',
    };
  }
};

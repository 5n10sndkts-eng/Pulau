/* eslint-disable react-refresh/only-export-components */
// ================================================
// Auth Context - User Authentication State
// Story: 32.1 - Integrate Error Tracking (Sentry)
// AC #4: User Context (anonymized ID only)
// ================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../lib/types';
import { authService } from '../lib/authService';
import { supabase } from '../lib/supabase';
import { setSentryUser } from '../lib/sentry';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: User) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Initialize from Supabase
    useEffect(() => {
        const initAuth = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);
                // Set Sentry user context (AC #4 - anonymized ID only)
                setSentryUser(currentUser?.id || null);
            } catch (error) {
                console.error('Failed to get current user', error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);
                // Set Sentry user context on sign in (AC #4)
                setSentryUser(currentUser?.id || null);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                // Clear Sentry user context on sign out (AC #4)
                setSentryUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const updateUser = async (updatedUser: User) => {
        // Optimistic update
        setUser(updatedUser);

        try {
            if (user?.id) {
                await authService.updateProfile(user.id, updatedUser);
            }
        } catch (error) {
            console.error('Failed to update profile', error);
            // Optionally revert or show toast
        }
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const loggedInUser = await authService.login(email, password);
            setUser(loggedInUser);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            const newUser = await authService.register(name, email, password);
            setUser(newUser);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.logout();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                register,
                logout,
                updateUser,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

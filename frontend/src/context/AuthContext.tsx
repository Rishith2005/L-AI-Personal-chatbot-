import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import { setAuthToken } from '../services/apiClient';
import { authApi } from '../services/authApi';
import type { Profile, User } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      if (session?.access_token) {
        const userProfile = await authApi.getProfile();
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('Failed to load user profile from backend:', err);
      // Fallback: set basic profile using user metadata
      if (session?.user) {
        setProfile({
          id: session.user.id,
          username: session.user.user_metadata?.username || session.user.user_metadata?.full_name || null,
          avatar_url: session.user.user_metadata?.avatar_url || null,
        });
      }
    }
  };

  useEffect(() => {
    // 1. Check active session
    const hasPlaceholder = import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co' || !import.meta.env.VITE_SUPABASE_URL;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setAuthToken(session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email || null,
          role: session.user.role,
        });
        setLoading(false);
      } else if (hasPlaceholder) {
        // Auto-login dummy developer guest account
        const mockSession = {
          access_token: 'dummy-token',
          token_type: 'bearer' as const,
          expires_in: 3600,
          refresh_token: 'dummy-refresh',
          user: {
            id: '00000000-0000-0000-0000-000000000000',
            email: 'guest@l-ai.workspace',
            user_metadata: { username: 'Guest Developer' },
            role: 'authenticated',
          } as any,
        };
        setSession(mockSession);
        setAuthToken(mockSession.access_token);
        setUser({
          id: mockSession.user.id,
          email: mockSession.user.email,
          role: mockSession.user.role,
        });
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setSession(session);
        setAuthToken(session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email || null,
          role: session.user.role,
        });
      } else if (hasPlaceholder) {
        // Maintain mock session in offline mode
      } else {
        setSession(null);
        setAuthToken(null);
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync profile when session changes
  useEffect(() => {
    if (session) {
      refreshProfile();
    }
  }, [session]);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setAuthToken(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signOut,
        refreshProfile,
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

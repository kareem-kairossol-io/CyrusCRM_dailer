import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { AuthService, AuthSession, User } from '@/services/AuthService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<AuthSession>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const segments = useSegments();

  // Load stored session on initial mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const session = await AuthService.getStoredSession();
        if (isMounted && session && session.token) {
          setUser(session.user);
          setToken(session.token);
        }
      } catch (e) {
        console.warn('Failed to load stored auth session from SQLite:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for native 401 Unauthorized event
  useEffect(() => {
    const sub = AuthService.onUnauthorized(() => {
      setUser(null);
      setToken(null);
      if ((segments[0] as string) !== 'login') {
        router.replace('/login' as any);
      }
    });

    return () => {
      sub.remove();
    };
  }, [router, segments]);

  // Route protection
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = (segments[0] as string) === 'login';

    if (!token && !inAuthGroup) {
      router.replace('/login' as any);
    } else if (token && inAuthGroup) {
      router.replace('/' as any);
    }
  }, [token, isLoading, segments, router]);

  const login = async (usernameOrEmail: string, password: string): Promise<AuthSession> => {
    const session = await AuthService.login(usernameOrEmail, password);
    setUser(session.user);
    setToken(session.token);
    router.replace('/' as any);
    return session;
  };

  const logout = async (): Promise<void> => {
    await AuthService.logout();
    setUser(null);
    setToken(null);
    router.replace('/login' as any);
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      const updatedUser = await AuthService.getMe();
      setUser(updatedUser);
    } catch (e) {
      console.warn('Failed to refresh user profile:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        logout,
        refreshProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

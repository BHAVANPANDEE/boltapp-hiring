import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoadingUser: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  guestEmails: Set<string>;
  markEmailAsGuest: (email: string) => void;
  resetGuestEmail: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('boltpay_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('boltpay_token');
  });
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [guestEmails, setGuestEmails] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function verifyExistingSession() {
      const storedToken = localStorage.getItem('boltpay_token');
      if (storedToken) {
        try {
          const freshUser = await api.getMe();
          setUser(freshUser);
          localStorage.setItem('boltpay_user', JSON.stringify(freshUser));
        } catch {
          // Token expired or invalid
          localStorage.removeItem('boltpay_token');
          localStorage.removeItem('boltpay_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoadingUser(false);
    }

    verifyExistingSession();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('boltpay_token', newToken);
    localStorage.setItem('boltpay_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('boltpay_token');
    localStorage.removeItem('boltpay_user');
    setToken(null);
    setUser(null);
  };

  const markEmailAsGuest = (email: string) => {
    setGuestEmails((prev) => new Set(prev).add(email.toLowerCase().trim()));
  };

  const resetGuestEmail = (email: string) => {
    setGuestEmails((prev) => {
      const updated = new Set(prev);
      updated.delete(email.toLowerCase().trim());
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoadingUser,
        login,
        logout,
        guestEmails,
        markEmailAsGuest,
        resetGuestEmail,
      }}
    >
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

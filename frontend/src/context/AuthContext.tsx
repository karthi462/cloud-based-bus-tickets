import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('cloudbus_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('cloudbus_token');
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.success && res.user) {
        setUser({
          id: res.user.id,
          email: res.user.email,
          role: res.user.role,
          fullName: res.user.profile?.fullName || (res.user.role === 'ADMIN' ? 'System Administrator' : undefined),
          passengerId: res.user.profile?.passengerId,
          employeeId: res.user.profile?.employeeId,
          assignedBusId: res.user.profile?.assignedBusId,
          assignedRouteId: res.user.profile?.assignedRouteId,
          biometricEnrolled: res.user.profile?.biometricEnrolled,
        });
      }
    } catch (err) {
      console.warn('Session expired or invalid, logging out', err);
      localStorage.removeItem('cloudbus_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('cloudbus_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('cloudbus_token');
    setToken(null);
    setUser(null);
  };

  const isRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser, isRole }}>
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

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from '../types';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateCredentials: (username: string, password: string) => void;
  addUser: (username: string, password: string) => boolean;
  deleteUser: (username: string) => void;
  users: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    currentUser: '',
    isLoading: true,
  });
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('fm_token');
      if (token) {
        const response = await fetch('http://localhost:4000/api/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setAuthState({
            isAuthenticated: true,
            currentUser: data.username,
            isLoading: false,
          });
        } else {
          await AsyncStorage.removeItem('fm_token');
        }
      }

      // Load users for settings
      const storedUsers = await AsyncStorage.getItem('fm_users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        const defaultUsers = [{ user: 'admin', pass: 'admin123' }];
        setUsers(defaultUsers);
        await AsyncStorage.setItem('fm_users', JSON.stringify(defaultUsers));
      }
    } catch (error) {
      console.warn('Auth initialization error:', error);
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data && data.token) {
        await AsyncStorage.setItem('fm_token', data.token);
        await AsyncStorage.setItem('fm_last_user', data.username || username);
        setAuthState({
          isAuthenticated: true,
          currentUser: data.username || username,
          isLoading: false,
        });
        return true;
      }
    } catch (error) {
      console.warn('Login error:', error);
    }
    return false;
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:4000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      return response.status === 201;
    } catch (error) {
      console.warn('Register error:', error);
      return false;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('fm_token');
    await AsyncStorage.removeItem('fm_last_user');
    setAuthState({
      isAuthenticated: false,
      currentUser: '',
      isLoading: false,
    });
  };

  const updateCredentials = async (newUsername: string, newPassword: string) => {
    const updatedUsers = users.map(user =>
      user.user === authState.currentUser
        ? { user: newUsername, pass: newPassword }
        : user
    );

    setUsers(updatedUsers);
    await AsyncStorage.setItem('fm_users', JSON.stringify(updatedUsers));
    setAuthState(prev => ({ ...prev, currentUser: newUsername }));
    await AsyncStorage.setItem('fm_last_user', newUsername);
  };

  const addUser = (username: string, password: string): boolean => {
    if (users.some(user => user.user.toLowerCase() === username.toLowerCase())) {
      return false;
    }

    const newUsers = [...users, { user: username, pass: password }];
    setUsers(newUsers);
    AsyncStorage.setItem('fm_users', JSON.stringify(newUsers));
    return true;
  };

  const deleteUser = (username: string) => {
    if (username === authState.currentUser) return;

    const newUsers = users.filter(user => user.user !== username);
    setUsers(newUsers);
    AsyncStorage.setItem('fm_users', JSON.stringify(newUsers));
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateCredentials,
    addUser,
    deleteUser,
    users,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

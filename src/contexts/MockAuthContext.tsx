import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUser } from '../services/mockData';
import { AuthUser, AuthContextType, AuthProviderProps } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const MockAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const checkSession = async () => {
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, don't auto-login - require user to sign in
        // setUser(mockUser);
      } catch (error: unknown) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Dummy credentials for demo
      const validCredentials = {
        email: 'admin@truckdata.com',
        password: 'admin123',
        name: 'Truck Admin'
      };
      
      // Check if credentials match dummy data
      if (email === validCredentials.email && password === validCredentials.password) {
        setUser({
          ...mockUser,
          email: validCredentials.email,
          name: validCredentials.name,
        });
      } else {
        throw new Error('Invalid email or password. Use: admin@truckdata.com / admin123');
      }
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    try {
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock registration - accept any valid email/name for demo
      if (email && password && name) {
        setUser({
          id: `user-${Date.now()}`,
          email,
          name,
          user_metadata: {
            full_name: name,
          },
        });
      } else {
        throw new Error('Invalid registration data');
      }
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
    } catch (error: unknown) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a MockAuthProvider');
  }
  return context;
};

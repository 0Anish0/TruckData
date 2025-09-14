import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../config/supabase';
import { AuthUser, AuthContextType, AuthProviderProps } from '../types';
import { User as SupabaseUser } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && session.user.email_confirmed_at) {
        setUser(transformSupabaseUser(session.user));
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Only set user if email is confirmed
          if (session.user.email_confirmed_at) {
            setUser(transformSupabaseUser(session.user));
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Handle token refresh
          if (session.user.email_confirmed_at) {
            setUser(transformSupabaseUser(session.user));
          }
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const transformSupabaseUser = (supabaseUser: SupabaseUser): AuthUser => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
      user_metadata: {
        full_name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
      },
    };
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Check if email is confirmed
        if (!data.user.email_confirmed_at) {
          Alert.alert(
            'Email Not Verified',
            'Please check your email and click the verification link to activate your account.',
            [{ text: 'OK' }]
          );
          // Sign out the user since email is not confirmed
          await supabase.auth.signOut();
          return;
        }

        setUser(transformSupabaseUser(data.user));
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      Alert.alert('Sign In Error', message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Check if email confirmation is required
        if (data.user.email_confirmed_at === null) {
          // Email confirmation required - show message and don't log in
          Alert.alert(
            'Email Verification Required',
            'Please check your email and click the verification link to activate your account.',
            [{ text: 'OK' }]
          );
          return; // Don't set user, stay on login screen
        } else {
          // Email already confirmed - profile is automatically created by trigger
          setUser(transformSupabaseUser(data.user));
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sign up failed';
      Alert.alert('Sign Up Error', message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

      setUser(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sign out failed';
      Alert.alert('Sign Out Error', message);
      throw error;
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
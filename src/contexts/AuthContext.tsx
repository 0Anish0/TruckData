import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../config/supabase';
import { AuthUser, AuthContextType, AuthProviderProps } from '../types';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting initial session:', error);
          setUser(null);
          return;
        }

        if (session?.user) {
          console.log('Initial session found:', {
            userId: session.user.id,
            email: session.user.email,
            emailConfirmed: !!session.user.email_confirmed_at
          });

          // Only set user if email is confirmed
          if (session.user.email_confirmed_at) {
            setUser(transformSupabaseUser(session.user));
          } else {
            console.log('Email not confirmed, clearing session');
            await supabase.auth.signOut();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', {
          event,
          hasSession: !!session,
          hasUser: !!session?.user,
          emailConfirmed: !!session?.user?.email_confirmed_at
        });

        try {
          switch (event) {
            case 'SIGNED_IN':
              if (session?.user) {
                if (session.user.email_confirmed_at) {
                  console.log('User signed in with confirmed email');
                  setUser(transformSupabaseUser(session.user));
                } else {
                  console.log('User signed in but email not confirmed');
                  await supabase.auth.signOut();
                  setUser(null);
                }
              }
              break;

            case 'SIGNED_OUT':
              console.log('User signed out');
              setUser(null);
              break;

            case 'TOKEN_REFRESHED':
              if (session?.user) {
                if (session.user.email_confirmed_at) {
                  setUser(transformSupabaseUser(session.user));
                } else {
                  await supabase.auth.signOut();
                  setUser(null);
                }
              }
              break;

            case 'USER_UPDATED':
              if (session?.user) {
                if (session.user.email_confirmed_at) {
                  setUser(transformSupabaseUser(session.user));
                } else {
                  setUser(null);
                }
              }
              break;

            default:
              console.log('Unhandled auth event:', event);
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const transformSupabaseUser = (supabaseUser: SupabaseUser): AuthUser => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.full_name ||
        supabaseUser.user_metadata?.name ||
        supabaseUser.email?.split('@')[0] ||
        'User',
      user_metadata: {
        full_name: supabaseUser.user_metadata?.full_name ||
          supabaseUser.user_metadata?.name,
      },
    };
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      console.log('Attempting sign in for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('Sign in successful:', {
          userId: data.user.id,
          emailConfirmed: !!data.user.email_confirmed_at
        });

        if (!data.user.email_confirmed_at) {
          console.log('Email not confirmed, signing out');
          await supabase.auth.signOut();
          Alert.alert(
            'Email Not Verified',
            'Please check your email and click the verification link to activate your account.',
            [{ text: 'OK' }]
          );
          return;
        }

        // User will be set by the auth state change listener
      }
    } catch (error: unknown) {
      console.error('Sign in failed:', error);
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
      console.log('Attempting sign up for:', email);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            name: name.trim(),
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('Sign up successful:', {
          userId: data.user.id,
          emailConfirmed: !!data.user.email_confirmed_at
        });

        // Always show verification message for signup
        Alert.alert(
          'Email Verification Required',
          'Please check your email and click the verification link to activate your account. You will be able to sign in after verification.',
          [{ text: 'OK' }]
        );

        // Don't set user - they need to verify email first
        // The auth state change listener will handle setting the user after verification
      }
    } catch (error: unknown) {
      console.error('Sign up failed:', error);
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
      console.log('Signing out user');

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
        throw new Error(error.message);
      }

      // User will be cleared by the auth state change listener
      console.log('Sign out successful');
    } catch (error: unknown) {
      console.error('Sign out failed:', error);
      const message = error instanceof Error ? error.message : 'Sign out failed';
      Alert.alert('Sign Out Error', message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearSession = async (): Promise<void> => {
    try {
      console.log('Clearing session');
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      console.log('Sending password reset for:', email);

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: 'truckfleet://reset-password', // Deep link for mobile
      });

      if (error) {
        console.error('Password reset error:', error);
        throw new Error(error.message);
      }

      Alert.alert(
        'Password Reset Sent',
        'Check your email for a password reset link.',
        [{ text: 'OK' }]
      );
    } catch (error: unknown) {
      console.error('Password reset failed:', error);
      const message = error instanceof Error ? error.message : 'Password reset failed';
      Alert.alert('Password Reset Error', message);
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
    clearSession,
    resetPassword,
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
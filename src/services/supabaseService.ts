import { supabase } from '../config/supabase';
import { AuthUser } from '../types';

export class SupabaseService {
  /**
   * Get the current authenticated user from Supabase session
   * Throws error if user is not authenticated or email not verified
   */
  protected async getCurrentUser(): Promise<AuthUser> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        throw new Error('Failed to get current session');
      }
      
      if (!session) {
        throw new Error('No active session found');
      }
      
      if (!session.user) {
        throw new Error('No user found in session');
      }
      
      if (!session.user.email_confirmed_at) {
        throw new Error('Email not verified. Please check your email and verify your account.');
      }
      
      console.log('Service authenticated user:', {
        userId: session.user.id,
        email: session.user.email,
        emailConfirmed: !!session.user.email_confirmed_at
      });
      
      return {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.full_name || 
              session.user.user_metadata?.name || 
              session.user.email?.split('@')[0] || 
              'User',
        user_metadata: {
          full_name: session.user.user_metadata?.full_name || 
                     session.user.user_metadata?.name,
        },
      };
    } catch (error) {
      console.error('getCurrentUser error:', error);
      throw error;
    }
  }

  /**
   * Get the current user ID
   * Throws error if user is not authenticated
   */
  protected async getUserId(): Promise<string> {
    const user = await this.getCurrentUser();
    return user.id;
  }

  /**
   * Handle errors consistently across all services
   */
  protected async handleError(error: unknown, operation: string): Promise<never> {
    console.error(`${operation} error:`, error);
    
    if (error instanceof Error) {
      // Check if it's an authentication error
      if (error.message.includes('not authenticated') || 
          error.message.includes('Email not verified') ||
          error.message.includes('No active session')) {
        throw new Error('Authentication required. Please sign in again.');
      }
      throw error;
    }
    
    throw new Error(`${operation} failed`);
  }

  /**
   * Check if user is authenticated without throwing error
   */
  protected async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
}

// Utility function to convert image to base64
export const convertImageToBase64 = async (imageUri: string): Promise<string> => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the data:image/...;base64, prefix
        const base64 = base64String.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw new Error('Failed to convert image to base64');
  }
};

// Utility function to convert base64 string to data URI for display
export const base64ToDataUri = (base64String: string, mimeType: string = 'image/jpeg'): string => {
  if (!base64String) return '';
  
  // If it already has a data URI prefix, return as is
  if (base64String.startsWith('data:')) {
    return base64String;
  }
  
  // Add the data URI prefix
  return `data:${mimeType};base64,${base64String}`;
};
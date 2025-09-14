import { supabase } from '../config/supabase';
import { AuthUser } from '../types';

export class SupabaseService {
  protected user: AuthUser | null = null;

  constructor() {
    // Get current user from auth context
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        this.user = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          user_metadata: {
            full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          },
        };
      }
    });
  }

  protected setUser(user: AuthUser | null) {
    this.user = user;
  }

  protected getUserId(): string {
    if (!this.user?.id) {
      throw new Error('User not authenticated');
    }
    return this.user.id;
  }

  protected async handleError(error: unknown, operation: string): Promise<never> {
    console.error(`${operation} error:`, error);
    const message = error instanceof Error ? error.message : `${operation} failed`;
    throw new Error(message);
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

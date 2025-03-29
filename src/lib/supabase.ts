
import { createClient } from '@supabase/supabase-js';

// Note: In a real app, these would be in environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type AuthResponse = {
  success: boolean;
  message?: string;
  error?: any;
};

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { success: false, message: error.message, error };
    }

    return { 
      success: true, 
      message: 'Check your email for the confirmation link'
    };
  } catch (error) {
    return { 
      success: false, 
      message: 'An unexpected error occurred', 
      error 
    };
  }
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, message: error.message, error };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      message: 'An unexpected error occurred', 
      error 
    };
  }
}

export async function signOut(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, message: error.message, error };
    }

    return { success: true, message: 'Signed out successfully' };
  } catch (error) {
    return { 
      success: false, 
      message: 'An unexpected error occurred', 
      error 
    };
  }
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

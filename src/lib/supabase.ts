
import { createClient } from '@supabase/supabase-js';
import { mockSupabase } from './mockAuth';
import { Database } from './supabaseTypes';

// Check if environment variables are defined
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Type definitions
export type AuthError = {
  message: string;
  status?: number;
};

export type AuthResponse = {
  success: boolean;
  message?: string;
  error?: AuthError;
};

// Create a mock client if credentials are missing
const createMockClient = () => {
  console.warn(
    'Supabase credentials missing. Using mock client. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
  
  return mockSupabase;
};

// Create the Supabase client with credentials check
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    })
  : createMockClient();

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      return { 
        success: false, 
        message: error.message, 
        error: { message: error.message, status: error.status }
      };
    }

    return { 
      success: true, 
      message: 'Check your email for the confirmation link'
    };
  } catch (error) {
    return { 
      success: false, 
      message: 'An unexpected error occurred', 
      error: typeof error === 'object' && error !== null 
        ? { message: String(error), status: 500 }
        : { message: 'Unknown error', status: 500 }
    };
  }
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password
    });

    if (error) {
      return { 
      success: false, 
      message: error.message, 
      error: { message: error.message, status: error.status } 
    };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      message: 'An unexpected error occurred', 
      error: typeof error === 'object' && error !== null 
        ? { message: String(error), status: 500 }
        : { message: 'Unknown error', status: 500 }
    };
  }
}

export async function signOut(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { 
        success: false, 
        message: error.message, 
        error: { message: error.message, status: error.status }
      };
    }

    return { success: true, message: 'Signed out successfully' };
  } catch (error) {
    return { 
      success: false, 
      message: 'An unexpected error occurred', 
      error: typeof error === 'object' && error !== null 
        ? { message: String(error), status: 500 }
        : { message: 'Unknown error', status: 500 }
    };
  }
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

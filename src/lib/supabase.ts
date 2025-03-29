
import { createClient } from '@supabase/supabase-js';

// Check if environment variables are defined
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client if credentials are missing
const createMockClient = () => {
  console.warn(
    'Supabase credentials missing. Using mock client. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
  
  // Return a mock client with the same interface
  return {
    auth: {
      signUp: () => Promise.resolve({ data: null, error: new Error('Mock client: Auth not configured') }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Mock client: Auth not configured') }),
      signOut: () => Promise.resolve({ error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
  };
};

// Create the Supabase client with credentials check
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : createMockClient();

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

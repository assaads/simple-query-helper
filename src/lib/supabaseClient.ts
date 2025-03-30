import { createClient, SupabaseClient as BaseSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a custom Supabase client type
export type SupabaseClient = BaseSupabaseClient<Database>;

// Initialize Supabase client
export const supabase: SupabaseClient = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    db: {
      schema: 'public',
    },
  }
);

// Database table types
export type Tables = Database['public']['Tables'];
export type TablesRow<T extends keyof Tables> = Tables[T]['Row'];
export type TablesInsert<T extends keyof Tables> = Tables[T]['Insert'];
export type TablesUpdate<T extends keyof Tables> = Tables[T]['Update'];

// Helper types for database operations
export type WithoutTimestamps<T> = Omit<T, 'created_at' | 'updated_at'>;
export type WithoutSystemFields<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;

// Type-safe filter builder
export type FilterValue = string | number | boolean | null | Array<string | number>;
export type Filters<T> = {
  [K in keyof T]?: FilterValue;
};

/**
 * Utility function to handle Supabase errors
 */
export function handleSupabaseError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error('An unknown error occurred');
}

/**
 * Helper function to create ISO date strings
 */
export function getISOString(): string {
  return new Date().toISOString();
}

/**
 * Helper function to build Supabase filters
 */
export function buildFilters<T extends Record<string, FilterValue>>(
  filters: Partial<T>
): string[] {
  return Object.entries(filters)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}.in.(${value.join(',')})`;
      }
      if (typeof value === 'boolean') {
        return `${key}.is.${value}`;
      }
      if (value === null) {
        return `${key}.is.null`;
      }
      return `${key}.eq.${value}`;
    });
}

/**
 * Helper function to update metadata
 */
export function updateMetadata<T extends { metadata: Record<string, unknown> }>(
  existing: T,
  updates: Partial<T['metadata']>
): T['metadata'] {
  return {
    ...existing.metadata,
    ...updates,
  };
}

/**
 * Type guard for checking if a value is a valid table name
 */
export function isTableName(value: string): value is keyof Tables {
  return value in supabase;
}

// Export Supabase client instance for use in services
export default supabase;

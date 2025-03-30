import type { User } from '@supabase/supabase-js';
import type { ApiKey } from '../supabaseTypes';

export interface AuthenticatedRequest extends Request {
  user: User;
}

export interface ApiKeyRequest extends Request {
  apiKey: ApiKey;
}

export interface RequestWithUser extends Request {
  user: User;
}

export interface ApiResponse {
  error?: string;
  message?: string;
  data?: unknown;
  status?: number;
}

export interface RateLimitInfo {
  count: number;
  resetTime: number;
}

export interface TokenPayload {
  exp: number;
  sub: string;
  [key: string]: unknown;
}

export type RequestWithContext<T> = Request & T;

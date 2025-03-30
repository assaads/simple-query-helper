import { supabase } from './supabaseClient';
import { validateToken } from './security';
import type { User } from '@supabase/supabase-js';
import type { ApiKey } from './supabaseTypes';
import type {
  AuthenticatedRequest,
  ApiKeyRequest,
  RequestWithUser,
  RateLimitInfo,
} from './types/apiTypes';

export type RequestHandler = (req: Request) => Promise<Response>;
export type Middleware = (handler: RequestHandler) => RequestHandler;

/**
 * Check if user is authenticated
 */
export const requireAuth: Middleware = (handler) => async (req) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Attach user to request
  const authenticatedReq = req as RequestWithUser;
  authenticatedReq.user = user;
  return handler(authenticatedReq);
};

/**
 * Verify API key expiration and access
 */
export const validateApiKey: Middleware = (handler) => async (req) => {
  const apiKey = req.headers.get('x-api-key');

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verify key in database
  const { data: keyData, error } = await supabase
    .from('api_keys')
    .select('id, user_id, provider, api_key, is_active, selected_model, created_at, updated_at')
    .eq('api_key', apiKey)
    .eq('is_active', true)
    .single();

  if (error || !keyData) {
    return new Response(JSON.stringify({ error: 'Invalid API key' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Ensure the returned data matches the ApiKey interface
  const apiKeyData: ApiKey = {
    id: keyData.id,
    user_id: keyData.user_id,
    provider: keyData.provider as 'openai' | 'anthropic' | 'gemini',
    api_key: keyData.api_key,
    is_active: keyData.is_active,
    selected_model: keyData.selected_model,
    created_at: keyData.created_at,
    updated_at: keyData.updated_at
  };

  // Attach key info to request
  const apiKeyReq = req as ApiKeyRequest;
  apiKeyReq.apiKey = apiKeyData;
  return handler(apiKeyReq);
};

/**
 * Rate limiting middleware
 */
const rateLimits = new Map<string, RateLimitInfo>();

export const rateLimit = (
  limit: number,
  windowMs: number = 60000
): Middleware => {
  return (handler) => async (req) => {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();

    // Get or create rate limit entry
    let limitInfo = rateLimits.get(ip);
    if (!limitInfo || now > limitInfo.resetTime) {
      limitInfo = { count: 0, resetTime: now + windowMs };
    }

    // Check if limit exceeded
    if (limitInfo.count >= limit) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          resetTime: limitInfo.resetTime,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Reset': limitInfo.resetTime.toString(),
          },
        }
      );
    }

    // Update rate limit info
    limitInfo.count++;
    rateLimits.set(ip, limitInfo);

    return handler(req);
  };
};

/**
 * Check required user roles/permissions
 */
export const requireRole = (roles: string[]): Middleware => {
  return (handler) => async (req) => {
    const authenticatedReq = req as RequestWithUser;
    const user = authenticatedReq.user;
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get user roles from metadata
    const userRoles = (user.user_metadata?.roles || []) as string[];
    const hasRole = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return handler(req);
  };
};

/**
 * Validate CSRF token
 */
export const validateCsrf: Middleware = (handler) => async (req) => {
  const csrfToken = req.headers.get('x-csrf-token');
  const storedToken = sessionStorage.getItem('csrf-token');

  if (!csrfToken || !storedToken || csrfToken !== storedToken) {
    return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return handler(req);
};

/**
 * Apply multiple middleware functions
 */
export const compose = (...middleware: Middleware[]) => {
  return (handler: RequestHandler): RequestHandler => {
    return middleware.reduceRight((acc, mid) => mid(acc), handler);
  };
};

/**
 * Error handling middleware
 */
export const errorHandler: Middleware = (handler) => async (req) => {
  try {
    return await handler(req);
  } catch (err) {
    console.error('Request error:', err);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: err instanceof Error ? err.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// Example protected route handler
export const protectedRoute = compose(
  errorHandler,
  requireAuth,
  validateCsrf,
  rateLimit(100)
);

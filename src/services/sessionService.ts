import { supabase } from '../lib/supabase';
import type { Session, SessionStep, SessionInsert, SessionStepInsert } from '../lib/supabaseTypes';

export class SessionService {
  /**
   * Create a new session
   */
  static async createSession(data: Omit<SessionInsert, 'id'>): Promise<Session | null> {
    const { data: session, error } = await supabase
      .from('sessions')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return null;
    }

    return session;
  }

  /**
   * Get a session by ID
   */
  static async getSession(id: string): Promise<Session | null> {
    const { data: session, error } = await supabase
      .from('sessions')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching session:', error);
      return null;
    }

    return session;
  }

  /**
   * List sessions for the current user with pagination
   */
  static async listSessions(page = 1, limit = 10): Promise<{ sessions: Session[]; count: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const [{ data: sessions, error }, { count, error: countError }] = await Promise.all([
      supabase
        .from('sessions')
        .select()
        .order('created_at', { ascending: false })
        .range(from, to),
      supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
    ]);

    if (error || countError) {
      console.error('Error fetching sessions:', error || countError);
      return { sessions: [], count: 0 };
    }

    return { sessions: sessions || [], count: count || 0 };
  }

  /**
   * Update a session's status or metadata
   */
  static async updateSession(id: string, updates: Partial<Session>): Promise<Session | null> {
    const { data: session, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating session:', error);
      return null;
    }

    return session;
  }

  /**
   * Add a step to a session
   */
  static async addSessionStep(data: Omit<SessionStepInsert, 'id'>): Promise<SessionStep | null> {
    const { data: step, error } = await supabase
      .from('session_steps')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Error adding session step:', error);
      return null;
    }

    return step;
  }

  /**
   * Update a session step
   */
  static async updateSessionStep(
    id: string, 
    updates: Partial<SessionStep>
  ): Promise<SessionStep | null> {
    const { data: step, error } = await supabase
      .from('session_steps')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating session step:', error);
      return null;
    }

    return step;
  }

  /**
   * Get all steps for a session
   */
  static async getSessionSteps(sessionId: string): Promise<SessionStep[]> {
    const { data: steps, error } = await supabase
      .from('session_steps')
      .select()
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching session steps:', error);
      return [];
    }

    return steps || [];
  }

  /**
   * Delete a session and all its steps
   */
  static async deleteSession(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting session:', error);
      return false;
    }

    return true;
  }
}

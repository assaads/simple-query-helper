export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          status: 'active' | 'completed' | 'error' | 'in_progress';
          screenshot_url?: string;
          agent_thoughts?: string[];
          created_at: string;
          updated_at: string;
          metadata: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          status?: 'active' | 'completed' | 'error' | 'in_progress';
          screenshot_url?: string;
          agent_thoughts?: string[];
          metadata?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          status?: 'active' | 'completed' | 'error' | 'in_progress';
          screenshot_url?: string;
          agent_thoughts?: string[];
          metadata?: Record<string, unknown>;
        };
      };
      session_steps: {
        Row: {
          id: string;
          session_id: string;
          description: string;
          screenshot_url: string;
          agent_thoughts: string[];
          status: 'completed' | 'error' | 'pending' | 'in_progress';
          created_at: string;
          updated_at: string;
          metadata: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          session_id: string;
          description: string;
          screenshot_url: string;
          agent_thoughts: string[];
          status?: 'completed' | 'error' | 'pending' | 'in_progress';
          metadata?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          session_id?: string;
          description?: string;
          screenshot_url?: string;
          agent_thoughts?: string[];
          status?: 'completed' | 'error' | 'pending' | 'in_progress';
          metadata?: Record<string, unknown>;
        };
      };
      knowledge_base: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          title: string;
          content: string;
          is_encrypted: boolean;
          created_at: string;
          updated_at: string;
          metadata: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          title: string;
          content: string;
          is_encrypted?: boolean;
          metadata?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          title?: string;
          content?: string;
          is_encrypted?: boolean;
          metadata?: Record<string, unknown>;
        };
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          provider: 'openai' | 'anthropic' | 'gemini';
          api_key: string;
          is_active: boolean;
          selected_model: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: 'openai' | 'anthropic' | 'gemini';
          api_key: string;
          is_active?: boolean;
          selected_model: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: 'openai' | 'anthropic' | 'gemini';
          api_key?: string;
          is_active?: boolean;
          selected_model?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          full_name: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
          metadata: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          full_name: string;
          avatar_url?: string;
          metadata?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          full_name?: string;
          avatar_url?: string;
          metadata?: Record<string, unknown>;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

import { Database as GeneratedDatabase } from './database.types';

export type Database = GeneratedDatabase;
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface ApiKey {
  id: string;
  user_id: string;
  provider: 'openai' | 'anthropic' | 'gemini';
  api_key: string;
  is_active: boolean;
  selected_model: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'error' | 'in_progress';
  screenshot_url?: string;
  agent_thoughts?: string[];
  created_at: string;
  updated_at: string;
  metadata: SessionMetadata;
}

export interface SessionStep {
  id: string;
  session_id: string;
  description: string;
  screenshot_url: string;
  agent_thoughts: string[];
  status: 'completed' | 'error' | 'pending' | 'in_progress';
  created_at: string;
  updated_at: string;
  metadata: Json;
}

export interface SessionMetadata {
  tags?: string[];
  source_url?: string;
  completion_time?: number;
  error_details?: string;
  [key: string]: unknown;
}

export interface KnowledgeBase {
  id: string;
  user_id: string;
  category: string;
  title: string;
  content: string;
  is_encrypted: boolean;
  created_at: string;
  updated_at: string;
  metadata: Json;
}

// Database Table Types
export type Tables = Database['public']['Tables'];

// Insert Types
export type SessionInsert = Tables['sessions']['Insert'];
export type SessionStepInsert = Tables['session_steps']['Insert'];
export type KnowledgeBaseInsert = Tables['knowledge_base']['Insert'];

// Update Types
export type SessionUpdate = Tables['sessions']['Update'];
export type SessionStepUpdate = Tables['session_steps']['Update'];
export type KnowledgeBaseUpdate = Tables['knowledge_base']['Update'];

// Row Types
export type SessionRow = Tables['sessions']['Row'];
export type SessionStepRow = Tables['session_steps']['Row'];
export type KnowledgeBaseRow = Tables['knowledge_base']['Row'];

export type DatabaseError = {
  code: string;
  details: string;
  hint: string;
  message: string;
};

export type TablesInsert = Database['public']['Tables'];
export type TablesUpdate = Database['public']['Tables'];

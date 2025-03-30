import { supabase } from '../lib/supabaseClient';
import type { TablesRow, TablesInsert } from '../lib/supabaseClient';

export type Provider = 'openai' | 'anthropic' | 'gemini';
export type ApiKey = TablesRow<'api_keys'>;

export interface ApiKeyInput {
  user_id: string;
  provider: Provider;
  api_key: string;
  selected_model: string;
  is_active?: boolean;
}

class ApiKeyService {
  async validateKey(
    provider: Provider,
    key: string
  ): Promise<{ isValid: boolean; message?: string }> {
    try {
      // Add provider-specific validation logic here
      switch (provider) {
        case 'openai':
          // OpenAI validation
          return { isValid: true };
        case 'anthropic':
          // Anthropic validation
          return { isValid: true };
        case 'gemini':
          // Gemini validation
          return { isValid: true };
        default:
          return { isValid: false, message: 'Unsupported provider' };
      }
    } catch (error) {
      return { isValid: false, message: 'Invalid API key' };
    }
  }

  async createKey(input: ApiKeyInput): Promise<ApiKey> {
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        ...input,
        is_active: input.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create API key');
    
    return data;
  }

  async updateKey(
    id: string,
    updates: Partial<Omit<ApiKeyInput, 'user_id'>>
  ): Promise<ApiKey> {
    const { data, error } = await supabase
      .from('api_keys')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update API key');
    
    return data;
  }

  async deleteKey(id: string): Promise<void> {
    const { error } = await supabase.from('api_keys').delete().eq('id', id);
    if (error) throw error;
  }

  async getKey(id: string): Promise<ApiKey> {
    const { data, error } = await supabase
      .from('api_keys')
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('API key not found');
    
    return data;
  }

  async getUserKeys(userId: string): Promise<ApiKey[]> {
    const { data, error } = await supabase
      .from('api_keys')
      .select()
      .eq('user_id', userId);

    if (error) throw error;
    if (!data) return [];
    
    return data;
  }

  async getActiveKeyForProvider(userId: string, provider: Provider): Promise<ApiKey | null> {
    const { data, error } = await supabase
      .from('api_keys')
      .select()
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows returned"
    return data;
  }
}

export const apiKeyService = new ApiKeyService();

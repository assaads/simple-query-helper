import { supabase } from '../lib/supabase';
import type { KnowledgeBase, KnowledgeBaseInsert } from '../lib/supabaseTypes';

export class KnowledgeBaseService {
  /**
   * Create a new knowledge base item
   */
  static async createItem(
    data: Omit<KnowledgeBaseInsert, 'id' | 'created_at' | 'updated_at'>
  ): Promise<KnowledgeBase | null> {
    const { data: item, error } = await supabase
      .from('knowledge_base')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Error creating knowledge base item:', error);
      return null;
    }

    return item;
  }

  /**
   * Get a knowledge base item by ID
   */
  static async getItem(id: string): Promise<KnowledgeBase | null> {
    const { data: item, error } = await supabase
      .from('knowledge_base')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching knowledge base item:', error);
      return null;
    }

    return item;
  }

  /**
   * List knowledge base items by category with pagination
   */
  static async listItems(
    category?: string,
    page = 1,
    limit = 10
  ): Promise<{ items: KnowledgeBase[]; count: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('knowledge_base').select('*', { count: 'exact' });

    if (category) {
      query = query.eq('category', category);
    }

    const { data: items, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching knowledge base items:', error);
      return { items: [], count: 0 };
    }

    return { items: items || [], count: count || 0 };
  }

  /**
   * Search knowledge base items by title or content
   */
  static async searchItems(searchTerm: string): Promise<KnowledgeBase[]> {
    const { data: items, error } = await supabase
      .from('knowledge_base')
      .select()
      .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching knowledge base:', error);
      return [];
    }

    return items || [];
  }

  /**
   * Update a knowledge base item
   */
  static async updateItem(
    id: string,
    updates: Partial<Omit<KnowledgeBase, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<KnowledgeBase | null> {
    const { data: item, error } = await supabase
      .from('knowledge_base')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating knowledge base item:', error);
      return null;
    }

    return item;
  }

  /**
   * Delete a knowledge base item
   */
  static async deleteItem(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting knowledge base item:', error);
      return false;
    }

    return true;
  }

  /**
   * Get all categories
   */
  static async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('category')
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    // Get unique categories
    const categories = [...new Set(data.map(item => item.category))];
    return categories;
  }
}

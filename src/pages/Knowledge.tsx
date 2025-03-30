import React from 'react';
import { KnowledgeList } from '../components/knowledge/KnowledgeList';
import { KnowledgeBaseService } from '../services/knowledgeBaseService';
import type { KnowledgeBase } from '../lib/supabaseTypes';

export default function KnowledgePage() {
  const [items, setItems] = React.useState<KnowledgeBase[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [itemsData, categoriesData] = await Promise.all([
        KnowledgeBaseService.listItems(),
        KnowledgeBaseService.getCategories(),
      ]);

      setItems(itemsData.items);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load knowledge base:', err);
      setError('Failed to load knowledge base items');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: string) => {
    try {
      await KnowledgeBaseService.deleteItem(id);
      await loadData();
    } catch (err) {
      console.error('Failed to delete item:', err);
      setError('Failed to delete item');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground mt-2">
          Manage your AI agent's knowledge and preferences.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
          <button
            onClick={loadData}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      <KnowledgeList
        items={items}
        categories={categories}
        onDelete={handleDelete}
        onRefresh={loadData}
      />

      {/* Help Text */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">About Knowledge Base</h3>
        <p className="text-sm text-muted-foreground">
          The knowledge base helps the AI agent understand your preferences and requirements. 
          Add items like work procedures, communication styles, or specific domain knowledge 
          to help the agent perform tasks more effectively.
        </p>
        <div className="mt-4 text-sm">
          <strong>Tips:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
            <li>Group related items using categories</li>
            <li>Be specific and clear in your descriptions</li>
            <li>Use encryption for sensitive information</li>
            <li>Update items as your preferences change</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

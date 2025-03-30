import React from 'react';
import { KnowledgeBaseService } from '../../services/knowledgeBaseService';
import { supabase } from '../../lib/supabaseClient';
import type { KnowledgeBase } from '../../lib/supabaseTypes';

interface KnowledgeFormProps {
  item?: KnowledgeBase;
  categories: string[];
  onSubmit: () => void;
  onCancel: () => void;
}

export function KnowledgeForm({
  item,
  categories,
  onSubmit,
  onCancel,
}: KnowledgeFormProps) {
  const [title, setTitle] = React.useState(item?.title || '');
  const [content, setContent] = React.useState(item?.content || '');
  const [category, setCategory] = React.useState(item?.category || '');
  const [newCategory, setNewCategory] = React.useState('');
  const [isEncrypted, setIsEncrypted] = React.useState(item?.is_encrypted || false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const data = {
        title,
        content,
        category: newCategory || category,
        is_encrypted: isEncrypted,
        user_id: user.id,
        metadata: {},
      };

      if (item) {
        await KnowledgeBaseService.updateItem(item.id, data);
      } else {
        await KnowledgeBaseService.createItem(data);
      }

      onSubmit();
    } catch (err) {
      setError('Failed to save knowledge base item');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-32 p-2 border rounded-md resize-y"
          required
          placeholder="Enter knowledge base content..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        {categories.length > 0 ? (
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 p-2 border rounded-md"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setCategory('')}
              className="px-3 py-2 text-sm text-primary hover:underline"
            >
              New Category
            </button>
          </div>
        ) : (
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Enter new category"
            required
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_encrypted"
          checked={isEncrypted}
          onChange={(e) => setIsEncrypted(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="is_encrypted" className="text-sm">
          Encrypt this content
        </label>
        {isEncrypted && (
          <span className="text-xs text-muted-foreground">
            (Content will be encrypted before storage)
          </span>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm hover:bg-accent rounded-md"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : item ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}

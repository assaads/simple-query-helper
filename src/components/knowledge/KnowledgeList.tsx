import React from 'react';
import type { KnowledgeBase } from '../../lib/supabaseTypes';
import { Dialog } from '../ui/Dialog';
import { KnowledgeForm } from './KnowledgeForm';

interface KnowledgeListProps {
  items: KnowledgeBase[];
  categories: string[];
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function KnowledgeList({
  items,
  categories,
  onDelete,
  onRefresh,
}: KnowledgeListProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [editingItem, setEditingItem] = React.useState<KnowledgeBase | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setIsDeleting(id);
      try {
        await onDelete(id);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const uniqueCategories = React.useMemo(() => {
    return ['all', ...new Set(items.map((item) => item.category))];
  }, [items]);

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search knowledge base..."
            className="w-full p-2 border rounded-md"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border rounded-md min-w-[150px]"
        >
          {uniqueCategories.map((category) => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Add Item
        </button>
      </div>

      {/* Knowledge Items Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-4 border rounded-lg hover:border-primary transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium">{item.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingItem(item)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={isDeleting === item.id}
                  className="p-1 text-destructive hover:text-destructive/80 disabled:opacity-50"
                >
                  {isDeleting === item.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {item.content.length > 150
                ? `${item.content.slice(0, 150)}...`
                : item.content}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-accent rounded-full">
                {item.category}
              </span>
              {item.is_encrypted && (
                <span className="text-xs text-muted-foreground">🔒 Encrypted</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {items.length === 0
              ? 'No knowledge base items found. Add some items to get started.'
              : 'No items match your search criteria.'}
          </p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={showForm || !!editingItem}
        onClose={() => {
          setShowForm(false);
          setEditingItem(null);
        }}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingItem ? 'Edit Knowledge Item' : 'Add Knowledge Item'}
          </h2>
          <KnowledgeForm
            item={editingItem || undefined}
            categories={categories}
            onSubmit={async () => {
              setShowForm(false);
              setEditingItem(null);
              await onRefresh();
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
          />
        </div>
      </Dialog>
    </div>
  );
}

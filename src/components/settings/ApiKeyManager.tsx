import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import type { ApiKey, Provider } from '../../services/apiKeyService';
import { apiKeyService } from '../../services/apiKeyService';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../lib/supabaseClient';
import { LoadingButton } from '../ui/LoadingIndicators';

interface ApiKeyFormData {
  provider: Provider;
  api_key: string;
  selected_model: string;
}

export function ApiKeyManager() {
  const [keys, setKeys] = React.useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAdding, setIsAdding] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<ApiKeyFormData>({
    provider: 'openai',
    api_key: '',
    selected_model: 'gpt-4',
  });

  const { toast } = useToast();

  const loadKeys = React.useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'Please sign in to manage API keys',
        });
        return;
      }

      const keys = await apiKeyService.getUserKeys(user.id);
      setKeys(keys);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load API keys',
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Validate the API key
      const validation = await apiKeyService.validateKey(
        formData.provider,
        formData.api_key
      );

      if (!validation.isValid) {
        toast({
          variant: 'destructive',
          title: 'Invalid API Key',
          description: validation.message || 'Please check your API key',
        });
        return;
      }

      // Create the API key
      await apiKeyService.createKey({
        ...formData,
        user_id: user.id,
      });

      toast({
        title: 'Success',
        description: 'API key added successfully',
      });
      
      await loadKeys();
      setFormData({
        provider: 'openai',
        api_key: '',
        selected_model: 'gpt-4',
      });
      setIsDialogOpen(false);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add API key',
      });
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this API key?')) return;

    try {
      await apiKeyService.deleteKey(id);
      toast({
        title: 'Success',
        description: 'API key deleted successfully',
      });
      await loadKeys();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete API key',
      });
      console.error(err);
    }
  };

  const toggleKeyStatus = async (key: ApiKey) => {
    try {
      await apiKeyService.updateKey(key.id, {
        is_active: !key.is_active,
        provider: key.provider,
        api_key: key.api_key,
        selected_model: key.selected_model,
      });
      toast({
        title: 'Success',
        description: `API key ${key.is_active ? 'disabled' : 'enabled'} successfully`,
      });
      await loadKeys();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update API key status',
      });
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">API Keys</h2>
        <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Dialog.Trigger asChild>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Add New Key
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-background p-6 shadow-lg rounded-lg">
              <Dialog.Title className="text-lg font-semibold">Add API Key</Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground mt-2 mb-4">
                Add a new API key for AI model integration.
              </Dialog.Description>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Provider</label>
                  <select
                    value={formData.provider}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        provider: e.target.value as Provider,
                      }))
                    }
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="gemini">Google Gemini</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">API Key</label>
                  <input
                    type="password"
                    value={formData.api_key}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        api_key: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Default Model
                  </label>
                  <input
                    type="text"
                    value={formData.selected_model}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        selected_model: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div className="pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDialogOpen(false)}
                    className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    type="submit"
                    loading={isAdding}
                    loadingText="Adding..."
                    className="bg-primary text-primary-foreground"
                  >
                    Add Key
                  </LoadingButton>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <div className="space-y-4">
          {keys.map((key) => (
            <div
              key={key.id}
              className="p-4 border rounded-lg flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{key.provider}</div>
                <div className="text-sm text-muted-foreground">
                  Added {new Date(key.created_at).toLocaleDateString()}
                </div>
                <div className="text-sm">Model: {key.selected_model}</div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleKeyStatus(key)}
                  className={`px-3 py-1 rounded text-sm ${
                    key.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {key.is_active ? 'Active' : 'Disabled'}
                </button>
                <button
                  onClick={() => handleDelete(key.id)}
                  className="text-destructive hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {keys.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No API keys added yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

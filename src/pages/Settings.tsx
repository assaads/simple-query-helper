import React from 'react';
import { ApiKeyService } from '../services/apiKeyService';
import type { ApiKey } from '../lib/supabaseTypes';
import { ApiKeyManager } from '../components/settings/ApiKeyManager';
import { ModelSettings as ModelSettingsComponent } from '../components/settings/ModelSettings';
import { type ModelSettings, DEFAULT_MODEL_SETTINGS } from '../lib/settingsTypes';
import { supabase } from '../lib/supabaseClient';

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>([]);
  const [modelSettings, setModelSettings] = React.useState(DEFAULT_MODEL_SETTINGS);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Load API keys and model settings
      const [keysResult, settingsResult] = await Promise.all([
        ApiKeyService.listApiKeys(),
        // TODO: Add model settings service
        // ModelSettingsService.getSettings(),
        Promise.resolve({ settings: DEFAULT_MODEL_SETTINGS }),
      ]);

      setApiKeys(keysResult);
      setModelSettings(settingsResult.settings);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveModelSettings = async (settings: ModelSettings) => {
    try {
      // TODO: Add model settings service
      // await ModelSettingsService.updateSettings(settings);
      setModelSettings(settings);
    } catch (err) {
      console.error('Failed to save model settings:', err);
      throw err;
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
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your API keys and model settings
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

      <div className="space-y-8">
        {/* API Keys Section */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-6">API Keys</h2>
          <ApiKeyManager keys={apiKeys} onRefresh={loadData} />
        </div>

        {/* Model Settings Section */}
        <div className="border rounded-lg p-6">
          <ModelSettingsComponent
            settings={modelSettings}
            onSave={handleSaveModelSettings}
          />
        </div>

        {/* User Preferences Section */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">User Preferences</h2>
          <div className="text-sm text-muted-foreground">
            Coming soon: Theme selection, notification settings, and more.
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">About Settings</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              Configure how the AI agent interacts with you and external services.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>API Keys are required for using AI models and other services</li>
              <li>Model settings control the behavior of AI responses</li>
              <li>Changes take effect immediately</li>
              <li>All settings are stored securely in your account</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

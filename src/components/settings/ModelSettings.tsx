import React from 'react';

interface ModelSettings {
  maxTokens: number;
  temperature: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
}

interface ModelSettingsProps {
  settings: ModelSettings;
  onSave: (settings: ModelSettings) => Promise<void>;
}

export function ModelSettings({ settings, onSave }: ModelSettingsProps) {
  const [localSettings, setLocalSettings] = React.useState(settings);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSave(localSettings);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    key: keyof ModelSettings,
    value: string,
    min = 0,
    max = 1
  ) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    setLocalSettings((prev) => ({
      ...prev,
      [key]: Math.min(Math.max(numValue, min), max),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Model Settings</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configure the behavior of the AI model
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Tokens</label>
            <input
              type="number"
              value={localSettings.maxTokens}
              onChange={(e) => handleChange('maxTokens', e.target.value, 1, 4096)}
              className="w-full p-2 border rounded-md"
              min="1"
              max="4096"
              required
            />
            <p className="text-xs text-muted-foreground">
              Maximum length of the model's response (1-4096)
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Temperature</label>
            <input
              type="number"
              value={localSettings.temperature}
              onChange={(e) => handleChange('temperature', e.target.value)}
              step="0.1"
              className="w-full p-2 border rounded-md"
              min="0"
              max="1"
              required
            />
            <p className="text-xs text-muted-foreground">
              Controls randomness in responses (0-1)
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Top P</label>
            <input
              type="number"
              value={localSettings.topP}
              onChange={(e) => handleChange('topP', e.target.value)}
              step="0.1"
              className="w-full p-2 border rounded-md"
              min="0"
              max="1"
              required
            />
            <p className="text-xs text-muted-foreground">
              Controls diversity of responses (0-1)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Presence Penalty</label>
              <input
                type="number"
                value={localSettings.presencePenalty}
                onChange={(e) => handleChange('presencePenalty', e.target.value)}
                step="0.1"
                className="w-full p-2 border rounded-md"
                min="0"
                max="1"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Frequency Penalty</label>
              <input
                type="number"
                value={localSettings.frequencyPenalty}
                onChange={(e) => handleChange('frequencyPenalty', e.target.value)}
                step="0.1"
                className="w-full p-2 border rounded-md"
                min="0"
                max="1"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </form>
  );
}

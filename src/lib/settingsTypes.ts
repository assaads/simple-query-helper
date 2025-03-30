export interface ModelSettings {
  maxTokens: number;
  temperature: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  autoSave: boolean;
}

export interface Settings {
  model: ModelSettings;
  user: UserPreferences;
}

export const DEFAULT_MODEL_SETTINGS: ModelSettings = {
  maxTokens: 2048,
  temperature: 0.7,
  topP: 0.9,
  presencePenalty: 0.2,
  frequencyPenalty: 0.2,
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  notifications: true,
  autoSave: true,
};

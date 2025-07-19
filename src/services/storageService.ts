import { Message, WebhookConfig } from '../types';

const MESSAGES_KEY = 'webhook-chat-messages';
const WEBHOOK_CONFIG_KEY = 'webhook-chat-config';

export const saveMessages = (messages: Message[]): void => {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
};

export const loadMessages = (): Message[] => {
  try {
    const data = localStorage.getItem(MESSAGES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading messages from storage:', error);
    return [];
  }
};

const saveWebhookConfig = (config: WebhookConfig): void => {
  try {
    // Create a new object with all fields explicitly set
    const configToSave = {
      url: config.url.trim(),
      enabled: Boolean(config.enabled),
      sessionId: config.sessionId.trim(),
      modelName: (config.modelName || '').trim(),
      modifier: (config.modifier || '').trim()
    };
    
    console.log('Saving webhook config:', configToSave);
    localStorage.setItem(WEBHOOK_CONFIG_KEY, JSON.stringify(configToSave));
  } catch (error) {
    console.error('Error saving webhook config:', error);
  }
};

const loadWebhookConfig = (): WebhookConfig => {
  try {
    const data = localStorage.getItem(WEBHOOK_CONFIG_KEY);
    console.log('Raw stored config:', data);
    
    if (!data) {
      return {
        url: '',
        enabled: false,
        sessionId: '',
        modelName: '',
        modifier: ''
      };
    }

    const parsedConfig = JSON.parse(data);
    console.log('Parsed stored config:', parsedConfig);

    // Create a new object with all fields explicitly set and trimmed
    return {
      url: (parsedConfig.url || '').trim(),
      enabled: Boolean(parsedConfig.enabled),
      sessionId: (parsedConfig.sessionId || '').trim(),
      modelName: (parsedConfig.modelName || '').trim(),
      modifier: (parsedConfig.modifier || '').trim()
    };
  } catch (error) {
    console.error('Error loading webhook config:', error);
    return {
      url: '',
      enabled: false,
      sessionId: '',
      modelName: '',
      modifier: ''
    };
  }
};
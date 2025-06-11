import { useState, useEffect } from 'react';
import { WebhookConfig } from '../types';
import { loadWebhookConfig, saveWebhookConfig } from '../services/storageService';
import { isValidWebhookUrl } from '../utils/validation';
import toast from 'react-hot-toast';

export const useWebhook = () => {
  const [config, setConfig] = useState<WebhookConfig>({
    url: '',
    enabled: false,
    sessionId: '',
    modelName: '',
    modifier: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadedConfig = loadWebhookConfig();
    console.log('Loaded webhook config:', loadedConfig);
    setConfig(loadedConfig);
    setLoading(false);
  }, []);

  const updateWebhookUrl = (url: string, sessionId: string, modelName?: string, modifier?: string) => {
    if (!url) {
      setError('Webhook URL cannot be empty');
      toast.error('Webhook URL cannot be empty');
      return false;
    }

    if (!isValidWebhookUrl(url)) {
      setError('Please enter a valid URL');
      toast.error('Please enter a valid URL');
      return false;
    }

    if (!sessionId.trim()) {
      setError('Session ID cannot be empty');
      toast.error('Session ID cannot be empty');
      return false;
    }

    setError(null);
    
    const newConfig: WebhookConfig = {
      url: url.trim(),
      enabled: true,
      sessionId: sessionId.trim(),
      modelName: modelName?.trim() ?? '',
      modifier: modifier?.trim() ?? ''
    };
    
    console.log('Saving new config:', newConfig);
    setConfig(newConfig);
    saveWebhookConfig(newConfig);
    toast.success('Webhook configuration saved');
    return true;
  };

  const toggleWebhook = (enabled: boolean) => {
    if (enabled && !isValidWebhookUrl(config.url)) {
      setError('Cannot enable webhook with invalid URL');
      toast.error('Cannot enable webhook with invalid URL');
      return false;
    }

    setError(null);
    const newConfig = { ...config, enabled };
    setConfig(newConfig);
    saveWebhookConfig(newConfig);
    toast.success(enabled ? 'Webhook enabled' : 'Webhook disabled');
    return true;
  };

  return {
    config,
    loading,
    error,
    updateWebhookUrl,
    toggleWebhook,
  };
};
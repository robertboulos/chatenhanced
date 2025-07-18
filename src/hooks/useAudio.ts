import { useCallback } from 'react';
import { WebhookConfig } from '../types';
import { CompanionPreset } from '../types/companions';
import { sendMessageToWebhook } from '../services/webhookService';
import toast from 'react-hot-toast';

export const useAudio = (
  activeCompanion: CompanionPreset | undefined, 
  updateMessageWithAudio: (messageId: string, audioUrl: string) => void
) => {
  // Create webhook config from active companion
  const webhookConfig: WebhookConfig = {
    url: '', // This will be managed through settings
    enabled: true,
    sessionId: activeCompanion?.sessionId || '',
    modelName: activeCompanion?.modelName || '',
    modifier: activeCompanion?.modifier || ''
  };

  const requestAudio = useCallback(
    async (messageId: string, content: string) => {
      if (!webhookConfig.enabled || !webhookConfig.url) {
        toast.error('Webhook not configured for audio requests');
        return;
      }

      try {
        // Include voice settings from companion
        const generationParams = {
          voice_settings: activeCompanion?.voiceSettings
        };

        const result = await sendMessageToWebhook(
          {
            id: messageId,
            content: `Convert to audio: ${content}`,
            timestamp: Date.now(),
            isImage: false,
          },
          webhookConfig,
          'text', // Audio requests are sent as text with special prefix
          undefined,
          undefined,
          generationParams
        );

        if (result.success && result.audioUrl) {
          updateMessageWithAudio(messageId, result.audioUrl);
          toast.success('Audio generated successfully');
        } else {
          toast.error('Failed to generate audio');
        }
      } catch (error) {
        console.error('Audio request failed:', error);
        toast.error('Failed to request audio');
      }
    },
    [activeCompanion, webhookConfig, updateMessageWithAudio]
  );

  return { requestAudio };
};
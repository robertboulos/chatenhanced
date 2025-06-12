import { useCallback } from 'react';
import { WebhookConfig } from '../types';
import { sendMessageToWebhook } from '../services/webhookService';
import toast from 'react-hot-toast';

export const useAudio = (
  webhookConfig: WebhookConfig, 
  updateMessageWithAudio: (messageId: string, audioUrl: string) => void
) => {
  const requestAudio = useCallback(
    async (messageId: string, content: string) => {
      if (!webhookConfig.enabled || !webhookConfig.url) {
        toast.error('Webhook not configured for audio requests');
        return;
      }

      try {
        const result = await sendMessageToWebhook(
          {
            id: messageId,
            content: `Convert to audio: ${content}`,
            timestamp: Date.now(),
            isImage: false,
          },
          webhookConfig,
          'text' // Audio requests are sent as text with special prefix
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
    [webhookConfig, updateMessageWithAudio]
  );

  return { requestAudio };
};
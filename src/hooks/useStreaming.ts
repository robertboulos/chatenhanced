import { useState, useCallback, useRef } from 'react';
import { WebhookConfig } from '../types';
import toast from 'react-hot-toast';

interface StreamingState {
  isStreaming: boolean;
  streamingMessageId: string | null;
  streamingContent: string;
}

export const useStreaming = (
  webhookConfig: WebhookConfig,
  onStreamingMessage: (messageId: string, content: string, isComplete: boolean) => void
) => {
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    streamingMessageId: null,
    streamingContent: '',
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStreaming = useCallback(
    async (messageId: string, prompt: string, requestType: 'text' | 'image' | 'video' = 'text') => {
      if (!webhookConfig.enabled || !webhookConfig.url) {
        toast.error('Webhook not configured for streaming');
        return false;
      }

      // Cancel any existing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setStreamingState({
        isStreaming: true,
        streamingMessageId: messageId,
        streamingContent: '',
      });

      try {
        const response = await fetch(`${webhookConfig.url}/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
          },
          body: JSON.stringify({
            sessionId: webhookConfig.sessionId,
            content: prompt,
            timestamp: Date.now(),
            modelName: webhookConfig.modelName,
            modifier: webhookConfig.modifier,
            requestType,
            stream: true,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body reader available');
        }

        const decoder = new TextDecoder();
        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                onStreamingMessage(messageId, accumulatedContent, true);
                setStreamingState({
                  isStreaming: false,
                  streamingMessageId: null,
                  streamingContent: '',
                });
                return true;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  accumulatedContent += parsed.content;
                  setStreamingState(prev => ({
                    ...prev,
                    streamingContent: accumulatedContent,
                  }));
                  onStreamingMessage(messageId, accumulatedContent, false);
                }
              } catch (e) {
                // Skip invalid JSON chunks
                console.warn('Invalid JSON in stream:', data);
              }
            }
          }
        }

        return true;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Stream aborted');
          return false;
        }

        console.error('Streaming failed:', error);
        toast.error(`Streaming failed: ${error.message}`);
        
        setStreamingState({
          isStreaming: false,
          streamingMessageId: null,
          streamingContent: '',
        });
        
        return false;
      }
    },
    [webhookConfig, onStreamingMessage]
  );

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setStreamingState({
      isStreaming: false,
      streamingMessageId: null,
      streamingContent: '',
    });
  }, []);

  return {
    streamingState,
    startStreaming,
    stopStreaming,
  };
};
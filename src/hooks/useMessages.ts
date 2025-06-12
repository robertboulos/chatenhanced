import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, WebhookConfig } from '../types';
import { saveMessages, loadMessages } from '../services/storageService';
import { sendMessageToWebhook, retryFailedMessage } from '../services/webhookService';
import { isImageUrl } from '../utils/validation';
import toast from 'react-hot-toast';

export const useMessages = (webhookConfig: WebhookConfig, onImageReceived?: (imageUrl: string) => void) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [waiting, setWaiting] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  useEffect(() => {
    const loadedMessages = loadMessages();
    setMessages(loadedMessages);
    setLoading(false);
  }, []);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const addMessage = useCallback((message: Message) => {
    setMessages(prevMessages => {
      // Check if message already exists to prevent duplicates
      const exists = prevMessages.some(m => m.id === message.id);
      if (exists) {
        return prevMessages;
      }
      return [...prevMessages, message];
    });
  }, []);

  const updateMessageStatus = useCallback((messageId: string, status: Message['status']) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId
          ? { ...msg, status }
          : msg
      )
    );
  }, []);

  const updateMessageWithAudio = useCallback((messageId: string, audioUrl: string) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId
          ? { ...msg, audioUrl }
          : msg
      )
    );
  }, []);

  const updateStreamingMessage = useCallback((messageId: string, content: string, isComplete: boolean) => {
    setMessages(prevMessages => {
      const existingIndex = prevMessages.findIndex(m => m.id === messageId);
      
      if (existingIndex >= 0) {
        // Update existing streaming message
        const updatedMessages = [...prevMessages];
        updatedMessages[existingIndex] = {
          ...updatedMessages[existingIndex],
          content,
          status: isComplete ? 'sent' : 'sending',
        };
        return updatedMessages;
      } else {
        // Create new streaming message
        const newMessage: Message = {
          id: messageId,
          content,
          timestamp: Date.now(),
          type: 'received',
          status: isComplete ? 'sent' : 'sending',
          isImage: false,
        };
        return [...prevMessages, newMessage];
      }
    });

    if (isComplete) {
      setStreamingMessageId(null);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string, requestType: 'text' | 'image' | 'video' = 'text', imageData?: string, currentImageUrl?: string) => {
      if (!content.trim() && !imageData) return;

      const isImage = isImageUrl(content);
      const messageId = uuidv4();
      
      // Create and add the sent message
      const newMessage: Message = {
        id: messageId,
        content,
        timestamp: Date.now(),
        type: 'sent',
        status: 'sending',
        isImage,
        imageData, // Store the base64 image data
      };

      addMessage(newMessage);

      // Send to webhook if configured
      if (webhookConfig.enabled && webhookConfig.url) {
        try {
          setWaiting(true);
          
          // Check if streaming is supported
          const supportsStreaming = webhookConfig.url.includes('/stream') || 
                                   webhookConfig.modelName?.includes('stream');
          
          if (supportsStreaming && requestType === 'text') {
            // Use streaming for text responses
            const streamingResponseId = uuidv4();
            setStreamingMessageId(streamingResponseId);
            
            // This would be handled by the streaming hook
            // For now, fall back to regular webhook
          }
          
          const result = await sendMessageToWebhook(
            {
              id: messageId,
              content: newMessage.content,
              timestamp: newMessage.timestamp,
              isImage: newMessage.isImage,
            },
            webhookConfig,
            requestType,
            imageData,
            currentImageUrl
          );

          if (result.success) {
            updateMessageStatus(messageId, 'sent');
            
            // Handle image URL response if present
            if (result.response && onImageReceived) {
              onImageReceived(result.response);
            }

            // Handle text message response if present
            if (result.additionalResponse) {
              const textMessage: Message = {
                id: uuidv4(),
                content: result.additionalResponse,
                timestamp: Date.now(),
                type: 'received',
                status: 'sent',
                isImage: false,
                audioUrl: result.audioUrl, // Add audio URL if present
              };
              addMessage(textMessage);
            }
          } else {
            updateMessageStatus(messageId, 'failed');
            toast.error(`Failed to send message: ${result.error}`);
          }
        } catch (error) {
          updateMessageStatus(messageId, 'failed');
          toast.error('Failed to send message to webhook');
        } finally {
          setWaiting(false);
        }
      } else {
        // Update status to 'sent' even if webhook isn't configured
        updateMessageStatus(messageId, 'sent');
      }
    },
    [webhookConfig, addMessage, updateMessageStatus, onImageReceived]
  );

  const retryMessage = useCallback(
    async (messageId: string) => {
      const message = messages.find((msg) => msg.id === messageId);
      if (!message || message.status !== 'failed') return;

      updateMessageStatus(messageId, 'sending');

      try {
        setWaiting(true);
        const result = await retryFailedMessage(message, webhookConfig);
        
        if (result.success) {
          updateMessageStatus(messageId, 'sent');
          toast.success('Message resent successfully');
          
          // Handle image URL response if present
          if (result.response && onImageReceived) {
            onImageReceived(result.response);
          }

          // Handle text message response if present
          if (result.additionalResponse) {
            const textMessage: Message = {
              id: uuidv4(),
              content: result.additionalResponse,
              timestamp: Date.now(),
              type: 'received',
              status: 'sent',
              isImage: false,
              audioUrl: result.audioUrl, // Add audio URL if present
            };
            addMessage(textMessage);
          }
        } else {
          updateMessageStatus(messageId, 'failed');
          toast.error(`Failed to resend message: ${result.error}`);
        }
      } catch (error) {
        updateMessageStatus(messageId, 'failed');
        toast.error('Failed to resend message');
      } finally {
        setWaiting(false);
      }
    },
    [messages, webhookConfig, addMessage, updateMessageStatus, onImageReceived]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    saveMessages([]);
    toast.success('Chat history cleared');
  }, []);

  return {
    messages,
    loading,
    waiting,
    streamingMessageId,
    sendMessage,
    retryMessage,
    clearMessages,
    updateMessageWithAudio,
    updateStreamingMessage,
  };
};
import React, { useState } from 'react';
import ChatHeader from './ChatHeader';
import ChatBody from './ChatBody';
import ChatInput from './ChatInput';
import SettingsModal from '../Settings/SettingsModal';
import { Message, WebhookConfig } from '../../types';
import { MessageSquare } from 'lucide-react';
import { useNotificationSound } from '../../hooks/useNotificationSound';

interface StreamingState {
  isStreaming: boolean;
  streamingMessageId: string | null;
  streamingContent: string;
}

interface ChatContainerProps {
  messages: Message[];
  loading: boolean;
  onSendMessage: (message: string, requestType: 'text' | 'image', imageData?: string, currentImageUrl?: string) => void;
  onRetryMessage: (messageId: string) => void;
  onClearChat: () => void;
  webhookConfig: WebhookConfig;
  webhookError: string | null;
  onUpdateWebhook: (url: string, sessionId: string, modelName: string, modifier: string) => boolean;
  onToggleWebhook: (enabled: boolean) => boolean;
  onRequestAudio?: (messageId: string, content: string) => void;
  streamingState?: StreamingState;
  onStopStreaming?: () => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  loading,
  onSendMessage,
  onRetryMessage,
  onClearChat,
  webhookConfig,
  webhookError,
  onUpdateWebhook,
  onToggleWebhook,
  onRequestAudio,
  streamingState,
  onStopStreaming,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { soundEnabled, toggleSound, playNotificationSound } = useNotificationSound();

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  const handleSaveWebhook = (url: string, sessionId: string, modelName: string, modifier: string) => {
    const success = onUpdateWebhook(url, sessionId, modelName, modifier);
    if (success) {
      setIsSettingsOpen(false);
    }
    return success;
  };

  const handleSendMessage = (message: string, requestType: 'text' | 'image', imageData?: string) => {
    onSendMessage(message, requestType, imageData);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-800 overflow-hidden">
      <ChatHeader 
        onOpenSettings={handleOpenSettings}
        onClearChat={onClearChat}
        webhookConfigured={webhookConfig.enabled && !!webhookConfig.url}
        streamingState={streamingState}
        onStopStreaming={onStopStreaming}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />
      
      <ChatBody 
        messages={messages} 
        loading={loading}
        onRetryMessage={onRetryMessage}
        onRequestAudio={onRequestAudio}
        streamingState={streamingState}
        onNotificationSound={playNotificationSound}
      />
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={loading || streamingState?.isStreaming}
      />
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        config={webhookConfig}
        onSaveWebhook={handleSaveWebhook}
        onToggleWebhook={onToggleWebhook}
        error={webhookError}
      />

      {!webhookConfig.url && !isSettingsOpen && (
        <div 
          className="fixed bottom-24 right-4 animate-bounce cursor-pointer z-40"
          onClick={handleOpenSettings}
        >
          <div className="bg-indigo-600 text-white p-3 rounded-full shadow-lg flex items-center">
            <MessageSquare className="mr-2" size={16} />
            <span className="text-sm font-medium">Configure Webhook</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
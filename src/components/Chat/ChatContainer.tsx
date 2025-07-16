import React, { useState } from 'react';
import ChatHeader from './ChatHeader';
import ChatBody from './ChatBody';
import ChatInput from './ChatInput';
import SettingsModal from '../Settings/SettingsModal';
import CompanionEditor from '../Companions/CompanionEditor';
import { Message, WebhookConfig } from '../../types';
import { CompanionPreset } from '../../types/companions';
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
  // Companion props
  companions: CompanionPreset[];
  activeCompanion: CompanionPreset;
  onSwitchCompanion: (companionId: string) => void;
  onCreateCompanion: (name: string, personality: string, sessionId: string, avatar?: string) => CompanionPreset | null;
  onUpdateCompanion: (companionId: string, updates: Partial<CompanionPreset>) => void;
  onDuplicateCompanion: (companionId: string) => CompanionPreset | null;
  onDeleteCompanion: (companionId: string) => boolean;
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
  companions,
  activeCompanion,
  onSwitchCompanion,
  onCreateCompanion,
  onUpdateCompanion,
  onDuplicateCompanion,
  onDeleteCompanion,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCompanionEditorOpen, setIsCompanionEditorOpen] = useState(false);
  const [editingCompanion, setEditingCompanion] = useState<CompanionPreset | null>(null);
  const [companionEditorMode, setCompanionEditorMode] = useState<'create' | 'edit'>('create');
  
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

  const handleCreateCompanion = () => {
    setEditingCompanion(null);
    setCompanionEditorMode('create');
    setIsCompanionEditorOpen(true);
  };

  const handleEditCompanion = (companion: CompanionPreset) => {
    setEditingCompanion(companion);
    setCompanionEditorMode('edit');
    setIsCompanionEditorOpen(true);
  };

  const handleSaveCompanion = (companionData: Partial<CompanionPreset>) => {
    if (editingCompanion) {
      onUpdateCompanion(editingCompanion.id, companionData);
    }
  };

  const handleCreateCompanionSubmit = (name: string, personality: string, sessionId: string, avatar?: string) => {
    onCreateCompanion(name, personality, sessionId, avatar);
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
        companions={companions}
        activeCompanion={activeCompanion}
        onSwitchCompanion={onSwitchCompanion}
        onCreateCompanion={handleCreateCompanion}
        onEditCompanion={handleEditCompanion}
        onDuplicateCompanion={onDuplicateCompanion}
        onDeleteCompanion={onDeleteCompanion}
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
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        config={webhookConfig}
        onSaveWebhook={handleSaveWebhook}
        onToggleWebhook={onToggleWebhook}
        error={webhookError}
      />

      {/* Companion Editor Modal */}
      <CompanionEditor
        isOpen={isCompanionEditorOpen}
        onClose={() => setIsCompanionEditorOpen(false)}
        companion={editingCompanion}
        onSave={handleSaveCompanion}
        onCreate={handleCreateCompanionSubmit}
        mode={companionEditorMode}
      />

      {/* Setup Prompt for New Users */}
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
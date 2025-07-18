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
  onRequestAudio?: (messageId: string, content: string) => void;
  streamingState?: StreamingState;
  onStopStreaming?: () => void;
  // Theme props
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  // Companion props
  companions: CompanionPreset[];
  activeCompanion: CompanionPreset;
  onSwitchCompanion: (companionId: string) => void;
  onCreateCompanion: (name: string, personality: string, sessionId: string, avatar?: string, modelName?: string, modifier?: string) => CompanionPreset | null;
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
  onRequestAudio,
  streamingState,
  onStopStreaming,
  theme,
  onToggleTheme,
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

  // Create webhook config from active companion
  const webhookConfig: WebhookConfig = {
    url: '', // This will be set from settings
    enabled: true,
    sessionId: activeCompanion.sessionId,
    modelName: activeCompanion.modelName,
    modifier: activeCompanion.modifier
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  const handleSaveWebhook = (url: string, sessionId: string, modelName: string, modifier: string) => {
    // Update the active companion with new settings
    onUpdateCompanion(activeCompanion.id, {
      sessionId,
      modelName,
      modifier
    });
    setIsSettingsOpen(false);
    return true;
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

  const handleCreateCompanionSubmit = (name: string, personality: string, sessionId: string, avatar?: string, modelName?: string, modifier?: string) => {
    onCreateCompanion(name, personality, sessionId, avatar, modelName, modifier);
  };

  const handleSendMessage = (message: string, requestType: 'text' | 'image', imageData?: string) => {
    onSendMessage(message, requestType, imageData);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-800 dark:bg-gray-50 overflow-hidden">
      <ChatHeader 
        onOpenSettings={handleOpenSettings}
        onClearChat={onClearChat}
        webhookConfigured={true} // Always show as configured since we use companion settings
        streamingState={streamingState}
        onStopStreaming={onStopStreaming}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        theme={theme}
        onToggleTheme={onToggleTheme}
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
        config={{
          url: '',
          enabled: true,
          sessionId: activeCompanion.sessionId,
          modelName: activeCompanion.modelName,
          modifier: activeCompanion.modifier
        }}
        onSaveWebhook={handleSaveWebhook}
        onToggleWebhook={() => true}
        error={null}
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

    </div>
  );
};

export default ChatContainer;
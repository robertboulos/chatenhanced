import React, { useState } from 'react';
import { Settings, Trash2, Square, Volume2, VolumeX, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { CompanionPreset } from '../../types/companions';
import CompanionSelector from '../Companions/CompanionSelector';

interface StreamingState {
  isStreaming: boolean;
  streamingMessageId: string | null;
  streamingContent: string;
}

interface ChatHeaderProps {
  onOpenSettings: () => void;
  onClearChat: () => void;
  webhookConfigured: boolean;
  streamingState?: StreamingState;
  onStopStreaming?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  // Companion props
  companions: CompanionPreset[];
  activeCompanion: CompanionPreset;
  onSwitchCompanion: (companionId: string) => void;
  onCreateCompanion: () => void;
  onEditCompanion: (companion: CompanionPreset) => void;
  onDuplicateCompanion: (companionId: string) => void;
  onDeleteCompanion: (companionId: string) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onOpenSettings, 
  onClearChat,
  webhookConfigured,
  streamingState,
  onStopStreaming,
  soundEnabled,
  onToggleSound,
  companions,
  activeCompanion,
  onSwitchCompanion,
  onCreateCompanion,
  onEditCompanion,
  onDuplicateCompanion,
  onDeleteCompanion,
}) => {
  return (
    <div className="bg-zinc-800 border-b border-zinc-700 p-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        {/* Companion Selector */}
        <CompanionSelector
          companions={companions}
          activeCompanion={activeCompanion}
          onSwitchCompanion={onSwitchCompanion}
          onCreateCompanion={onCreateCompanion}
          onEditCompanion={onEditCompanion}
          onDuplicateCompanion={onDuplicateCompanion}
          onDeleteCompanion={onDeleteCompanion}
          disabled={streamingState?.isStreaming}
        />

        {/* Connection Status */}
        {webhookConfigured && (
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-xs text-green-400 font-medium">Connected</span>
          </div>
        )}
        
        {/* Streaming Status */}
        {streamingState?.isStreaming && (
          <div className="flex items-center">
            <div className="flex space-x-1 mr-2">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-xs text-blue-400 font-medium">Streaming...</span>
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        {/* Stop Streaming */}
        {streamingState?.isStreaming && onStopStreaming && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onStopStreaming}
            className="p-2 text-zinc-400 hover:text-red-400 rounded-full hover:bg-zinc-700 transition-colors"
            title="Stop streaming"
          >
            <Square size={18} />
          </motion.button>
        )}

        {/* Sound Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleSound}
          className={`p-2 rounded-full transition-colors ${
            soundEnabled 
              ? 'text-blue-400 hover:text-blue-300 hover:bg-zinc-700' 
              : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700'
          }`}
          title={soundEnabled ? 'Disable notification sounds' : 'Enable notification sounds'}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </motion.button>
        
        {/* Clear Chat */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClearChat}
          className="p-2 text-zinc-400 hover:text-red-400 rounded-full hover:bg-zinc-700 transition-colors"
          title="Clear chat history and images"
        >
          <Trash2 size={18} />
        </motion.button>
        
        {/* Settings */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onOpenSettings}
          className="p-2 text-zinc-400 hover:text-indigo-400 rounded-full hover:bg-zinc-700 transition-colors"
          title="Settings"
        >
          <Settings size={18} />
        </motion.button>
      </div>
    </div>
  );
};

export default ChatHeader;
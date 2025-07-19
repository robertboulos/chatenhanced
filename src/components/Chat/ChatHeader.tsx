import React, { useState } from 'react';
import { Settings, Trash2, Square, Volume2, VolumeX, Plus, Sun, Moon } from 'lucide-react';
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
  // Theme props
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
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
  theme,
  onToggleTheme,
  companions,
  activeCompanion,
  onSwitchCompanion,
  onCreateCompanion,
  onEditCompanion,
  onDuplicateCompanion,
  onDeleteCompanion,
}) => {
  return (
    <div className="bg-white dark:bg-zinc-800 border-b border-gray-300 dark:border-zinc-700 p-2 sm:p-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
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
          <div className="hidden sm:flex items-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-xs text-green-400 dark:text-green-600 font-medium">Connected</span>
          </div>
        )}
        
        {/* Streaming Status */}
        {streamingState?.isStreaming && (
          <div className="hidden sm:flex items-center">
            <div className="flex space-x-1 mr-2">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-xs text-blue-400 dark:text-blue-600 font-medium">Streaming...</span>
          </div>
        )}
      </div>
      
      <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
        {/* Stop Streaming */}
        {streamingState?.isStreaming && onStopStreaming && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onStopStreaming}
            className="p-1.5 sm:p-2 text-gray-600 dark:text-zinc-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
            title="Stop streaming"
          >
            <Square size={16} className="sm:w-[18px] sm:h-[18px]" />
          </motion.button>
        )}

        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleTheme}
          className={`p-1.5 sm:p-2 rounded-full transition-colors ${
            theme === 'dark'
              ? 'text-yellow-400 hover:text-yellow-300 hover:bg-zinc-700'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Moon size={16} className="sm:w-[18px] sm:h-[18px]" />}
        </motion.button>

        {/* Sound Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleSound}
          className={`p-1.5 sm:p-2 rounded-full transition-colors ${
            soundEnabled 
              ? 'text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-gray-100 dark:hover:bg-zinc-700' 
              : 'text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
          }`}
          title={soundEnabled ? 'Disable notification sounds' : 'Enable notification sounds'}
        >
          {soundEnabled ? <Volume2 size={16} className="sm:w-[18px] sm:h-[18px]" /> : <VolumeX size={16} className="sm:w-[18px] sm:h-[18px]" />}
        </motion.button>
        
        {/* Clear Chat */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClearChat}
          className="p-1.5 sm:p-2 text-gray-600 dark:text-zinc-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          title="Clear chat history and images"
        >
          <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
        </motion.button>
        
        {/* Settings */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onOpenSettings}
          className="p-1.5 sm:p-2 text-gray-600 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          title="Settings"
        >
          <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
        </motion.button>
      </div>
    </div>
  );
};

export default ChatHeader;
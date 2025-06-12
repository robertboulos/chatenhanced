import React from 'react';
import { Settings, Trash2, Square } from 'lucide-react';
import { motion } from 'framer-motion';

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
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onOpenSettings, 
  onClearChat,
  webhookConfigured,
  streamingState,
  onStopStreaming
}) => {
  return (
    <div className="bg-zinc-800 border-b border-zinc-700 p-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-zinc-100">Live Chat</h1>
        {webhookConfigured && (
          <div className="ml-3 flex items-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-xs text-green-400 font-medium">Connected</span>
          </div>
        )}
        
        {streamingState?.isStreaming && (
          <div className="ml-3 flex items-center">
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
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClearChat}
          className="p-2 text-zinc-400 hover:text-red-400 rounded-full hover:bg-zinc-700 transition-colors"
          title="Clear chat history and images"
        >
          <Trash2 size={18} />
        </motion.button>
        
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
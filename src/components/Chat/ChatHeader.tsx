import React from 'react';
import { Settings, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatHeaderProps {
  onOpenSettings: () => void;
  onClearChat: () => void;
  webhookConfigured: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onOpenSettings, 
  onClearChat,
  webhookConfigured 
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
      </div>
      
      <div className="flex space-x-2">
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
import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { MessageSquare, Image } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSendMessage: (message: string, requestType: 'text' | 'image') => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: FormEvent, requestType: 'text' | 'image') => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSendMessage(message, requestType);
      setMessage('');
    }
  };

  const buttonBaseClasses = "p-2.5 rounded-full transition-all duration-200 flex items-center justify-center min-w-[44px]";
  const isMessageEmpty = !message.trim();
  const isDisabled = disabled || isMessageEmpty;

  return (
    <div className="border-t border-zinc-700 p-4 bg-zinc-800 shadow-lg">
      <form className="flex items-center space-x-3">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-3 border border-zinc-600 bg-zinc-700 text-zinc-100 placeholder-zinc-400 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!isDisabled) {
                handleSubmit(e, 'text');
              }
            }
          }}
        />
        
        {/* Text Message Button */}
        <motion.button
          type="button"
          onClick={(e) => handleSubmit(e, 'text')}
          className={`${buttonBaseClasses} ${
            isDisabled
              ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
          }`}
          disabled={isDisabled}
          whileTap={!isDisabled ? { scale: 0.95 } : {}}
          whileHover={!isDisabled ? { scale: 1.05 } : {}}
          title="Send text message"
        >
          <MessageSquare size={18} />
        </motion.button>

        {/* Image Request Button */}
        <motion.button
          type="button"
          onClick={(e) => handleSubmit(e, 'image')}
          className={`${buttonBaseClasses} ${
            isDisabled
              ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
          }`}
          disabled={isDisabled}
          whileTap={!isDisabled ? { scale: 0.95 } : {}}
          whileHover={!isDisabled ? { scale: 1.05 } : {}}
          title="Request image"
        >
          <Image size={18} />
        </motion.button>
      </form>
    </div>
  );
};

export default ChatInput;
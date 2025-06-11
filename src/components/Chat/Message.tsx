import React from 'react';
import { formatTimestamp } from '../../utils/formatters';
import { Message as MessageType } from '../../types';
import { motion } from 'framer-motion';
import { RefreshCw, Check, Clock, X } from 'lucide-react';

interface MessageProps {
  message: MessageType;
  onRetry: (id: string) => void;
}

const Message: React.FC<MessageProps> = ({ message, onRetry }) => {
  const isSent = message.type === 'sent';
  
  const messageVariants = {
    initial: { 
      opacity: 0, 
      y: 20,
      x: isSent ? 20 : -20 
    },
    animate: { 
      opacity: 1, 
      y: 0,
      x: 0,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-zinc-400" />;
      case 'sent':
        return <Check className="h-3 w-3 text-green-500" />;
      case 'failed':
        return <X className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const formatMessageContent = (content: string) => {
    // Split content by newlines and handle each line
    const lines = content.split('\n');
    
    return lines.map((line, index) => {
      // Handle code blocks (text between backticks)
      const codePattern = /`([^`]+)`/g;
      const parts = line.split(codePattern);
      
      if (parts.length > 1) {
        return (
          <p key={index} className="mb-1 last:mb-0">
            {parts.map((part, i) => 
              i % 2 === 0 ? (
                part
              ) : (
                <code key={i} className="px-1 py-0.5 bg-zinc-700 rounded font-mono text-sm">
                  {part}
                </code>
              )
            )}
          </p>
        );
      }

      // Regular text
      return <p key={index} className="mb-1 last:mb-0">{line}</p>;
    });
  };

  return (
    <motion.div
      className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-4`}
      initial="initial"
      animate="animate"
      variants={messageVariants}
    >
      <div className={`max-w-[75%] ${isSent ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isSent
              ? 'bg-indigo-600 text-white rounded-tr-none'
              : 'bg-zinc-700 text-zinc-100 rounded-tl-none'
          }`}
        >
          <div className="text-sm whitespace-pre-wrap break-words">
            {formatMessageContent(message.content)}
          </div>
        </div>
        
        <div className={`flex items-center mt-1 text-xs text-zinc-400 ${
          isSent ? 'justify-end' : 'justify-start'
        }`}>
          <span>{formatTimestamp(message.timestamp)}</span>
          
          {isSent && (
            <div className="flex items-center ml-2">
              {getStatusIcon()}
              
              {message.status === 'failed' && (
                <button
                  onClick={() => onRetry(message.id)}
                  className="ml-2 text-indigo-400 hover:text-indigo-300 flex items-center transition-colors"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Message;
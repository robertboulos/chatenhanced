import React, { useState } from 'react';
import { formatTimestamp } from '../../utils/formatters';
import { Message as MessageType } from '../../types';
import { motion } from 'framer-motion';
import { RefreshCw, Check, Clock, X, Volume2, Play, Pause, Loader2 } from 'lucide-react';
import ImagePreview from './ImagePreview';
import AudioPlayer from './AudioPlayer';

interface MessageProps {
  message: MessageType;
  onRetry: (id: string) => void;
  onRequestAudio?: (messageId: string, content: string) => void;
}

const Message: React.FC<MessageProps> = ({ message, onRetry, onRequestAudio }) => {
  const isSent = message.type === 'sent';
  const [isRequestingAudio, setIsRequestingAudio] = useState(false);
  
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
        return <Clock className="h-3 w-3 text-blue-300" />;
      case 'sent':
        return <Check className="h-3 w-3 text-blue-300" />;
      case 'failed':
        return <X className="h-3 w-3 text-red-400" />;
      default:
        return null;
    }
  };

  const handleRequestAudio = async () => {
    if (!onRequestAudio || isRequestingAudio) return;
    
    setIsRequestingAudio(true);
    try {
      await onRequestAudio(message.id, message.content);
    } finally {
      setIsRequestingAudio(false);
    }
  };

  const formatMessageContent = (content: string, imageData?: string) => {
    // If there's image data, show the image
    if (imageData) {
      return (
        <div className="space-y-2">
          <ImagePreview url={imageData} />
          {content && content !== `Uploaded image: ${content.split(': ')[1]}` && (
            <div className="text-sm">
              {formatTextContent(content)}
            </div>
          )}
        </div>
      );
    }

    return formatTextContent(content);
  };

  const formatTextContent = (content: string) => {
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
                <code key={i} className={`px-1 py-0.5 rounded font-mono text-sm ${
                  isSent ? 'bg-blue-600' : 'bg-gray-600'
                }`}>
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
      className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4 px-2 sm:px-4`}
      initial="initial"
      animate="animate"
      variants={messageVariants}
    >
      <div className={`max-w-[85%] sm:max-w-[75%] ${isSent ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl sm:rounded-3xl shadow-sm ${
            isSent
              ? 'bg-blue-500 text-white rounded-br-lg'
              : 'bg-gray-300 text-black rounded-bl-lg'
          }`}
        >
          <div className="text-sm sm:text-base whitespace-pre-wrap break-words">
            {formatMessageContent(message.content, (message as any).imageData)}
          </div>
          
          {/* Audio Player - Show if audio URL exists */}
          {message.audioUrl && (
            <div className={`mt-2 pt-2 border-t ${
              isSent ? 'border-blue-400' : 'border-gray-400'
            }`}>
              <AudioPlayer audioUrl={message.audioUrl} />
            </div>
          )}
        </div>
        
        <div className={`flex items-center mt-1 text-xs text-gray-500 dark:text-zinc-400 ${
          isSent ? 'justify-end' : 'justify-start'
        }`}>
          <span>{formatTimestamp(message.timestamp)}</span>
          
          {/* Audio Request Button - Only for received messages without audio */}
          {!isSent && !message.audioUrl && onRequestAudio && (
            <button
              onClick={handleRequestAudio}
              disabled={isRequestingAudio}
              className="ml-2 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 flex items-center transition-colors disabled:opacity-50"
              title="Convert to audio"
            >
              {isRequestingAudio ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Volume2 className="h-3 w-3 mr-1" />
              )}
              <span className="hidden sm:inline">{isRequestingAudio ? 'Converting...' : 'Audio'}</span>
            </button>
          )}
          
          {isSent && (
            <div className="flex items-center ml-2">
              {getStatusIcon()}
              
              {message.status === 'failed' && (
                <button
                  onClick={() => onRetry(message.id)}
                  className="ml-2 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 flex items-center transition-colors"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Retry</span>
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
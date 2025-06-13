import React, { useEffect, useRef } from 'react';
import { Message as MessageType } from '../../types';
import Message from './Message';
import StreamingMessage from './StreamingMessage';
import { motion, AnimatePresence } from 'framer-motion';

interface StreamingState {
  isStreaming: boolean;
  streamingMessageId: string | null;
  streamingContent: string;
}

interface ChatBodyProps {
  messages: MessageType[];
  loading: boolean;
  onRetryMessage: (id: string) => void;
  onRequestAudio?: (messageId: string, content: string) => void;
  streamingState?: StreamingState;
  onNotificationSound?: () => void;
}

const ChatBody: React.FC<ChatBodyProps> = ({ 
  messages, 
  loading, 
  onRetryMessage, 
  onRequestAudio,
  streamingState,
  onNotificationSound
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(messages.length);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, streamingState?.streamingContent]);

  // Play notification sound when a new received message is added
  useEffect(() => {
    const currentMessageCount = messages.length;
    const previousMessageCount = previousMessageCountRef.current;
    
    if (currentMessageCount > previousMessageCount) {
      // Check if the new message is a received message
      const newMessage = messages[currentMessageCount - 1];
      if (newMessage && newMessage.type === 'received' && onNotificationSound) {
        // Small delay to ensure the message is rendered before playing sound
        setTimeout(() => {
          onNotificationSound();
        }, 100);
      }
    }
    
    previousMessageCountRef.current = currentMessageCount;
  }, [messages, onNotificationSound]);

  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="flex justify-start mb-4 px-4"
    >
      <div className="flex items-end space-x-2 px-4 py-3 bg-gray-300 rounded-3xl rounded-bl-lg w-fit shadow-sm">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ 
            scale: [0.8, 1, 0.8],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 0 
          }}
          className="w-2.5 h-2.5 bg-gray-500 rounded-full"
        />
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ 
            scale: [0.8, 1, 0.8],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 0.2 
          }}
          className="w-2.5 h-2.5 bg-gray-500 rounded-full"
        />
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ 
            scale: [0.8, 1, 0.8],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 0.4 
          }}
          className="w-2.5 h-2.5 bg-gray-500 rounded-full"
        />
      </div>
    </motion.div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-900" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {messages.length === 0 && !loading && !streamingState?.isStreaming ? (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="text-center">No messages yet.</p>
            <p className="text-center text-sm mt-2 opacity-75">Start a conversation!</p>
          </motion.div>
        </div>
      ) : (
        <div className="py-4">
          {messages.map((message) => (
            <Message 
              key={message.id} 
              message={message} 
              onRetry={onRetryMessage}
              onRequestAudio={onRequestAudio}
            />
          ))}
          
          {/* Streaming Message */}
          {streamingState?.isStreaming && streamingState.streamingContent && (
            <StreamingMessage
              content={streamingState.streamingContent}
              timestamp={Date.now()}
              isComplete={false}
            />
          )}
          
          {/* Typing Indicator */}
          <AnimatePresence>
            {loading && !streamingState?.isStreaming && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 1, duration: 0.3 }}
              >
                <TypingIndicator />
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default ChatBody;
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
}

const ChatBody: React.FC<ChatBodyProps> = ({ 
  messages, 
  loading, 
  onRetryMessage, 
  onRequestAudio,
  streamingState 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, streamingState?.streamingContent]);

  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="flex items-end space-x-2 px-6 py-4 bg-zinc-700 rounded-2xl rounded-tl-none w-fit"
    >
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
        className="w-2.5 h-2.5 bg-zinc-400 rounded-full"
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
        className="w-2.5 h-2.5 bg-zinc-400 rounded-full"
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
        className="w-2.5 h-2.5 bg-zinc-400 rounded-full"
      />
    </motion.div>
  );

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-zinc-900">
      {messages.length === 0 && !loading && !streamingState?.isStreaming ? (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500">
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
        <>
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
                className="flex justify-start mb-4 mt-2"
              >
                <TypingIndicator />
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default ChatBody;
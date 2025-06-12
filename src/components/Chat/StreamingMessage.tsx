import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatTimestamp } from '../../utils/formatters';

interface StreamingMessageProps {
  content: string;
  timestamp: number;
  isComplete: boolean;
}

const StreamingMessage: React.FC<StreamingMessageProps> = ({ 
  content, 
  timestamp, 
  isComplete 
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isComplete) {
      setDisplayedContent(content);
      return;
    }

    // Typewriter effect for streaming content
    const timer = setInterval(() => {
      if (currentIndex < content.length) {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
      }
    }, 20); // Adjust speed as needed

    return () => clearInterval(timer);
  }, [content, currentIndex, isComplete]);

  const formatMessageContent = (text: string) => {
    // Split content by newlines and handle each line
    const lines = text.split('\n');
    
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
                <code key={i} className="px-1 py-0.5 bg-blue-600 rounded font-mono text-sm">
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
      className="flex justify-start mb-4 px-4"
      initial={{ opacity: 0, y: 20, x: -20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="max-w-[75%]">
        <div className="px-4 py-3 rounded-3xl bg-blue-500 text-white rounded-bl-lg shadow-sm">
          <div className="text-sm whitespace-pre-wrap break-words">
            {formatMessageContent(displayedContent)}
            {!isComplete && (
              <motion.span
                className="inline-block w-2 h-4 bg-blue-200 ml-1"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </div>
        </div>
        
        <div className="flex items-center mt-1 text-xs text-zinc-400 justify-start">
          <span>{formatTimestamp(timestamp)}</span>
          {!isComplete && (
            <div className="flex items-center ml-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1"></div>
              <span className="text-blue-400">Streaming...</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StreamingMessage;
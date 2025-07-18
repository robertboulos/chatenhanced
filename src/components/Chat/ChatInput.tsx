import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { MessageSquare, Image, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface ChatInputProps {
  onSendMessage: (message: string, requestType: 'text' | 'image', imageData?: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: FormEvent, requestType: 'text' | 'image', imageData?: string) => {
    e.preventDefault();
    
    if (requestType === 'text' && !message.trim() && !disabled) {
      return;
    }
    
    if (!disabled) {
      const messageContent = requestType === 'image' && !message.trim() ? 'Generate an image' : message;
      onSendMessage(messageContent, requestType, imageData);
      setMessage('');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target?.result as string;
        onSendMessage(`Uploaded image: ${file.name}`, 'text', base64Data);
        setIsUploading(false);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to process image');
      setIsUploading(false);
    }
  };

  const buttonBaseClasses = "p-2.5 rounded-full transition-all duration-200 flex items-center justify-center min-w-[44px]";
  const isTextDisabled = disabled || (!message.trim());

  return (
    <div className="border-t border-gray-300 dark:border-zinc-700 p-4 bg-white dark:bg-zinc-800 shadow-lg">
      <form className="flex items-center space-x-3">
        {/* Upload Image Button - Moved to left side */}
        <motion.button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`${buttonBaseClasses} ${
            disabled || isUploading
              ? 'bg-gray-400 dark:bg-zinc-600 text-gray-500 dark:text-zinc-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
          }`}
          disabled={disabled || isUploading}
          whileTap={!disabled && !isUploading ? { scale: 0.95 } : {}}
          whileHover={!disabled && !isUploading ? { scale: 1.05 } : {}}
          title="Attach image"
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload size={18} />
          )}
        </motion.button>

        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="iMessage"
          className="flex-1 p-3 border border-gray-300 dark:border-zinc-600 bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-500 dark:placeholder-zinc-400 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!isTextDisabled) {
                handleSubmit(e, 'text');
              }
            }
          }}
        />
        
        {/* Request Image Button - No text required */}
        <motion.button
          type="button"
          onClick={(e) => handleSubmit(e, 'image')}
          className={`${buttonBaseClasses} ${
            disabled
              ? 'bg-gray-400 dark:bg-zinc-600 text-gray-500 dark:text-zinc-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
          }`}
          disabled={disabled}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          whileHover={!disabled ? { scale: 1.05 } : {}}
          title="Request image generation"
        >
          <Image size={18} />
        </motion.button>

        {/* Text Message Button */}
        <motion.button
          type="button"
          onClick={(e) => handleSubmit(e, 'text')}
          className={`${buttonBaseClasses} ${
            isTextDisabled
              ? 'bg-gray-400 dark:bg-zinc-600 text-gray-500 dark:text-zinc-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
          }`}
          disabled={isTextDisabled}
          whileTap={!isTextDisabled ? { scale: 0.95 } : {}}
          whileHover={!isTextDisabled ? { scale: 1.05 } : {}}
          title="Send text message"
        >
          <MessageSquare size={18} />
        </motion.button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </form>
    </div>
  );
};

export default ChatInput;
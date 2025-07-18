import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LiveViewControlsProps {
  onSendMessage: (message: string, requestType: 'text' | 'image' | 'video', imageData?: string, currentImageUrl?: string) => void;
  currentImageUrl?: string;
  disabled?: boolean;
}

const LiveViewControls: React.FC<LiveViewControlsProps> = ({
  onSendMessage,
  currentImageUrl,
  disabled = false,
}) => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleAction = async (action: string, requestType: 'text' | 'image' | 'video', message: string) => {
    if (disabled) return;
    
    // Check if we have a current image URL for image/video operations
    if ((requestType === 'video' || requestType === 'image') && !currentImageUrl) {
      toast.error('No image available for this operation');
      return;
    }
    
    setIsProcessing(action);
    
    try {
      // Pass the current image URL for both video and variation requests
      onSendMessage(
        message, 
        requestType, 
        undefined, // imageData (base64) - not needed for these operations
        currentImageUrl // Pass the current image URL
      );
      
      toast.success(`${action} request sent with image URL!`);
    } catch (error) {
      toast.error(`Failed to send ${action} request`);
    } finally {
      setTimeout(() => setIsProcessing(null), 1000);
    }
  };

  const controlButtons = [
    {
      id: 'video',
      icon: Video,
      label: 'Video',
      color: 'bg-red-600 hover:bg-red-700',
      message: 'Create a short video from this image',
      requestType: 'video' as const,
    },
    {
      id: 'variation',
      icon: Sparkles,
      label: 'Variation',
      color: 'bg-amber-600 hover:bg-amber-700',
      message: 'Create a variation of this image',
      requestType: 'image' as const,
    },
  ];

  const buttonBaseClasses = "p-3 rounded-lg transition-all duration-200 flex flex-col items-center justify-center space-y-1 min-h-[60px] shadow-md";

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-300 dark:border-zinc-700 p-3 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-gray-700 dark:text-zinc-300">AI Controls</h3>
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-600 dark:text-zinc-500">
            {currentImageUrl ? 'Image Ready' : 'No Image'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {controlButtons.map((button) => {
          const Icon = button.icon;
          const isDisabled = disabled || !currentImageUrl;
          const isProcessingThis = isProcessing === button.id;
          
          return (
            <motion.button
              key={button.id}
              onClick={() => handleAction(button.label, button.requestType, button.message)}
              className={`${buttonBaseClasses} ${
                isDisabled
                  ? 'bg-gray-300 dark:bg-zinc-700 text-gray-500 dark:text-zinc-500 cursor-not-allowed'
                  : `${button.color} text-white hover:shadow-lg`
              }`}
              disabled={isDisabled || isProcessingThis}
              whileHover={!isDisabled ? { scale: 1.05 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
              title={isDisabled && !currentImageUrl ? 'No image available' : button.label}
            >
              {isProcessingThis ? (
                <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon size={16} />
              )}
              <span className="text-sm font-medium">
                {button.label}
              </span>
            </motion.button>
          );
        })}
      </div>
      
      {/* Debug info - shows current image URL (can be removed in production) */}
      {currentImageUrl && (
        <div className="mt-2 p-2 bg-gray-100 dark:bg-zinc-900/50 rounded text-xs text-gray-600 dark:text-zinc-400 truncate">
          <span className="font-medium">Current: </span>
          <span className="opacity-75">{currentImageUrl}</span>
        </div>
      )}
    </div>
  );
};

export default LiveViewControls;
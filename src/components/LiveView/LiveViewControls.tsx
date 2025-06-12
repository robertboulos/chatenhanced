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
    
    setIsProcessing(action);
    
    try {
      onSendMessage(
        message, 
        requestType, 
        undefined, 
        requestType === 'video' ? currentImageUrl : undefined
      );
      
      toast.success(`${action} request sent!`);
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
    <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-3 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-zinc-300">AI Controls</h3>
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-zinc-500">Ready</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {controlButtons.map((button) => {
          const Icon = button.icon;
          const isDisabled = disabled;
          const isProcessingThis = isProcessing === button.id;
          
          return (
            <motion.button
              key={button.id}
              onClick={() => handleAction(button.label, button.requestType, button.message)}
              className={`${buttonBaseClasses} ${
                isDisabled
                  ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                  : `${button.color} text-white hover:shadow-lg`
              }`}
              disabled={isDisabled || isProcessingThis}
              whileHover={!isDisabled ? { scale: 1.05 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
              title={button.label}
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
    </div>
  );
};

export default LiveViewControls;
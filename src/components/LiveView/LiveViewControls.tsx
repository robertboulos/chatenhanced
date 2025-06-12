import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Image, 
  Video, 
  Mic, 
  Palette, 
  Sparkles, 
  Zap,
  Camera,
  Music
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
      id: 'image',
      icon: Image,
      label: 'Image',
      color: 'bg-purple-600 hover:bg-purple-700',
      message: 'Generate a creative image',
      requestType: 'image' as const,
    },
    {
      id: 'video',
      icon: Video,
      label: 'Video',
      color: 'bg-red-600 hover:bg-red-700',
      message: 'Create a short video from this image',
      requestType: 'video' as const,
    },
    {
      id: 'enhance',
      icon: Sparkles,
      label: 'Enhance',
      color: 'bg-amber-600 hover:bg-amber-700',
      message: 'Enhance and improve this image',
      requestType: 'image' as const,
    },
    {
      id: 'style',
      icon: Palette,
      label: 'Style',
      color: 'bg-pink-600 hover:bg-pink-700',
      message: 'Apply artistic style to this image',
      requestType: 'image' as const,
    },
    {
      id: 'animate',
      icon: Zap,
      label: 'Animate',
      color: 'bg-blue-600 hover:bg-blue-700',
      message: 'Create an animated version',
      requestType: 'video' as const,
    },
    {
      id: 'portrait',
      icon: Camera,
      label: 'Portrait',
      color: 'bg-green-600 hover:bg-green-700',
      message: 'Generate a professional portrait',
      requestType: 'image' as const,
    },
  ];

  const buttonBaseClasses = "p-2 rounded-lg transition-all duration-200 flex flex-col items-center justify-center space-y-1 min-h-[50px] shadow-md";

  return (
    <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-3 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-zinc-300">AI Controls</h3>
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-zinc-500">Ready</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
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
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon size={14} />
              )}
              <span className="text-xs font-medium">
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
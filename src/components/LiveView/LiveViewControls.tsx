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
      if (requestType === 'video' && !currentImageUrl) {
        toast.error('Please select an image first to create a video');
        return;
      }
      
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
      label: 'Generate Image',
      color: 'bg-purple-600 hover:bg-purple-700',
      message: 'Generate a creative image',
      requestType: 'image' as const,
    },
    {
      id: 'video',
      icon: Video,
      label: 'Create Video',
      color: 'bg-red-600 hover:bg-red-700',
      message: 'Create a short video from this image',
      requestType: 'video' as const,
      requiresImage: true,
    },
    {
      id: 'enhance',
      icon: Sparkles,
      label: 'Enhance Image',
      color: 'bg-amber-600 hover:bg-amber-700',
      message: 'Enhance and improve this image',
      requestType: 'image' as const,
    },
    {
      id: 'style',
      icon: Palette,
      label: 'Style Transfer',
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
      requiresImage: true,
    },
    {
      id: 'portrait',
      icon: Camera,
      label: 'Portrait Mode',
      color: 'bg-green-600 hover:bg-green-700',
      message: 'Generate a professional portrait',
      requestType: 'image' as const,
    },
  ];

  const buttonBaseClasses = "p-3 rounded-xl transition-all duration-200 flex flex-col items-center justify-center space-y-1 min-h-[80px] shadow-lg";

  return (
    <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-200">Creative Controls</h3>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-zinc-400">AI Ready</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {controlButtons.map((button) => {
          const Icon = button.icon;
          const isDisabled = disabled || (button.requiresImage && !currentImageUrl);
          const isProcessingThis = isProcessing === button.id;
          
          return (
            <motion.button
              key={button.id}
              onClick={() => handleAction(button.label, button.requestType, button.message)}
              className={`${buttonBaseClasses} ${
                isDisabled
                  ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed border border-zinc-600'
                  : `${button.color} text-white hover:shadow-xl border border-transparent`
              }`}
              disabled={isDisabled || isProcessingThis}
              whileHover={!isDisabled ? { scale: 1.02, y: -2 } : {}}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
              title={
                button.requiresImage && !currentImageUrl 
                  ? 'Select an image first' 
                  : button.label
              }
            >
              {isProcessingThis ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon size={20} />
              )}
              <span className="text-xs font-medium text-center leading-tight">
                {button.label}
              </span>
            </motion.button>
          );
        })}
      </div>
      
      {/* Status indicator */}
      <div className="mt-4 pt-3 border-t border-zinc-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400">
            {currentImageUrl ? 'Image selected' : 'No image selected'}
          </span>
          <span className="text-zinc-400">
            {controlButtons.filter(b => !b.requiresImage || currentImageUrl).length} actions available
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveViewControls;
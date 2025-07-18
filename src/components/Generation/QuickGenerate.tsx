import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { CompanionPreset } from '../../types/companions';
import toast from 'react-hot-toast';

interface QuickGenerateProps {
  companion: CompanionPreset;
  onGenerate: (prompt: string, type: 'text-to-image' | 'image-to-image', sourceImage?: string) => void;
  currentImageUrl?: string;
  disabled?: boolean;
}

const QuickGenerate: React.FC<QuickGenerateProps> = ({
  companion,
  onGenerate,
  currentImageUrl,
  disabled = false,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleGenerate = async (type: 'text-to-image' | 'image-to-image') => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (type === 'image-to-image' && !currentImageUrl) {
      toast.error('No source image available');
      return;
    }

    setIsGenerating(true);
    try {
      await onGenerate(prompt.trim(), type, currentImageUrl);
      setPrompt(''); // Clear prompt after successful generation
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        if (prompt.trim()) {
          onGenerate(prompt.trim(), 'image-to-image', imageData);
          setPrompt('');
        } else {
          toast.error('Please enter a prompt first');
        }
      };
      reader.readAsDataURL(imageFile);
    } else {
      toast.error('Please drop an image file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="space-y-4">
      {/* Companion Info */}
      <div className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-zinc-800/50 rounded-lg border border-gray-300 dark:border-zinc-700">
        <div className="flex-shrink-0">
          {companion.avatar ? (
            <span className="text-2xl">{companion.avatar}</span>
          ) : (
            <div className="w-8 h-8 bg-gray-300 dark:bg-zinc-700 rounded-full flex items-center justify-center">
              <Sparkles size={16} className="text-gray-600 dark:text-zinc-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 dark:text-zinc-200 truncate">
            {companion.name}
          </h3>
          <p className="text-xs text-gray-600 dark:text-zinc-400 truncate">
            {companion.defaultImageStyle}
          </p>
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
          Image Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Describe the image you want ${companion.name} to create...`}
          disabled={disabled || isGenerating}
          rows={3}
          className="w-full px-3 py-2 bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 rounded border border-gray-300 dark:border-zinc-600 focus:border-indigo-500 focus:outline-none resize-none transition-colors disabled:opacity-50"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleGenerate('text-to-image');
            }
          }}
        />
        <p className="text-xs text-gray-500 dark:text-zinc-500">
          Press Ctrl+Enter to generate • Using {companion.generationDefaults.style_preset} style
        </p>
      </div>

      {/* Generation Buttons */}
      <div className="grid grid-cols-1 gap-3">
        {/* Text to Image */}
        <motion.button
          onClick={() => handleGenerate('text-to-image')}
          disabled={disabled || isGenerating || !prompt.trim()}
          className={`w-full p-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
            disabled || isGenerating || !prompt.trim()
              ? 'bg-gray-300 dark:bg-zinc-700 text-gray-500 dark:text-zinc-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl'
          }`}
          whileHover={!disabled && !isGenerating && prompt.trim() ? { scale: 1.02 } : {}}
          whileTap={!disabled && !isGenerating && prompt.trim() ? { scale: 0.98 } : {}}
        >
          {isGenerating ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Generate Image</span>
            </>
          )}
        </motion.button>

        {/* Image to Image */}
        {currentImageUrl && (
          <motion.button
            onClick={() => handleGenerate('image-to-image')}
            disabled={disabled || isGenerating || !prompt.trim()}
            className={`w-full p-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 border-2 border-dashed ${
              disabled || isGenerating || !prompt.trim()
                ? 'border-gray-400 dark:border-zinc-600 text-gray-500 dark:text-zinc-500 cursor-not-allowed'
                : 'border-amber-500 text-amber-400 hover:bg-amber-500/10'
            }`}
            whileHover={!disabled && !isGenerating && prompt.trim() ? { scale: 1.02 } : {}}
            whileTap={!disabled && !isGenerating && prompt.trim() ? { scale: 0.98 } : {}}
          >
            <ImageIcon size={18} />
            <span>Transform Current Image</span>
          </motion.button>
        )}

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`w-full p-4 rounded-lg border-2 border-dashed transition-all duration-200 flex items-center justify-center space-x-2 ${
            dragOver
              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
              : disabled || isGenerating
              ? 'border-gray-400 dark:border-zinc-600 text-gray-500 dark:text-zinc-500 cursor-not-allowed'
              : 'border-gray-400 dark:border-zinc-600 text-gray-600 dark:text-zinc-400 hover:border-gray-500 dark:hover:border-zinc-500'
          }`}
        >
          <Upload size={18} />
          <span className="text-sm">
            {dragOver ? 'Drop image here' : 'Drop image to transform'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuickGenerate;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown,
  ChevronUp,
  Settings,
  Sliders
} from 'lucide-react';
import { CompanionPreset, GenerationQueueItem, StylePreset } from '../../types/companions';
import QuickGenerate from '../Generation/QuickGenerate';
import GenerationQueue from '../Generation/GenerationQueue';
import StylePresets from '../Generation/StylePresets';

interface AdvancedControlsProps {
  companion: CompanionPreset;
  onGenerate: (prompt: string, type: 'text-to-image' | 'image-to-image', sourceImage?: string, styleOverride?: StylePreset) => void;
  generationQueue: GenerationQueueItem[];
  onCancelGeneration?: (id: string) => void;
  onRetryGeneration?: (id: string) => void;
  onClearCompleted?: () => void;
  currentImageUrl?: string;
  disabled?: boolean;
}

const AdvancedControls: React.FC<AdvancedControlsProps> = ({
  companion,
  onGenerate,
  generationQueue,
  onCancelGeneration,
  onRetryGeneration,
  onClearCompleted,
  currentImageUrl,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStylePreset, setSelectedStylePreset] = useState<string>(
    companion.generationDefaults.style_preset || 'photographic'
  );
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const activeGenerations = generationQueue.filter(item => 
    item.status === 'pending' || item.status === 'processing'
  );

  const handleGenerate = (prompt: string, type: 'text-to-image' | 'image-to-image', sourceImage?: string) => {
    const stylePreset = {
      id: selectedStylePreset,
      name: selectedStylePreset,
      description: '',
      icon: 'sparkles',
      category: 'artistic' as const,
      settings: { style_preset: selectedStylePreset }
    };
    
    onGenerate(prompt, type, sourceImage, stylePreset);
  };

  const handleStylePresetSelect = (preset: StylePreset) => {
    setSelectedStylePreset(preset.id);
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-800 rounded-lg border border-gray-300 dark:border-zinc-700 shadow-lg overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-2 sm:p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700/50 transition-colors w-full"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <div className="flex-shrink-0">
            {companion.avatar ? (
              <span className="text-base sm:text-lg">{companion.avatar}</span>
            ) : (
              <div className="w-5 h-5 bg-gray-300 dark:bg-zinc-700 rounded-full flex items-center justify-center">
                <Sliders size={10} className="sm:w-3 sm:h-3 text-gray-600 dark:text-zinc-400" />
              </div>
            )}
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-800 dark:text-zinc-200 truncate">
            AI Generation Studio
          </h3>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          {activeGenerations.length > 0 && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-400">
                {activeGenerations.length}
              </span>
            </div>
          )}
          {isExpanded ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden w-full"
          >
            <div className="p-2 sm:p-4 pt-0 space-y-3 sm:space-y-4 w-full">
              {/* Quick Generate Section */}
              <QuickGenerate
                companion={companion}
                onGenerate={handleGenerate}
                currentImageUrl={currentImageUrl}
                disabled={disabled}
              />

              {/* Style Presets */}
              <StylePresets
                selectedPreset={selectedStylePreset}
                onPresetSelect={handleStylePresetSelect}
                disabled={disabled}
              />

              {/* Advanced Settings Toggle */}
              <div className="border-t border-gray-300 dark:border-zinc-700 pt-3">
                <button
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 transition-colors"
                >
                  <Settings size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span>Advanced Settings</span>
                  {showAdvancedSettings ? <ChevronUp size={12} className="sm:w-3.5 sm:h-3.5" /> : <ChevronDown size={12} className="sm:w-3.5 sm:h-3.5" />}
                </button>

                <AnimatePresence>
                  {showAdvancedSettings && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 sm:mt-3 space-y-2 sm:space-y-3 overflow-hidden"
                    >
                      {/* CFG Scale */}
                      <div>
                        <label className="flex items-center justify-between text-xs text-gray-600 dark:text-zinc-400 mb-1">
                          <span>CFG Scale</span>
                          <span>{companion.generationDefaults.cfg_scale}</span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          step="0.5"
                          value={companion.generationDefaults.cfg_scale}
                          disabled={disabled}
                          className="w-full h-1 bg-gray-300 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
                          readOnly
                        />
                      </div>

                      {/* Steps */}
                      <div>
                        <label className="flex items-center justify-between text-xs text-gray-600 dark:text-zinc-400 mb-1">
                          <span>Steps</span>
                          <span>{companion.generationDefaults.steps}</span>
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={companion.generationDefaults.steps}
                          disabled={disabled}
                          className="w-full h-1 bg-gray-300 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
                          readOnly
                        />
                      </div>

                      {/* Dimensions */}
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-zinc-400 mb-1">
                          Dimensions
                        </label>
                        <div className="text-xs text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-700 px-2 py-1 rounded">
                          {companion.generationDefaults.dimensions}
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-zinc-500 italic">
                        Edit companion settings to modify these values
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Generation Queue */}
              {generationQueue.length > 0 && (
                <div className="border-t border-gray-300 dark:border-zinc-700 pt-3">
                  <GenerationQueue
                    queue={generationQueue}
                    onCancelGeneration={onCancelGeneration}
                    onRetryGeneration={onRetryGeneration}
                    onClearCompleted={onClearCompleted}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedControls;
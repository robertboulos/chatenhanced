import React from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Palette, 
  Sparkles, 
  Film,
  Zap,
  Heart
} from 'lucide-react';
import { StylePreset } from '../../types/companions';

interface StylePresetsProps {
  selectedPreset?: string;
  onPresetSelect: (preset: StylePreset) => void;
  disabled?: boolean;
}

const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'photographic',
    name: 'Photo',
    description: 'Realistic photography',
    icon: 'camera',
    category: 'photography',
    settings: {
      cfg_scale: 7.0,
      steps: 30,
      style_preset: 'photographic'
    }
  },
  {
    id: 'artistic',
    name: 'Artistic',
    description: 'Creative and expressive',
    icon: 'palette',
    category: 'artistic',
    settings: {
      cfg_scale: 8.5,
      steps: 40,
      style_preset: 'artistic'
    }
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Movie-like quality',
    icon: 'film',
    category: 'artistic',
    settings: {
      cfg_scale: 8.0,
      steps: 45,
      style_preset: 'cinematic'
    }
  },
  {
    id: 'anime',
    name: 'Anime',
    description: 'Japanese animation style',
    icon: 'sparkles',
    category: 'anime',
    settings: {
      cfg_scale: 9.0,
      steps: 35,
      style_preset: 'anime'
    }
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    description: 'Magical and fantastical',
    icon: 'zap',
    category: 'artistic',
    settings: {
      cfg_scale: 8.5,
      steps: 50,
      style_preset: 'fantasy'
    }
  },
  {
    id: 'portrait',
    name: 'Portrait',
    description: 'People and faces',
    icon: 'heart',
    category: 'portrait',
    settings: {
      cfg_scale: 7.5,
      steps: 35,
      style_preset: 'portrait'
    }
  }
];

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'camera':
      return Camera;
    case 'palette':
      return Palette;
    case 'film':
      return Film;
    case 'sparkles':
      return Sparkles;
    case 'zap':
      return Zap;
    case 'heart':
      return Heart;
    default:
      return Sparkles;
  }
};

const StylePresets: React.FC<StylePresetsProps> = ({
  selectedPreset,
  onPresetSelect,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-300">
          Quick Styles
        </label>
        <span className="text-xs text-zinc-500">
          {selectedPreset ? `${selectedPreset} selected` : 'Select a style'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {STYLE_PRESETS.map((preset) => {
          const Icon = getIcon(preset.icon);
          const isSelected = selectedPreset === preset.id;
          
          return (
            <motion.button
              key={preset.id}
              onClick={() => onPresetSelect(preset)}
              disabled={disabled}
              className={`p-3 rounded-lg transition-all duration-200 flex flex-col items-center space-y-1 text-center ${
                disabled
                  ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                  : isSelected
                  ? 'bg-indigo-600 text-white border border-indigo-500'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-700'
              }`}
              whileHover={!disabled ? { scale: 1.02 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              title={preset.description}
            >
              <Icon size={16} />
              <span className="text-xs font-medium leading-tight">
                {preset.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {selectedPreset && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2 bg-zinc-800/50 rounded border border-zinc-700"
        >
          <div className="text-xs text-zinc-400">
            {STYLE_PRESETS.find(p => p.id === selectedPreset)?.description}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StylePresets;
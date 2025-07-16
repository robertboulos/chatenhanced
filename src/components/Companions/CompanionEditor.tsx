import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Sparkles, Settings, Volume2 } from 'lucide-react';
import { CompanionPreset } from '../../types/companions';

interface CompanionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  companion?: CompanionPreset | null;
  onSave: (companion: Partial<CompanionPreset>) => void;
  onCreate: (name: string, personality: string, sessionId: string, avatar?: string) => void;
  mode: 'create' | 'edit';
}

const AVATAR_OPTIONS = ['🤖', '👨', '👩', '🧑', '👨‍💻', '👩‍💻', '🎨', '📸', '🎭', '🌟', '💎', '🔮'];

const STYLE_PRESETS = [
  { id: 'photographic', name: 'Photographic', description: 'Realistic photos' },
  { id: 'artistic', name: 'Artistic', description: 'Creative and expressive' },
  { id: 'anime', name: 'Anime', description: 'Japanese animation style' },
  { id: 'digital-art', name: 'Digital Art', description: 'Modern digital artwork' },
  { id: 'fantasy', name: 'Fantasy', description: 'Magical and fantastical' },
  { id: 'cinematic', name: 'Cinematic', description: 'Movie-like quality' },
];

const CompanionEditor: React.FC<CompanionEditorProps> = ({
  isOpen,
  onClose,
  companion,
  onSave,
  onCreate,
  mode,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    personality: '',
    sessionId: '',
    defaultImageStyle: '',
    generationDefaults: {
      cfg_scale: 7.5,
      steps: 30,
      dimensions: '1024x1024',
      style_preset: 'photographic',
    },
    voiceSettings: {
      voice_id: '',
      speed: 1.0,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (companion && mode === 'edit') {
      setFormData({
        name: companion.name,
        avatar: companion.avatar || '',
        personality: companion.personality,
        sessionId: companion.sessionId,
        defaultImageStyle: companion.defaultImageStyle,
        generationDefaults: { ...companion.generationDefaults },
        voiceSettings: companion.voiceSettings || { voice_id: '', speed: 1.0 },
      });
    } else {
      // Reset for create mode
      setFormData({
        name: '',
        avatar: '',
        personality: '',
        sessionId: '',
        defaultImageStyle: 'Balanced and versatile',
        generationDefaults: {
          cfg_scale: 7.5,
          steps: 30,
          dimensions: '1024x1024',
          style_preset: 'photographic',
        },
        voiceSettings: {
          voice_id: '',
          speed: 1.0,
        },
      });
    }
    setErrors({});
  }, [companion, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.personality.trim()) {
      newErrors.personality = 'Personality description is required';
    }

    if (!formData.sessionId.trim()) {
      newErrors.sessionId = 'Session ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (mode === 'create') {
      onCreate(
        formData.name.trim(),
        formData.personality.trim(),
        formData.sessionId.trim(),
        formData.avatar || undefined
      );
    } else {
      onSave({
        ...formData,
        name: formData.name.trim(),
        personality: formData.personality.trim(),
        sessionId: formData.sessionId.trim(),
        avatar: formData.avatar || undefined,
      });
    }
    
    onClose();
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateGenerationDefaults = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      generationDefaults: {
        ...prev.generationDefaults,
        [field]: value,
      },
    }));
  };

  const updateVoiceSettings = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      voiceSettings: {
        ...prev.voiceSettings,
        [field]: value,
      },
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-zinc-700 p-4">
              <h2 className="text-xl font-semibold text-zinc-100 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>{mode === 'create' ? 'Create' : 'Edit'} AI Companion</span>
              </h2>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="p-4 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-zinc-200 flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Basic Information</span>
                  </h3>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      className={`w-full px-3 py-2 bg-zinc-700 text-zinc-100 rounded border transition-colors ${
                        errors.name ? 'border-red-500' : 'border-zinc-600 focus:border-indigo-500'
                      } focus:outline-none`}
                      placeholder="Enter companion name"
                    />
                    {errors.name && (
                      <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Avatar */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Avatar
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_OPTIONS.map((avatar) => (
                        <button
                          key={avatar}
                          type="button"
                          onClick={() => updateFormData('avatar', avatar)}
                          className={`p-2 text-lg rounded border transition-colors ${
                            formData.avatar === avatar
                              ? 'border-indigo-500 bg-indigo-600/20'
                              : 'border-zinc-600 hover:border-zinc-500'
                          }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Personality */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Personality *
                    </label>
                    <textarea
                      value={formData.personality}
                      onChange={(e) => updateFormData('personality', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 bg-zinc-700 text-zinc-100 rounded border transition-colors resize-none ${
                        errors.personality ? 'border-red-500' : 'border-zinc-600 focus:border-indigo-500'
                      } focus:outline-none`}
                      placeholder="Describe the companion's personality and behavior"
                    />
                    {errors.personality && (
                      <p className="text-red-400 text-xs mt-1">{errors.personality}</p>
                    )}
                  </div>

                  {/* Session ID */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Session ID *
                    </label>
                    <input
                      type="text"
                      value={formData.sessionId}
                      onChange={(e) => updateFormData('sessionId', e.target.value)}
                      className={`w-full px-3 py-2 bg-zinc-700 text-zinc-100 rounded border transition-colors ${
                        errors.sessionId ? 'border-red-500' : 'border-zinc-600 focus:border-indigo-500'
                      } focus:outline-none`}
                      placeholder="unique-session-id"
                    />
                    {errors.sessionId && (
                      <p className="text-red-400 text-xs mt-1">{errors.sessionId}</p>
                    )}
                    <p className="text-zinc-400 text-xs mt-1">
                      Unique identifier for webhook communication
                    </p>
                  </div>
                </div>

                {/* Generation Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-zinc-200 flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Generation Defaults</span>
                  </h3>

                  {/* Style Preset */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Default Style
                    </label>
                    <select
                      value={formData.generationDefaults.style_preset}
                      onChange={(e) => updateGenerationDefaults('style_preset', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-700 text-zinc-100 rounded border border-zinc-600 focus:border-indigo-500 focus:outline-none"
                    >
                      {STYLE_PRESETS.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.name} - {preset.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CFG Scale */}
                  <div>
                    <label className="flex items-center justify-between text-sm font-medium text-zinc-300 mb-2">
                      <span>CFG Scale</span>
                      <span className="text-zinc-400">{formData.generationDefaults.cfg_scale}</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="0.5"
                      value={formData.generationDefaults.cfg_scale}
                      onChange={(e) => updateGenerationDefaults('cfg_scale', parseFloat(e.target.value))}
                      className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Steps */}
                  <div>
                    <label className="flex items-center justify-between text-sm font-medium text-zinc-300 mb-2">
                      <span>Steps</span>
                      <span className="text-zinc-400">{formData.generationDefaults.steps}</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={formData.generationDefaults.steps}
                      onChange={(e) => updateGenerationDefaults('steps', parseInt(e.target.value))}
                      className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Dimensions */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Default Dimensions
                    </label>
                    <select
                      value={formData.generationDefaults.dimensions}
                      onChange={(e) => updateGenerationDefaults('dimensions', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-700 text-zinc-100 rounded border border-zinc-600 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="1024x1024">Square (1024x1024)</option>
                      <option value="1024x768">Landscape (1024x768)</option>
                      <option value="768x1024">Portrait (768x1024)</option>
                      <option value="1024x576">Wide (1024x576)</option>
                      <option value="576x1024">Tall (576x1024)</option>
                    </select>
                  </div>
                </div>

                {/* Voice Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-zinc-200 flex items-center space-x-2">
                    <Volume2 className="w-4 h-4" />
                    <span>Voice Settings (Optional)</span>
                  </h3>

                  {/* Voice ID */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Voice ID
                    </label>
                    <input
                      type="text"
                      value={formData.voiceSettings.voice_id}
                      onChange={(e) => updateVoiceSettings('voice_id', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-700 text-zinc-100 rounded border border-zinc-600 focus:border-indigo-500 focus:outline-none"
                      placeholder="voice-id-from-provider"
                    />
                  </div>

                  {/* Speed */}
                  <div>
                    <label className="flex items-center justify-between text-sm font-medium text-zinc-300 mb-2">
                      <span>Speech Speed</span>
                      <span className="text-zinc-400">{formData.voiceSettings.speed}x</span>
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={formData.voiceSettings.speed}
                      onChange={(e) => updateVoiceSettings('speed', parseFloat(e.target.value))}
                      className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-zinc-700 p-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save size={16} />
                  <span>{mode === 'create' ? 'Create' : 'Save'} Companion</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompanionEditor;
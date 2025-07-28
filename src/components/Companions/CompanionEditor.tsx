import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Sparkles, Settings, Volume2 } from 'lucide-react';
import { CompanionPreset } from '../../types/companions';
import { LoRASelector } from '../GenerationControls/LoRASelector';

interface CompanionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  companion?: CompanionPreset | null;
  onSave: (companion: Partial<CompanionPreset>) => void;
  onCreate: (name: string, personality: string, sessionId: string, avatar?: string, modelName?: string, modifier?: string) => void;
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

const SAMPLER_OPTIONS = [
  { id: 'DPM++ 2M Karras', name: 'DPM++ 2M Karras', description: 'Balanced quality and speed' },
  { id: 'Euler a', name: 'Euler a', description: 'Fast and creative' },
  { id: 'DPM++ SDE Karras', name: 'DPM++ SDE Karras', description: 'High quality, slower' },
  { id: 'DDIM', name: 'DDIM', description: 'Deterministic sampling' },
  { id: 'UniPC', name: 'UniPC', description: 'Fast convergence' },
];

const VOICE_OPTIONS = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral and clear' },
  { id: 'echo', name: 'Echo', description: 'Male voice' },
  { id: 'fable', name: 'Fable', description: 'British male' },
  { id: 'onyx', name: 'Onyx', description: 'Deep male voice' },
  { id: 'nova', name: 'Nova', description: 'Female voice' },
  { id: 'shimmer', name: 'Shimmer', description: 'Soft female voice' },
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
    modelName: '',
    modifier: '',
    defaultImageStyle: '',
    generationDefaults: {
      cfg_scale: 7.5,
      steps: 30,
      dimensions: '1024x1024',
      sampler: 'DPM++ 2M Karras',
      seed: -1,
      style_preset: 'photographic',
      loras: [] as Array<{ id: number; weight: number; }>,
      negative_prompt: '',
    },
    voiceSettings: {
      voice_id: '',
      speed: 1.0,
      format: 'mp3',
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
        modelName: companion.modelName || '',
        modifier: companion.modifier || '',
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
        modelName: 'gpt-4o-mini',
        modifier: 'balanced',
        defaultImageStyle: 'Balanced and versatile',
        generationDefaults: {
          cfg_scale: 7.5,
          steps: 30,
          dimensions: '1024x1024',
          sampler: 'DPM++ 2M Karras',
          seed: -1,
          style_preset: 'photographic',
          loras: [],
          negative_prompt: 'low quality, blurry',
        },
        voiceSettings: {
          voice_id: '',
          speed: 1.0,
          format: 'mp3',
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

    if (!formData.modelName.trim()) {
      newErrors.modelName = 'Model name is required';
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
        formData.avatar || undefined,
        formData.modelName.trim(),
        formData.modifier.trim()
      );
    } else {
      onSave({
        ...formData,
        name: formData.name.trim(),
        personality: formData.personality.trim(),
        sessionId: formData.sessionId.trim(),
        modelName: formData.modelName.trim(),
        modifier: formData.modifier.trim(),
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

  const handleLoRAChange = (selectedLoRAs: Array<{ model: any; weight: number; }>) => {
    const loraData = selectedLoRAs.map(({ model, weight }) => ({
      id: model.id,
      weight
    }));
    
    updateGenerationDefaults('loras', loraData);
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
          className="fixed inset-0 bg-black/70 dark:bg-white/70 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-xl max-w-sm sm:max-w-2xl w-full max-h-[90vh] overflow-hidden mx-2 sm:mx-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-300 dark:border-zinc-700 p-3 sm:p-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-zinc-100 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>{mode === 'create' ? 'Create' : 'Edit'} AI Companion</span>
              </h2>
              <button
                onClick={onClose}
                className="text-zinc-400 dark:text-gray-600 hover:text-zinc-200 dark:hover:text-gray-800 transition-colors"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
                {/* Basic Info */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-800 dark:text-zinc-200 flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Basic Information</span>
                  </h3>

                  {/* Name */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      className={`w-full px-2 sm:px-3 py-2 text-sm sm:text-base bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 rounded border transition-colors ${
                        errors.name ? 'border-red-500' : 'border-gray-300 dark:border-zinc-600 focus:border-indigo-500'
                      } focus:outline-none`}
                      placeholder="Enter companion name"
                    />
                    {errors.name && (
                      <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Avatar */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                      Avatar
                    </label>
                    <div className="grid grid-cols-6 sm:flex sm:flex-wrap gap-1.5 sm:gap-2">
                      {AVATAR_OPTIONS.map((avatar) => (
                        <button
                          key={avatar}
                          type="button"
                          onClick={() => updateFormData('avatar', avatar)}
                          className={`p-1.5 sm:p-2 text-base sm:text-lg rounded border transition-colors ${
                            formData.avatar === avatar
                              ? 'border-indigo-500 bg-indigo-100 dark:bg-indigo-600/20'
                              : 'border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500'
                          }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Personality */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                      Personality *
                    </label>
                    <textarea
                      value={formData.personality}
                      onChange={(e) => updateFormData('personality', e.target.value)}
                      rows={2}
                      className={`w-full px-2 sm:px-3 py-2 text-sm sm:text-base bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 rounded border transition-colors resize-none ${
                        errors.personality ? 'border-red-500' : 'border-gray-300 dark:border-zinc-600 focus:border-indigo-500'
                      } focus:outline-none`}
                      placeholder="Describe the companion's personality and behavior"
                    />
                    {errors.personality && (
                      <p className="text-red-400 text-xs mt-1">{errors.personality}</p>
                    )}
                  </div>

                  {/* Session ID */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                      Session ID *
                    </label>
                    <input
                      type="text"
                      value={formData.sessionId}
                      onChange={(e) => updateFormData('sessionId', e.target.value)}
                      className={`w-full px-2 sm:px-3 py-2 text-sm sm:text-base bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 rounded border transition-colors ${
                        errors.sessionId ? 'border-red-500' : 'border-gray-300 dark:border-zinc-600 focus:border-indigo-500'
                      } focus:outline-none`}
                      placeholder="unique-session-id"
                    />
                    {errors.sessionId && (
                      <p className="text-red-400 text-xs mt-1">{errors.sessionId}</p>
                    )}
                    <p className="text-zinc-400 dark:text-gray-600 text-xs mt-1">
                      Unique identifier for webhook communication
                    </p>
                  </div>

                  {/* Model Name */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                      AI Model *
                    </label>
                    <select
                      value={formData.modelName}
                      onChange={(e) => updateFormData('modelName', e.target.value)}
                      className={`w-full px-2 sm:px-3 py-2 text-sm sm:text-base bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 rounded border transition-colors ${
                        errors.modelName ? 'border-red-500' : 'border-gray-300 dark:border-zinc-600 focus:border-indigo-500'
                      } focus:outline-none`}
                    >
                      <option value="">Select AI Model</option>
                      <option value="gpt-4o">GPT-4o (Most Capable)</option>
                      <option value="gpt-4o-mini">GPT-4o Mini (Fast & Efficient)</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo (Balanced)</option>
                      <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                      <option value="claude-3-haiku">Claude 3 Haiku</option>
                    </select>
                    {errors.modelName && (
                      <p className="text-red-400 text-xs mt-1">{errors.modelName}</p>
                    )}
                    <p className="text-zinc-400 dark:text-gray-600 text-xs mt-1">
                      Choose the AI model for this companion's conversations
                    </p>
                  </div>

                  {/* Modifier */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                      Personality Modifier
                    </label>
                    <select
                      value={formData.modifier}
                      onChange={(e) => updateFormData('modifier', e.target.value)}
                      className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 rounded border border-gray-300 dark:border-zinc-600 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="balanced">Balanced</option>
                      <option value="creative">Creative</option>
                      <option value="precise">Precise</option>
                      <option value="helpful">Helpful</option>
                      <option value="analytical">Analytical</option>
                      <option value="friendly">Friendly</option>
                      <option value="professional">Professional</option>
                    </select>
                    <p className="text-zinc-400 dark:text-gray-600 text-xs mt-1">
                      Adjust the companion's response style and behavior
                    </p>
                  </div>
                </div>

                {/* Generation Settings */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-800 dark:text-zinc-200 flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Generation Defaults</span>
                  </h3>

                  {/* Style Preset */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                      Default Style
                    </label>
                    <select
                      value={formData.generationDefaults.style_preset}
                      onChange={(e) => updateGenerationDefaults('style_preset', e.target.value)}
                      className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 rounded border border-gray-300 dark:border-zinc-600 focus:border-indigo-500 focus:outline-none"
                    >
                      {STYLE_PRESETS.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.name} - {preset.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sampler */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                      Sampler
                    </label>
                    <select
                      value={formData.generationDefaults.sampler}
                      onChange={(e) => updateGenerationDefaults('sampler', e.target.value)}
                      className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 rounded border border-gray-300 dark:border-zinc-600 focus:border-indigo-500 focus:outline-none"
                    >
                      {SAMPLER_OPTIONS.map((sampler) => (
                        <option key={sampler.id} value={sampler.id}>
                          {sampler.name} - {sampler.description}
                        </option>
                      ))}
                    </select>
                    <p className="text-zinc-400 dark:text-gray-600 text-xs mt-1">
                      Sampling method affects image quality and generation speed
                    </p>
                  </div>

                  {/* Seed */}
                  <div>
                    <label className="flex items-center justify-between text-xs sm:text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                      <span>Seed</span>
                      <span className="text-gray-600 dark:text-zinc-400">
                        {formData.generationDefaults.seed === -1 ? 'Random' : formData.generationDefaults.seed}
                      </span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={formData.generationDefaults.seed === -1 ? '' : formData.generationDefaults.seed}
                        onChange={(e) => {
                          const value = e.target.value === '' ? -1 : parseInt(e.target.value);
                          updateGenerationDefaults('seed', value);
                        }}
                        placeholder="Random"
                        className="flex-1 px-2 sm:px-3 py-2 text-sm sm:text-base bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 rounded border border-gray-300 dark:border-zinc-600 focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => updateGenerationDefaults('seed', Math.floor(Math.random() * 2147483647))}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm transition-colors"
                      >
                        Random
                      </button>
                    </div>
                    <p className="text-zinc-400 dark:text-gray-600 text-xs mt-1">
                      Use -1 for random seed, or specify a number for reproducible results
                    </p>
                  </div>

                  {/* LoRA Models */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                      LoRA Models
                    </label>
                    <LoRASelector
                      onLoRAChange={handleLoRAChange}
                      initialLoRAs={formData.generationDefaults.loras}
                      maxSelections={5}
                      disabled={false}
                    />
                    <p className="text-zinc-400 dark:text-gray-600 text-xs mt-1">
                      Select LoRA models that define this companion's visual style
                    </p>
                  </div>

                  {/* CFG Scale */}
                  <div>
                    <label className="flex items-center justify-between text-xs sm:text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                      <span>CFG Scale</span>
                      <span className="text-gray-600 dark:text-zinc-400">{formData.generationDefaults.cfg_scale}</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="0.5"
                      value={formData.generationDefaults.cfg_scale}
                      onChange={(e) => updateGenerationDefaults('cfg_scale', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-300 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Steps */}
                  <div>
                    <label className="flex items-center justify-between text-xs sm:text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                      <span>Steps</span>
                      <span className="text-gray-600 dark:text-zinc-400">{formData.generationDefaults.steps}</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={formData.generationDefaults.steps}
                      onChange={(e) => updateGenerationDefaults('steps', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-300 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Dimensions */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                      Default Dimensions
                    </label>
                    <select
                      value={formData.generationDefaults.dimensions}
                      onChange={(e) => updateGenerationDefaults('dimensions', e.target.value)}
                      className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 rounded border border-gray-300 dark:border-zinc-600 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="1024x1024">Square (1024x1024)</option>
                      <option value="1024x768">Landscape (1024x768)</option>
                      <option value="768x1024">Portrait (768x1024)</option>
                      <option value="1024x576">Wide (1024x576)</option>
                      <option value="576x1024">Tall (576x1024)</option>
                    </select>
                  </div>

                  {/* Negative Prompt */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                      Negative Prompt
                    </label>
                    <textarea
                      value={formData.generationDefaults.negative_prompt}
                      onChange={(e) => updateGenerationDefaults('negative_prompt', e.target.value)}
                      rows={2}
                      className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 rounded border border-gray-300 dark:border-zinc-600 focus:border-indigo-500 focus:outline-none resize-none"
                      placeholder="Things to avoid in generated images..."
                    />
                    <p className="text-zinc-400 dark:text-gray-600 text-xs mt-1">
                      Specify what should be avoided in this companion's image generations
                    </p>
                  </div>
                </div>

                {/* Voice Settings */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-800 dark:text-zinc-200 flex items-center space-x-2">
                    <Volume2 className="w-4 h-4" />
                    <span>Voice Settings (Optional)</span>
                  </h3>

                  {/* Voice ID */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                      Voice ID
                    </label>
                    <select
                      value={formData.voiceSettings.voice_id}
                      onChange={(e) => updateVoiceSettings('voice_id', e.target.value)}
                      className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 rounded border border-gray-300 dark:border-zinc-600 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">Select Voice</option>
                      {VOICE_OPTIONS.map((voice) => (
                        <option key={voice.id} value={voice.id}>
                          {voice.name} - {voice.description}
                        </option>
                      ))}
                    </select>
                    <p className="text-zinc-400 dark:text-gray-600 text-xs mt-1">
                      Choose the voice for this companion's audio responses
                    </p>
                  </div>

                  {/* Speed */}
                  <div>
                    <label className="flex items-center justify-between text-xs sm:text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                      <span>Speech Speed</span>
                      <span className="text-gray-600 dark:text-zinc-400">{formData.voiceSettings.speed}x</span>
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={formData.voiceSettings.speed}
                      onChange={(e) => updateVoiceSettings('speed', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-300 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-zinc-500 mt-1">
                      <span>0.5x</span>
                      <span>Normal</span>
                      <span>2.0x</span>
                    </div>
                  </div>

                  {/* Audio Format */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                      Audio Format
                    </label>
                    <select
                      value={formData.voiceSettings.format}
                      onChange={(e) => updateVoiceSettings('format', e.target.value)}
                      className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 rounded border border-gray-300 dark:border-zinc-600 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="mp3">MP3 (Recommended)</option>
                      <option value="opus">Opus (High Quality)</option>
                      <option value="aac">AAC (Apple Compatible)</option>
                      <option value="flac">FLAC (Lossless)</option>
                    </select>
                    <p className="text-zinc-400 dark:text-gray-600 text-xs mt-1">
                      Audio format for voice responses
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-300 dark:border-zinc-700 p-3 sm:p-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm sm:text-base text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 transition-colors order-2 sm:order-1"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors order-1 sm:order-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save size={14} className="sm:w-4 sm:h-4" />
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
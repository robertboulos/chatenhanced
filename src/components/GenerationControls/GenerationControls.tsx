import React, { useState } from 'react';
import { Sliders, Shuffle, Copy, ChevronDown, ChevronUp } from 'lucide-react';

interface GenerationParams {
  cfg_scale: number;
  steps: number;
  sampler: string;
  seed: number;
  width: number;
  height: number;
  negative_prompt: string;
  lora_model?: string;
  lora_weight?: number;
}

interface GenerationControlsProps {
  onParamsChange: (params: GenerationParams) => void;
  disabled?: boolean;
}

const SAMPLERS = [
  'Euler a',
  'DPM++ 2M Karras',
  'DPM++ SDE Karras',
  'DDIM',
  'UniPC',
  'DPM++ 2M',
  'Euler',
  'LMS',
  'Heun',
  'DPM2',
  'DPM2 a',
];

const QUICK_SETTINGS = {
  draft: { steps: 20, cfg_scale: 5 },
  standard: { steps: 30, cfg_scale: 7.5 },
  quality: { steps: 50, cfg_scale: 8 },
  ultra: { steps: 100, cfg_scale: 9 },
};

export const GenerationControls: React.FC<GenerationControlsProps> = ({ 
  onParamsChange, 
  disabled = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [params, setParams] = useState<GenerationParams>({
    cfg_scale: 7.5,
    steps: 30,
    sampler: 'DPM++ 2M Karras',
    seed: -1,
    width: 1024,
    height: 1024,
    negative_prompt: '',
  });

  const updateParam = <K extends keyof GenerationParams>(
    key: K,
    value: GenerationParams[K]
  ) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    onParamsChange(newParams);
  };

  const randomizeSeed = () => {
    const newSeed = Math.floor(Math.random() * 2147483647);
    updateParam('seed', newSeed);
  };

  const copySettings = () => {
    navigator.clipboard.writeText(JSON.stringify(params, null, 2));
    // You could add a toast notification here
  };

  const applyQuickSetting = (preset: keyof typeof QUICK_SETTINGS) => {
    const settings = QUICK_SETTINGS[preset];
    const newParams = { ...params, ...settings };
    setParams(newParams);
    onParamsChange(newParams);
  };

  return (
    <div className="bg-zinc-900 border-t border-zinc-700 p-4">
      {/* Header with toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sliders size={20} className="text-zinc-400" />
          <h3 className="text-sm font-medium text-zinc-300">Generation Settings</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-zinc-800 rounded transition-colors"
          disabled={disabled}
        >
          {isExpanded ? (
            <ChevronUp size={20} className="text-zinc-400" />
          ) : (
            <ChevronDown size={20} className="text-zinc-400" />
          )}
        </button>
      </div>

      {/* Quick presets - always visible */}
      <div className="flex gap-2 mb-4">
        {Object.entries(QUICK_SETTINGS).map(([key]) => (
          <button
            key={key}
            onClick={() => applyQuickSetting(key as keyof typeof QUICK_SETTINGS)}
            disabled={disabled}
            className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded capitalize transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {key}
          </button>
        ))}
        <button
          onClick={copySettings}
          disabled={disabled}
          className="ml-auto p-1 hover:bg-zinc-800 rounded transition-colors"
          title="Copy settings"
        >
          <Copy size={16} className="text-zinc-400" />
        </button>
      </div>

      {/* Expanded controls */}
      {isExpanded && (
        <div className="space-y-4">
          {/* CFG Scale */}
          <div>
            <label className="flex items-center justify-between text-sm text-zinc-400 mb-2">
              <span>CFG Scale</span>
              <span className="text-zinc-500">{params.cfg_scale}</span>
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={params.cfg_scale}
              onChange={(e) => updateParam('cfg_scale', parseFloat(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Steps */}
          <div>
            <label className="flex items-center justify-between text-sm text-zinc-400 mb-2">
              <span>Steps</span>
              <span className="text-zinc-500">{params.steps}</span>
            </label>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={params.steps}
              onChange={(e) => updateParam('steps', parseInt(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Sampler */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Sampler</label>
            <select
              value={params.sampler}
              onChange={(e) => updateParam('sampler', e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 bg-zinc-800 text-zinc-300 rounded border border-zinc-700 focus:border-indigo-500 focus:outline-none"
            >
              {SAMPLERS.map((sampler) => (
                <option key={sampler} value={sampler}>
                  {sampler}
                </option>
              ))}
            </select>
          </div>

          {/* Seed */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Seed</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={params.seed}
                onChange={(e) => updateParam('seed', parseInt(e.target.value) || -1)}
                disabled={disabled}
                className="flex-1 px-3 py-2 bg-zinc-800 text-zinc-300 rounded border border-zinc-700 focus:border-indigo-500 focus:outline-none"
                placeholder="-1 for random"
              />
              <button
                onClick={randomizeSeed}
                disabled={disabled}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Random seed"
              >
                <Shuffle size={20} />
              </button>
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center justify-between text-sm text-zinc-400 mb-2">
                <span>Width</span>
                <span className="text-zinc-500">{params.width}</span>
              </label>
              <input
                type="range"
                min="512"
                max="2048"
                step="64"
                value={params.width}
                onChange={(e) => updateParam('width', parseInt(e.target.value))}
                disabled={disabled}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            <div>
              <label className="flex items-center justify-between text-sm text-zinc-400 mb-2">
                <span>Height</span>
                <span className="text-zinc-500">{params.height}</span>
              </label>
              <input
                type="range"
                min="512"
                max="2048"
                step="64"
                value={params.height}
                onChange={(e) => updateParam('height', parseInt(e.target.value))}
                disabled={disabled}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          {/* Negative Prompt */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Negative Prompt</label>
            <textarea
              value={params.negative_prompt}
              onChange={(e) => updateParam('negative_prompt', e.target.value)}
              disabled={disabled}
              rows={3}
              className="w-full px-3 py-2 bg-zinc-800 text-zinc-300 rounded border border-zinc-700 focus:border-indigo-500 focus:outline-none resize-none"
              placeholder="Things to avoid in the image..."
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerationControls;
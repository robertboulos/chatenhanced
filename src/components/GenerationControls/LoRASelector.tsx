import React, { useState, useEffect } from 'react';
import { Search, X, Plus, Minus } from 'lucide-react';

interface LoRAModel {
  id: number;
  name: string;
  file_size_mb: number;
  type: string;
  personality: string;
  url: string;
  description: string;
  tags: string[];
}

interface SelectedLoRA {
  model: LoRAModel;
  weight: number;
}

interface LoRASelectorProps {
  onLoRAChange: (loras: SelectedLoRA[]) => void;
  maxSelections?: number;
  disabled?: boolean;
}

export const LoRASelector: React.FC<LoRASelectorProps> = ({
  onLoRAChange,
  maxSelections = 5,
  disabled = false
}) => {
  const [availableLoRAs, setAvailableLoRAs] = useState<LoRAModel[]>([]);
  const [selectedLoRAs, setSelectedLoRAs] = useState<SelectedLoRA[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual Xano API call
  useEffect(() => {
    // This would be replaced with actual API call to Xano
    const mockLoRAs: LoRAModel[] = [
      {
        id: 309,
        name: 'sarasampaio',
        file_size_mb: 19.3,
        type: 'Character LoRA',
        personality: 'Elegant fashion model aesthetic',
        url: 'https://xnwv-v1z6-dvnr.n7c.xano.io/vault/zu8qHvvN/aBPrLQP5/sarasampaio.safetensors',
        description: 'High-quality fashion and portrait model',
        tags: ['fashion', 'portrait', 'elegant']
      },
      {
        id: 310,
        name: 'marietemara',
        file_size_mb: 19.3,
        type: 'Character LoRA',
        personality: 'Natural beauty style',
        url: 'https://xnwv-v1z6-dvnr.n7c.xano.io/vault/zu8qHvvN/aBPrLQP5/marietemara.safetensors',
        description: 'Natural and casual portrait style',
        tags: ['natural', 'casual', 'portrait']
      },
      {
        id: 311,
        name: 'lovette',
        file_size_mb: 19.3,
        type: 'Character LoRA',
        personality: 'Artistic and creative',
        url: 'https://xnwv-v1z6-dvnr.n7c.xano.io/vault/zu8qHvvN/aBPrLQP5/lovette.safetensors',
        description: 'Creative and artistic portrait style',
        tags: ['artistic', 'creative', 'unique']
      },
      {
        id: 312,
        name: 'dawnknudsen',
        file_size_mb: 19.3,
        type: 'Character LoRA',
        personality: 'Professional headshot style',
        url: 'https://xnwv-v1z6-dvnr.n7c.xano.io/vault/zu8qHvvN/aBPrLQP5/dawnknudsen.safetensors',
        description: 'Professional and corporate portrait style',
        tags: ['professional', 'corporate', 'headshot']
      }
    ];
    setAvailableLoRAs(mockLoRAs);
  }, []);

  const filteredLoRAs = availableLoRAs.filter(lora =>
    lora.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lora.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addLoRA = (lora: LoRAModel) => {
    if (selectedLoRAs.length >= maxSelections) return;
    if (selectedLoRAs.find(s => s.model.id === lora.id)) return;

    const newSelection = { model: lora, weight: 1.0 };
    const updated = [...selectedLoRAs, newSelection];
    setSelectedLoRAs(updated);
    onLoRAChange(updated);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const removeLoRA = (loraId: number) => {
    const updated = selectedLoRAs.filter(s => s.model.id !== loraId);
    setSelectedLoRAs(updated);
    onLoRAChange(updated);
  };

  const updateWeight = (loraId: number, weight: number) => {
    const updated = selectedLoRAs.map(s =>
      s.model.id === loraId ? { ...s, weight } : s
    );
    setSelectedLoRAs(updated);
    onLoRAChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm text-zinc-400">LoRA Models</label>
        <span className="text-xs text-zinc-500">
          {selectedLoRAs.length}/{maxSelections} selected
        </span>
      </div>

      {/* Selected LoRAs */}
      {selectedLoRAs.length > 0 && (
        <div className="space-y-2 mb-3">
          {selectedLoRAs.map(({ model, weight }) => (
            <div
              key={model.id}
              className="bg-zinc-800 rounded p-3 border border-zinc-700"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-zinc-300">{model.name}</h4>
                    <span className="text-xs text-zinc-500 bg-zinc-700 px-2 py-0.5 rounded">
                      {model.type}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">{model.personality}</p>
                </div>
                <button
                  onClick={() => removeLoRA(model.id)}
                  disabled={disabled}
                  className="p-1 hover:bg-zinc-700 rounded transition-colors"
                >
                  <X size={16} className="text-zinc-400" />
                </button>
              </div>
              
              {/* Weight control */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-zinc-400">Weight:</label>
                <button
                  onClick={() => updateWeight(model.id, Math.max(0, weight - 0.1))}
                  disabled={disabled || weight <= 0}
                  className="p-1 hover:bg-zinc-700 rounded transition-colors disabled:opacity-50"
                >
                  <Minus size={14} className="text-zinc-400" />
                </button>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={weight}
                  onChange={(e) => updateWeight(model.id, parseFloat(e.target.value))}
                  disabled={disabled}
                  className="flex-1 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-zinc-300 w-8 text-center">
                  {weight.toFixed(1)}
                </span>
                <button
                  onClick={() => updateWeight(model.id, Math.min(2, weight + 0.1))}
                  disabled={disabled || weight >= 2}
                  className="p-1 hover:bg-zinc-700 rounded transition-colors disabled:opacity-50"
                >
                  <Plus size={14} className="text-zinc-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add LoRA dropdown */}
      {selectedLoRAs.length < maxSelections && (
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled}
            className="w-full px-3 py-2 bg-zinc-800 text-zinc-300 rounded border border-zinc-700 hover:border-zinc-600 focus:border-indigo-500 focus:outline-none flex items-center justify-between transition-colors"
          >
            <span className="text-sm">Add LoRA Model</span>
            <Plus size={16} className="text-zinc-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-h-80 overflow-hidden">
              {/* Search input */}
              <div className="p-3 border-b border-zinc-700">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search models..."
                    className="w-full pl-9 pr-3 py-2 bg-zinc-700 text-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                    autoFocus
                  />
                </div>
              </div>

              {/* LoRA list */}
              <div className="max-h-60 overflow-y-auto">
                {filteredLoRAs.length === 0 ? (
                  <div className="p-4 text-center text-zinc-500 text-sm">
                    No models found
                  </div>
                ) : (
                  filteredLoRAs.map((lora) => (
                    <button
                      key={lora.id}
                      onClick={() => addLoRA(lora)}
                      disabled={selectedLoRAs.find(s => s.model.id === lora.id) !== undefined}
                      className="w-full p-3 hover:bg-zinc-700 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-300">
                              {lora.name}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {lora.file_size_mb}MB
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 mt-1">
                            {lora.description}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {lora.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-zinc-700 text-zinc-400 px-2 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoRASelector;
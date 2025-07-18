import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Plus, Minus } from 'lucide-react';
import { fetchLoRAModels, searchLoRAModels, LoRAModel } from '../../services/xanoService';


interface SelectedLoRA {
  model: LoRAModel;
  weight: number;
}

interface LoRASelectorProps {
  onLoRAChange: (loras: SelectedLoRA[]) => void;
  initialLoRAs?: Array<{ id: number; weight: number; }>;
  maxSelections?: number;
  disabled?: boolean;
}

export const LoRASelector: React.FC<LoRASelectorProps> = ({
  onLoRAChange,
  initialLoRAs = [],
  maxSelections = 5,
  disabled = false
}) => {
  const [availableLoRAs, setAvailableLoRAs] = useState<LoRAModel[]>([]);
  const [selectedLoRAs, setSelectedLoRAs] = useState<SelectedLoRA[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load LoRA models from Xano API
  useEffect(() => {
    const loadLoRAs = async () => {
      setLoading(true);
      try {
        const models = await fetchLoRAModels();
        setAvailableLoRAs(models);
      } catch (error) {
        console.error('Failed to load LoRA models:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLoRAs();
  }, []);

  // Initialize selected LoRAs from props
  useEffect(() => {
    if (initialLoRAs.length > 0 && availableLoRAs.length > 0) {
      const initialSelections: SelectedLoRA[] = [];
      
      for (const initial of initialLoRAs) {
        const model = availableLoRAs.find(m => m.id === initial.id);
        if (model) {
          initialSelections.push({
            model,
            weight: initial.weight
          });
        }
      }
      
      setSelectedLoRAs(initialSelections);
    }
  }, [initialLoRAs, availableLoRAs]);

  // Handle search with debouncing
  const handleSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      const models = await fetchLoRAModels();
      setAvailableLoRAs(models);
      return;
    }

    setLoading(true);
    try {
      const results = await searchLoRAModels(term);
      setAvailableLoRAs(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, handleSearch]);
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
              className="bg-zinc-800 dark:bg-gray-100 rounded p-3 border border-zinc-700 dark:border-gray-300"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-zinc-300 dark:text-gray-700">{model.name}</h4>
                    <span className="text-xs text-zinc-500 dark:text-gray-600 bg-zinc-700 dark:bg-gray-200 px-2 py-0.5 rounded">
                      {model.type}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-gray-600 mt-1">{model.personality}</p>
                </div>
                <button
                  onClick={() => removeLoRA(model.id)}
                  disabled={disabled}
                  className="p-1 hover:bg-zinc-700 dark:hover:bg-gray-200 rounded transition-colors"
                >
                  <X size={16} className="text-zinc-400 dark:text-gray-600" />
                </button>
              </div>
              
              {/* Weight control */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-zinc-400 dark:text-gray-600">Weight:</label>
                <button
                  onClick={() => updateWeight(model.id, Math.max(0, weight - 0.1))}
                  disabled={disabled || weight <= 0}
                  className="p-1 hover:bg-zinc-700 dark:hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                >
                  <Minus size={14} className="text-zinc-400 dark:text-gray-600" />
                </button>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={weight}
                  onChange={(e) => updateWeight(model.id, parseFloat(e.target.value))}
                  disabled={disabled}
                  className="flex-1 h-1.5 bg-zinc-700 dark:bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-zinc-300 dark:text-gray-700 w-8 text-center">
                  {weight.toFixed(1)}
                </span>
                <button
                  onClick={() => updateWeight(model.id, Math.min(2, weight + 0.1))}
                  disabled={disabled || weight >= 2}
                  className="p-1 hover:bg-zinc-700 dark:hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                >
                  <Plus size={14} className="text-zinc-400 dark:text-gray-600" />
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
            className="w-full px-3 py-2 bg-zinc-800 dark:bg-gray-100 text-zinc-300 dark:text-gray-700 rounded border border-zinc-700 dark:border-gray-300 hover:border-zinc-600 dark:hover:border-gray-400 focus:border-indigo-500 focus:outline-none flex items-center justify-between transition-colors"
          >
            <span className="text-sm">Add LoRA Model</span>
            <Plus size={16} className="text-zinc-400 dark:text-gray-600" />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-zinc-800 dark:bg-white border border-zinc-700 dark:border-gray-300 rounded-lg shadow-xl max-h-80 overflow-hidden">
              {/* Search input */}
              <div className="p-3 border-b border-zinc-700 dark:border-gray-300">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search models..."
                    className="w-full pl-9 pr-3 py-2 bg-zinc-700 dark:bg-gray-50 text-zinc-300 dark:text-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                    autoFocus
                  />
                </div>
              </div>

              {/* LoRA list */}
              <div className="max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-zinc-500 dark:text-gray-400 text-sm">
                    <div className="inline-block w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Loading models...
                  </div>
                ) : filteredLoRAs.length === 0 ? (
                  <div className="p-4 text-center text-zinc-500 dark:text-gray-400 text-sm">
                    {searchTerm ? 'No models found' : 'No models available'}
                  </div>
                ) : (
                  filteredLoRAs.map((lora) => (
                    <button
                      key={lora.id}
                      onClick={() => addLoRA(lora)}
                      disabled={selectedLoRAs.find(s => s.model.id === lora.id) !== undefined}
                      className="w-full p-3 hover:bg-zinc-700 dark:hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-300">
                              {lora.name}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-gray-500">
                              {lora.file_size_mb}MB
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-gray-600 mt-1">
                            {lora.description}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {lora.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-zinc-700 dark:bg-gray-200 text-zinc-400 dark:text-gray-600 px-2 py-0.5 rounded"
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
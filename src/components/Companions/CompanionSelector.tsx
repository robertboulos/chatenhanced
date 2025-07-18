import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Plus, 
  User, 
  Settings, 
  Copy,
  Trash2,
  Clock
} from 'lucide-react';
import { CompanionPreset } from '../../types/companions';
import { formatDistanceToNow } from 'date-fns';

interface CompanionSelectorProps {
  companions: CompanionPreset[];
  activeCompanion: CompanionPreset;
  onSwitchCompanion: (companionId: string) => void;
  onCreateCompanion: () => void;
  onEditCompanion: (companion: CompanionPreset) => void;
  onDuplicateCompanion: (companionId: string) => void;
  onDeleteCompanion: (companionId: string) => void;
  disabled?: boolean;
}

const CompanionSelector: React.FC<CompanionSelectorProps> = ({
  companions,
  activeCompanion,
  onSwitchCompanion,
  onCreateCompanion,
  onEditCompanion,
  onDuplicateCompanion,
  onDeleteCompanion,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCompanionSelect = (companionId: string) => {
    onSwitchCompanion(companionId);
    setIsOpen(false);
  };

  const handleAction = (action: () => void, event: React.MouseEvent) => {
    event.stopPropagation();
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
          disabled
            ? 'bg-gray-300 dark:bg-zinc-700 text-gray-500 dark:text-zinc-500 cursor-not-allowed'
            : 'bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-900 dark:text-zinc-200 border border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500'
        }`}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        <div className="flex items-center space-x-2 min-w-0">
          {activeCompanion.avatar ? (
            <span className="text-lg">{activeCompanion.avatar}</span>
          ) : (
            <User size={16} className="text-gray-600 dark:text-zinc-400" />
          )}
          <span className="font-medium truncate max-w-32">
            {activeCompanion.name}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-600 dark:text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 bg-gray-100 dark:bg-zinc-900/50 border-b border-gray-300 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-zinc-200">AI Companions</h3>
                <button
                  onClick={(e) => handleAction(onCreateCompanion, e)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded transition-colors"
                  title="Create new companion"
                >
                  <Plus size={16} className="text-gray-600 dark:text-zinc-400" />
                </button>
              </div>
            </div>

            {/* Companions List */}
            <div className="max-h-80 overflow-y-auto">
              {companions.map((companion) => (
                <div
                  key={companion.id}
                  className={`group relative ${
                    companion.id === activeCompanion.id
                      ? 'bg-indigo-600/20 border-l-2 border-indigo-500'
                      : 'hover:bg-zinc-700/50'
                  }`}
                >
                  <button
                    onClick={() => handleCompanionSelect(companion.id)}
                    className="w-full p-3 text-left transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {companion.avatar ? (
                          <span className="text-lg">{companion.avatar}</span>
                        ) : (
                          <User size={16} className="text-gray-600 dark:text-zinc-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-zinc-200 truncate">
                            {companion.name}
                          </h4>
                          {companion.id === activeCompanion.id && (
                            <span className="text-xs text-indigo-400 font-medium">
                              Active
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 line-clamp-2">
                          {companion.personality}
                        </p>
                        
                        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500 dark:text-zinc-500">
                          <Clock size={10} />
                          <span>
                            {formatDistanceToNow(companion.lastUsed, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => handleAction(() => onEditCompanion(companion), e)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-600 rounded transition-colors"
                        title="Edit companion"
                      >
                        <Settings size={12} className="text-gray-600 dark:text-zinc-400" />
                      </button>
                      
                      <button
                        onClick={(e) => handleAction(() => onDuplicateCompanion(companion.id), e)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-600 rounded transition-colors"
                        title="Duplicate companion"
                      >
                        <Copy size={12} className="text-gray-600 dark:text-zinc-400" />
                      </button>
                      
                      {companions.length > 1 && (
                        <button
                          onClick={(e) => handleAction(() => onDeleteCompanion(companion.id), e)}
                          className="p-1 hover:bg-red-600 rounded transition-colors"
                          title="Delete companion"
                        >
                          <Trash2 size={12} className="text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-2 bg-gray-100 dark:bg-zinc-900/30 border-t border-gray-300 dark:border-zinc-700">
              <button
                className="w-full p-2 text-sm text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded transition-colors flex items-center justify-center space-x-2"
              >
                <Plus size={14} />
                <span>Create New Companion</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default CompanionSelector;
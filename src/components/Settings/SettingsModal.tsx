import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WebhookForm from './WebhookForm';
import { WebhookConfig } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WebhookConfig;
  onSaveWebhook: (url: string, sessionId: string, modelName: string, modifier: string) => boolean;
  onToggleWebhook: (enabled: boolean) => boolean;
  error: string | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveWebhook,
  onToggleWebhook,
  error,
}) => {
  const handleSaveWebhook = (url: string, sessionId: string, modelName: string, modifier: string) => {
    const success = onSaveWebhook(url, sessionId, modelName, modifier);
    if (success) {
      onClose();
    }
    return success;
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
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-gray-300 dark:border-zinc-700 p-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">Settings</h2>
              <button
                onClick={onClose}
                className="text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <WebhookForm 
                config={config}
                onSave={handleSaveWebhook}
                onToggle={onToggleWebhook}
                error={error}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
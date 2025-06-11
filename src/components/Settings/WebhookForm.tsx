import React, { useState, FormEvent, useEffect } from 'react';
import { isValidWebhookUrl } from '../../utils/validation';
import { WebhookConfig } from '../../types';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface WebhookFormProps {
  config: WebhookConfig;
  onSave: (url: string, sessionId: string, modelName: string, modifier: string) => boolean;
  onToggle: (enabled: boolean) => boolean;
  error: string | null;
}

const WebhookForm: React.FC<WebhookFormProps> = ({ 
  config, 
  onSave, 
  onToggle, 
  error 
}) => {
  const [url, setUrl] = useState(config.url || '');
  const [sessionId, setSessionId] = useState(config.sessionId || '');
  const [modelName, setModelName] = useState(config.modelName || '');
  const [modifier, setModifier] = useState(config.modifier || '');
  const [urlTouched, setUrlTouched] = useState(false);
  const [sessionIdTouched, setSessionIdTouched] = useState(false);
  const [modelNameTouched, setModelNameTouched] = useState(false);
  const [modifierTouched, setModifierTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    console.log('Config updated in form:', config);
    setUrl(config.url || '');
    setSessionId(config.sessionId || '');
    setModelName(config.modelName || '');
    setModifier(config.modifier || '');
  }, [config]);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      console.log('Submitting form with values:', {
        url,
        sessionId,
        modelName,
        modifier
      });
      
      const success = onSave(
        url.trim(),
        sessionId.trim(),
        modelName.trim(),
        modifier.trim()
      );
      
      if (success) {
        setUrlTouched(false);
        setSessionIdTouched(false);
        setModelNameTouched(false);
        setModifierTouched(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = isValidWebhookUrl(url) && sessionId.trim().length > 0;
  const showUrlError = !isValidWebhookUrl(url) && urlTouched;
  const showSessionIdError = !sessionId.trim() && sessionIdTouched;
  const hasChanges = 
    url !== config.url || 
    sessionId !== config.sessionId || 
    modelName !== config.modelName || 
    modifier !== config.modifier;

  const inputClasses = (hasError: boolean) => `
    w-full p-3 border rounded-lg transition-all duration-200 bg-zinc-700 text-zinc-100 placeholder-zinc-400
    focus:outline-none focus:ring-2
    ${hasError
      ? 'border-red-500 bg-red-900/20 focus:ring-red-500'
      : 'border-zinc-600 focus:ring-indigo-500 hover:border-zinc-500'
    }
  `;

  const labelClasses = "block text-sm font-medium text-zinc-200 mb-2";
  const helperTextClasses = "mt-1.5 text-xs text-zinc-400";
  const errorTextClasses = "mt-1.5 text-xs text-red-400 flex items-center";
  const successTextClasses = "mt-1.5 text-xs text-green-400 flex items-center";

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <label htmlFor="webhook-url" className={labelClasses}>
          Webhook URL
        </label>
        <div className="relative">
          <input
            id="webhook-url"
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setUrlTouched(true);
            }}
            placeholder="https://your-webhook-url.com"
            className={inputClasses(showUrlError)}
          />
          {urlTouched && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isValidWebhookUrl(url) ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>
        {showUrlError && (
          <p className={errorTextClasses}>
            <XCircle className="w-4 h-4 mr-1" />
            Please enter a valid URL
          </p>
        )}
        {error && !showUrlError && (
          <p className={errorTextClasses}>
            <XCircle className="w-4 h-4 mr-1" />
            {error}
          </p>
        )}
        <p className={helperTextClasses}>
          Enter the URL where messages will be sent as POST requests
        </p>
      </div>

      <div>
        <label htmlFor="session-id" className={labelClasses}>
          Session ID
        </label>
        <div className="relative">
          <input
            id="session-id"
            type="text"
            value={sessionId}
            onChange={(e) => {
              setSessionId(e.target.value);
              setSessionIdTouched(true);
            }}
            placeholder="Enter a session identifier"
            className={inputClasses(showSessionIdError)}
          />
          {sessionIdTouched && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {sessionId.trim() ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>
        {showSessionIdError && (
          <p className={errorTextClasses}>
            <XCircle className="w-4 h-4 mr-1" />
            Please enter a session ID
          </p>
        )}
        <p className={helperTextClasses}>
          Enter a unique identifier for this chat session
        </p>
      </div>

      <motion.div
        className="space-y-4 border-t border-zinc-700 pt-6 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-medium text-zinc-200">Optional Parameters</h3>
        
        <div>
          <label htmlFor="model-name" className={labelClasses}>
            Model Name
          </label>
          <div className="relative">
            <input
              id="model-name"
              type="text"
              value={modelName}
              onChange={(e) => {
                const value = e.target.value;
                console.log('Setting model name:', value);
                setModelName(value);
                setModelNameTouched(true);
              }}
              placeholder="e.g., gpt-4, claude-2"
              className={inputClasses(false)}
            />
            {modelNameTouched && modelName.trim() && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            )}
          </div>
          {modelName.trim() && (
            <p className={successTextClasses}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Current model: {modelName}
            </p>
          )}
          <p className={helperTextClasses}>
            Specify a model name to be used by your backend service
          </p>
        </div>

        <div>
          <label htmlFor="modifier" className={labelClasses}>
            Modifier
          </label>
          <div className="relative">
            <input
              id="modifier"
              type="text"
              value={modifier}
              onChange={(e) => {
                const value = e.target.value;
                console.log('Setting modifier:', value);
                setModifier(value);
                setModifierTouched(true);
              }}
              placeholder="e.g., creative, precise"
              className={inputClasses(false)}
            />
            {modifierTouched && modifier.trim() && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            )}
          </div>
          {modifier.trim() && (
            <p className={successTextClasses}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Current modifier: {modifier}
            </p>
          )}
          <p className={helperTextClasses}>
            Add a modifier to customize the response behavior
          </p>
        </div>
      </motion.div>

      <div className="flex items-center justify-between pt-4">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only peer"
            disabled={!isValid}
          />
          <div className="w-11 h-6 bg-zinc-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          <span className="ml-3 text-sm font-medium text-zinc-200">
            {config.enabled ? 'Webhook Enabled' : 'Webhook Disabled'}
          </span>
        </label>
        
        <motion.button
          type="submit"
          className={`px-6 py-2.5 rounded-lg text-white font-medium flex items-center justify-center min-w-[120px] ${
            isValid && hasChanges
              ? 'bg-indigo-600 hover:bg-indigo-700'
              : 'bg-zinc-600 cursor-not-allowed'
          }`}
          disabled={!isValid || !hasChanges || isSaving}
          whileHover={isValid && hasChanges ? { scale: 1.02 } : {}}
          whileTap={isValid && hasChanges ? { scale: 0.98 } : {}}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </motion.button>
      </div>
    </motion.form>
  );
};

export default WebhookForm;
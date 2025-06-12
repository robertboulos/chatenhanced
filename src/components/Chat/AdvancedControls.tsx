import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Code, 
  Languages, 
  Sparkles, 
  Eye, 
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AITask } from '../../hooks/useAdvancedAI';

interface AdvancedControlsProps {
  onWebSearch: (query: string, type: 'general' | 'images' | 'news' | 'academic') => void;
  onCodeExecution: (code: string, language: 'python' | 'javascript' | 'bash') => void;
  onTranslation: (text: string, targetLang: string, sourceLang: string) => void;
  onImageAnalysis: (imageUrl: string, type: 'describe' | 'ocr' | 'objects' | 'faces') => void;
  onImageEnhancement: (imageUrl: string, type: 'upscale' | 'denoise' | 'colorize' | 'restore') => void;
  activeTasks: AITask[];
  currentImageUrl?: string;
  disabled?: boolean;
}

const AdvancedControls: React.FC<AdvancedControlsProps> = ({
  onWebSearch,
  onCodeExecution,
  onTranslation,
  onImageAnalysis,
  onImageEnhancement,
  activeTasks,
  currentImageUrl,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'general' | 'images' | 'news' | 'academic'>('general');
  const [codeInput, setCodeInput] = useState('');
  const [codeLanguage, setCodeLanguage] = useState<'python' | 'javascript' | 'bash'>('python');
  const [translateText, setTranslateText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [sourceLanguage, setSourceLanguage] = useState('auto');

  const getTaskStatus = (type: string) => {
    const task = activeTasks.find(t => t.type === type && t.status === 'processing');
    return task ? 'processing' : 'idle';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const handleWebSearch = () => {
    if (searchQuery.trim()) {
      onWebSearch(searchQuery, searchType);
      setSearchQuery('');
      setActivePanel(null);
    }
  };

  const handleCodeExecution = () => {
    if (codeInput.trim()) {
      onCodeExecution(codeInput, codeLanguage);
      setCodeInput('');
      setActivePanel(null);
    }
  };

  const handleTranslation = () => {
    if (translateText.trim()) {
      onTranslation(translateText, targetLanguage, sourceLanguage);
      setTranslateText('');
      setActivePanel(null);
    }
  };

  const handleImageAnalysis = (type: 'describe' | 'ocr' | 'objects' | 'faces') => {
    if (currentImageUrl) {
      onImageAnalysis(currentImageUrl, type);
      setActivePanel(null);
    }
  };

  const handleImageEnhancement = (type: 'upscale' | 'denoise' | 'colorize' | 'restore') => {
    if (currentImageUrl) {
      onImageEnhancement(currentImageUrl, type);
      setActivePanel(null);
    }
  };

  const controlButtons = [
    {
      id: 'search',
      icon: Search,
      label: 'Web Search',
      color: 'bg-blue-600 hover:bg-blue-700',
      status: getTaskStatus('search'),
    },
    {
      id: 'code',
      icon: Code,
      label: 'Code Execute',
      color: 'bg-green-600 hover:bg-green-700',
      status: getTaskStatus('execute'),
    },
    {
      id: 'translate',
      icon: Languages,
      label: 'Translate',
      color: 'bg-purple-600 hover:bg-purple-700',
      status: getTaskStatus('translate'),
    },
    {
      id: 'analyze',
      icon: Eye,
      label: 'Analyze Image',
      color: 'bg-orange-600 hover:bg-orange-700',
      status: getTaskStatus('analyze'),
      requiresImage: true,
    },
    {
      id: 'enhance',
      icon: Sparkles,
      label: 'Enhance Image',
      color: 'bg-pink-600 hover:bg-pink-700',
      status: getTaskStatus('enhance'),
      requiresImage: true,
    },
  ];

  return (
    <div className="bg-zinc-800 rounded-lg border border-zinc-700 shadow-lg">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-zinc-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-medium text-zinc-200">Advanced AI Tools</h3>
        </div>
        <div className="flex items-center space-x-2">
          {activeTasks.filter(t => t.status === 'processing').length > 0 && (
            <div className="flex items-center space-x-1">
              <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
              <span className="text-xs text-blue-400">
                {activeTasks.filter(t => t.status === 'processing').length} active
              </span>
            </div>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 space-y-3">
              {/* Control Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {controlButtons.map((button) => {
                  const Icon = button.icon;
                  const isDisabled = disabled || (button.requiresImage && !currentImageUrl);
                  const isActive = activePanel === button.id;
                  
                  return (
                    <motion.button
                      key={button.id}
                      onClick={() => setActivePanel(isActive ? null : button.id)}
                      className={`p-2 rounded-lg transition-all duration-200 flex flex-col items-center justify-center space-y-1 min-h-[50px] text-xs ${
                        isDisabled
                          ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                          : isActive
                          ? 'bg-indigo-600 text-white'
                          : `${button.color} text-white hover:shadow-md`
                      }`}
                      disabled={isDisabled}
                      whileHover={!isDisabled ? { scale: 1.02 } : {}}
                      whileTap={!isDisabled ? { scale: 0.98 } : {}}
                    >
                      <div className="flex items-center space-x-1">
                        <Icon size={14} />
                        {getStatusIcon(button.status)}
                      </div>
                      <span className="font-medium leading-tight text-center">
                        {button.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Active Panel Content */}
              <AnimatePresence>
                {activePanel && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-zinc-700/50 rounded-lg p-3 space-y-3"
                  >
                    {activePanel === 'search' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Enter search query..."
                          className="w-full p-2 bg-zinc-600 border border-zinc-500 rounded text-sm text-zinc-100 placeholder-zinc-400"
                          onKeyDown={(e) => e.key === 'Enter' && handleWebSearch()}
                        />
                        <div className="flex space-x-2">
                          <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value as any)}
                            className="flex-1 p-2 bg-zinc-600 border border-zinc-500 rounded text-sm text-zinc-100"
                          >
                            <option value="general">General</option>
                            <option value="images">Images</option>
                            <option value="news">News</option>
                            <option value="academic">Academic</option>
                          </select>
                          <button
                            onClick={handleWebSearch}
                            disabled={!searchQuery.trim()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 rounded text-sm font-medium transition-colors"
                          >
                            Search
                          </button>
                        </div>
                      </div>
                    )}

                    {activePanel === 'code' && (
                      <div className="space-y-2">
                        <select
                          value={codeLanguage}
                          onChange={(e) => setCodeLanguage(e.target.value as any)}
                          className="w-full p-2 bg-zinc-600 border border-zinc-500 rounded text-sm text-zinc-100"
                        >
                          <option value="python">Python</option>
                          <option value="javascript">JavaScript</option>
                          <option value="bash">Bash</option>
                        </select>
                        <textarea
                          value={codeInput}
                          onChange={(e) => setCodeInput(e.target.value)}
                          placeholder={`Enter ${codeLanguage} code...`}
                          className="w-full p-2 bg-zinc-600 border border-zinc-500 rounded text-sm text-zinc-100 placeholder-zinc-400 font-mono"
                          rows={4}
                        />
                        <button
                          onClick={handleCodeExecution}
                          disabled={!codeInput.trim()}
                          className="w-full p-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 rounded text-sm font-medium transition-colors"
                        >
                          Execute Code
                        </button>
                      </div>
                    )}

                    {activePanel === 'translate' && (
                      <div className="space-y-2">
                        <textarea
                          value={translateText}
                          onChange={(e) => setTranslateText(e.target.value)}
                          placeholder="Enter text to translate..."
                          className="w-full p-2 bg-zinc-600 border border-zinc-500 rounded text-sm text-zinc-100 placeholder-zinc-400"
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <select
                            value={sourceLanguage}
                            onChange={(e) => setSourceLanguage(e.target.value)}
                            className="flex-1 p-2 bg-zinc-600 border border-zinc-500 rounded text-sm text-zinc-100"
                          >
                            <option value="auto">Auto-detect</option>
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="it">Italian</option>
                            <option value="pt">Portuguese</option>
                            <option value="ru">Russian</option>
                            <option value="ja">Japanese</option>
                            <option value="ko">Korean</option>
                            <option value="zh">Chinese</option>
                          </select>
                          <select
                            value={targetLanguage}
                            onChange={(e) => setTargetLanguage(e.target.value)}
                            className="flex-1 p-2 bg-zinc-600 border border-zinc-500 rounded text-sm text-zinc-100"
                          >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="it">Italian</option>
                            <option value="pt">Portuguese</option>
                            <option value="ru">Russian</option>
                            <option value="ja">Japanese</option>
                            <option value="ko">Korean</option>
                            <option value="zh">Chinese</option>
                          </select>
                        </div>
                        <button
                          onClick={handleTranslation}
                          disabled={!translateText.trim()}
                          className="w-full p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-600 rounded text-sm font-medium transition-colors"
                        >
                          Translate
                        </button>
                      </div>
                    )}

                    {activePanel === 'analyze' && (
                      <div className="space-y-2">
                        <p className="text-xs text-zinc-400 mb-2">
                          Analyze the current image:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleImageAnalysis('describe')}
                            className="p-2 bg-orange-600 hover:bg-orange-700 rounded text-xs font-medium transition-colors"
                          >
                            Describe
                          </button>
                          <button
                            onClick={() => handleImageAnalysis('ocr')}
                            className="p-2 bg-orange-600 hover:bg-orange-700 rounded text-xs font-medium transition-colors"
                          >
                            Extract Text
                          </button>
                          <button
                            onClick={() => handleImageAnalysis('objects')}
                            className="p-2 bg-orange-600 hover:bg-orange-700 rounded text-xs font-medium transition-colors"
                          >
                            Find Objects
                          </button>
                          <button
                            onClick={() => handleImageAnalysis('faces')}
                            className="p-2 bg-orange-600 hover:bg-orange-700 rounded text-xs font-medium transition-colors"
                          >
                            Detect Faces
                          </button>
                        </div>
                      </div>
                    )}

                    {activePanel === 'enhance' && (
                      <div className="space-y-2">
                        <p className="text-xs text-zinc-400 mb-2">
                          Enhance the current image:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleImageEnhancement('upscale')}
                            className="p-2 bg-pink-600 hover:bg-pink-700 rounded text-xs font-medium transition-colors"
                          >
                            Upscale
                          </button>
                          <button
                            onClick={() => handleImageEnhancement('denoise')}
                            className="p-2 bg-pink-600 hover:bg-pink-700 rounded text-xs font-medium transition-colors"
                          >
                            Denoise
                          </button>
                          <button
                            onClick={() => handleImageEnhancement('colorize')}
                            className="p-2 bg-pink-600 hover:bg-pink-700 rounded text-xs font-medium transition-colors"
                          >
                            Colorize
                          </button>
                          <button
                            onClick={() => handleImageEnhancement('restore')}
                            className="p-2 bg-pink-600 hover:bg-pink-700 rounded text-xs font-medium transition-colors"
                          >
                            Restore
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedControls;
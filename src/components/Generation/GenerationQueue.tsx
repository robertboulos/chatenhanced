import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Image as ImageIcon,
  Sparkles,
  X
} from 'lucide-react';
import { GenerationQueueItem } from '../../types/companions';
import { formatDistanceToNow } from 'date-fns';

interface GenerationQueueProps {
  queue: GenerationQueueItem[];
  onCancelGeneration?: (id: string) => void;
  onRetryGeneration?: (id: string) => void;
  onClearCompleted?: () => void;
}

const GenerationQueue: React.FC<GenerationQueueProps> = ({
  queue,
  onCancelGeneration,
  onRetryGeneration,
  onClearCompleted,
}) => {
  const activeGenerations = queue.filter(item => 
    item.status === 'pending' || item.status === 'processing'
  );
  const completedGenerations = queue.filter(item => 
    item.status === 'completed' || item.status === 'failed'
  );

  const getStatusIcon = (status: GenerationQueueItem['status']) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'processing':
        return <Loader2 size={16} className="text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'failed':
        return <XCircle size={16} className="text-red-500" />;
    }
  };

  const getTypeIcon = (type: GenerationQueueItem['type']) => {
    switch (type) {
      case 'text-to-image':
        return <Sparkles size={14} className="text-indigo-400" />;
      case 'image-to-image':
        return <ImageIcon size={14} className="text-amber-400" />;
      case 'upscale':
        return <ImageIcon size={14} className="text-green-400" />;
      case 'variation':
        return <ImageIcon size={14} className="text-purple-400" />;
    }
  };

  const getTypeLabel = (type: GenerationQueueItem['type']) => {
    switch (type) {
      case 'text-to-image':
        return 'Text to Image';
      case 'image-to-image':
        return 'Image to Image';
      case 'upscale':
        return 'Upscale';
      case 'variation':
        return 'Variation';
    }
  };

  if (queue.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Active Generations */}
      {activeGenerations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-zinc-300">
              Active Generations ({activeGenerations.length})
            </h4>
          </div>
          
          <AnimatePresence>
            {activeGenerations.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(item.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getTypeIcon(item.type)}
                      <span className="text-sm font-medium text-zinc-200">
                        {getTypeLabel(item.type)}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    
                    {item.prompt && (
                      <p className="text-xs text-zinc-400 line-clamp-2 mb-2">
                        {item.prompt}
                      </p>
                    )}
                    
                    {item.progress !== undefined && (
                      <div className="w-full bg-zinc-700 rounded-full h-1.5 mb-2">
                        <motion.div
                          className="bg-blue-500 h-1.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                  </div>
                  
                  {onCancelGeneration && item.status === 'processing' && (
                    <button
                      onClick={() => onCancelGeneration(item.id)}
                      className="p-1 hover:bg-zinc-700 rounded transition-colors"
                      title="Cancel generation"
                    >
                      <X size={14} className="text-zinc-400" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Completed Generations */}
      {completedGenerations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-zinc-300">
              Recent ({completedGenerations.length})
            </h4>
            {onClearCompleted && (
              <button
                onClick={onClearCompleted}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {completedGenerations.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="bg-zinc-800/30 rounded p-2 border border-zinc-700/50"
              >
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    {getStatusIcon(item.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(item.type)}
                      <span className="text-xs font-medium text-zinc-300">
                        {getTypeLabel(item.type)}
                      </span>
                      {item.status === 'completed' && item.result && (
                        <span className="text-xs text-green-400">
                          {Array.isArray(item.result) ? `${item.result.length} images` : '1 image'}
                        </span>
                      )}
                    </div>
                    
                    {item.prompt && (
                      <p className="text-xs text-zinc-500 truncate mt-0.5">
                        {item.prompt}
                      </p>
                    )}
                  </div>
                  
                  <span className="text-xs text-zinc-500 flex-shrink-0">
                    {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                  </span>
                  
                  {onRetryGeneration && item.status === 'failed' && (
                    <button
                      onClick={() => onRetryGeneration(item.id)}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerationQueue;
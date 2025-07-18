import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  X,
  Search,
  Code,
  Languages,
  Eye,
  Sparkles
} from 'lucide-react';
import { AITask } from '../../hooks/useAdvancedAI';

interface TaskMonitorProps {
  tasks: AITask[];
  onClearCompleted: () => void;
}

const TaskMonitor: React.FC<TaskMonitorProps> = ({ tasks, onClearCompleted }) => {
  const activeTasks = tasks.filter(task => task.status === 'processing');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const failedTasks = tasks.filter(task => task.status === 'failed');

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'search':
        return Search;
      case 'execute':
        return Code;
      case 'translate':
        return Languages;
      case 'analyze':
        return Eye;
      case 'enhance':
        return Sparkles;
      default:
        return Loader2;
    }
  };

  const getTaskLabel = (type: string) => {
    switch (type) {
      case 'search':
        return 'Web Search';
      case 'execute':
        return 'Code Execution';
      case 'translate':
        return 'Translation';
      case 'analyze':
        return 'Image Analysis';
      case 'enhance':
        return 'Image Enhancement';
      default:
        return 'Task';
    }
  };

  if (tasks.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 w-72 max-w-[calc(100vw-2rem)] max-h-80 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-xl overflow-hidden z-30">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-zinc-900/50 border-b border-gray-300 dark:border-zinc-700">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-zinc-200">AI Tasks</h3>
          {activeTasks.length > 0 && (
            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
              {activeTasks.length}
            </span>
          )}
        </div>
        
        {completedTasks.length > 0 && (
          <button
            onClick={onClearCompleted}
            className="text-xs text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 transition-colors"
          >
            Clear completed
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="max-h-64 overflow-y-auto">
        <AnimatePresence>
          {tasks.slice(0, 5).map((task) => {
            const Icon = getTaskIcon(task.type);
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-3 border-b border-gray-300 dark:border-zinc-700 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {task.status === 'processing' && (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    )}
                    {task.status === 'completed' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {task.status === 'failed' && (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-3 h-3 text-gray-600 dark:text-zinc-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-zinc-200 truncate">
                        {getTaskLabel(task.type)}
                      </span>
                    </div>
                    
                    {task.status === 'processing' && task.progress !== undefined && (
                      <div className="mt-1">
                        <div className="w-full bg-zinc-600 rounded-full h-1">
                          <motion.div
                            className="bg-blue-500 h-1 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${task.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {task.status === 'completed' && task.result && (
                      <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 truncate">
                        {typeof task.result === 'string' 
                          ? task.result.slice(0, 40) + (task.result.length > 40 ? '...' : '')
                          : 'Completed successfully'
                        }
                      </p>
                    )}
                    
                    {task.status === 'failed' && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                        Task failed
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {tasks.length > 5 && (
          <div className="p-2 text-center text-xs text-zinc-500">
            +{tasks.length - 5} more tasks
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskMonitor;
import { useState, useCallback } from 'react';
import { WebhookConfig } from '../types';
import { sendMessageToWebhook } from '../services/webhookService';
import toast from 'react-hot-toast';

interface AICapabilities {
  textToSpeech: boolean;
  speechToText: boolean;
  imageGeneration: boolean;
  videoGeneration: boolean;
  imageAnalysis: boolean;
  codeExecution: boolean;
  webSearch: boolean;
}

interface AITask {
  id: string;
  type: 'analyze' | 'enhance' | 'search' | 'execute' | 'translate';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: any;
}

export const useAdvancedAI = (webhookConfig: WebhookConfig) => {
  const [capabilities, setCapabilities] = useState<AICapabilities>({
    textToSpeech: true,
    speechToText: true,
    imageGeneration: true,
    videoGeneration: true,
    imageAnalysis: true,
    codeExecution: false,
    webSearch: false,
  });

  const [activeTasks, setActiveTasks] = useState<AITask[]>([]);

  const analyzeImage = useCallback(
    async (imageUrl: string, analysisType: 'describe' | 'ocr' | 'objects' | 'faces' = 'describe') => {
      const taskId = `analyze_${Date.now()}`;
      
      const newTask: AITask = {
        id: taskId,
        type: 'analyze',
        status: 'processing',
        progress: 0,
      };

      setActiveTasks(prev => [...prev, newTask]);

      try {
        const result = await sendMessageToWebhook(
          {
            id: taskId,
            content: `Analyze image: ${analysisType}`,
            timestamp: Date.now(),
            isImage: true,
          },
          webhookConfig,
          'text',
          undefined,
          imageUrl
        );

        if (result.success) {
          setActiveTasks(prev => 
            prev.map(task => 
              task.id === taskId 
                ? { ...task, status: 'completed', progress: 100, result: result.additionalResponse }
                : task
            )
          );
          
          toast.success('Image analysis completed');
          return result.additionalResponse;
        } else {
          throw new Error(result.error || 'Analysis failed');
        }
      } catch (error: any) {
        setActiveTasks(prev => 
          prev.map(task => 
            task.id === taskId 
              ? { ...task, status: 'failed' }
              : task
          )
        );
        
        toast.error(`Image analysis failed: ${error.message}`);
        return null;
      }
    },
    [webhookConfig]
  );

  const enhanceImage = useCallback(
    async (imageUrl: string, enhancement: 'upscale' | 'denoise' | 'colorize' | 'restore') => {
      const taskId = `enhance_${Date.now()}`;
      
      const newTask: AITask = {
        id: taskId,
        type: 'enhance',
        status: 'processing',
        progress: 0,
      };

      setActiveTasks(prev => [...prev, newTask]);

      try {
        const result = await sendMessageToWebhook(
          {
            id: taskId,
            content: `Enhance image: ${enhancement}`,
            timestamp: Date.now(),
            isImage: true,
          },
          webhookConfig,
          'image',
          undefined,
          imageUrl
        );

        if (result.success) {
          setActiveTasks(prev => 
            prev.map(task => 
              task.id === taskId 
                ? { ...task, status: 'completed', progress: 100, result: result.response }
                : task
            )
          );
          
          toast.success('Image enhancement completed');
          return result.response;
        } else {
          throw new Error(result.error || 'Enhancement failed');
        }
      } catch (error: any) {
        setActiveTasks(prev => 
          prev.map(task => 
            task.id === taskId 
              ? { ...task, status: 'failed' }
              : task
          )
        );
        
        toast.error(`Image enhancement failed: ${error.message}`);
        return null;
      }
    },
    [webhookConfig]
  );

  const performWebSearch = useCallback(
    async (query: string, searchType: 'general' | 'images' | 'news' | 'academic' = 'general') => {
      const taskId = `search_${Date.now()}`;
      
      const newTask: AITask = {
        id: taskId,
        type: 'search',
        status: 'processing',
        progress: 0,
      };

      setActiveTasks(prev => [...prev, newTask]);

      try {
        const result = await sendMessageToWebhook(
          {
            id: taskId,
            content: `Web search: ${query} (type: ${searchType})`,
            timestamp: Date.now(),
            isImage: false,
          },
          webhookConfig,
          'text'
        );

        if (result.success) {
          setActiveTasks(prev => 
            prev.map(task => 
              task.id === taskId 
                ? { ...task, status: 'completed', progress: 100, result: result.additionalResponse }
                : task
            )
          );
          
          toast.success('Web search completed');
          return result.additionalResponse;
        } else {
          throw new Error(result.error || 'Search failed');
        }
      } catch (error: any) {
        setActiveTasks(prev => 
          prev.map(task => 
            task.id === taskId 
              ? { ...task, status: 'failed' }
              : task
          )
        );
        
        toast.error(`Web search failed: ${error.message}`);
        return null;
      }
    },
    [webhookConfig]
  );

  const executeCode = useCallback(
    async (code: string, language: 'python' | 'javascript' | 'bash' = 'python') => {
      const taskId = `execute_${Date.now()}`;
      
      const newTask: AITask = {
        id: taskId,
        type: 'execute',
        status: 'processing',
        progress: 0,
      };

      setActiveTasks(prev => [...prev, newTask]);

      try {
        const result = await sendMessageToWebhook(
          {
            id: taskId,
            content: `Execute ${language} code:\n\`\`\`${language}\n${code}\n\`\`\``,
            timestamp: Date.now(),
            isImage: false,
          },
          webhookConfig,
          'text'
        );

        if (result.success) {
          setActiveTasks(prev => 
            prev.map(task => 
              task.id === taskId 
                ? { ...task, status: 'completed', progress: 100, result: result.additionalResponse }
                : task
            )
          );
          
          toast.success('Code execution completed');
          return result.additionalResponse;
        } else {
          throw new Error(result.error || 'Execution failed');
        }
      } catch (error: any) {
        setActiveTasks(prev => 
          prev.map(task => 
            task.id === taskId 
              ? { ...task, status: 'failed' }
              : task
          )
        );
        
        toast.error(`Code execution failed: ${error.message}`);
        return null;
      }
    },
    [webhookConfig]
  );

  const translateText = useCallback(
    async (text: string, targetLanguage: string, sourceLanguage: string = 'auto') => {
      const taskId = `translate_${Date.now()}`;
      
      const newTask: AITask = {
        id: taskId,
        type: 'translate',
        status: 'processing',
        progress: 0,
      };

      setActiveTasks(prev => [...prev, newTask]);

      try {
        const result = await sendMessageToWebhook(
          {
            id: taskId,
            content: `Translate from ${sourceLanguage} to ${targetLanguage}: ${text}`,
            timestamp: Date.now(),
            isImage: false,
          },
          webhookConfig,
          'text'
        );

        if (result.success) {
          setActiveTasks(prev => 
            prev.map(task => 
              task.id === taskId 
                ? { ...task, status: 'completed', progress: 100, result: result.additionalResponse }
                : task
            )
          );
          
          toast.success('Translation completed');
          return result.additionalResponse;
        } else {
          throw new Error(result.error || 'Translation failed');
        }
      } catch (error: any) {
        setActiveTasks(prev => 
          prev.map(task => 
            task.id === taskId 
              ? { ...task, status: 'failed' }
              : task
          )
        );
        
        toast.error(`Translation failed: ${error.message}`);
        return null;
      }
    },
    [webhookConfig]
  );

  const clearCompletedTasks = useCallback(() => {
    setActiveTasks(prev => prev.filter(task => task.status === 'processing'));
  }, []);

  const updateCapabilities = useCallback((newCapabilities: Partial<AICapabilities>) => {
    setCapabilities(prev => ({ ...prev, ...newCapabilities }));
  }, []);

  return {
    capabilities,
    activeTasks,
    analyzeImage,
    enhanceImage,
    performWebSearch,
    executeCode,
    translateText,
    clearCompletedTasks,
    updateCapabilities,
  };
};
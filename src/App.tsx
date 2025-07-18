import React from 'react';
import LiveViewContainer from './components/LiveView/LiveViewContainer';
import ChatContainer from './components/Chat/ChatContainer';
import AdvancedControls from './components/Chat/AdvancedControls';
import TaskMonitor from './components/Chat/TaskMonitor';
import { useMessages } from './hooks/useMessages';
import { useProfileImages } from './hooks/useProfileImages';
import { useAudio } from './hooks/useAudio';
import { useStreaming } from './hooks/useStreaming';
import { useAdvancedAI } from './hooks/useAdvancedAI';
import { useCompanions } from './hooks/useCompanions';
import { useTheme } from './hooks/useTheme';
import { Toaster } from 'react-hot-toast';
import { StylePreset } from './types/companions';

function App() {
  const { theme, toggleTheme } = useTheme();
  
  const {
    images,
    currentIndex,
    pinnedIndex,
    addImage,
    changeImage,
    togglePin,
    clearImages,
  } = useProfileImages();
  
  const {
    companions,
    activeCompanion,
    loading: companionsLoading,
    switchCompanion,
    addCompanion,
    updateCompanion,
    deleteCompanion,
    duplicateCompanion,
  } = useCompanions();

  // Create webhook config from active companion
  const activeWebhookConfig = {
    url: '', // This will be managed through settings
    enabled: true,
    sessionId: activeCompanion?.sessionId || webhookConfig.sessionId,
    modelName: activeCompanion?.modelName || '',
    modifier: activeCompanion?.modifier || ''
  };
  
  const { 
    messages, 
    loading: messagesLoading,
    waiting,
    streamingMessageId,
    sendMessage,
    retryMessage,
    clearMessages,
    updateMessageWithAudio,
    updateStreamingMessage,
  } = useMessages(activeCompanion, addImage);

  const { requestAudio } = useAudio(activeCompanion, updateMessageWithAudio);
  
  const { streamingState, startStreaming, stopStreaming } = useStreaming(
    activeCompanion, 
    updateStreamingMessage
  );

  const {
    capabilities,
    activeTasks,
    generationQueue,
    generateImage,
    analyzeImage,
    enhanceImage,
    performWebSearch,
    executeCode,
    translateText,
    clearCompletedTasks,
    clearCompletedGenerations,
    cancelGeneration,
    retryGeneration,
  } = useAdvancedAI(activeCompanion);

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all chat history and images?')) {
      clearMessages();
      clearImages();
    }
  };

  const handleSendMessage = (message: string, requestType: 'text' | 'image' | 'video', imageData?: string, currentImageUrl?: string) => {
    sendMessage(message, requestType, imageData, currentImageUrl);
  };

  const handleGenerate = async (
    prompt: string, 
    type: 'text-to-image' | 'image-to-image', 
    sourceImage?: string, 
    styleOverride?: StylePreset
  ) => {
    if (!activeCompanion) return;
    
    const images = await generateImage(prompt, type, activeCompanion, sourceImage, styleOverride);
    
    // Add generated images to the gallery
    if (images && images.length > 0) {
      images.forEach(imageUrl => addImage(imageUrl));
    }
  };

  const currentImageUrl = images[currentIndex];

  // Show loading state while companions are loading
  if (companionsLoading) {
    return (
      <div className="h-screen bg-zinc-900 dark:bg-gray-100 flex items-center justify-center">
        <div className="text-zinc-400 dark:text-gray-600">Loading AI Companions...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-900 dark:bg-gray-100 flex flex-col md:flex-row overflow-hidden">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#27272a' : '#ffffff',
            color: theme === 'dark' ? '#f4f4f5' : '#1f2937',
            border: theme === 'dark' ? '1px solid #3f3f46' : '1px solid #d1d5db',
          },
        }}
      />
      
      {/* Left Section - Live View / Webcam Display */}
      <div className="w-full md:w-96 flex flex-col flex-shrink-0 border-b md:border-b-0 md:border-r border-zinc-700 dark:border-gray-300 overflow-hidden">
        <div className="flex-1 p-4 overflow-hidden">
          <LiveViewContainer
            images={images}
            currentIndex={currentIndex}
            onImageChange={changeImage}
            pinnedIndex={pinnedIndex}
            onTogglePin={togglePin}
            onSendMessage={handleSendMessage}
            disabled={waiting}
          />
        </div>
        
        {/* AI Generation Controls - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 pt-0">
          <AdvancedControls
            companion={activeCompanion}
            onGenerate={handleGenerate}
            generationQueue={generationQueue}
            onCancelGeneration={cancelGeneration}
            onRetryGeneration={retryGeneration}
            onClearCompleted={clearCompletedGenerations}
            currentImageUrl={currentImageUrl}
            disabled={waiting}
          />
        </div>
      </div>
      
      {/* Right Section - Chat Interface */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatContainer
          messages={messages}
          loading={waiting}
          onSendMessage={handleSendMessage}
          onRetryMessage={retryMessage}
          onClearChat={handleClearAll}
          onRequestAudio={requestAudio}
          streamingState={streamingState}
          onStopStreaming={stopStreaming}
          theme={theme}
          onToggleTheme={toggleTheme}
          companions={companions}
          activeCompanion={activeCompanion}
          onSwitchCompanion={switchCompanion}
          onCreateCompanion={addCompanion}
          onUpdateCompanion={updateCompanion}
          onDuplicateCompanion={duplicateCompanion}
          onDeleteCompanion={deleteCompanion}
        />
      </div>

      {/* Task Monitor - Fixed position overlay */}
      <TaskMonitor 
        tasks={activeTasks}
        onClearCompleted={clearCompletedTasks}
      />
    </div>
  );
}

export default App;
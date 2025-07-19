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
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [isAdvancedControlsOpen, setIsAdvancedControlsOpen] = React.useState(false);
  
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

  const handleImageReceived = (imageUrl: string) => {
    addImage(imageUrl);
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
  } = useMessages(activeCompanion, handleImageReceived);

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

  const handleOpenAdvancedControls = () => {
    setIsAdvancedControlsOpen(true);
  };

  const handleCloseAdvancedControls = () => {
    setIsAdvancedControlsOpen(false);
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
      <div className="h-screen bg-gray-100 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-zinc-400">Loading AI Companions...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 dark:bg-zinc-900 flex flex-col lg:flex-row overflow-hidden">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: theme === 'light' ? '#ffffff' : '#27272a',
            color: theme === 'light' ? '#1f2937' : '#f4f4f5',
            border: theme === 'light' ? '1px solid #d1d5db' : '1px solid #3f3f46',
          },
        }}
      />
      
      {/* Left Section - Live View / Image Display */}
      <div className="w-full lg:w-96 xl:w-[28rem] flex flex-col flex-shrink-0 border-b lg:border-b-0 lg:border-r border-gray-300 dark:border-zinc-700 overflow-hidden">
        <div className="flex-1 p-2 sm:p-4 overflow-hidden">
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
        
        {/* Desktop AI Generation Controls - Fixed at bottom, hidden on mobile */}
        <div className="hidden lg:block flex-shrink-0 p-2 sm:p-4 pt-0">
          <AdvancedControls
            companion={activeCompanion}
            onGenerate={handleGenerate}
            generationQueue={generationQueue}
            onCancelGeneration={cancelGeneration}
            onRetryGeneration={retryGeneration}
            onClearCompleted={clearCompletedGenerations}
            currentImageUrl={currentImageUrl}
            disabled={waiting}
            isModal={false}
            onClose={() => {}}
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
          onOpenAdvancedControls={handleOpenAdvancedControls}
        />
      </div>

      {/* Mobile Advanced Controls Modal */}
      <AnimatePresence>
        {isAdvancedControlsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={handleCloseAdvancedControls}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-800 rounded-t-2xl max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <AdvancedControls
                companion={activeCompanion}
                onGenerate={handleGenerate}
                generationQueue={generationQueue}
                onCancelGeneration={cancelGeneration}
                onRetryGeneration={retryGeneration}
                onClearCompleted={clearCompletedGenerations}
                currentImageUrl={currentImageUrl}
                disabled={waiting}
                isModal={true}
                onClose={handleCloseAdvancedControls}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Monitor - Fixed position overlay */}
      <TaskMonitor 
        tasks={activeTasks}
        onClearCompleted={clearCompletedTasks}
      />
    </div>
  );
}

export default App;
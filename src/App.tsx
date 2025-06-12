import React from 'react';
import LiveViewContainer from './components/LiveView/LiveViewContainer';
import ChatContainer from './components/Chat/ChatContainer';
import AdvancedControls from './components/Chat/AdvancedControls';
import TaskMonitor from './components/Chat/TaskMonitor';
import { useWebhook } from './hooks/useWebhook';
import { useMessages } from './hooks/useMessages';
import { useProfileImages } from './hooks/useProfileImages';
import { useAudio } from './hooks/useAudio';
import { useStreaming } from './hooks/useStreaming';
import { useAdvancedAI } from './hooks/useAdvancedAI';
import { Toaster } from 'react-hot-toast';

function App() {
  const { 
    config: webhookConfig, 
    error: webhookError,
    updateWebhookUrl,
    toggleWebhook,
  } = useWebhook();
  
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
    messages, 
    loading: messagesLoading,
    waiting,
    streamingMessageId,
    sendMessage,
    retryMessage,
    clearMessages,
    updateMessageWithAudio,
    updateStreamingMessage,
  } = useMessages(webhookConfig, addImage);

  const { requestAudio } = useAudio(webhookConfig, updateMessageWithAudio);
  
  const { streamingState, startStreaming, stopStreaming } = useStreaming(
    webhookConfig, 
    updateStreamingMessage
  );

  const {
    capabilities,
    activeTasks,
    analyzeImage,
    enhanceImage,
    performWebSearch,
    executeCode,
    translateText,
    clearCompletedTasks,
  } = useAdvancedAI(webhookConfig);

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all chat history and images?')) {
      clearMessages();
      clearImages();
    }
  };

  const handleSendMessage = (message: string, requestType: 'text' | 'image' | 'video', imageData?: string, currentImageUrl?: string) => {
    sendMessage(message, requestType, imageData, currentImageUrl);
  };

  const currentImageUrl = images[currentIndex];

  return (
    <div className="h-screen bg-zinc-900 flex flex-col md:flex-row overflow-hidden">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#27272a',
            color: '#f4f4f5',
            border: '1px solid #3f3f46',
          },
        }}
      />
      
      {/* Left Section - Live View / Webcam Display */}
      <div className="w-full md:w-96 flex flex-col flex-shrink-0 border-b md:border-b-0 md:border-r border-zinc-700 overflow-hidden">
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
        
        {/* Advanced AI Controls - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 pt-0">
          <AdvancedControls
            onWebSearch={performWebSearch}
            onCodeExecution={executeCode}
            onTranslation={translateText}
            onImageAnalysis={analyzeImage}
            onImageEnhancement={enhanceImage}
            activeTasks={activeTasks}
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
          webhookConfig={webhookConfig}
          webhookError={webhookError}
          onUpdateWebhook={updateWebhookUrl}
          onToggleWebhook={toggleWebhook}
          onRequestAudio={requestAudio}
          streamingState={streamingState}
          onStopStreaming={stopStreaming}
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
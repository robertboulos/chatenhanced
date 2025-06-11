import React from 'react';
import LiveViewContainer from './components/LiveView/LiveViewContainer';
import ChatContainer from './components/Chat/ChatContainer';
import { useWebhook } from './hooks/useWebhook';
import { useMessages } from './hooks/useMessages';
import { useProfileImages } from './hooks/useProfileImages';
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
    sendMessage,
    retryMessage,
    clearMessages,
  } = useMessages(webhookConfig, addImage);

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all chat history and images?')) {
      clearMessages();
      clearImages();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex">
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
      
      {/* Left Section - Live View / Webcam Display (Wider portrait width) */}
      <div className="w-96 p-4 flex-shrink-0">
        <LiveViewContainer
          images={images}
          currentIndex={currentIndex}
          onImageChange={changeImage}
          pinnedIndex={pinnedIndex}
          onTogglePin={togglePin}
        />
      </div>
      
      {/* Right Section - Chat Interface (Remaining space) */}
      <div className="flex-1 border-l border-zinc-700">
        <ChatContainer
          messages={messages}
          loading={waiting}
          onSendMessage={sendMessage}
          onRetryMessage={retryMessage}
          onClearChat={handleClearAll}
          webhookConfig={webhookConfig}
          webhookError={webhookError}
          onUpdateWebhook={updateWebhookUrl}
          onToggleWebhook={toggleWebhook}
        />
      </div>
    </div>
  );
}

export default App;
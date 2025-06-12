import React from 'react';
import ProfileImageDisplay from '../ProfileDisplay/ProfileImageDisplay';
import LiveViewControls from './LiveViewControls';

interface LiveViewContainerProps {
  images: string[];
  currentIndex: number;
  onImageChange: (index: number) => void;
  pinnedIndex: number | null;
  onTogglePin: (index: number | null) => void;
  onSendMessage: (message: string, requestType: 'text' | 'image' | 'video', imageData?: string, currentImageUrl?: string) => void;
  disabled?: boolean;
}

const LiveViewContainer: React.FC<LiveViewContainerProps> = ({
  images,
  currentIndex,
  onImageChange,
  pinnedIndex,
  onTogglePin,
  onSendMessage,
  disabled = false,
}) => {
  const currentImageUrl = images[currentIndex];

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Profile Image Display - Takes most of the space */}
      <div className="flex-1">
        <ProfileImageDisplay
          images={images}
          currentIndex={currentIndex}
          onImageChange={onImageChange}
          pinnedIndex={pinnedIndex}
          onTogglePin={onTogglePin}
        />
      </div>
      
      {/* Live View Controls - Fixed at bottom */}
      <div className="flex-shrink-0">
        <LiveViewControls
          onSendMessage={onSendMessage}
          currentImageUrl={currentImageUrl}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default LiveViewContainer;
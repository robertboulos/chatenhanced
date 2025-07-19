import React from 'react';
import ProfileImageDisplay from '../ProfileDisplay/ProfileImageDisplay';

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

  return (
    <div className="h-full overflow-hidden">
      <ProfileImageDisplay
        images={images}
        currentIndex={currentIndex}
        onImageChange={onImageChange}
        pinnedIndex={pinnedIndex}
        onTogglePin={onTogglePin}
      />
    </div>
  );
};

export default LiveViewContainer;
import React from 'react';
import ProfileImageDisplay from '../ProfileDisplay/ProfileImageDisplay';

interface LiveViewContainerProps {
  images: string[];
  currentIndex: number;
  onImageChange: (index: number) => void;
  pinnedIndex: number | null;
  onTogglePin: (index: number | null) => void;
}

const LiveViewContainer: React.FC<LiveViewContainerProps> = ({
  images,
  currentIndex,
  onImageChange,
  pinnedIndex,
  onTogglePin,
}) => {
  return (
    <div className="h-full">
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
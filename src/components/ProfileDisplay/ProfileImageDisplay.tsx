import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X, ChevronLeft, ChevronRight, Pin, PinOff } from 'lucide-react';

interface ProfileImageDisplayProps {
  images: string[];
  currentIndex: number;
  onImageChange: (index: number) => void;
  pinnedIndex: number | null;
  onTogglePin: (index: number | null) => void;
}

const ProfileImageDisplay: React.FC<ProfileImageDisplayProps> = ({
  images,
  currentIndex,
  onImageChange,
  pinnedIndex,
  onTogglePin,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const currentImage = images[currentIndex];
  const hasImages = images.length > 0;
  const canNavigate = images.length > 1;
  const isPinned = pinnedIndex === currentIndex;

  const handleImageLoad = () => {
    setLoaded(true);
    setError(false);
  };

  const handleImageError = () => {
    setLoaded(false);
    setError(true);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!canNavigate) return;
    
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + images.length) % images.length
      : (currentIndex + 1) % images.length;
    
    onImageChange(newIndex);
  };

  const togglePin = () => {
    onTogglePin(isPinned ? null : currentIndex);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <div className="h-full flex flex-col bg-white dark:bg-zinc-800 rounded-xl border border-gray-300 dark:border-zinc-700 overflow-hidden shadow-2xl group">
        {/* Header */}
        <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-100 dark:bg-zinc-900/50 border-b border-gray-300 dark:border-zinc-700 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700 dark:text-zinc-300 text-xs sm:text-sm font-medium">Live View</span>
          </div>
          
          {hasImages && (
            <div className="flex items-center space-x-1">
              <span className="text-gray-600 dark:text-zinc-400 text-xs sm:text-sm">
                {currentIndex + 1}/{images.length}
              </span>
              
              <button
                onClick={togglePin}
                className={`p-0.5 sm:p-1 rounded transition-colors ${
                  isPinned 
                    ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                }`}
                title={isPinned ? 'Unpin image' : 'Pin image'}
              >
                {isPinned ? <PinOff size={10} className="sm:w-3 sm:h-3" /> : <Pin size={10} className="sm:w-3 sm:h-3" />}
              </button>
            </div>
          )}
        </div>

        {/* Image Display - Takes remaining space with 9:16 aspect ratio */}
        <div className="relative flex-1 bg-gray-200 dark:bg-zinc-900 flex items-center justify-center min-h-0">
          {!hasImages ? (
            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-zinc-500 p-2 sm:p-4">
              <User size={24} className="sm:w-8 sm:h-8 mb-2 opacity-50" />
              <p className="text-xs sm:text-sm text-center">No images yet</p>
              <p className="text-xs opacity-75 mt-1 text-center">Images will appear here</p>
            </div>
          ) : (
            <>
              {!loaded && !error && (
                <div className="absolute inset-0 bg-gray-300 dark:bg-zinc-800 animate-pulse flex items-center justify-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-gray-400 dark:border-zinc-600 border-t-gray-600 dark:border-t-zinc-400 rounded-full animate-spin"></div>
                </div>
              )}
              
              {error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 dark:text-zinc-500 p-2 sm:p-4">
                  <X size={20} className="sm:w-6 sm:h-6 mb-2 opacity-50" />
                  <p className="text-xs text-center">Failed to load image</p>
                </div>
              ) : (
                <motion.img
                  key={currentImage}
                  src={currentImage}
                  alt="Profile view"
                  className={`max-w-full max-h-full object-contain cursor-pointer transition-opacity ${
                    loaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  onClick={toggleExpand}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: loaded ? 1 : 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}

              {/* Navigation Controls */}
              {canNavigate && loaded && (
                <>
                  <button
                    onClick={() => navigateImage('prev')}
                    className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 sm:p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  
                  <button
                    onClick={() => navigateImage('next')}
                    className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 sm:p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </>
              )}

              {/* Pin Indicator */}
              {isPinned && (
                <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-amber-500/90 text-amber-900 px-1 sm:px-1.5 py-0.5 rounded-full text-xs font-medium">
                  Pinned
                </div>
              )}
            </>
          )}
        </div>

        {/* Image Thumbnails - Compact for narrow width */}
        {images.length > 1 && (
          <div className="p-1 sm:p-2 bg-gray-100 dark:bg-zinc-900/30 border-t border-gray-300 dark:border-zinc-700 flex-shrink-0">
            <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => onImageChange(index)}
                  className={`relative flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded overflow-hidden border transition-all ${
                    index === currentIndex
                      ? 'border-indigo-500 ring-1 ring-indigo-500/30'
                      : 'border-gray-400 dark:border-zinc-600 hover:border-gray-500 dark:hover:border-zinc-500'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {pinnedIndex === index && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-amber-500 rounded-full flex items-center justify-center">
                      <Pin size={4} className="sm:w-1.5 sm:h-1.5 text-amber-900" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expanded View Modal */}
      <AnimatePresence>
        {expanded && currentImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={toggleExpand}
          >
            <button 
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(false);
              }}
            >
              <X size={24} />
            </button>
            
            <motion.img
              src={currentImage}
              alt="Full size view"
              className="max-w-full max-h-full object-contain"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navigation in expanded view */}
            {canNavigate && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('prev');
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('next');
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfileImageDisplay;
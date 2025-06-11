import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ImagePreviewProps {
  url: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ url }) => {
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleImageLoad = () => {
    setLoaded(true);
    setError(false);
  };

  const handleImageError = () => {
    setLoaded(false);
    setError(true);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        Failed to load image: {url}
      </div>
    );
  }

  return (
    <>
      <div 
        className="cursor-pointer relative"
        onClick={toggleExpand}
      >
        {!loaded && (
          <div className="w-full h-32 bg-gray-200 animate-pulse rounded flex items-center justify-center">
            <p className="text-gray-500 text-sm">Loading image...</p>
          </div>
        )}
        <img 
          src={url} 
          alt="Preview" 
          className={`max-h-32 rounded transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ maxWidth: '100%' }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
            onClick={toggleExpand}
          >
            <button 
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(false);
              }}
            >
              <X size={24} />
            </button>
            <motion.img
              src={url}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImagePreview;
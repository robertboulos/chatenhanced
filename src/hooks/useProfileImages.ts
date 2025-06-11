import { useState, useCallback } from 'react';

export const useProfileImages = () => {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);

  const addImage = useCallback((imageUrl: string) => {
    setImages(prevImages => {
      // Check if image already exists to prevent duplicates
      if (prevImages.includes(imageUrl)) {
        const existingIndex = prevImages.indexOf(imageUrl);
        setCurrentIndex(existingIndex);
        return prevImages;
      }

      const newImages = [...prevImages, imageUrl];
      
      // If no image is pinned, automatically show the latest image
      if (pinnedIndex === null) {
        setCurrentIndex(newImages.length - 1);
      }
      
      return newImages;
    });
  }, [pinnedIndex]);

  const changeImage = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
    }
  }, [images.length]);

  const togglePin = useCallback((index: number | null) => {
    setPinnedIndex(index);
    if (index !== null) {
      setCurrentIndex(index);
    }
  }, []);

  const clearImages = useCallback(() => {
    setImages([]);
    setCurrentIndex(0);
    setPinnedIndex(null);
  }, []);

  return {
    images,
    currentIndex,
    pinnedIndex,
    addImage,
    changeImage,
    togglePin,
    clearImages,
  };
};
import { useState, useCallback, useRef, useEffect } from 'react';

export const useNotificationSound = () => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('notification-sound-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem('notification-sound-enabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  const createNotificationSound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      
      // Resume audio context if it's suspended (required by some browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      // Create a gentle notification sound (similar to iPhone message sound)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set frequency for a pleasant notification tone
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
      
      // Set volume envelope for a gentle sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      // Play the sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  return {
    soundEnabled,
    toggleSound,
    playNotificationSound: createNotificationSound,
  };
};
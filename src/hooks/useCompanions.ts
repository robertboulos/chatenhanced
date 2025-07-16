import { useState, useEffect, useCallback } from 'react';
import { CompanionPreset } from '../types/companions';
import {
  loadCompanions,
  saveCompanions,
  loadActiveCompanionId,
  saveActiveCompanionId,
  createCompanion,
  updateCompanionLastUsed
} from '../services/companionService';
import toast from 'react-hot-toast';

export const useCompanions = () => {
  const [companions, setCompanions] = useState<CompanionPreset[]>([]);
  const [activeCompanionId, setActiveCompanionId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Load companions and active companion on mount
  useEffect(() => {
    const loadedCompanions = loadCompanions();
    const loadedActiveId = loadActiveCompanionId();
    
    setCompanions(loadedCompanions);
    setActiveCompanionId(loadedActiveId);
    setLoading(false);
  }, []);

  // Save companions when they change
  useEffect(() => {
    if (!loading && companions.length > 0) {
      saveCompanions(companions);
    }
  }, [companions, loading]);

  // Save active companion when it changes
  useEffect(() => {
    if (!loading && activeCompanionId) {
      saveActiveCompanionId(activeCompanionId);
    }
  }, [activeCompanionId, loading]);

  const activeCompanion = companions.find(c => c.id === activeCompanionId) || companions[0];

  const switchCompanion = useCallback((companionId: string) => {
    const companion = companions.find(c => c.id === companionId);
    if (!companion) {
      toast.error('Companion not found');
      return false;
    }

    setActiveCompanionId(companionId);
    
    // Update last used timestamp
    const updatedCompanions = updateCompanionLastUsed(companions, companionId);
    setCompanions(updatedCompanions);
    
    toast.success(`Switched to ${companion.name}`);
    return true;
  }, [companions]);

  const addCompanion = useCallback((
    name: string,
    personality: string,
    sessionId: string,
    avatar?: string
  ) => {
    // Check if sessionId already exists
    const existingCompanion = companions.find(c => c.sessionId === sessionId);
    if (existingCompanion) {
      toast.error('Session ID already exists');
      return null;
    }

    const newCompanion = createCompanion(name, personality, sessionId, avatar);
    const updatedCompanions = [...companions, newCompanion];
    
    setCompanions(updatedCompanions);
    setActiveCompanionId(newCompanion.id);
    
    toast.success(`Created companion: ${name}`);
    return newCompanion;
  }, [companions]);

  const updateCompanion = useCallback((companionId: string, updates: Partial<CompanionPreset>) => {
    const updatedCompanions = companions.map(companion =>
      companion.id === companionId
        ? { ...companion, ...updates }
        : companion
    );
    
    setCompanions(updatedCompanions);
    toast.success('Companion updated');
  }, [companions]);

  const deleteCompanion = useCallback((companionId: string) => {
    if (companions.length <= 1) {
      toast.error('Cannot delete the last companion');
      return false;
    }

    const companion = companions.find(c => c.id === companionId);
    if (!companion) {
      toast.error('Companion not found');
      return false;
    }

    const updatedCompanions = companions.filter(c => c.id !== companionId);
    setCompanions(updatedCompanions);

    // If we deleted the active companion, switch to the first one
    if (activeCompanionId === companionId) {
      setActiveCompanionId(updatedCompanions[0].id);
    }

    toast.success(`Deleted companion: ${companion.name}`);
    return true;
  }, [companions, activeCompanionId]);

  const duplicateCompanion = useCallback((companionId: string) => {
    const companion = companions.find(c => c.id === companionId);
    if (!companion) {
      toast.error('Companion not found');
      return null;
    }

    const newCompanion = createCompanion(
      `${companion.name} (Copy)`,
      companion.personality,
      `${companion.sessionId}-copy-${Date.now()}`,
      companion.avatar
    );

    // Copy generation defaults and voice settings
    newCompanion.generationDefaults = { ...companion.generationDefaults };
    newCompanion.defaultImageStyle = companion.defaultImageStyle;
    if (companion.voiceSettings) {
      newCompanion.voiceSettings = { ...companion.voiceSettings };
    }

    const updatedCompanions = [...companions, newCompanion];
    setCompanions(updatedCompanions);
    
    toast.success(`Duplicated companion: ${companion.name}`);
    return newCompanion;
  }, [companions]);

  return {
    companions,
    activeCompanion,
    activeCompanionId,
    loading,
    switchCompanion,
    addCompanion,
    updateCompanion,
    deleteCompanion,
    duplicateCompanion,
  };
};
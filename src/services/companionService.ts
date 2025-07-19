import { CompanionPreset } from '../types/companions';

const COMPANIONS_KEY = 'ai-companions';
const ACTIVE_COMPANION_KEY = 'active-companion-id';

const defaultCompanions: CompanionPreset[] = [
  {
    id: 'default-assistant',
    name: 'AI Assistant',
    personality: 'Helpful and professional AI assistant',
    sessionId: 'default-session',
    modelName: 'gpt-4o-mini',
    modifier: 'helpful',
    defaultImageStyle: 'Professional and clean',
    generationDefaults: {
      cfg_scale: 7.5,
      steps: 30,
      dimensions: '1024x1024',
      style_preset: 'photographic',
      loras: [],
      negative_prompt: 'blurry, low quality, distorted'
    },
    createdAt: Date.now(),
    lastUsed: Date.now()
  },
  {
    id: 'creative-artist',
    name: 'Creative Artist',
    avatar: '🎨',
    personality: 'Imaginative and artistic, loves creating beautiful visuals',
    sessionId: 'artist-session',
    modelName: 'gpt-4o',
    modifier: 'creative',
    defaultImageStyle: 'Artistic and expressive',
    generationDefaults: {
      cfg_scale: 8.5,
      steps: 50,
      dimensions: '1024x1024',
      style_preset: 'artistic',
      loras: [],
      negative_prompt: 'ugly, deformed, low quality'
    },
    createdAt: Date.now(),
    lastUsed: Date.now()
  },
  {
    id: 'photo-expert',
    name: 'Photo Expert',
    avatar: '📸',
    personality: 'Photography enthusiast with an eye for realistic imagery',
    sessionId: 'photo-session',
    modelName: 'gpt-4o',
    modifier: 'precise',
    defaultImageStyle: 'Photorealistic and detailed',
    generationDefaults: {
      cfg_scale: 7.0,
      steps: 40,
      dimensions: '1024x1024',
      style_preset: 'photographic',
      loras: [],
      negative_prompt: 'cartoon, anime, painting, sketch'
    },
    createdAt: Date.now(),
    lastUsed: Date.now()
  }
];

export const saveCompanions = (companions: CompanionPreset[]): void => {
  try {
    localStorage.setItem(COMPANIONS_KEY, JSON.stringify(companions));
  } catch (error) {
    console.error('Error saving companions:', error);
  }
};

export const loadCompanions = (): CompanionPreset[] => {
  try {
    const data = localStorage.getItem(COMPANIONS_KEY);
    if (!data) {
      // First time - save defaults
      saveCompanions(defaultCompanions);
      return defaultCompanions;
    }
    const companions = JSON.parse(data);
    // Ensure we have at least the default companions
    if (companions.length === 0) {
      saveCompanions(defaultCompanions);
      return defaultCompanions;
    }
    return companions;
  } catch (error) {
    console.error('Error loading companions:', error);
    return defaultCompanions;
  }
};

export const saveActiveCompanionId = (companionId: string): void => {
  try {
    localStorage.setItem(ACTIVE_COMPANION_KEY, companionId);
  } catch (error) {
    console.error('Error saving active companion:', error);
  }
};

export const loadActiveCompanionId = (): string => {
  try {
    const id = localStorage.getItem(ACTIVE_COMPANION_KEY);
    return id || defaultCompanions[0].id;
  } catch (error) {
    console.error('Error loading active companion:', error);
    return defaultCompanions[0].id;
  }
};

export const createCompanion = (
  name: string,
  personality: string,
  sessionId: string,
  avatar?: string,
  modelName?: string,
  modifier?: string
): CompanionPreset => {
  return {
    id: `companion-${Date.now()}`,
    name,
    avatar,
    personality,
    sessionId,
    modelName: modelName || 'gpt-4o-mini',
    modifier: modifier || 'balanced',
    defaultImageStyle: 'Balanced and versatile',
    generationDefaults: {
      cfg_scale: 7.5,
      steps: 30,
      dimensions: '1024x1024',
      style_preset: 'balanced',
      loras: [],
      negative_prompt: 'low quality, blurry'
    },
    createdAt: Date.now(),
    lastUsed: Date.now()
  };
};

export const updateCompanionLastUsed = (companions: CompanionPreset[], companionId: string): CompanionPreset[] => {
  return companions.map(companion =>
    companion.id === companionId
      ? { ...companion, lastUsed: Date.now() }
      : companion
  );
};
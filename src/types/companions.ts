export interface CompanionPreset {
  id: string;
  name: string;
  avatar?: string;
  personality: string;
  sessionId: string;
  modelName: string;
  modifier: string;
  defaultImageStyle: string;
  generationDefaults: {
    cfg_scale: number;
    steps: number;
    dimensions: string;
    loras: Array<{ id: number; weight: number; }>;
    negative_prompt: string;
    style_preset?: string;
  };
  voiceSettings?: {
    voice_id: string;
    speed: number;
  };
  createdAt: number;
  lastUsed: number;
}

interface GenerationRequest {
  type: 'text-to-image' | 'image-to-image' | 'upscale' | 'variation';
  prompt?: string;
  sourceImageUrl?: string;
  stylePreset?: string;
  companionId: string;
  overrides?: Partial<CompanionPreset['generationDefaults']>;
}

export interface GenerationQueueItem {
  id: string;
  type: GenerationRequest['type'];
  prompt?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: string[];
  error?: string;
  createdAt: number;
  companionId: string;
}

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  settings: Partial<CompanionPreset['generationDefaults']>;
  category: 'portrait' | 'landscape' | 'artistic' | 'realistic' | 'anime' | 'photography';
}
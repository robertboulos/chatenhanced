export interface Message {
  id: string;
  content: string;
  timestamp: number;
  type: 'sent' | 'received';
  status: 'sending' | 'sent' | 'failed';
  isImage: boolean;
  audioUrl?: string;
  imageData?: string; // Base64 image data for uploaded images
}

export interface WebhookConfig {
  url: string;
  enabled: boolean;
  sessionId?: string;
  modelName?: string;
  modifier?: string;
}

export interface WebhookPayload {
  sessionId: string;
  content: string;
  timestamp: number;
  isImage: boolean;
  modelName?: string;
  modifier?: string;
  requestType?: 'text' | 'image' | 'video';
  imageData?: string;
  currentImageUrl?: string;
  stream?: boolean;
  generationParams?: any;
}

export interface AITask {
  id: string;
  type: 'analyze' | 'enhance' | 'search' | 'execute' | 'translate';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: any;
}
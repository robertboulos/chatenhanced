export interface Message {
  id: string;
  content: string;
  timestamp: number;
  type: 'sent' | 'received';
  status: 'sending' | 'sent' | 'failed';
  isImage: boolean;
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
  requestType?: 'text' | 'image';
}
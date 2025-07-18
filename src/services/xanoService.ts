export interface LoRAModel {
  id: number;
  name: string;
  file_size_mb: number;
  type: string;
  personality: string;
  url: string;
  description: string;
  tags: string[];
  thumbnail_url?: string;
  usage_count?: number;
  avg_weight?: number;
}

const XANO_CONFIG = {
  baseUrl: 'https://xnwv-v1z6-dvnr.n7c.xano.io',
  workspaceId: '5',
  apiGroups: {
    imageGenV2: '/api:f0PVlTz_',
  }
};

export const fetchLoRAModels = async (): Promise<LoRAModel[]> => {
  try {
    // This will be connected to your actual Xano endpoint
    const response = await fetch(`${XANO_CONFIG.baseUrl}${XANO_CONFIG.apiGroups.imageGenV2}/loras`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.loras || data || [];
  } catch (error) {
    console.error('Failed to fetch LoRA models:', error);
    
    // Fallback to mock data for development
    return [
      {
        id: 309,
        name: 'sarasampaio',
        file_size_mb: 19.3,
        type: 'Character LoRA',
        personality: 'Elegant fashion model aesthetic',
        url: 'https://xnwv-v1z6-dvnr.n7c.xano.io/vault/zu8qHvvN/aBPrLQP5/sarasampaio.safetensors',
        description: 'High-quality fashion and portrait model',
        tags: ['fashion', 'portrait', 'elegant']
      },
      {
        id: 310,
        name: 'marietemara',
        file_size_mb: 19.3,
        type: 'Character LoRA',
        personality: 'Natural beauty style',
        url: 'https://xnwv-v1z6-dvnr.n7c.xano.io/vault/zu8qHvvN/aBPrLQP5/marietemara.safetensors',
        description: 'Natural and casual portrait style',
        tags: ['natural', 'casual', 'portrait']
      },
      {
        id: 311,
        name: 'lovette',
        file_size_mb: 19.3,
        type: 'Character LoRA',
        personality: 'Artistic and creative',
        url: 'https://xnwv-v1z6-dvnr.n7c.xano.io/vault/zu8qHvvN/aBPrLQP5/lovette.safetensors',
        description: 'Creative and artistic portrait style',
        tags: ['artistic', 'creative', 'unique']
      },
      {
        id: 312,
        name: 'dawnknudsen',
        file_size_mb: 19.3,
        type: 'Character LoRA',
        personality: 'Professional headshot style',
        url: 'https://xnwv-v1z6-dvnr.n7c.xano.io/vault/zu8qHvvN/aBPrLQP5/dawnknudsen.safetensors',
        description: 'Professional and corporate portrait style',
        tags: ['professional', 'corporate', 'headshot']
      }
    ];
  }
};

export const searchLoRAModels = async (searchTerm: string, category?: string): Promise<LoRAModel[]> => {
  try {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (category) params.append('category', category);
    
    const response = await fetch(`${XANO_CONFIG.baseUrl}${XANO_CONFIG.apiGroups.imageGenV2}/loras?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.loras || data || [];
  } catch (error) {
    console.error('Failed to search LoRA models:', error);
    // Fallback to filtering mock data
    const allModels = await fetchLoRAModels();
    return allModels.filter(model => 
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }
};
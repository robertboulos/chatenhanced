# Xano Image Generation Endpoint Reorganization Plan

## Current State Analysis (🖼️ Image Generation Group)

### Endpoint Inventory
You have 19 endpoints with overlapping functionality:
- **3 Flux variants**: flux-dev-lora, flux-general, juggernaut-flux
- **Multiple providers**: fal-ai, rundiffusion, black-forest-labs
- **Retrieval endpoints**: Various /requests endpoints
- **Legacy endpoints**: gpt-image variants

### Issues with Current Organization
1. **Naming inconsistency**: `fal-ai/flux-lora` vs `rundiffusion-fal/juggernaut-flux-lora`
2. **Parameter fragmentation**: `cfg` vs `guidance_scale`, `steps` vs `num_inference_steps`
3. **Missing core features**: No seed control, no negative prompts
4. **No unified interface**: Frontend must know about each endpoint's quirks

## 🎯 Proposed Reorganization

### 1. Create Unified Gateway Endpoint
```javascript
// NEW ENDPOINT: /api/image/generate
POST /api/image/generate
{
  // Core parameters (always required)
  prompt: string,
  
  // Generation settings
  settings: {
    cfg_scale: number,        // Unified naming
    steps: number,            // Unified naming
    sampler: string,          // "euler", "ddim", etc.
    seed: number,             // NEW: -1 for random
    width: number,            // Direct pixel control
    height: number,           // Direct pixel control
    negative_prompt: string,  // NEW: Essential feature
  },
  
  // LoRA configuration
  loras: [{
    id: number,              // From table 163
    weight: number,          // 0.0 - 2.0
  }],
  
  // Advanced options
  options: {
    provider: string,        // "fal", "rundiffusion", "auto"
    model: string,          // "flux-dev", "juggernaut", "auto"
    num_images: number,     // Batch size
    format: string,         // "jpeg", "png", "webp"
    quality: number,        // 0-100 for jpeg
    save_to_vault: boolean, // Auto-save to Xano
  }
}

// Response
{
  request_id: string,
  status: "pending" | "processing" | "completed" | "failed",
  images: [{
    url: string,
    vault_url: string,
    metadata: {
      seed: number,
      actual_cfg: number,
      actual_steps: number,
      generation_time: number,
    }
  }],
  credits_used: number,
  provider_used: string,
}
```

### 2. Essential New Endpoints

#### A. LoRA Management
```javascript
// NEW: Get available LoRAs with enhanced metadata
GET /api/loras/available
{
  include_stats: boolean,  // Usage statistics
  compatible_with: string, // Filter by compatibility
}

// NEW: LoRA compatibility checker
POST /api/loras/check-compatibility
{
  lora_ids: number[],
  model: string,
}

// NEW: LoRA usage analytics
GET /api/loras/analytics
{
  lora_id: number,
  date_range: string,
}
```

#### B. Generation Presets
```javascript
// NEW: Save generation preset
POST /api/presets/save
{
  name: string,
  settings: object,
  loras: array,
  tags: string[],
}

// NEW: List user presets
GET /api/presets/list
{
  tags: string[],
  sort: "popular" | "recent" | "name",
}

// NEW: Apply preset
GET /api/presets/{preset_id}
```

#### C. Generation History & Gallery
```javascript
// NEW: Get generation history
GET /api/generations/history
{
  page: number,
  per_page: number,
  filters: {
    date_range: string,
    lora_ids: number[],
    has_seed: boolean,
  }
}

// NEW: Get generation details
GET /api/generations/{generation_id}

// NEW: Favorite/unfavorite generation
POST /api/generations/{generation_id}/favorite
```

#### D. Real-time Status
```javascript
// NEW: Check generation status (for polling)
GET /api/generations/{request_id}/status

// NEW: WebSocket endpoint for real-time updates
WS /api/generations/subscribe
{
  request_ids: string[],
}
```

### 3. Refactor Existing Endpoints

#### Keep & Improve:
1. **black-forest-labs/flux-dev-lora** → `/api/providers/flux-dev`
2. **rundiffusion-fal/juggernaut-flux-lora** → `/api/providers/juggernaut`
3. **fal-ai/flux-general** → `/api/providers/flux-general`

#### Consolidate:
- All `/requests` endpoints → Single `/api/generations/status`
- All retrieval endpoints → Single `/api/generations/retrieve`

#### Deprecate:
- Duplicate endpoints with similar functionality
- Endpoints without clear documentation

## 🔄 Implementation Plan

### Phase 1: Backend Gateway (Week 1)
```javascript
// Xano function: Unified Image Generator
function generateImage(input) {
  // 1. Validate and normalize parameters
  const params = normalizeParams(input);
  
  // 2. Select best provider based on requirements
  const provider = selectProvider(params);
  
  // 3. Format for specific provider
  const providerParams = formatForProvider(provider, params);
  
  // 4. Call provider endpoint
  const result = callProvider(provider, providerParams);
  
  // 5. Store in database
  saveGeneration(result, params);
  
  // 6. Return unified response
  return formatResponse(result);
}
```

### Phase 2: Enhanced Features (Week 2)
1. Add seed parameter to all provider calls
2. Implement negative prompt handling
3. Create preset management system
4. Build generation history tracking

### Phase 3: Real-time Updates (Week 3)
1. Implement WebSocket notifications
2. Add progress tracking
3. Create queue management system

## 📊 Database Schema Updates

### New Tables Needed:

#### generation_presets
```sql
CREATE TABLE generation_presets (
  id INT PRIMARY KEY,
  user_id INT,
  name VARCHAR(255),
  settings JSON,
  loras JSON,
  tags TEXT[],
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### generation_history
```sql
CREATE TABLE generation_history (
  id INT PRIMARY KEY,
  user_id INT,
  request_id VARCHAR(255),
  provider VARCHAR(50),
  settings JSON,
  loras JSON,
  images JSON,
  credits_used DECIMAL,
  generation_time INT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);
```

#### lora_compatibility
```sql
CREATE TABLE lora_compatibility (
  id INT PRIMARY KEY,
  lora_id_1 INT,
  lora_id_2 INT,
  compatibility_score DECIMAL,
  tested_count INT,
  success_rate DECIMAL,
  notes TEXT
);
```

## 🚀 Frontend Integration Updates

### Updated Service Layer
```typescript
class XanoImageService {
  private baseUrl = 'https://xnwv-v1z6-dvnr.n7c.xano.io/api/image';
  
  async generate(params: GenerationParams): Promise<GenerationResult> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.formatParams(params))
    });
    
    const result = await response.json();
    
    // Start polling for completion
    if (result.status === 'pending') {
      return this.pollForCompletion(result.request_id);
    }
    
    return result;
  }
  
  private formatParams(params: GenerationParams) {
    return {
      prompt: params.prompt,
      settings: {
        cfg_scale: params.cfg_scale,
        steps: params.steps,
        sampler: params.sampler,
        seed: params.seed || -1,
        width: params.width,
        height: params.height,
        negative_prompt: params.negative_prompt || '',
      },
      loras: params.lora_models.map(l => ({
        id: l.model.id,
        weight: l.weight
      })),
      options: {
        provider: 'auto',
        num_images: params.batch_size || 1,
        format: 'jpeg',
        quality: 95,
        save_to_vault: true,
      }
    };
  }
}
```

## 📋 Quick Wins to Implement First

1. **Add to existing endpoints**:
   - `seed` parameter (pass through to providers)
   - `negative_prompt` parameter
   - Unified response format

2. **Create gateway endpoint**:
   - Start with simple pass-through
   - Add provider selection logic
   - Implement response normalization

3. **Add preset endpoint**:
   - Simple save/load functionality
   - Most requested by users

4. **History endpoint**:
   - Leverage existing database records
   - Add pagination and filtering

This reorganization will make the frontend truly a thin layer while Xano handles all the complexity!
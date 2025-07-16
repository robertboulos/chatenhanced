# Provider-Specific Integration Guide for ChatEnhanced

## 🎨 Understanding Provider Differences

Based on the endpoint analysis, here's how each provider works and what parameters they need:

## 1. Fal.ai Integration

### Characteristics
- **Async only** - Always returns request_id
- **Requires polling** - Must check status endpoint
- **Best for** - LoRA models, batch generation
- **Limits** - Varies by model (2-5 LoRAs)

### Parameter Mapping
```typescript
interface FalRequest {
  prompt: string;
  loras: Array<{
    path: string;      // Full URL to .safetensors file
    scale: number;     // 0.0 to 1.0 (not 2.0!)
  }>;
  num_inference_steps: number;  // 40-48 typical
  guidance_scale: number;       // 3.5-7.0 typical
  image_size: string;          // Presets: "square_hd", "portrait_4_3", etc.
  num_images: number;
  enable_safety_checker: boolean;
  output_format: "jpeg" | "png";
}

// Frontend to Fal mapping
function mapToFal(settings: GenerationSettings): FalRequest {
  return {
    prompt: settings.prompt,
    loras: settings.lora_models.map(lm => ({
      path: lm.model.url,  // Get from Xano lora_models table
      scale: Math.min(lm.weight, 1.0)  // Fal uses 0-1, not 0-2
    })),
    num_inference_steps: settings.steps,
    guidance_scale: settings.cfg_scale,
    image_size: getSizePreset(settings.width, settings.height),
    num_images: settings.batch_size || 1,
    enable_safety_checker: false,
    output_format: "jpeg"
  };
}
```

### Size Preset Mapping
```typescript
function getSizePreset(width: number, height: number): string {
  const ratio = width / height;
  
  // Fal.ai specific presets
  if (ratio === 1) return "square_hd";           // 1024x1024
  if (ratio > 1.4) return "landscape_16_9";      // 1024x576
  if (ratio > 1.2) return "landscape_4_3";       // 1024x768
  if (ratio < 0.7) return "portrait_16_9";       // 576x1024
  if (ratio < 0.9) return "portrait_4_3";        // 768x1024
  
  return "square_hd";  // Default
}
```

## 2. Replicate Integration

### Characteristics
- **Sync or Async** - Depends on "Prefer" header
- **Different API structure** - Uses `input` object
- **Best for** - When you need specific Replicate models
- **Unique features** - aspect_ratio, prompt_strength

### Parameter Mapping
```typescript
interface ReplicateRequest {
  version: string;  // Model version ID
  input: {
    prompt: string;
    hf_loras?: string[];        // Array of HuggingFace URLs
    lora_scales?: number[];     // Matching array of scales
    num_inference_steps: number;
    guidance: number;           // Note: Not guidance_scale
    aspect_ratio: string;       // "1:1", "16:9", etc.
    prompt_strength?: number;   // Unique to Replicate
  };
  webhook?: string;
  webhook_events_filter?: string[];
}

// Frontend to Replicate mapping
function mapToReplicate(settings: GenerationSettings): ReplicateRequest {
  return {
    version: "xlabs-ai/flux-dev-lora:latest",  // Or specific version
    input: {
      prompt: settings.prompt,
      hf_loras: settings.lora_models.map(lm => lm.model.url),
      lora_scales: settings.lora_models.map(lm => lm.weight),
      num_inference_steps: settings.steps,
      guidance: settings.cfg_scale,  // Same value, different name
      aspect_ratio: getAspectRatio(settings.width, settings.height)
    }
  };
}

function getAspectRatio(width: number, height: number): string {
  const ratio = width / height;
  
  // Replicate uses string ratios
  if (Math.abs(ratio - 1) < 0.1) return "1:1";
  if (Math.abs(ratio - 16/9) < 0.1) return "16:9";
  if (Math.abs(ratio - 4/3) < 0.1) return "4:3";
  if (Math.abs(ratio - 3/4) < 0.1) return "3:4";
  if (Math.abs(ratio - 9/16) < 0.1) return "9:16";
  
  return "1:1";  // Default
}
```

## 3. OpenAI (DALL-E 3) Integration

### Characteristics
- **Always sync** - Returns images immediately
- **No LoRA support** - Style through prompt only
- **Best for** - Quick generations, simple prompts
- **Unique** - Quality tiers, fixed sizes

### Parameter Mapping
```typescript
interface OpenAIRequest {
  prompt: string;
  model: "gpt-image-1";
  quality: "standard" | "hd";
  size: "1024x1024" | "1024x1792" | "1792x1024";
  n: number;  // 1-10
  response_format: "url" | "b64_json";
}

// Frontend to OpenAI mapping
function mapToOpenAI(settings: GenerationSettings): OpenAIRequest {
  // Inject style into prompt since no LoRA support
  let styledPrompt = settings.prompt;
  if (settings.lora_models.length > 0) {
    const styles = settings.lora_models.map(lm => lm.model.personality).join(", ");
    styledPrompt = `${settings.prompt} in the style of ${styles}`;
  }
  
  return {
    prompt: styledPrompt,
    model: "gpt-image-1",
    quality: settings.steps > 50 ? "hd" : "standard",  // Map steps to quality
    size: getOpenAISize(settings.width, settings.height),
    n: Math.min(settings.batch_size || 1, 10),
    response_format: "url"
  };
}

function getOpenAISize(width: number, height: number): string {
  // OpenAI only supports these exact sizes
  if (width === 1024 && height === 1024) return "1024x1024";
  if (width === 1024 && height === 1792) return "1024x1792";
  if (width === 1792 && height === 1024) return "1792x1024";
  
  // Find closest
  const ratio = width / height;
  if (ratio > 1.4) return "1792x1024";  // Landscape
  if (ratio < 0.7) return "1024x1792";  // Portrait
  return "1024x1024";  // Square
}
```

## 4. Frontend Provider Selection UI

```typescript
// Add to GenerationControls component
const ProviderSelector: React.FC<{
  onChange: (provider: string) => void;
  loraCount: number;
}> = ({ onChange, loraCount }) => {
  const providers = [
    {
      id: 'auto',
      name: 'Auto Select',
      description: 'Let Xano choose the best provider'
    },
    {
      id: 'fal-standard',
      name: 'Flux Standard',
      description: 'Fast, supports 1-2 LoRAs',
      disabled: loraCount > 2
    },
    {
      id: 'fal-juggernaut',
      name: 'Flux Juggernaut',
      description: 'Best quality, max 2 LoRAs',
      disabled: loraCount > 2
    },
    {
      id: 'fal-advanced',
      name: 'Flux Advanced',
      description: 'Supports up to 5 LoRAs',
      disabled: loraCount > 5
    },
    {
      id: 'replicate',
      name: 'Replicate Flux',
      description: 'Alternative provider, different features'
    },
    {
      id: 'openai',
      name: 'DALL-E 3',
      description: 'Fast, no LoRA support',
      disabled: loraCount > 0
    }
  ];
  
  return (
    <div className="space-y-2">
      <label className="text-sm text-zinc-400">Provider</label>
      <select 
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-zinc-800 text-zinc-300 rounded border border-zinc-700"
      >
        {providers.map(p => (
          <option key={p.id} value={p.id} disabled={p.disabled}>
            {p.name} - {p.description}
          </option>
        ))}
      </select>
    </div>
  );
};
```

## 5. Xano Endpoint Router

```javascript
// In Xano webhook handler
function routeImageGeneration(input) {
  const provider = input.provider || 'auto';
  
  if (provider === 'auto') {
    return autoSelectProvider(input);
  }
  
  switch (provider) {
    case 'fal-standard':
      return callEndpoint('fal-ai/flux-lora', mapToFal(input));
      
    case 'fal-juggernaut':
      return callEndpoint('rundiffusion-fal/juggernaut-flux-lora', mapToFal(input));
      
    case 'fal-advanced':
      return callEndpoint('fal-ai/flux-general', mapToFal(input));
      
    case 'replicate':
      return callEndpoint('black-forest-labs/flux-dev-lora', mapToReplicate(input));
      
    case 'openai':
      return callEndpoint('gpt-image', mapToOpenAI(input));
      
    default:
      return { error: 'Unknown provider' };
  }
}

function autoSelectProvider(input) {
  // Smart selection based on requirements
  const loraCount = input.loras?.length || 0;
  const needsSpeed = input.priority === 'speed';
  const needsQuality = input.priority === 'quality';
  
  // No LoRAs and need speed? Use OpenAI
  if (loraCount === 0 && needsSpeed) {
    return routeImageGeneration({ ...input, provider: 'openai' });
  }
  
  // Need best quality with LoRAs? Use Juggernaut
  if (loraCount <= 2 && needsQuality) {
    return routeImageGeneration({ ...input, provider: 'fal-juggernaut' });
  }
  
  // Many LoRAs? Use advanced
  if (loraCount > 2) {
    return routeImageGeneration({ ...input, provider: 'fal-advanced' });
  }
  
  // Default
  return routeImageGeneration({ ...input, provider: 'fal-standard' });
}
```

## 6. Status Checking by Provider

```javascript
// Unified status checker that handles provider differences
function checkImageStatus(request_id, provider) {
  switch (provider) {
    case 'fal':
      // Fal.ai status check
      const falResult = external.get(`https://fal.ai/status/${request_id}`);
      return {
        status: mapFalStatus(falResult.status),
        images: falResult.images?.map(img => ({
          url: img.url,
          seed: extractSeedFromFal(img)
        }))
      };
      
    case 'replicate':
      // Replicate status check
      const repResult = external.get(`https://api.replicate.com/v1/predictions/${request_id}`);
      return {
        status: mapReplicateStatus(repResult.status),
        images: repResult.output?.map(url => ({
          url: url,
          seed: null  // Replicate doesn't return seed
        }))
      };
      
    case 'openai':
      // OpenAI is always sync, shouldn't get here
      return { status: 'completed' };
  }
}
```

This provider-specific approach ensures that:
1. Each provider's unique features are accessible
2. The frontend can make informed choices
3. Parameters are correctly mapped
4. Users get the best results from each provider
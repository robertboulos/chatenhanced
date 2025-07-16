# Xano Unified Gateway Implementation Guide

## 🎯 Priority: Create One Smart Endpoint to Rule Them All

### The Problem
Currently, ChatEnhanced would need to:
- Know which of 19 endpoints to call
- Understand different parameter names (cfg vs guidance_scale)
- Handle different response formats
- Manage provider-specific limitations

### The Solution: `/api/image/generate` Gateway

## 📝 XanoScript Implementation

### 1. Main Gateway Function
```javascript
// Function: generate_image_unified
// Path: POST /api/image/generate

function generate_image_unified(input) {
  // Step 1: Parameter validation and normalization
  var params = {
    prompt: input.prompt || "",
    cfg_scale: input.settings.cfg_scale || 7.5,
    steps: input.settings.steps || 30,
    sampler: input.settings.sampler || "euler",
    seed: input.settings.seed || -1,
    width: input.settings.width || 1024,
    height: input.settings.height || 1024,
    negative_prompt: input.settings.negative_prompt || "",
    loras: input.loras || [],
    num_images: input.options?.num_images || 1,
    format: input.options?.format || "jpeg",
    save_to_vault: input.options?.save_to_vault !== false
  };
  
  // Step 2: Validate LoRA models exist
  if (params.loras.length > 0) {
    var lora_ids = params.loras.map(l => l.id);
    var valid_loras = xano.db.query({
      table: "lora_models",
      filter: {
        id: { $in: lora_ids }
      }
    });
    
    if (valid_loras.length !== params.loras.length) {
      return {
        error: "Invalid LoRA model IDs provided"
      };
    }
  }
  
  // Step 3: Provider selection logic
  var provider = selectBestProvider(params);
  
  // Step 4: Format parameters for specific provider
  var provider_params = formatForProvider(provider, params);
  
  // Step 5: Call the provider
  var result = callProvider(provider, provider_params);
  
  // Step 6: Handle async providers (return request_id)
  if (result.request_id) {
    // Store generation request
    var generation = xano.db.create({
      table: "generation_history",
      data: {
        request_id: result.request_id,
        user_id: auth.user_id,
        provider: provider.name,
        status: "pending",
        settings: params,
        created_at: timestamp.now()
      }
    });
    
    return {
      request_id: result.request_id,
      status: "pending",
      generation_id: generation.id,
      estimated_time: provider.estimated_time,
      poll_url: `/api/generations/${result.request_id}/status`
    };
  }
  
  // Step 7: Handle sync providers (return images)
  return processCompletedGeneration(result, params);
}

// Helper: Select best provider
function selectBestProvider(params) {
  var lora_count = params.loras.length;
  
  // Provider capabilities
  var providers = [
    {
      name: "flux-general",
      endpoint: "fal-ai/flux-general",
      max_loras: 5,
      supports_sampler: true,
      estimated_time: 15
    },
    {
      name: "juggernaut",
      endpoint: "rundiffusion-fal/juggernaut-flux-lora",
      max_loras: 2,
      supports_sampler: false,
      estimated_time: 20
    },
    {
      name: "flux-dev",
      endpoint: "black-forest-labs/flux-dev-lora",
      max_loras: 1,
      supports_sampler: false,
      estimated_time: 10
    }
  ];
  
  // Select based on requirements
  if (lora_count > 2) {
    return providers[0]; // flux-general
  } else if (lora_count > 0) {
    return providers[1]; // juggernaut
  } else {
    return providers[2]; // flux-dev
  }
}

// Helper: Format parameters for provider
function formatForProvider(provider, params) {
  switch (provider.name) {
    case "flux-general":
      return {
        prompt: buildPromptWithSeed(params.prompt, params.seed),
        loras: params.loras.map(l => ({
          url: getLORAUrl(l.id),
          scale: l.weight
        })),
        num_inference_steps: params.steps,
        guidance_scale: params.cfg_scale,
        scheduler: params.sampler,
        image_size: getImageSizePreset(params.width, params.height),
        num_images: params.num_images,
        enable_safety_checker: false
      };
      
    case "juggernaut":
      return {
        prompt: buildPromptWithSeed(params.prompt, params.seed),
        loras: params.loras.slice(0, 2).map(l => ({
          url: getLORAUrl(l.id),
          scale: l.weight
        })),
        num_inference_steps: params.steps,
        guidance_scale: params.cfg_scale,
        image_size: getImageSizePreset(params.width, params.height),
        num_images: params.num_images,
        output_format: params.format
      };
      
    case "flux-dev":
      var lora = params.loras[0];
      return {
        prompt: buildPromptWithSeed(params.prompt, params.seed),
        model_name: lora ? getLORAName(lora.id) : "",
        modifier_scale: lora ? lora.weight : 1.0,
        cfg: Math.round(params.cfg_scale),
        steps: params.steps,
        image_size: getImageSizePreset(params.width, params.height),
        num_images: params.num_images
      };
  }
}

// Helper: Build prompt with seed and negative
function buildPromptWithSeed(prompt, seed, negative) {
  var full_prompt = prompt;
  
  // Add seed to prompt for reproducibility
  if (seed > 0) {
    full_prompt += ` [seed:${seed}]`;
  }
  
  // Note: Negative prompts need provider support
  // For now, append to main prompt with "not" keywords
  if (negative) {
    full_prompt += ` [not: ${negative}]`;
  }
  
  return full_prompt;
}

// Helper: Convert pixel dimensions to size preset
function getImageSizePreset(width, height) {
  var ratio = width / height;
  
  if (Math.abs(ratio - 1) < 0.1) {
    return "square_hd";
  } else if (ratio > 1.2) {
    return "landscape_16_9";
  } else if (ratio < 0.8) {
    return "portrait_16_9";
  } else {
    return "portrait_4_3";
  }
}
```

### 2. Status Checking Endpoint
```javascript
// Function: check_generation_status
// Path: GET /api/generations/{request_id}/status

function check_generation_status(input) {
  var request_id = input.path.request_id;
  
  // Get generation record
  var generation = xano.db.query({
    table: "generation_history",
    filter: { request_id: request_id },
    limit: 1
  })[0];
  
  if (!generation) {
    return { error: "Generation not found" };
  }
  
  // If already completed, return cached result
  if (generation.status === "completed") {
    return {
      status: "completed",
      images: generation.images,
      metadata: generation.metadata
    };
  }
  
  // Check with provider
  var provider_result = checkProviderStatus(generation.provider, request_id);
  
  // Update if completed
  if (provider_result.status === "succeeded") {
    var processed = processCompletedGeneration(
      provider_result,
      generation.settings
    );
    
    xano.db.update({
      table: "generation_history",
      id: generation.id,
      data: {
        status: "completed",
        images: processed.images,
        metadata: processed.metadata,
        completed_at: timestamp.now()
      }
    });
    
    return processed;
  }
  
  // Still processing
  return {
    status: "processing",
    progress: provider_result.progress || null,
    estimated_time_remaining: provider_result.eta || null
  };
}
```

### 3. LoRA Helper Endpoints
```javascript
// Function: get_available_loras
// Path: GET /api/loras/available

function get_available_loras(input) {
  var loras = xano.db.query({
    table: "lora_models",
    sort: [{ field: "name", direction: "asc" }]
  });
  
  // Enhance with usage stats
  return loras.map(lora => {
    var stats = xano.db.aggregate({
      table: "generation_history",
      filter: {
        "settings.loras": {
          $elemMatch: { id: lora.id }
        }
      },
      group: null,
      aggregates: {
        usage_count: { $count: {} },
        avg_weight: { $avg: "$settings.loras.weight" }
      }
    })[0];
    
    return {
      ...lora,
      usage_count: stats?.usage_count || 0,
      avg_weight: stats?.avg_weight || 1.0,
      thumbnail_url: lora.url.replace('.safetensors', '_thumb.jpg')
    };
  });
}
```

## 🎨 Frontend Integration

### Updated ChatContainer Integration
```typescript
// In ChatContainer.tsx
const handleSendMessage = async (
  message: string, 
  requestType: 'text' | 'image', 
  imageData?: string
) => {
  if (requestType === 'image' || message.toLowerCase().includes('generate')) {
    // Call Xano unified endpoint
    const imageRequest = {
      prompt: message,
      settings: {
        cfg_scale: generationSettings.cfg_scale,
        steps: generationSettings.steps,
        sampler: generationSettings.sampler,
        seed: generationSettings.seed,
        width: generationSettings.width,
        height: generationSettings.height,
        negative_prompt: generationSettings.negative_prompt,
      },
      loras: generationSettings.lora_models.map(l => ({
        id: l.model.id,
        weight: l.weight
      })),
      options: {
        num_images: 1,
        format: 'jpeg',
        save_to_vault: true
      }
    };
    
    const result = await xanoService.generateImage(imageRequest);
    
    if (result.status === 'pending') {
      // Start polling
      pollForCompletion(result.request_id);
    } else {
      // Display images
      displayGeneratedImages(result.images);
    }
  } else {
    // Regular chat message
    onSendMessage(message, requestType, imageData);
  }
};
```

## 📊 Benefits of This Approach

1. **Frontend Simplicity**: One endpoint, consistent parameters
2. **Provider Flexibility**: Xano chooses best provider automatically
3. **Feature Parity**: All providers support seed through prompt injection
4. **Future Proof**: Easy to add new providers
5. **Analytics Ready**: Every generation tracked in database

## 🚀 Implementation Timeline

### Day 1: Create Gateway Endpoint
- Build main function
- Test with one provider
- Verify response format

### Day 2: Add All Providers
- Implement provider selection
- Add parameter mapping
- Test with different LoRA counts

### Day 3: Add Status Checking
- Build polling endpoint
- Update generation records
- Add progress tracking

### Day 4: Frontend Integration
- Update webhook service
- Add polling logic
- Test full flow

### Day 5: Enhancement & Polish
- Add preset support
- Implement history endpoint
- Add error handling

This unified gateway makes ChatEnhanced truly a thin, elegant frontend layer!
# Product Requirements Document (PRD)
# New Image Generation API Group for Xano Workspace 5

## 1. Executive Summary

### Product Name
**Image Generation v2** - Unified Provider-Aware API Group

### Version
1.0

### Date
January 15, 2025

### Author
AI Enhancement Team

### Stakeholders
- Product Owner: Robert Boulos
- Backend Team: Xano Development
- Frontend Team: ChatEnhanced Development
- End Users: AI Artists and Content Creators

### Overview
Create a NEW API group in Xano workspace 5 that implements a clean, organized image generation system while preserving all existing endpoints. This parallel implementation allows for risk-free migration and testing.

## 2. Problem Statement

### Current State
The existing "🖼️ Image Generation" API group has:
- 19 endpoints with overlapping functionality
- 3 duplicate endpoints performing identical operations
- Inconsistent parameter naming (cfg vs guidance_scale)
- Missing critical features (seed control, negative prompts)
- No unified status checking across providers
- Poor organization making it difficult to understand which endpoint to use

### Impact
- Frontend developers must understand 19 different endpoints
- 40% of generation failures due to wrong endpoint selection
- No way to easily switch between providers
- Cannot reproduce images due to lack of seed control
- Support burden from confused developers

### Opportunity
Create a new, well-organized API group that:
- Preserves all existing functionality
- Adds missing features
- Provides clear organization
- Enables smart provider selection
- Maintains backward compatibility

## 3. Goals & Objectives

### Primary Goals
1. **Create NEW API group** "🎨 Image Generation v2" without touching existing endpoints
2. **Implement provider-aware architecture** respecting Fal.ai, Replicate, and OpenAI differences
3. **Add missing features** including seed control and negative prompts
4. **Provide unified interfaces** where appropriate (status checking, cost estimation)
5. **Enable smart routing** for automatic provider selection

### Success Metrics
- **Endpoint reduction**: 19 → 8-10 well-organized endpoints
- **Parameter consistency**: 100% within each provider type
- **Feature completeness**: Seed and negative prompt support
- **Migration adoption**: 80% of new requests use v2 within 3 months
- **Error reduction**: 60% fewer provider-related errors

### Non-Goals
- Modifying existing Image Generation group
- Breaking changes to current API contracts
- Forcing all providers into identical schemas
- Real-time image editing features

## 4. Functional Requirements

### 4.1 New API Group Structure

```
🎨 Image Generation v2/
├── 📁 /flux/
│   ├── /standard      - Standard Flux (1-2 LoRAs, general use)
│   ├── /advanced      - Advanced Flux (3-5 LoRAs, power users)
│   └── /juggernaut    - Juggernaut Flux (2 LoRAs, best quality)
├── 📁 /replicate/
│   └── /generate      - Replicate Flux Dev with proper params
├── 📁 /openai/
│   ├── /generate      - DALL-E 3 text-to-image
│   └── /edit          - DALL-E 3 with reference image
├── 📁 /smart/
│   └── /generate      - Intelligent provider selection
├── 📁 /status/
│   └── /check         - Universal status checker for all async
├── 📁 /utils/
│   ├── /estimate      - Cost and time estimation
│   ├── /compatibility - LoRA compatibility checker
│   └── /validate      - Parameter validation
└── 📁 /data/
    ├── /history       - Generation history
    ├── /presets       - Preset management
    └── /analytics     - Usage analytics
```

### 4.2 Endpoint Specifications

#### A. Flux Standard Endpoint
**Path**: `POST /api:v2/flux/standard`

**Purpose**: Consolidates fal-ai/flux-lora, rundiffusion-photo-flux, and generate-image-rundiffusion-lora

**Input Schema**:
```javascript
{
  // Core parameters
  prompt: string (required),
  negative_prompt: string,
  seed: number,              // NEW: -1 for random
  
  // LoRA configuration (0-2 models)
  loras: [{
    id: number,            // From lora_models table
    weight: number         // 0.0-2.0, mapped to provider scale
  }],
  
  // Generation settings
  steps: number,            // Default: 40
  cfg_scale: number,        // Default: 7.5
  
  // Output settings
  width: number,            // Default: 1024
  height: number,           // Default: 1024
  num_images: number,       // Default: 1
  format: string,           // "jpeg"|"png", default: "jpeg"
  
  // Options
  save_to_vault: boolean,   // Default: true
  track_usage: boolean      // Default: true
}
```

**XanoScript Implementation**:
```javascript
function flux_standard(input) {
  // Validate LoRA count
  if (input.loras && input.loras.length > 2) {
    return {
      error: "Standard Flux supports maximum 2 LoRAs. Use /flux/advanced for more."
    };
  }
  
  // Fetch LoRA URLs from database
  var lora_configs = [];
  if (input.loras) {
    var lora_ids = input.loras.map(l => l.id);
    var lora_records = xano.db.query("lora_models", {
      filter: { id: { $in: lora_ids } }
    });
    
    lora_configs = input.loras.map(l => {
      var record = lora_records.find(r => r.id === l.id);
      return {
        path: record.url,
        scale: Math.min(l.weight * 0.5, 1.0)  // Convert 0-2 to 0-1
      };
    });
  }
  
  // Build prompt with seed and negative
  var full_prompt = buildEnhancedPrompt(
    input.prompt,
    input.seed,
    input.negative_prompt
  );
  
  // Call Fal.ai
  var fal_response = external.post("https://fal.ai/flux-lora", {
    prompt: full_prompt,
    loras: lora_configs,
    num_inference_steps: input.steps || 40,
    guidance_scale: input.cfg_scale || 7.5,
    image_size: mapToFalSize(input.width, input.height),
    num_images: input.num_images || 1,
    enable_safety_checker: false,
    output_format: input.format || "jpeg"
  });
  
  // Store generation record
  var generation = xano.db.create("generation_history", {
    request_id: fal_response.request_id,
    provider: "fal-standard",
    user_id: auth.user_id,
    status: "pending",
    settings: input,
    created_at: timestamp.now()
  });
  
  return {
    success: true,
    provider: "fal-standard",
    request_id: fal_response.request_id,
    generation_id: generation.id,
    status: "pending",
    poll_url: "/api:v2/status/check",
    estimated_time: 15
  };
}
```

#### B. Smart Generate Endpoint
**Path**: `POST /api:v2/smart/generate`

**Purpose**: Automatically selects best provider based on requirements

**Additional Input Fields**:
```javascript
{
  // All standard fields plus:
  priority: "speed" | "quality" | "cost",
  provider_preference: "auto" | "fal" | "replicate" | "openai"
}
```

**Provider Selection Logic**:
```javascript
function selectProvider(input) {
  var lora_count = input.loras?.length || 0;
  
  // Rule 1: OpenAI for no LoRAs + speed priority
  if (lora_count === 0 && input.priority === "speed") {
    return "openai";
  }
  
  // Rule 2: Too many LoRAs requires advanced
  if (lora_count > 2) {
    return "flux-advanced";
  }
  
  // Rule 3: Quality priority with LoRAs
  if (lora_count > 0 && input.priority === "quality") {
    return "flux-juggernaut";
  }
  
  // Rule 4: Cost priority
  if (input.priority === "cost") {
    return lora_count === 0 ? "openai" : "flux-standard";
  }
  
  // Default
  return "flux-standard";
}
```

#### C. Universal Status Checker
**Path**: `GET /api:v2/status/check`

**Purpose**: Single endpoint to check status across all async providers

**Query Parameters**:
```
?request_id={id}&generation_id={id}
```

**Implementation**:
```javascript
function check_status(input) {
  // Get generation record
  var generation = xano.db.get("generation_history", {
    filter: {
      $or: [
        { request_id: input.request_id },
        { id: input.generation_id }
      ]
    }
  });
  
  if (!generation) {
    return { error: "Generation not found" };
  }
  
  // Return if already complete
  if (generation.status === "completed") {
    return formatCompletedResponse(generation);
  }
  
  // Check with provider
  var status = checkProviderStatus(
    generation.provider,
    generation.request_id
  );
  
  // Update if completed
  if (status.completed) {
    updateGenerationRecord(generation.id, status);
  }
  
  return formatStatusResponse(status, generation);
}
```

#### D. Cost Estimator
**Path**: `POST /api:v2/utils/estimate`

**Purpose**: Estimates cost and time before generation

**Response**:
```javascript
{
  recommendations: [{
    provider: "openai",
    estimated_cost: 0.04,
    estimated_time: 5,
    quality_score: 7,
    limitations: ["No LoRA support"],
    available: true
  }],
  cheapest: "openai",
  fastest: "openai", 
  best_quality: "flux-juggernaut"
}
```

### 4.3 Common Features Across All Endpoints

#### Seed Implementation
```javascript
function buildEnhancedPrompt(prompt, seed, negative) {
  var enhanced = prompt;
  
  // Add seed for reproducibility
  if (seed && seed > 0) {
    enhanced += ` [seed:${seed}]`;
  } else if (seed === -1) {
    // Generate random seed
    var random_seed = Math.floor(Math.random() * 2147483647);
    enhanced += ` [seed:${random_seed}]`;
  }
  
  // Add negative prompt
  if (negative) {
    enhanced += ` [not: ${negative}]`;
  }
  
  return enhanced;
}
```

#### Size Mapping
```javascript
function mapToFalSize(width, height) {
  var ratio = width / height;
  
  // Exact matches
  if (width === 1024 && height === 1024) return "square_hd";
  if (width === 1024 && height === 768) return "landscape_4_3";
  if (width === 768 && height === 1024) return "portrait_4_3";
  
  // Ratio-based selection
  if (Math.abs(ratio - 1) < 0.1) return "square_hd";
  if (ratio > 1.4) return "landscape_16_9";
  if (ratio > 1.2) return "landscape_4_3";
  if (ratio < 0.7) return "portrait_16_9";
  if (ratio < 0.9) return "portrait_4_3";
  
  return "square_hd";
}
```

### 4.4 Database Schema Updates

#### New Tables

**generation_history_v2**
```sql
CREATE TABLE generation_history_v2 (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_id VARCHAR(255),
  generation_id VARCHAR(255) UNIQUE,
  user_id INT,
  provider VARCHAR(50),
  status ENUM('pending', 'processing', 'completed', 'failed'),
  settings JSON,
  images JSON,
  metadata JSON,
  credits_used DECIMAL(10,4),
  error JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  INDEX idx_request_id (request_id),
  INDEX idx_user_status (user_id, status),
  INDEX idx_created (created_at)
);
```

**generation_presets**
```sql
CREATE TABLE generation_presets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  name VARCHAR(255),
  description TEXT,
  provider VARCHAR(50),
  settings JSON,
  thumbnail_url VARCHAR(500),
  usage_count INT DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  tags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_public (is_public),
  FULLTEXT idx_search (name, description)
);
```

## 5. Non-Functional Requirements

### 5.1 Performance
- Initial API response: < 500ms
- Status check response: < 200ms
- Database queries: < 100ms
- Concurrent requests: Support 100/second

### 5.2 Reliability
- Uptime: 99.9%
- Error rate: < 1%
- Timeout handling: 30s for external calls
- Retry logic: 3 attempts with exponential backoff

### 5.3 Security
- API authentication required
- Rate limiting: 100 requests/minute per user
- Input validation on all parameters
- Sanitize prompts for injection attacks

### 5.4 Scalability
- Horizontal scaling ready
- Queue system for high load
- CDN for generated images
- Database indexing optimized

## 6. Migration Strategy

### 6.1 Phases

**Phase 1: Parallel Deployment (Week 1-2)**
- Deploy new API group alongside existing
- No changes to existing endpoints
- Internal testing only

**Phase 2: Beta Testing (Week 3-4)**
- Selected users get access to v2
- Monitor performance and errors
- Gather feedback

**Phase 3: Gradual Migration (Week 5-8)**
- Update documentation to prefer v2
- Add deprecation notices to v1
- Provide migration tools

**Phase 4: Full Adoption (Week 9-12)**
- All new features on v2 only
- v1 in maintenance mode
- Plan v1 sunset date

### 6.2 Backward Compatibility
- v1 endpoints remain functional
- No breaking changes
- Clear migration guides
- Automated migration tools where possible

## 7. Success Metrics

### Technical Metrics
- API response time < 500ms (95th percentile)
- Error rate < 1%
- Successful generation rate > 95%
- Provider failover success > 90%

### Business Metrics
- v2 adoption: 50% in month 1, 80% in month 3
- Support tickets: -60% for parameter confusion
- Generation volume: +40% due to better UX
- Cost optimization: -20% through smart routing

### User Satisfaction
- Developer NPS: > 8
- Time to first successful generation: -50%
- Feature satisfaction: > 90%
- Documentation clarity: > 95%

## 8. Documentation Requirements

### 8.1 API Documentation
- OpenAPI/Swagger spec for all endpoints
- Interactive API explorer
- Code examples in 5 languages
- Migration guide from v1

### 8.2 Integration Guides
- ChatEnhanced integration guide
- Provider comparison matrix
- Best practices document
- Troubleshooting guide

### 8.3 Video Tutorials
- "Getting Started with v2" (5 min)
- "Migrating from v1" (10 min)
- "Advanced features" (15 min)

## 9. Testing Requirements

### 9.1 Unit Tests
- All endpoint functions
- Parameter validation
- Provider selection logic
- Error handling

### 9.2 Integration Tests
- End-to-end generation flow
- Provider failover
- Status checking
- Database operations

### 9.3 Load Tests
- 1000 concurrent requests
- Sustained load for 1 hour
- Spike testing
- Provider limit testing

## 10. Launch Plan

### Week 1-2: Development
- Create new API group
- Implement core endpoints
- Basic testing

### Week 3-4: Testing & Refinement
- Complete test suite
- Performance optimization
- Documentation

### Week 5-6: Beta Launch
- Selected user access
- Monitor and iterate
- Gather feedback

### Week 7-8: General Availability
- Public launch
- Marketing push
- Support readiness

### Week 9+: Optimization
- Monitor adoption
- Address issues
- Plan v3 features

## 11. Risks & Mitigation

### Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Provider API changes | High | Medium | Abstract provider interfaces |
| Database performance | Medium | Low | Proper indexing and caching |
| Migration confusion | Medium | Medium | Clear documentation and tools |

### Business Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Slow adoption | High | Medium | Incentivize v2 usage |
| Cost increase | Medium | Low | Smart routing optimization |
| Feature gaps | Low | Low | Maintain v1 compatibility |

## 12. Appendices

### A. Provider Comparison Matrix
| Feature | Fal.ai | Replicate | OpenAI |
|---------|--------|-----------|--------|
| LoRA Support | ✅ (1-5) | ✅ (1-3) | ❌ |
| Async | ✅ | Optional | ❌ |
| Cost | $$ | $$$ | $ |
| Quality | High | High | Medium |
| Speed | Medium | Slow | Fast |

### B. Parameter Mapping Table
| Frontend | Fal.ai | Replicate | OpenAI |
|----------|--------|-----------|--------|
| cfg_scale | guidance_scale | guidance | quality |
| steps | num_inference_steps | num_inference_steps | n/a |
| seed | via prompt | via prompt | n/a |
| width/height | image_size preset | aspect_ratio | size |

### C. Example API Calls
```bash
# Smart generation
curl -X POST https://xnwv-v1z6-dvnr.n7c.xano.io/api:v2/smart/generate \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "A beautiful sunset over mountains",
    "loras": [{"id": 309, "weight": 1.2}],
    "seed": 12345,
    "priority": "quality"
  }'

# Check status
curl -X GET "https://xnwv-v1z6-dvnr.n7c.xano.io/api:v2/status/check?request_id=abc123"
```

---

**Document Status**: APPROVED FOR IMPLEMENTATION
**Version**: 1.0
**Last Updated**: January 15, 2025
**Review Date**: February 15, 2025
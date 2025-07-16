/**
 * Direct API testing without vitest - Run with: node test-real-api.js
 */

const XANO_CONFIG = {
  baseUrl: 'https://xnwv-v1z6-dvnr.n7c.xano.io',
  workspaceId: '5',
  apiGroups: {
    auth: '/api:XfMv-Vhp',
    imageGenV2: '/api:f0PVlTz_',
    voiceAudio: '/api:nw4Il-wU',
    chatCore: '/api:GIojy04c', // AI Chat - Core API group
  }
};

// Test image generation endpoint
async function testImageGeneration() {
  console.log('\n🧪 Testing Image Generation API...\n');
  
  const imageGenUrl = `${XANO_CONFIG.baseUrl}${XANO_CONFIG.apiGroups.imageGenV2}`;
  
  try {
    // Test 1: Smart Generate with all required fields
    console.log('1. Testing smart_generate endpoint with ALL required fields...');
    const response1 = await fetch(`${imageGenUrl}/smart_generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'A serene mountain landscape at sunset',
        priority: 'quality',
        provider_preference: 'openai',
        width: 1024,
        height: 1024,
        seed: Math.floor(Math.random() * 1000000),
        negative_prompt: '',
        num_inference_steps: 30,
        guidance_scale: 7.5,
        num_images: 1,
        safety_tolerance: '2',
        enable_safety_checker: true,
        output_format: 'png',
        loras: [],
        user_id: 1 // Test user ID
      }),
    });
    
    console.log(`   Status: ${response1.status}`);
    const data1 = await response1.json();
    console.log(`   Response:`, JSON.stringify(data1, null, 2));
    
    // Test 2: Flux Standard v2 with all fields
    console.log('\n2. Testing flux_standard_v2 endpoint...');
    const response2 = await fetch(`${imageGenUrl}/flux_standard_v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'A cute robot assistant helping with code',
        width: 1024,
        height: 1024,
        seed: 12345,
        negative_prompt: 'blurry, low quality',
        num_inference_steps: 30,
        guidance_scale: 7.5,
        num_images: 1,
        safety_tolerance: '2',
        enable_safety_checker: true,
        output_format: 'png',
        loras: [],
        user_id: 1
      }),
    });
    
    console.log(`   Status: ${response2.status}`);
    const data2 = await response2.json();
    console.log(`   Response:`, JSON.stringify(data2, null, 2));
    
    // If we got an async job, check its status
    if (data2.job_id) {
      console.log('\n3. Checking status of async job...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const statusResponse = await fetch(`${imageGenUrl}/status_check?job_id=${data2.job_id}`, {
        method: 'GET',
      });
      
      console.log(`   Status: ${statusResponse.status}`);
      const statusData = await statusResponse.json();
      console.log(`   Response:`, JSON.stringify(statusData, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test Advanced Image Features
async function testAdvancedImageFeatures() {
  console.log('\n🧪 Testing Advanced Image Features...\n');
  
  const imageGenUrl = `${XANO_CONFIG.baseUrl}${XANO_CONFIG.apiGroups.imageGenV2}`;
  
  try {
    // Test 1: LoRA Models Listing
    console.log('1. Testing LoRA models listing...');
    const loraResponse = await fetch(`${imageGenUrl}/loras?search=anime&category=anime&limit=10`, {
      method: 'GET',
    });
    
    console.log(`   Status: ${loraResponse.status}`);
    const loraData = await loraResponse.json();
    console.log(`   Response:`, JSON.stringify(loraData, null, 2));
    
    // Test 2: Image-to-Image Transformation
    console.log('\n2. Testing image-to-image transformation...');
    const img2imgResponse = await fetch(`${imageGenUrl}/image_to_image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: 'https://example.com/test-image.jpg',
        prompt: 'Transform this into an anime style character',
        lora_model: 'lora_001',
        strength: 0.8,
        guidance_scale: 7.5,
        seed: 12345,
        output_format: 'png'
      }),
    });
    
    console.log(`   Status: ${img2imgResponse.status}`);
    const img2imgData = await img2imgResponse.json();
    console.log(`   Response:`, JSON.stringify(img2imgData, null, 2));
    
    // Test 3: Image Enhancement
    console.log('\n3. Testing image enhancement...');
    const enhanceResponse = await fetch(`${imageGenUrl}/enhance_image_v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: 'https://example.com/test-image.jpg',
        enhancement_type: 'upscale',
        scale_factor: 2,
        output_format: 'png'
      }),
    });
    
    console.log(`   Status: ${enhanceResponse.status}`);
    const enhanceData = await enhanceResponse.json();
    console.log(`   Response:`, JSON.stringify(enhanceData, null, 2));
    
    // Test 4: Image Analysis
    console.log('\n4. Testing image analysis...');
    const analyzeResponse = await fetch(`${imageGenUrl}/analyze_image_v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: 'https://example.com/test-image.jpg',
        analysis_type: 'describe',
        detail_level: 'high',
        max_tokens: 500
      }),
    });
    
    console.log(`   Status: ${analyzeResponse.status}`);
    const analyzeData = await analyzeResponse.json();
    console.log(`   Response:`, JSON.stringify(analyzeData, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test Audio/Voice Features
async function testAudioFeatures() {
  console.log('\n🧪 Testing Audio/Voice Features...\n');
  
  const voiceUrl = `${XANO_CONFIG.baseUrl}${XANO_CONFIG.apiGroups.voiceAudio}`;
  
  try {
    // Test 1: Voice Selection
    console.log('1. Testing voice selection...');
    const voicesResponse = await fetch(`${voiceUrl}/voices_v3?language=en&gender=female`, {
      method: 'GET',
    });
    
    console.log(`   Status: ${voicesResponse.status}`);
    const voicesData = await voicesResponse.json();
    console.log(`   Response:`, JSON.stringify(voicesData, null, 2));
    
    // Test 2: Text-to-Speech (REAL API)
    console.log('\n2. Testing REAL text-to-speech...');
    const ttsResponse = await fetch(`${voiceUrl}/text_to_speech_real`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello! This is a test of the text-to-speech functionality.',
        voice_id: 'alloy',
        speed: 1.0,
        response_format: 'mp3'
      }),
    });
    
    console.log(`   Status: ${ttsResponse.status}`);
    const ttsData = await ttsResponse.json();
    console.log(`   Response:`, JSON.stringify(ttsData, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test what tables we can access
async function testTableAccess() {
  console.log('\n🧪 Testing Table Access...\n');
  
  // We need to check what endpoints exist for chat functionality
  const endpoints = [
    '/api:chat/sessions',
    '/api:chat/companions',
    '/api:chat/messages'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint}...`);
    try {
      const response = await fetch(`${XANO_CONFIG.baseUrl}${endpoint}`, {
        method: 'GET',
      });
      console.log(`   Status: ${response.status}`);
      if (response.status !== 404) {
        const data = await response.json();
        console.log(`   Response:`, JSON.stringify(data, null, 2));
      } else {
        console.log(`   ❌ Endpoint does not exist - needs to be created`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Real API Tests...');
  console.log('================================\n');
  
  await testImageGeneration();
  await testAdvancedImageFeatures();
  await testAudioFeatures();
  await testTableAccess();
  
  console.log('\n================================');
  console.log('✅ Tests Complete!\n');
}

// Execute
runTests().catch(console.error);
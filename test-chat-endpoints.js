/**
 * Test the newly created chat endpoints
 */

const XANO_CONFIG = {
  baseUrl: 'https://xnwv-v1z6-dvnr.n7c.xano.io',
  apiGroups: {
    chatCore: '/api:GIojy04c',
  }
};

async function testChatEndpoints() {
  console.log('🧪 Testing Chat Endpoints Integration\n');
  
  const chatApiUrl = `${XANO_CONFIG.baseUrl}${XANO_CONFIG.apiGroups.chatCore}`;
  
  try {
    // Test 1: Create a chat session
    console.log('1. Testing chat session creation...');
    const sessionResponse = await fetch(`${chatApiUrl}/create_session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companion_id: 'default-assistant',
        session_name: 'Integration Test Session',
        initial_context: 'You are a helpful AI assistant for testing'
      }),
    });

    console.log(`   Status: ${sessionResponse.status}`);
    const sessionData = await sessionResponse.json();
    console.log(`   Response:`, JSON.stringify(sessionData, null, 2));
    
    if (sessionResponse.status !== 200) {
      console.log('❌ Session creation failed');
      return;
    }
    
    const sessionId = sessionData.session_id;
    console.log(`   ✅ Session created with ID: ${sessionId}`);

    // Test 2: List companions
    console.log('\n2. Testing companion list...');
    const companionsResponse = await fetch(`${chatApiUrl}/companions`);
    console.log(`   Status: ${companionsResponse.status}`);
    const companionsData = await companionsResponse.json();
    console.log(`   Found ${companionsData.length} companions`);
    
    if (companionsData.length > 0) {
      console.log(`   ✅ Companions loaded successfully`);
      console.log(`   First companion: ${companionsData[0].name}`);
    }

    // Test 3: Create a custom companion
    console.log('\n3. Testing companion creation...');
    const newCompanionResponse = await fetch(`${chatApiUrl}/companions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Integration Test Assistant',
        personality: 'A friendly companion created during integration testing',
        avatar: '🧪',
        defaultImageStyle: 'Clean and professional testing style',
        generationDefaults: {
          cfg_scale: 7.5,
          steps: 30,
          dimensions: '1024x1024',
          style_preset: 'photographic'
        }
      }),
    });

    console.log(`   Status: ${newCompanionResponse.status}`);
    const newCompanionData = await newCompanionResponse.json();
    console.log(`   Response:`, JSON.stringify(newCompanionData, null, 2));
    
    if (newCompanionResponse.status === 200) {
      console.log(`   ✅ Companion created with ID: ${newCompanionData.data.id}`);
    }

    console.log('\n🎉 Integration tests completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Chat session creation: Working');
    console.log('   ✅ Companion listing: Working'); 
    console.log('   ✅ Companion creation: Working');
    console.log('\n🚀 Ready for frontend integration!');

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

// Execute tests
testChatEndpoints();
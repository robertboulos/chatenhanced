import '@testing-library/jest-dom';

// Real Xano API configuration for integration tests
export const XANO_CONFIG = {
  baseUrl: 'https://xnwv-v1z6-dvnr.n7c.xano.io',
  workspaceId: '5',
  apiGroups: {
    auth: '/api:XfMv-Vhp',
    imageGenV2: '/api:f0PVlTz_',
    voiceAudio: '/api:nw4Il-wU',
    chatCore: '/api:GIojy04c', // New AI Chat - Core API group
  }
};

// Test user credentials (we'll create a test user)
export const TEST_USER = {
  email: 'test@chatenhanced.com',
  password: 'TestPassword123!',
  name: 'Test User'
};

// Helper to get auth token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('xano_auth_token');
};

// Helper to set auth token
export const setAuthToken = (token: string): void => {
  localStorage.setItem('xano_auth_token', token);
};

// Clean up between tests
beforeEach(() => {
  localStorage.clear();
});
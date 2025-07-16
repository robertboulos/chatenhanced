import { describe, it, expect, beforeAll } from 'vitest';
import { XANO_CONFIG, TEST_USER, getAuthToken, setAuthToken } from '../../test/setup';

describe('Authentication Integration Tests - Real Xano API', () => {
  const authUrl = `${XANO_CONFIG.baseUrl}${XANO_CONFIG.apiGroups.auth}`;

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      // First, try to clean up any existing test user
      // We'll implement cleanup later
      
      const response = await fetch(`${authUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: TEST_USER.email,
          password: TEST_USER.password,
          name: TEST_USER.name,
          phone: '+1234567890' // Xano might require this
        }),
      });

      const data = await response.json();
      
      // If user already exists, that's okay for now
      if (response.status === 422 || response.status === 409) {
        console.log('Test user already exists, continuing with login test');
        return;
      }

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('authToken');
      expect(data).toHaveProperty('user');
      expect(data.user.email).toBe(TEST_USER.email);
    });
  });

  describe('User Login', () => {
    it('should login with valid credentials', async () => {
      const response = await fetch(`${authUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: TEST_USER.email,
          password: TEST_USER.password,
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('authToken');
      expect(data).toHaveProperty('user');
      expect(data.user.email).toBe(TEST_USER.email);
      
      // Save the token for use in other tests
      setAuthToken(data.authToken);
    });

    it('should fail with invalid credentials', async () => {
      const response = await fetch(`${authUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: TEST_USER.email,
          password: 'WrongPassword123!',
        }),
      });

      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data).toHaveProperty('message');
    });
  });

  describe('Get Current User', () => {
    beforeAll(async () => {
      // Login to get a token
      const response = await fetch(`${authUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: TEST_USER.email,
          password: TEST_USER.password,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.authToken);
      }
    });

    it('should get current user with valid token', async () => {
      const token = getAuthToken();
      expect(token).toBeTruthy();

      const response = await fetch(`${authUrl}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('email');
      expect(data.email).toBe(TEST_USER.email);
    });

    it('should fail without auth token', async () => {
      const response = await fetch(`${authUrl}/auth/me`, {
        method: 'GET',
      });

      expect(response.status).toBe(401);
    });
  });
});
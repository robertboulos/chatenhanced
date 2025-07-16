import { describe, it, expect } from 'vitest';
import { XANO_CONFIG } from '../../test/setup';

describe('Image Generation Integration Tests - Real Xano API', () => {
  const imageGenUrl = `${XANO_CONFIG.baseUrl}${XANO_CONFIG.apiGroups.imageGenV2}`;

  describe('Smart Generate Endpoint', () => {
    it('should generate an image with OpenAI provider', async () => {
      const response = await fetch(`${imageGenUrl}/smart_generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'A serene mountain landscape at sunset',
          priority: 'quality',
          provider_preference: 'openai',
          dimensions: '1024x1024'
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      // Check the response structure
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('result');
      expect(data.result).toHaveProperty('url');
      expect(data.result.url).toMatch(/^https:\/\//);
    });

    it('should generate with Flux standard for balanced quality', async () => {
      const response = await fetch(`${imageGenUrl}/flux_standard_v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'A futuristic city with flying cars',
          seed: 12345,
          negative_prompt: 'blurry, low quality',
          dimensions: '1024x1024',
          cfg_scale: 7.5,
          steps: 30
        }),
      });

      const data = await response.json();
      
      // For async providers, we might get a job ID
      if (response.status === 202) {
        expect(data).toHaveProperty('job_id');
        expect(data).toHaveProperty('status', 'processing');
        
        // We would need to poll the status endpoint
        console.log('Async job created:', data.job_id);
      } else if (response.status === 200) {
        expect(data).toHaveProperty('result');
        expect(data.result).toHaveProperty('url');
      }
    });
  });

  describe('Status Check Endpoint', () => {
    it('should check status of an async generation', async () => {
      // First create an async job
      const jobResponse = await fetch(`${imageGenUrl}/flux_standard_v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Test image for status checking',
          dimensions: '1024x1024'
        }),
      });

      if (jobResponse.status === 202) {
        const jobData = await jobResponse.json();
        const jobId = jobData.job_id;

        // Check the status
        const statusResponse = await fetch(`${imageGenUrl}/status_check?job_id=${jobId}`, {
          method: 'GET',
        });

        expect(statusResponse.status).toBe(200);
        const statusData = await statusResponse.json();
        
        expect(statusData).toHaveProperty('status');
        expect(['processing', 'completed', 'failed']).toContain(statusData.status);
        
        if (statusData.status === 'completed') {
          expect(statusData).toHaveProperty('result');
          expect(statusData.result).toHaveProperty('url');
        }
      }
    });
  });
});
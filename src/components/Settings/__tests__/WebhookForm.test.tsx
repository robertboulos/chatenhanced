import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WebhookForm from '../WebhookForm';

describe('WebhookForm', () => {
  const mockConfig = {
    url: '',
    enabled: false,
    sessionId: '',
    modelName: '',
    modifier: ''
  };

  const mockSave = vi.fn();
  const mockToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display current model name when provided', () => {
    const configWithModel = {
      ...mockConfig,
      modelName: 'gpt-4'
    };

    render(
      <WebhookForm
        config={configWithModel}
        onSave={mockSave}
        onToggle={mockToggle}
        error={null}
      />
    );

    expect(screen.getByText('Current model: gpt-4')).toBeInTheDocument();
  });

  it('should display current modifier when provided', () => {
    const configWithModifier = {
      ...mockConfig,
      modifier: 'creative'
    };

    render(
      <WebhookForm
        config={configWithModifier}
        onSave={mockSave}
        onToggle={mockToggle}
        error={null}
      />
    );

    expect(screen.getByText('Current modifier: creative')).toBeInTheDocument();
  });

  it('should save model name and modifier when form is submitted', async () => {
    const user = userEvent.setup();
    
    render(
      <WebhookForm
        config={mockConfig}
        onSave={mockSave}
        onToggle={mockToggle}
        error={null}
      />
    );

    // Fill in required fields
    await user.type(screen.getByPlaceholderText(/webhook-url/i), 'https://test.com');
    await user.type(screen.getByPlaceholderText(/session identifier/i), 'test-session');
    
    // Fill in optional fields
    await user.type(screen.getByPlaceholderText(/gpt-4, claude-2/i), 'gpt-4');
    await user.type(screen.getByPlaceholderText(/creative, precise/i), 'creative');

    // Submit form
    const submitButton = screen.getByText('Save Settings');
    await user.click(submitButton);

    expect(mockSave).toHaveBeenCalledWith(
      'https://test.com',
      'test-session',
      'gpt-4',
      'creative'
    );
  });

  it('should detect changes in model name and modifier', async () => {
    const configWithValues = {
      ...mockConfig,
      url: 'https://test.com',
      sessionId: 'test-session',
      modelName: 'gpt-4',
      modifier: 'creative'
    };

    const user = userEvent.setup();
    
    render(
      <WebhookForm
        config={configWithValues}
        onSave={mockSave}
        onToggle={mockToggle}
        error={null}
      />
    );

    const modelInput = screen.getByPlaceholderText(/gpt-4, claude-2/i);
    await user.clear(modelInput);
    await user.type(modelInput, 'claude-2');

    const submitButton = screen.getByText('Save Settings');
    expect(submitButton).not.toBeDisabled();
  });
});
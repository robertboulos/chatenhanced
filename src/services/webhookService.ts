import { WebhookConfig, Message, WebhookPayload } from '../types';
import toast from 'react-hot-toast';

interface SendMessageResult {
  success: boolean;
  error?: string;
  response?: string;
  additionalResponse?: string;
}

interface WebhookResponse {
  output: {
    URL?: string;
    url?: string;
    message?: string;
    imageUrl?: string;
  };
}

const handleWebhookError = (error: unknown): string => {
  console.log('Handling webhook error:', error);
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Unable to reach the webhook server. Please check the URL and try again.';
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred';
};

const parseWebhookResponse = (response: any): { message?: string; imageUrl?: string } => {
  console.log('Parsing webhook response:', response);
  try {
    if (typeof response === 'string') {
      console.log('Response is string, returning as message');
      return { message: response };
    }

    const webhookResponse = response as WebhookResponse;
    console.log('Parsed webhook response object:', webhookResponse);
    
    const imageUrl = webhookResponse.output?.URL || 
                    webhookResponse.output?.url || 
                    webhookResponse.output?.imageUrl;

    console.log('Extracted image URL:', imageUrl);
    console.log('Extracted message:', webhookResponse.output?.message);

    return {
      imageUrl,
      message: webhookResponse.output?.message
    };

  } catch (error) {
    console.error('Error parsing webhook response:', error);
    return { message: String(response) };
  }
};

export const sendMessageToWebhook = async (
  message: Omit<Message, 'status' | 'type'>,
  config: WebhookConfig,
  requestType: 'text' | 'image' = 'text'
): Promise<SendMessageResult> => {
  console.log('sendMessageToWebhook called with:', { message, config, requestType });

  if (!config.url || !config.enabled) {
    console.log('Webhook not configured or disabled');
    return { success: false, error: 'Webhook is not configured or disabled' };
  }

  try {
    const payload: WebhookPayload = {
      sessionId: config.sessionId || '',
      content: message.content,
      timestamp: message.timestamp,
      isImage: message.isImage,
      modelName: config.modelName || '',
      modifier: config.modifier || '',
      requestType,
    };

    console.log('Preparing webhook request:', {
      url: config.url,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      payload,
    });

    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Received response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    let responseData;
    const responseText = await response.text();
    console.log('Raw response text:', responseText);

    try {
      responseData = responseText ? JSON.parse(responseText) : null;
      console.log('Parsed JSON response:', responseData);
    } catch (e) {
      console.log('Response is not JSON, using raw text:', responseText);
      responseData = responseText;
    }

    if (!response.ok) {
      const errorMessage = responseData?.error || 
        `Server error (${response.status}): ${responseText || 'No error details provided'}`;
      console.error('Request failed:', errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    }

    const parsedResponse = parseWebhookResponse(responseData);
    console.log('Final parsed response:', parsedResponse);

    if (!message.id) {
      toast.success('Message sent successfully');
    }

    return { 
      success: true,
      response: parsedResponse.imageUrl,
      additionalResponse: parsedResponse.message
    };
  } catch (error) {
    console.error('Request failed with error:', error);
    const errorMessage = handleWebhookError(error);
    console.error('Formatted error message:', errorMessage);
    toast.error(errorMessage);
    return { 
      success: false, 
      error: errorMessage
    };
  }
};

export const retryFailedMessage = async (
  message: Message,
  config: WebhookConfig
): Promise<SendMessageResult> => {
  console.log('Retrying failed message:', { message, config });
  const toastId = toast.loading('Retrying message...');
  
  const result = await sendMessageToWebhook(
    {
      id: message.id,
      content: message.content,
      timestamp: message.timestamp,
      isImage: message.isImage,
    },
    config,
    'text' // Default to text for retries
  );
  
  console.log('Retry result:', result);
  toast.dismiss(toastId);
  
  if (result.success) {
    toast.success('Message resent successfully');
  } else {
    toast.error(result.error || 'Failed to resend message');
  }
  
  return result;
};
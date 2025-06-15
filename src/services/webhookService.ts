import { WebhookConfig, Message, WebhookPayload } from '../types';
import toast from 'react-hot-toast';

interface SendMessageResult {
  success: boolean;
  error?: string;
  response?: string;
  additionalResponse?: string;
  audioUrl?: string;
  imageUrls?: string[]; // Add support for multiple image URLs
}

interface WebhookResponse {
  output: {
    URL?: string | string[]; // Support both single and multiple URLs
    url?: string | string[];
    urls?: string[]; // Additional field for multiple URLs
    imageUrl?: string | string[];
    imageUrls?: string[]; // Additional field for multiple image URLs
    message?: string;
    audioUrl?: string;
  };
}

const handleWebhookError = (error: unknown): string => {
  console.log('Handling webhook error:', error);
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Unable to reach the webhook server. Please check the URL and try again.';
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred';
};

const parseWebhookResponse = (response: any): { 
  message?: string; 
  imageUrl?: string; 
  imageUrls?: string[];
  audioUrl?: string; 
} => {
  console.log('Parsing webhook response:', response);
  try {
    if (typeof response === 'string') {
      console.log('Response is string, returning as message');
      return { message: response };
    }

    const webhookResponse = response as WebhookResponse;
    console.log('Parsed webhook response object:', webhookResponse);
    
    // Collect all possible image URLs from various fields
    const allImageUrls: string[] = [];
    
    // Helper function to add URLs to the collection
    const addUrls = (value: string | string[] | undefined) => {
      if (typeof value === 'string') {
        allImageUrls.push(value);
      } else if (Array.isArray(value)) {
        allImageUrls.push(...value.filter(url => typeof url === 'string'));
      }
    };

    // Check all possible URL fields
    addUrls(webhookResponse.output?.URL);
    addUrls(webhookResponse.output?.url);
    addUrls(webhookResponse.output?.urls);
    addUrls(webhookResponse.output?.imageUrl);
    addUrls(webhookResponse.output?.imageUrls);

    // Remove duplicates and filter out empty strings
    const uniqueImageUrls = [...new Set(allImageUrls)].filter(url => url && url.trim());

    console.log('Extracted image URLs:', uniqueImageUrls);
    console.log('Extracted message:', webhookResponse.output?.message);
    console.log('Extracted audio URL:', webhookResponse.output?.audioUrl);

    return {
      imageUrl: uniqueImageUrls.length > 0 ? uniqueImageUrls[0] : undefined, // Keep backward compatibility
      imageUrls: uniqueImageUrls.length > 0 ? uniqueImageUrls : undefined,
      message: webhookResponse.output?.message,
      audioUrl: webhookResponse.output?.audioUrl
    };

  } catch (error) {
    console.error('Error parsing webhook response:', error);
    return { message: String(response) };
  }
};

export const sendMessageToWebhook = async (
  message: Omit<Message, 'status' | 'type'>,
  config: WebhookConfig,
  requestType: 'text' | 'image' | 'video' = 'text',
  imageData?: string,
  currentImageUrl?: string
): Promise<SendMessageResult> => {
  console.log('sendMessageToWebhook called with:', { message, config, requestType, imageData: !!imageData, currentImageUrl });

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
      imageData,
      currentImageUrl,
    };

    console.log('Preparing webhook request:', {
      url: config.url,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: {
        ...payload,
        imageData: payload.imageData ? '[Base64 Data Present]' : undefined
      },
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
      response: parsedResponse.imageUrl, // Keep backward compatibility
      imageUrls: parsedResponse.imageUrls, // New field for multiple URLs
      additionalResponse: parsedResponse.message,
      audioUrl: parsedResponse.audioUrl
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
import { parse } from 'url';

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

export const isValidWebhookUrl = (url: string): boolean => {
  if (!isValidUrl(url)) return false;
  
  // Additional webhook-specific validation could be added here
  // For example, checking for http/https protocol
  const parsedUrl = new URL(url);
  return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
};

export const isImageUrl = (url: string): boolean => {
  if (!isValidUrl(url)) return false;
  
  try {
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname.toLowerCase();
    return path.endsWith('.jpg') || 
           path.endsWith('.jpeg') || 
           path.endsWith('.png') || 
           path.endsWith('.gif') || 
           path.endsWith('.webp');
  } catch (e) {
    return false;
  }
};
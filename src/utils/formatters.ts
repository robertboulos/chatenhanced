import { format } from 'date-fns';

export const formatTimestamp = (timestamp: number): string => {
  return format(new Date(timestamp), 'h:mm a');
};
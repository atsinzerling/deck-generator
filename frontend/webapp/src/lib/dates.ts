import { format } from 'date-fns'

const DATE_FORMAT = 'MMM d, yyyy h:mm a';

export function formatDate(dateString: string): string {
	try {
	  const date = new Date(dateString);
	  return format(date, DATE_FORMAT);  // e.g., "Feb 15, 2024 9:40 PM"
	} catch {
	  return dateString;
	}
  }

export function formatRelativeDate(dateString: string): string {
	try {
	  const date = new Date(dateString);
	  const now = new Date();
	  const diffInMilliseconds = now.getTime() - date.getTime();
	  const diffInHours = diffInMilliseconds / (1000 * 60 * 60);
  
	  if (diffInHours < 24) {
		if (diffInHours < 1) {
		  const minutes = Math.floor(diffInMilliseconds / (1000 * 60));
		  return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
		}
		const hours = Math.floor(diffInHours);
		return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
	  }
  
	  // For dates more than 24 hours ago, use the browser's timezone
	  return format(date, DATE_FORMAT);
	} catch {
	  return dateString;
	}
  }
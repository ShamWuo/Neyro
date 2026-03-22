// Time and date formatting utilities

/**
 * Format seconds into HH:MM:SS display
 */
export function formatTimer(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Format seconds into human readable duration (e.g., "1h 30m", "45m", "30s")
 */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * Format minutes into human readable duration
 */
export function formatMinutes(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${Math.round(totalMinutes)}m`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

/**
 * Format timestamp to time string (e.g., "2:30 PM")
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

/**
 * Format timestamp to date string for display
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if same day
  if (isSameDay(date, now)) {
    return 'Today';
  }

  // Check if yesterday
  if (isSameDay(date, yesterday)) {
    return 'Yesterday';
  }

  // Check if this year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  // Different year
  return date.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

/**
 * Format timestamp to full date string
 */
export function formatFullDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get YYYY-MM-DD string from timestamp
 */
export function getDateKey(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Get start of day timestamp
 */
export function getStartOfDay(timestamp: number = Date.now()): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Get start of week timestamp (Monday)
 */
export function getStartOfWeek(timestamp: number = Date.now()): number {
  const date = new Date(timestamp);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Get array of last N days as date keys
 */
export function getLastNDays(n: number): string[] {
  const days: string[] = [];
  const now = new Date();
  
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    days.push(getDateKey(date.getTime()));
  }
  
  return days;
}

/**
 * Get short day name from date key
 */
export function getShortDayName(dateKey: string): string {
  const date = new Date(dateKey + 'T00:00:00');
  return date.toLocaleDateString([], { weekday: 'short' });
}

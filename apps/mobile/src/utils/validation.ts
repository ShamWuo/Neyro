/**
 * Validation Result Type
 */
export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

/**
 * Validates a piece or exercise title.
 * Must be non-empty and at least 2 characters.
 */
export function validatePieceTitle(title: string): ValidationResult {
  const trimmed = title.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Title is required.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Title must be at least 2 characters.' };
  }
  return { isValid: true };
}

/**
 * Validates daily practice goal.
 * Must be between 1 and 480 minutes (8 hours).
 */
export function validateDailyGoal(minutes: number): ValidationResult {
  if (isNaN(minutes)) {
    return { isValid: false, error: 'Goal must be a number.' };
  }
  if (minutes < 1) {
    return { isValid: false, error: 'Goal must be at least 1 minute.' };
  }
  if (minutes > 480) {
    return { isValid: false, error: 'Goal cannot exceed 480 minutes (8 hours).' };
  }
  return { isValid: true };
}

/**
 * Validates years played.
 * Must be between 0 and 100.
 */
export function validateYearsPlayed(years: number): ValidationResult {
  if (isNaN(years)) {
    return { isValid: false, error: 'Years must be a number.' };
  }
  if (years < 0) {
    return { isValid: false, error: 'Years cannot be negative.' };
  }
  if (years > 100) {
    return { isValid: false, error: 'Years played implies you are over 100 years old?' };
  }
  return { isValid: true };
}

/**
 * Validates display name.
 * Must be between 2 and 30 characters.
 */
export function validateDisplayName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Name is required.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters.' };
  }
  if (trimmed.length > 30) {
    return { isValid: false, error: 'Name must be 30 characters or less.' };
  }
  return { isValid: true };
}

/**
 * Validate session duration
 */
export function validateSessionDuration(startTime: number, endTime: number): ValidationResult {
  if (startTime >= endTime) {
    return {
      isValid: false,
      error: 'End time must be after start time',
    };
  }

  const durationMs = endTime - startTime;
  const durationMinutes = durationMs / 1000 / 60;

  if (durationMinutes < 1) {
    return {
      isValid: false,
      error: 'Session must be at least 1 minute',
    };
  }

  if (durationMinutes > 1440) { // 24 hours
    return {
      isValid: false,
      error: 'Session cannot be longer than 24 hours',
    };
  }

  // Check if session is in the future
  if (endTime > Date.now()) {
    return {
      isValid: false,
      error: 'Session cannot end in the future',
    };
  }

  return { isValid: true };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Email is required',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }

  return { isValid: true };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

/**
 * Validate and sanitize notes field
 */
export function validateNotes(notes: string): ValidationResult {
  if (notes.length > 5000) {
    return {
      isValid: false,
      error: 'Notes must be less than 5000 characters',
    };
  }

  return { isValid: true };
}


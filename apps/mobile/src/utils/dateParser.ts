// Natural Language Date Parser
// Converts phrases like "tomorrow", "next Friday" to YYYY-MM-DD

export const parseNaturalDate = (input: string): string | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lowerInput = input.toLowerCase().trim();

    // Today
    if (lowerInput === 'today') {
        return formatDate(today);
    }

    // Tomorrow
    if (lowerInput === 'tomorrow' || lowerInput === 'tmr') {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return formatDate(tomorrow);
    }

    // Yesterday
    if (lowerInput === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return formatDate(yesterday);
    }

    // Next week
    if (lowerInput === 'next week') {
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        return formatDate(nextWeek);
    }

    // This/Next [Day of Week]
    const dayMatch = lowerInput.match(/(this|next)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
    if (dayMatch) {
        const modifier = dayMatch[1]; // 'this' or 'next'
        const targetDay = dayMatch[2];
        return getNextDayOfWeek(today, targetDay, modifier === 'next');
    }

    // Standalone day names (assume next occurrence)
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    if (dayNames.includes(lowerInput)) {
        return getNextDayOfWeek(today, lowerInput, false);
    }

    // In X days
    const inDaysMatch = lowerInput.match(/in\s+(\d+)\s+days?/);
    if (inDaysMatch) {
        const days = parseInt(inDaysMatch[1], 10);
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + days);
        return formatDate(futureDate);
    }

    // In X weeks
    const inWeeksMatch = lowerInput.match(/in\s+(\d+)\s+weeks?/);
    if (inWeeksMatch) {
        const weeks = parseInt(inWeeksMatch[1], 10);
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + (weeks * 7));
        return formatDate(futureDate);
    }

    return null;
};

const getNextDayOfWeek = (fromDate: Date, dayName: string, forceNext: boolean): string => {
    const dayMap: { [key: string]: number } = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6
    };

    const targetDay = dayMap[dayName.toLowerCase()];
    const currentDay = fromDate.getDay();

    let daysToAdd = targetDay - currentDay;

    // If target day is today or has passed this week, go to next week
    if (daysToAdd <= 0 || forceNext) {
        daysToAdd += 7;
    }

    const resultDate = new Date(fromDate);
    resultDate.setDate(fromDate.getDate() + daysToAdd);
    return formatDate(resultDate);
};

const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper to display dates in human-friendly format
export const formatDateHuman = (dateStr: string): string => {
    // Validate input
    if (!dateStr || typeof dateStr !== 'string') {
        return 'Invalid date';
    }

    const date = new Date(dateStr);

    // Check if date is valid
    if (isNaN(date.getTime())) {
        return 'Invalid date';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    if (dateOnly.getTime() === today.getTime()) return 'Today';
    if (dateOnly.getTime() === tomorrow.getTime()) return 'Tomorrow';

    const diffDays = Math.floor((dateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays <= 7) {
        return dateOnly.toLocaleDateString('en-US', { weekday: 'long' });
    }

    return dateOnly.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export interface DifficultyDimensions {
    technical: number; // 0-10
    rhythmic: number; // 0-10
    reading: number; // 0-10
    endurance: number; // 0-10
    musicality: number; // 0-10
}

export interface DifficultyAnalysis {
    absoluteRating: number; // 1-10 (Global Standard)
    relativeRating?: number; // 1-10 (Relative to User)
    confidence: number; // 0.0 - 1.0 (float)
    label: string; // "Beginner" ... "Virtuoso"
    dimensions: DifficultyDimensions;
    technicalChallenges: string[]; // "Double stops", "Polyrhythms"
    prerequisites?: string[]; // "3-octave scales"
    reasoning: string;
}

// Re-export current types if needed to avoid circles, or just paste this into existing types file

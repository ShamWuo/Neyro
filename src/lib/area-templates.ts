// Predefined area templates

export type AreaTemplate = {
  id: string;
  name: string;
  standard: string;
  description: string;
  icon?: string;
};

export const AREA_TEMPLATES: AreaTemplate[] = [
  {
    id: "health-fitness",
    name: "Health & Fitness",
    standard: "Exercise 3x/week, maintain healthy diet, get 7-8 hours sleep",
    description: "Physical health, exercise, nutrition, and wellness",
  },
  {
    id: "finances",
    name: "Finances",
    standard: "Track expenses weekly, review budget monthly, save 20% of income",
    description: "Financial planning, budgeting, savings, and investments",
  },
  {
    id: "relationships",
    name: "Relationships",
    standard: "Weekly check-ins with family, monthly date nights, maintain friendships",
    description: "Family, friends, romantic relationships, and social connections",
  },
  {
    id: "career-school",
    name: "Career/School",
    standard: "Continuous learning, network quarterly, maintain work-life balance",
    description: "Professional development, education, and career growth",
  },
  {
    id: "home-environment",
    name: "Home/Environment",
    standard: "Keep living space organized, maintain cleanliness, regular maintenance",
    description: "Home organization, cleanliness, and living environment",
  },
  {
    id: "personal-growth",
    name: "Personal Growth",
    standard: "Read 1 book/month, practice mindfulness, learn new skills",
    description: "Self-improvement, learning, and personal development",
  },
];

export function getAreaTemplate(id: string): AreaTemplate | undefined {
  return AREA_TEMPLATES.find((t) => t.id === id);
}


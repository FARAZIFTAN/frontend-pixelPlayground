// Template data structure
export interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  frameUrl: string;
  isPremium?: boolean;
}

// Mock templates - Replace with real template images later
export const templates: Template[] = [
  {
    id: "template-1",
    name: "Birthday Party",
    category: "Birthday",
    thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=400&fit=crop",
    frameUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1280&h=720&fit=crop",
    isPremium: false,
  },
  {
    id: "template-2",
    name: "Wedding Elegant",
    category: "Wedding",
    thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop",
    frameUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1280&h=720&fit=crop",
    isPremium: false,
  },
  {
    id: "template-3",
    name: "Graduation",
    category: "Education",
    thumbnail: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=400&fit=crop",
    frameUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1280&h=720&fit=crop",
    isPremium: false,
  },
  {
    id: "template-4",
    name: "Corporate Event",
    category: "Corporate",
    thumbnail: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=400&fit=crop",
    frameUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1280&h=720&fit=crop",
    isPremium: false,
  },
  {
    id: "template-5",
    name: "Baby Shower",
    category: "Baby",
    thumbnail: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop",
    frameUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1280&h=720&fit=crop",
    isPremium: false,
  },
  {
    id: "template-6",
    name: "Christmas",
    category: "Holiday",
    thumbnail: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400&h=400&fit=crop",
    frameUrl: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1280&h=720&fit=crop",
    isPremium: true,
  },
  {
    id: "template-7",
    name: "New Year",
    category: "Holiday",
    thumbnail: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&h=400&fit=crop",
    frameUrl: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=1280&h=720&fit=crop",
    isPremium: true,
  },
  {
    id: "template-8",
    name: "Valentine",
    category: "Love",
    thumbnail: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=400&fit=crop",
    frameUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1280&h=720&fit=crop",
    isPremium: true,
  },
];

// Categories for filtering
export const templateCategories = [
  "All",
  "Birthday",
  "Wedding",
  "Education",
  "Corporate",
  "Baby",
  "Holiday",
  "Love",
];

// Template data structure
export interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  frameUrl: string;
  isPremium?: boolean;
  frameCount: number; // Number of photos in the template (2, 3, or 4)
  layoutPositions: {
    // Position of each photo in the strip
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}

// Templates with real images
export const templates: Template[] = [
  {
    id: "template-1",
    name: "Graduation",
    category: "Education",
    thumbnail: "/assets/templates/graduation/graduation-1.png",
    frameUrl: "/assets/templates/graduation/graduation-1.png",
    isPremium: false,
    frameCount: 3, // 3 photos in this template
    layoutPositions: [
      { x: 27, y: 99, width: 487, height: 318 },    // Photo 1 (top)
      { x: 28, y: 490, width: 485, height: 323 },   // Photo 2 (middle)
      { x: 27, y: 883, width: 486, height: 317 },   // Photo 3 (bottom)
    ],
  },
  {
    id: "template-2",
    name: "Morris",
    category: "Artistic",
    thumbnail: "/assets/templates/morris/morris-1.png",
    frameUrl: "/assets/templates/morris/morris-1.png",
    isPremium: false,
    frameCount: 3, // 3 photos in this template
    layoutPositions: [
      { x: 26, y: 181, width: 485, height: 315 },   // Photo 1 (top)
      { x: 27, y: 560, width: 498, height: 317 },   // Photo 2 (middle)
      { x: 27, y: 947, width: 486, height: 323 },   // Photo 3 (bottom)
    ],
  },
];

// Categories for filtering
export const templateCategories = [
  "All",
  "Birthday",
  "Wedding",
  "Education",
  "Artistic",
  "Corporate",
  "Baby",
  "Holiday",
  "Love",
];

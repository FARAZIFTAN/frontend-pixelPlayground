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
    frameCount: 4, // 4 photos in this template
    layoutPositions: [
      // Coordinates for each photo position in the template
      // Will be adjusted based on actual template size
      { x: 40, y: 110, width: 443, height: 266 },   // Photo 1 (top)
      { x: 40, y: 405, width: 443, height: 266 },   // Photo 2
      { x: 40, y: 700, width: 443, height: 266 },   // Photo 3
      { x: 40, y: 995, width: 443, height: 266 },   // Photo 4 (bottom)
    ],
  },
  {
    id: "template-2",
    name: "Morris",
    category: "Artistic",
    thumbnail: "/assets/templates/morris/morris-1.png",
    frameUrl: "/assets/templates/morris/morris-1.png",
    isPremium: false,
    frameCount: 4, // 4 photos in this template
    layoutPositions: [
      // Coordinates for each photo position in the template
      // Adjusted for template size 591x1772
      { x: 66, y: 130, width: 459, height: 276 },   // Photo 1 (top)
      { x: 66, y: 530, width: 459, height: 276 },   // Photo 2
      { x: 66, y: 930, width: 459, height: 276 },   // Photo 3
      { x: 66, y: 1330, width: 459, height: 276 },  // Photo 4 (bottom)
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

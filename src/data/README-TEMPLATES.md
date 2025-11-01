# Template System Documentation

## 📁 File Structure

```
src/
  data/
    templates.ts        # Template data & configuration
    README-TEMPLATES.md # This file
```

## 🎨 Current Implementation

Currently using **MOCK DATA** with Unsplash images as placeholders.

### Mock Templates (8 total):
1. Birthday Party
2. Wedding Elegant
3. Graduation
4. Corporate Event
5. Baby Shower
6. Christmas (Premium)
7. New Year (Premium)
8. Valentine (Premium)

## 🔄 How to Replace with Real Templates

### Step 1: Prepare Your Template Images

Create PNG images with transparent areas for the photo:
- **Recommended Size:** 1280x720px (16:9 aspect ratio)
- **Format:** PNG with transparency
- **File Size:** < 500KB for best performance

### Step 2: Add Images to Project

Put your template files in:
```
src/assets/templates/
  ├── birthday-template.png
  ├── wedding-template.png
  └── ...
```

### Step 3: Import in templates.ts

```typescript
import birthdayTemplate from "@/assets/templates/birthday-template.png";
import weddingTemplate from "@/assets/templates/wedding-template.png";
```

### Step 4: Update Template Data

Replace the mock URLs with your imported images:

```typescript
export const templates: Template[] = [
  {
    id: "template-1",
    name: "Birthday Party",
    category: "Birthday",
    thumbnail: birthdayTemplate, // Use imported image
    frameUrl: birthdayTemplate,   // Same image for frame
    isPremium: false,
  },
  // ... more templates
];
```

## 🎯 Template Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Display name |
| `category` | string | Category for filtering |
| `thumbnail` | string | Small preview image URL |
| `frameUrl` | string | Full-size overlay image URL |
| `isPremium` | boolean | Show "PRO" badge |

## 📝 Notes

- Current implementation uses Unsplash images (not real templates)
- Replace with actual template designs later
- Template overlay opacity is set to 80% in Booth.tsx
- CORS is handled with `crossOrigin = "anonymous"`

## 🚀 Future Enhancements

- [ ] Backend API for templates
- [ ] Dynamic template loading
- [ ] Category filtering
- [ ] Search functionality
- [ ] User-uploaded templates (admin panel)

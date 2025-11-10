# 🎨 Admin Panel - PixelPlayground Photo Booth

## ✨ Overview

Admin Panel lengkap untuk mengelola template photo booth, analytics, user management, dan settings.

---

## 🚀 Cara Mengakses Admin Panel

### Development Mode:

1. **Login Page**
   ```
   http://localhost:5173/admin/login
   ```

2. **Dashboard** (setelah login)
   ```
   http://localhost:5173/admin/dashboard
   ```

### Default Credentials (Development):
```
Email: admin@pixelplay.com
Password: admin123
```

> ⚠️ **Note:** Authentication belum terimplementasi. Saat ini bisa langsung akses dashboard.

---

## 📁 Struktur File Admin

```
src/
├── components/
│   └── admin/
│       ├── AdminLayout.tsx      # Main layout dengan sidebar & header
│       ├── Sidebar.tsx          # Navigation sidebar
│       └── Header.tsx           # Top header dengan search & notifications
├── pages/
│   └── admin/
│       ├── Login.tsx            # Admin login page
│       ├── Dashboard.tsx        # Dashboard dengan stats & overview
│       ├── Templates.tsx        # Template management (list, edit, delete)
│       ├── Analytics.tsx        # Analytics & reports
│       └── Settings.tsx         # Application settings
```

---

## 🎯 Fitur yang Sudah Dibuat

### ✅ **1. Admin Layout**
- Responsive sidebar dengan collapse
- Top header dengan search bar
- Notifications dropdown
- User menu dropdown
- Clean & modern design

### ✅ **2. Dashboard**
- Statistics cards (Templates, Photos, Users, Downloads)
- Popular templates list
- Recent activity feed
- Quick actions banner

### ✅ **3. Templates Management**
- Grid & List view toggle
- Search & filter by category
- Template cards dengan hover effects
- Actions: View, Edit, Copy, Delete
- Status badges (Active/Inactive, Premium)

### ✅ **4. Analytics Page**
- Usage statistics
- Top templates dengan progress bars
- Chart placeholders (ready untuk integration)
- Time range filter

### ✅ **5. Settings Page**
- Profile settings
- Notification preferences
- Security settings
- Appearance customization

### ✅ **6. Login Page**
- Beautiful gradient design
- Social login buttons (Google, GitHub)
- Remember me & forgot password
- Animated background

---

## 🎨 UI Components yang Digunakan

Semua menggunakan komponen dari **shadcn/ui**:
- ✅ Button
- ✅ Card
- ✅ Badge
- ✅ Input
- ✅ Select
- ✅ Checkbox

Plus **Lucide React Icons** untuk semua icon.

---

## 🔗 Navigasi Admin Panel

| Menu | Route | Status | Deskripsi |
|------|-------|--------|-----------|
| **Dashboard** | `/admin/dashboard` | ✅ Done | Overview & statistics |
| **Templates** | `/admin/templates` | ✅ Done | Manage templates |
| **Create Template** | `/admin/template-creator` | 🚧 Todo | Upload & create new template |
| **Analytics** | `/admin/analytics` | ✅ Done | Usage reports & insights |
| **Users** | `/admin/users` | 🚧 Todo | User management |
| **Settings** | `/admin/settings` | ✅ Done | App settings |

---

## 🚧 Fitur yang Masih Perlu Dibuat

### Priority High:
1. **Authentication System** 🔐
   - Login/Logout functionality
   - Protected routes
   - Session management
   - Role-based access

2. **Template Creator Tool** 🎨
   - Upload template image
   - Drag & drop coordinate marker
   - Preview dengan sample photos
   - Save to database

3. **Backend Integration** 🔥
   - Firebase/Supabase setup
   - API services
   - Database schema
   - Storage for images

### Priority Medium:
4. **User Management** 👥
   - List all users
   - Add/Edit/Delete users
   - Role management
   - Activity logs

5. **Real Analytics** 📊
   - Charts implementation (Recharts)
   - Real data from database
   - Export reports

### Priority Low:
6. **Advanced Features** ⭐
   - Template versioning
   - Batch operations
   - AI frame detection
   - Advanced filters

---

## 🎯 Next Steps untuk Development

### Phase 1: Authentication (Week 1)
```bash
# Install Firebase
npm install firebase

# Setup auth context
# Implement login/logout
# Add protected routes
```

### Phase 2: Template Creator (Week 2-3)
```bash
# Build drag & drop marker
# Canvas manipulation
# Image upload to storage
# Save coordinates to DB
```

### Phase 3: Backend Integration (Week 4)
```bash
# Setup Firebase/Supabase
# Create API services
# Connect UI to backend
# Real-time updates
```

---

## 🎨 Design System

### Colors:
```css
Primary: hsl(var(--primary))       /* Main brand color */
Secondary: hsl(var(--secondary))   /* Accent color */
Background: hsl(var(--background)) /* Page background */
Card: hsl(var(--card))            /* Card background */
```

### Gradients:
```css
from-primary via-purple-600 to-pink-500     /* Login page */
from-gray-900 via-gray-800 to-gray-900      /* Sidebar */
from-primary to-purple-600                  /* Buttons, badges */
```

---

## 📱 Responsive Breakpoints

```css
sm: 640px   /* Mobile */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large Desktop */
```

---

## 🐛 Known Issues / TODO

- [ ] Authentication belum terimplementasi
- [ ] Template Creator belum ada
- [ ] Data masih static (belum dari database)
- [ ] Charts belum terintegrasi
- [ ] User Management belum dibuat
- [ ] File upload belum ada
- [ ] Notifications belum real-time

---

## 💡 Tips untuk Development

### 1. Menambah Menu Baru di Sidebar:
Edit `src/components/admin/Sidebar.tsx`:
```typescript
const menuItems = [
  // ... existing items
  { 
    path: "/admin/new-page", 
    icon: YourIcon, 
    label: "New Page" 
  },
];
```

### 2. Menambah Route Baru:
Edit `src/App.tsx`:
```typescript
<Route path="new-page" element={<NewPage />} />
```

### 3. Membuat Page Baru:
```typescript
// src/pages/admin/NewPage.tsx
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const NewPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">New Page</h1>
      {/* Your content */}
    </div>
  );
};

export default NewPage;
```

---

## 🎉 Screenshots

### Dashboard
![Dashboard Preview](coming-soon)

### Templates Management
![Templates Preview](coming-soon)

### Login Page
![Login Preview](coming-soon)

---

## 📞 Support

Jika ada pertanyaan atau butuh bantuan development, silakan hubungi tim!

---

**Built with ❤️ by PixelPlayground Team**

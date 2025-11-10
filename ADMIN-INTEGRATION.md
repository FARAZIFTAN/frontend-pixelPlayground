# 🔐 Admin Authentication - Quick Reference

## ✅ Yang Sudah Tersedia di Frontend

### 1. AuthContext dengan Admin Support
```tsx
import { useAuth } from "@/contexts/AuthContext";

const { user, isAdmin, isAuthenticated } = useAuth();

// user.role = 'user' | 'admin'
// isAdmin = true jika user.role === 'admin'
```

### 2. ProtectedAdminRoute Component
```tsx
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";

<Route
  path="/admin/*"
  element={
    <ProtectedAdminRoute>
      <AdminLayout />
    </ProtectedAdminRoute>
  }
/>
```

---

## 🚀 Cara Implementasi di App.tsx

### Option 1: Admin sebagai Nested Routes

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";

// Import pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Import admin components
import AdminLayout from "@/components/admin/AdminLayout";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* User Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes - Semua route dibawah /admin/* */}
          <Route
            path="/admin/*"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

### Option 2: Individual Admin Routes

```tsx
<Routes>
  {/* Public Routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  
  {/* User Routes */}
  <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
  
  {/* Admin Routes - Individual */}
  <Route
    path="/admin"
    element={
      <ProtectedAdminRoute>
        <AdminDashboard />
      </ProtectedAdminRoute>
    }
  />
  <Route
    path="/admin/users"
    element={
      <ProtectedAdminRoute>
        <AdminUsers />
      </ProtectedAdminRoute>
    }
  />
  <Route
    path="/admin/settings"
    element={
      <ProtectedAdminRoute>
        <AdminSettings />
      </ProtectedAdminRoute>
    }
  />
</Routes>
```

---

## 🎨 Update Navbar untuk Show Admin Link

```tsx
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const Navbar = () => {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          KaryaKlik
        </Link>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Show Admin Link if user is admin */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <Shield size={18} />
                  Admin Panel
                </Link>
              )}
              
              <span className="text-sm text-gray-600">
                {user?.name} 
                {isAdmin && <span className="ml-2 text-red-600 font-semibold">(Admin)</span>}
              </span>
              
              <button
                onClick={logout}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 hover:underline">
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
```

---

## 🔒 Conditional Rendering berdasarkan Role

### Example 1: Show/Hide UI Elements

```tsx
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { isAdmin, user } = useAuth();
  
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Show to everyone */}
      <div>Welcome, {user?.name}!</div>
      
      {/* Show only to admin */}
      {isAdmin && (
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <h2>Admin Controls</h2>
          <button>Manage Users</button>
          <button>View Analytics</button>
        </div>
      )}
      
      {/* Show only to regular users */}
      {!isAdmin && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded">
          <p>Upgrade to admin to unlock more features!</p>
        </div>
      )}
    </div>
  );
};
```

### Example 2: Role Badge Component

```tsx
interface RoleBadgeProps {
  role: 'user' | 'admin';
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <Shield size={12} className="mr-1" />
        Admin
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      User
    </span>
  );
};

// Usage
<RoleBadge role={user?.role} />
```

---

## 🎯 Testing Checklist

### 1. Register sebagai User Biasa
- [ ] Buka `/register`
- [ ] Isi form dan register
- [ ] Login dengan credentials yang baru dibuat
- [ ] Check: `user.role === 'user'`
- [ ] Check: `isAdmin === false`
- [ ] Try akses `/admin` → harus redirect ke home

### 2. Login sebagai Admin
- [ ] Buat admin dulu (pakai script `create-admin.js`)
- [ ] Login dengan admin credentials
- [ ] Check: `user.role === 'admin'`
- [ ] Check: `isAdmin === true`
- [ ] Try akses `/admin` → harus berhasil
- [ ] Check navbar muncul "Admin Panel" button

### 3. Role Persistence
- [ ] Login sebagai admin
- [ ] Refresh page
- [ ] Check: masih tetap admin (role tersimpan di token)

---

## 🐛 Common Issues

### Issue: `isAdmin` selalu false
**Solution:**
1. Check backend sudah update dengan role support
2. Logout dan login ulang untuk dapat token baru
3. Check token di localStorage, decode di jwt.io, pastikan ada field "role"

### Issue: Admin redirect ke home
**Solution:**
1. Check `ProtectedAdminRoute` sudah import dengan benar
2. Check `user?.role` di console
3. Pastikan `isAdmin` dari AuthContext bukan hardcoded

### Issue: Role tidak muncul di response
**Solution:**
1. Restart backend server
2. Check User model sudah ada field `role`
3. Check API routes sudah return role

---

## 📚 Documentation

- **Backend Setup**: `backend-pixelPlayground/ADMIN-SETUP-GUIDE.md`
- **Create Admin Script**: `backend-pixelPlayground/scripts/create-admin.js`
- **Backend README**: `backend-pixelPlayground/README.md`

---

## 🎉 Quick Start

1. **Create Admin** (di backend):
   ```bash
   cd backend-pixelPlayground
   node scripts/create-admin.js
   ```

2. **Update App.tsx** dengan admin routes

3. **Update Navbar** untuk show admin link

4. **Test Login** dengan admin credentials

5. **Done!** 🚀

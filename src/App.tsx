import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster as HotToast } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Booth from "./pages/Booth";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyGallery from "./pages/MyGallery";
import MyAccount from "./pages/MyAccount";
import PhotoSessions from "./pages/PhotoSessions";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import ChangePassword from "./pages/ChangePassword";
import Share from "./pages/Share";
import AITemplateCreator from "./pages/AITemplateCreator";
import InputMethodSelection from "./pages/InputMethodSelection";

// Admin Pages
import AdminLayout from "./components/admin/AdminLayout";
import AdminLogin from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Templates from "./pages/admin/Templates";
import TemplateCreator from "./pages/admin/TemplateCreator";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";
import UserManagement from "./pages/admin/UserManagement";


const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <HotToast
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "hsl(var(--card))",
              color: "hsl(var(--card-foreground))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "1rem",
              padding: "16px",
            },
          }}
        />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes (No Navbar/Footer) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Admin Routes (No Navbar/Footer) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="templates" element={<Templates />} />
              <Route path="template-creator" element={<TemplateCreator />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Public Routes (With Navbar/Footer) */}
            <Route path="*" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/share/:id" element={<Share />} />
                    <Route path="/my-gallery" element={
                      <ProtectedRoute>
                        <MyGallery />
                      </ProtectedRoute>
                    } />
                    <Route path="/my-account" element={
                      <ProtectedRoute>
                        <MyAccount />
                      </ProtectedRoute>
                    } />
                    <Route path="/change-password" element={
                      <ProtectedRoute>
                        <ChangePassword />
                      </ProtectedRoute>
                    } />
                    <Route path="/input-method" element={
                      <ProtectedRoute>
                        <InputMethodSelection />
                      </ProtectedRoute>
                    } />
                    <Route path="/booth" element={
                      <ProtectedRoute>
                        <Booth />
                      </ProtectedRoute>
                    } />
                    <Route path="/booth/sessions" element={
                      <ProtectedRoute>
                        <PhotoSessions />
                      </ProtectedRoute>
                    } />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/ai-template-creator" element={
                      <ProtectedRoute>
                        <AITemplateCreator />
                      </ProtectedRoute>
                    } />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

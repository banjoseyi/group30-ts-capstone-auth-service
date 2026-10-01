import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Route guards
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Protected user pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Security from './pages/Security';
import Sessions from './pages/Sessions';

// Admin pages
import UserManagement from './pages/admin/UserManagement';
import UserDetails from './pages/admin/UserDetails';

export default function App() {
  return (
    <BrowserRouter>
      {/*
        AuthProvider is inside BrowserRouter so AuthContext can call
        useNavigate() (which requires a Router context).
      */}
      <AuthProvider>
        <Routes>
          {/* ── Public Routes ───────────────────────────────────────────── */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>

          {/* ── Protected User Routes ────────────────────────────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/security" element={<Security />} />
              <Route path="/sessions" element={<Sessions />} />
            </Route>
          </Route>

          {/* ── Admin Only Routes ────────────────────────────────────────── */}
          <Route element={<AdminRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/users/:userId" element={<UserDetails />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Pages
import HomePage from './pages/HomePage';
import AuctionsPage from './pages/AuctionsPage';
import AuctionDetailPage from './pages/AuctionDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ProfilePage from './pages/ProfilePage';
import CheckoutPage from './pages/CheckoutPage';
import AdminAuctionsPage from './pages/admin/AdminAuctionsPage';
import VerificationManagementPage from './pages/admin/VerificationManagementPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuctionForm from './components/admin/AuctionForm';
import UnauthorizedPage from './pages/UnauthorizedPage';

function App() {
  const { checkAuth } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auctions" element={<AuctionsPage />} />
        <Route path="/auctions/:id" element={<AuctionDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/checkout/:id" element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/auctions" element={
          <ProtectedRoute requiredRole="admin">
            <AdminAuctionsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/auctions/create" element={
          <ProtectedRoute requiredRole="admin">
            <AuctionForm />
          </ProtectedRoute>
        } />
        <Route path="/admin/verifications" element={
          <ProtectedRoute requiredRole="admin">
            <VerificationManagementPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
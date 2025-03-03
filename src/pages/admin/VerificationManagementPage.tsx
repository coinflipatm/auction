import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Layout from '../../components/layout/Layout';
import VerificationReviewPanel from '../../components/admin/VerificationReviewPanel';

const VerificationManagementPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  
  // Redirect if not authenticated or not admin
  if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Identity Verification Management</h1>
          </div>
          
          <VerificationReviewPanel />
        </div>
      </div>
    </Layout>
  );
};

export default VerificationManagementPage;
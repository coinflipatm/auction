import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAuctionStore } from '../store/auctionStore';
import Layout from '../components/layout/Layout';
import CheckoutForm from '../components/payment/CheckoutForm';
import { AlertCircle } from 'lucide-react';

const CheckoutPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuthStore();
  const { currentAuction, fetchAuctionById, isLoading, error } = useAuctionStore();
  const [isEligible, setIsEligible] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchAuctionById(id);
    }
  }, [id, fetchAuctionById]);
  
  // Check if user is eligible to checkout (winning bidder)
  useEffect(() => {
    if (currentAuction && user) {
      const isWinner = currentAuction.winningBidderId === user.id;
      const isEnded = currentAuction.status === 'ended';
      setIsEligible(isWinner && isEnded);
    }
  }, [currentAuction, user]);
  
  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-red-700 mb-2">Error Loading Auction</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => id && fetchAuctionById(id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!currentAuction) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Auction Not Found</h2>
              <p className="text-gray-600 mb-4">The auction you're looking for doesn't exist or has been removed.</p>
              <a
                href="/auctions"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Browse Auctions
              </a>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!isEligible) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
              <h2 className="text-2xl font-bold text-yellow-700 mb-2">Not Eligible for Checkout</h2>
              <p className="text-yellow-600 mb-4">
                You are not the winning bidder for this auction or the auction is still active.
              </p>
              <a
                href={`/auctions/${id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Return to Auction
              </a>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Complete Your Purchase</h1>
            
            <div className="mb-6">
              <CheckoutForm 
                auction={currentAuction} 
                onCancel={() => window.location.href = `/auctions/${id}`}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
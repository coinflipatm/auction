import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/layout/Layout';
import { Auction, Bid } from '../types';
import { Clock, DollarSign, Truck, AlertCircle } from 'lucide-react';
import { API_URL } from '../config';
import { toJSDate } from '../utils/dateUtils';

const DashboardPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'bids' | 'won' | 'watching'>('bids');
  const [userBids, setUserBids] = useState<Bid[]>([]);
  const [wonAuctions, setWonAuctions] = useState<Auction[]>([]);
  const [watchedAuctions, setWatchedAuctions] = useState<Auction[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchUserData = async () => {
        setIsDataLoading(true);
        setError(null);
        
        try {
          // Fetch user bids
          const bidsResponse = await fetch(`${API_URL}/users/${user.id}/bids`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          
          if (!bidsResponse.ok) {
            throw new Error('Failed to fetch your bids');
          }
          
          const bidsData = await bidsResponse.json();
          setUserBids(bidsData.data || []);
          
          // Fetch won auctions
          const wonResponse = await fetch(`${API_URL}/users/${user.id}/won-auctions`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          
          if (!wonResponse.ok) {
            throw new Error('Failed to fetch won auctions');
          }
          
          const wonData = await wonResponse.json();
          setWonAuctions(wonData.data || []);
          
          // Fetch watched auctions
          const watchedResponse = await fetch(`${API_URL}/users/${user.id}/watched-auctions`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          
          if (!watchedResponse.ok) {
            throw new Error('Failed to fetch watched auctions');
          }
          
          const watchedData = await watchedResponse.json();
          setWatchedAuctions(watchedData.data || []);
          
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setIsDataLoading(false);
        }
      };
      
      fetchUserData();
    }
  }, [isAuthenticated, user]);
  
  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {user?.username}! Manage your auctions and bids.
            </p>
          </div>
          
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                  <DollarSign size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Active Bids</h3>
                  <p className="text-gray-500">Auctions you're participating in</p>
                </div>
              </div>
              <div className="text-3xl font-bold">
                {userBids.filter(bid => bid.status === 'placed' || bid.status === 'winning').length}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-100 rounded-full mr-4">
                  <Truck size={24} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Won Auctions</h3>
                  <p className="text-gray-500">Vehicles you've successfully bid on</p>
                </div>
              </div>
              <div className="text-3xl font-bold">
                {wonAuctions.length}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-amber-100 rounded-full mr-4">
                  <Clock size={24} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Watching</h3>
                  <p className="text-gray-500">Auctions you're interested in</p>
                </div>
              </div>
              <div className="text-3xl font-bold">
                {watchedAuctions.length}
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('bids')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'bids'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Bids
                </button>
                <button
                  onClick={() => setActiveTab('won')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'won'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Won Auctions
                </button>
                <button
                  onClick={() => setActiveTab('watching')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'watching'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Watching
                </button>
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start">
                  <AlertCircle size={20} className="mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Error loading data</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}
              
              {isDataLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : (
                <>
                  {activeTab === 'bids' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Your Bids</h3>
                      
                      {userBids.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Auction
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Your Bid
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Current Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  End Time
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {userBids.map((bid) => (
                                <tr key={bid.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <a href={`/auctions/${bid.auctionId}`} className="text-blue-600 hover:text-blue-800">
                                      Auction #{bid.auctionId.slice(0, 8)}
                                    </a>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                                    ${bid.amount.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    ${bid.amount.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      bid.status === 'winning' ? 'bg-green-100 text-green-800' :
                                      bid.status === 'outbid' ? 'bg-red-100 text-red-800' :
                                      bid.status === 'placed' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {toJSDate(bid.timestamp)?.toLocaleString() || 'N/A'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>You haven't placed any bids yet.</p>
                          <a 
                            href="/auctions" 
                            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Browse Auctions
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'won' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Won Auctions</h3>
                      
                      {wonAuctions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {wonAuctions.map((auction) => (
                            <div key={auction.id} className="border border-gray-200 rounded-lg overflow-hidden">
                              <div className="p-4">
                                <h4 className="font-semibold text-lg mb-2">
                                  <a href={`/auctions/${auction.id}`} className="text-blue-600 hover:text-blue-800">
                                    {auction.title}
                                  </a>
                                </h4>
                                <div className="flex justify-between mb-2">
                                  <span className="text-gray-600">Final Price:</span>
                                  <span className="font-medium">${auction.currentPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                  <span className="text-gray-600">End Date:</span>
                                  <span>{toJSDate(auction.endTime)?.toLocaleDateString() || 'N/A'}</span>
                                </div>
                                <div className="mt-4">
                                  <a 
                                    href={`/auctions/${auction.id}`}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  >
                                    View Details
                                  </a>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>You haven't won any auctions yet.</p>
                          <a 
                            href="/auctions" 
                            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Browse Auctions
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'watching' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Watched Auctions</h3>
                      
                      {watchedAuctions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {watchedAuctions.map((auction) => (
                            <div key={auction.id} className="border border-gray-200 rounded-lg overflow-hidden">
                              <div className="p-4">
                                <h4 className="font-semibold text-lg mb-2">
                                  <a href={`/auctions/${auction.id}`} className="text-blue-600 hover:text-blue-800">
                                    {auction.title}
                                  </a>
                                </h4>
                                <div className="flex justify-between mb-2">
                                  <span className="text-gray-600">Current Price:</span>
                                  <span className="font-medium">${auction.currentPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                  <span className="text-gray-600">End Date:</span>
                                  <span>{toJSDate(auction.endTime)?.toLocaleDateString() || 'N/A'}</span>
                                </div>
                                <div className="mt-4 flex justify-between">
                                  <a 
                                    href={`/auctions/${auction.id}`}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  >
                                    View Details
                                  </a>
                                  <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                                    Remove Watch
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>You're not watching any auctions.</p>
                          <a 
                            href="/auctions" 
                            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Browse Auctions
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
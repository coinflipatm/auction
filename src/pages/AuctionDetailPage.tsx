import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuctionStore } from '../store/auctionStore';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/layout/Layout';
import VehicleDetails from '../components/auctions/VehicleDetails';
import BidForm from '../components/auctions/BidForm';
import BidHistory from '../components/auctions/BidHistory';
import { Clock, DollarSign, User, Eye, AlertTriangle, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AUCTION_REFRESH_INTERVAL } from '../config';
import websocketService from '../services/websocketService';
import { toJSDate } from '../utils/dateUtils';

const AuctionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentAuction, fetchAuctionById, isLoading, error, watchAuction, unwatchAuction } = useAuctionStore();
  const { user } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isWatching, setIsWatching] = useState<boolean>(false);
  const [watchLoading, setWatchLoading] = useState<boolean>(false);
  
  useEffect(() => {
    if (id) {
      fetchAuctionById(id);
      
      // Set up polling for real-time updates
      const intervalId = setInterval(() => {
        fetchAuctionById(id);
      }, AUCTION_REFRESH_INTERVAL);
      
      return () => clearInterval(intervalId);
    }
  }, [id, fetchAuctionById]);
  
  useEffect(() => {
    if (currentAuction) {
      const updateTimeLeft = () => {
        const endDate = toJSDate(currentAuction.endTime);
        if (!endDate) return;
        
        const now = new Date();
        
        if (now > endDate) {
          setTimeLeft('Auction ended');
          return;
        }
        
        setTimeLeft(formatDistanceToNow(endDate, { addSuffix: true }));
      };
      
      updateTimeLeft();
      const timerId = setInterval(updateTimeLeft, 1000);
      
      return () => clearInterval(timerId);
    }
  }, [currentAuction]);
  
  // Connect to WebSocket for real-time updates
  useEffect(() => {
    if (id) {
      websocketService.connect();
      
      // Subscribe to auction updates
      const unsubscribe = websocketService.subscribe('auction_update', (data) => {
        if (data.auctionId === id) {
          // Refresh auction data
          fetchAuctionById(id);
        }
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, [id, fetchAuctionById]);
  
  const handleToggleWatch = async () => {
    if (!id || !user) return;
    
    setWatchLoading(true);
    
    try {
      if (isWatching) {
        await unwatchAuction(id);
        setIsWatching(false);
      } else {
        await watchAuction(id);
        setIsWatching(true);
      }
    } catch (error) {
      console.error('Error toggling watch status:', error);
    } finally {
      setWatchLoading(false);
    }
  };
  
  if (isLoading && !currentAuction) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              
              <div>
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
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
      </Layout>
    );
  }
  
  if (!currentAuction) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
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
      </Layout>
    );
  }
  
  const { title, description, currentPrice, startingPrice, bids, viewCount, vehicle, status, endTime } = currentAuction;
  const isActive = status === 'active';
  const isEnded = status === 'ended';
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <div className="flex flex-wrap gap-4 text-gray-600">
                <div className="flex items-center">
                  <Clock size={18} className="mr-1" />
                  <span>{timeLeft}</span>
                </div>
                <div className="flex items-center">
                  <Eye size={18} className="mr-1" />
                  <span>{viewCount} views</span>
                </div>
                <div className="flex items-center">
                  <User size={18} className="mr-1" />
                  <span>{bids.length} bids</span>
                </div>
              </div>
            </div>
            
            {user && (
              <button
                onClick={handleToggleWatch}
                disabled={watchLoading}
                className={`flex items-center px-4 py-2 rounded-md ${
                  isWatching 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart size={18} className={`mr-2 ${isWatching ? 'fill-red-500 text-red-500' : ''}`} />
                {isWatching ? 'Watching' : 'Watch'}
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Vehicle Details */}
          <div className="lg:col-span-2">
            {vehicle && <VehicleDetails vehicle={vehicle} />}
            
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Auction Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{description}</p>
            </div>
          </div>
          
          {/* Right Column - Bidding Area */}
          <div>
            {/* Current Price Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Current Price</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isActive ? 'bg-green-100 text-green-800' : 
                  isEnded ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {isActive ? 'Active' : isEnded ? 'Ended' : 'Scheduled'}
                </span>
              </div>
              
              <div className="text-3xl font-bold text-green-600 flex items-center mb-2">
                <DollarSign size={24} />
                <span>{currentPrice.toLocaleString()}</span>
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                Started at ${startingPrice.toLocaleString()}
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                <div className="flex justify-between mb-1">
                  <span>Auction ends:</span>
                  <span>{toJSDate(endTime)?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ 
                    width: `${Math.min(100, Math.max(0, 
                      100 - ((toJSDate(endTime)?.getTime() || 0) - new Date().getTime()) / 
                      Math.max(1, ((toJSDate(endTime)?.getTime() || 0) - (toJSDate(currentAuction.startTime)?.getTime() || 0)))
                      * 100
                    ))}%` 
                  }}
                ></div>
                </div>
              </div>
              
              {isActive && <BidForm auction={currentAuction} />}
              
              {isEnded && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-gray-700 mb-2">This auction has ended</p>
                  {currentAuction.winningBidId ? (
                    <p className="font-semibold text-green-600">Sold for ${currentPrice.toLocaleString()}</p>
                  ) : (
                    <p className="font-semibold text-amber-600">No winning bid</p>
                  )}
                </div>
               )}
            </div>
            
            {/* Bid History */}
            <BidHistory 
              bids={bids} 
              auctionId={currentAuction.id}
              currentUserId={user?.id}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuctionDetailPage;
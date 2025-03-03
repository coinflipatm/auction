import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAuctionStore } from '../../store/auctionStore';
import { Auction } from '../../types';
import { DollarSign, AlertCircle, Clock } from 'lucide-react';
import websocketService from '../../services/websocketService';
import { toJSDate } from '../../utils/dateUtils';
import { formatDistanceToNow } from 'date-fns'; // Missing import

interface BidFormProps {
  auction: Auction;
  onBidPlaced?: () => void;
}

const BidForm: React.FC<BidFormProps> = ({ auction, onBidPlaced }) => {
  const { isAuthenticated, user } = useAuthStore();
  const { createBid, isLoading, error } = useAuctionStore();
  const [bidAmount, setBidAmount] = useState<number>(
    auction.currentPrice + auction.incrementAmount
  );
  const [bidError, setBidError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isEnding, setIsEnding] = useState<boolean>(false);
  
  // Update bid amount when current price changes
  useEffect(() => {
    setBidAmount(auction.currentPrice + auction.incrementAmount);
  }, [auction.currentPrice, auction.incrementAmount]);
  
  // Calculate time left
  useEffect(() => {
    const updateTimeLeft = () => {
      // Convert auction end time to JS Date
      const endTime = toJSDate(auction.endTime) || new Date();
      const now = new Date();
      
      if (now >= endTime) {
        setTimeLeft('Auction ended');
        return;
      }
      
      const diff = endTime.getTime() - now.getTime();
      
      // Format time left
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      let timeString = '';
      if (days > 0) {
        timeString = `${days}d ${hours}h ${minutes}m`;
      } else if (hours > 0) {
        timeString = `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        timeString = `${minutes}m ${seconds}s`;
      } else {
        timeString = `${seconds}s`;
      }
      
      setTimeLeft(timeString);
      
      // Set isEnding flag if less than 5 minutes left
      setIsEnding(diff < 5 * 60 * 1000);
    };
    
    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, [auction.endTime]);
  
  // Subscribe to real-time bid updates
  useEffect(() => {
    // Connect to WebSocket when component mounts
    websocketService.connect();
    
    // Subscribe to bid updates for this auction
    const unsubscribe = websocketService.subscribe('bid_update', (data) => {
      if (data.auctionId === auction.id) {
        // The auction store will handle the update
        console.log('Received bid update:', data);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [auction.id]);

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setBidAmount(value);
    
    // Clear previous errors
    setBidError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate bid amount
    if (bidAmount <= auction.currentPrice) {
      setBidError(`Bid must be higher than current price: $${auction.currentPrice}`);
      return;
    }
    
    if (bidAmount < auction.currentPrice + auction.incrementAmount) {
      setBidError(`Minimum bid increment is $${auction.incrementAmount}`);
      return;
    }
    
    const success = await createBid(auction.id, bidAmount);
    
    if (success && onBidPlaced) {
      onBidPlaced();
      
      // Send bid notification via WebSocket
      websocketService.send('place_bid', {
        auctionId: auction.id,
        amount: bidAmount,
        bidderId: user?.id
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-800 mb-3">
          You need to be logged in to place a bid
        </p>
        <a 
          href="/login" 
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Login to Bid
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">Place Your Bid</h3>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Current Price:</span>
          <span className="font-semibold">${auction.currentPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Minimum Bid:</span>
          <span className="font-semibold">
            ${(auction.currentPrice + auction.incrementAmount).toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* Time Left */}
      <div className={`mb-4 p-3 rounded-md flex items-center ${
        isEnding ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
      }`}>
        <Clock size={16} className="mr-2" />
        <div>
          <span className="font-medium">Time Left: </span>
          <span>{timeLeft}</span>
        </div>
      </div>
      
      {(error || bidError) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-start">
          <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{bidError || error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Your Bid Amount ($)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign size={16} className="text-gray-500" />
            </div>
            <input
              type="number"
              id="bidAmount"
              value={bidAmount}
              onChange={handleBidChange}
              min={auction.currentPrice + auction.incrementAmount}
              step={auction.incrementAmount}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Processing...' : 'Place Bid'}
        </button>
      </form>
      
      <div className="mt-4 text-xs text-gray-500">
        By placing a bid, you agree to our Terms of Service and Auction Rules.
      </div>
    </div>
  );
};

export default BidForm;
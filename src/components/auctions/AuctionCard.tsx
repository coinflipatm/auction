import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, DollarSign, MapPin } from 'lucide-react';
import { Auction } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { DEFAULT_VEHICLE_IMAGE } from '../../config';
import { toJSDate } from '../../utils/dateUtils';

interface AuctionCardProps {
  auction: Auction;
}

const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
  const { id, title, currentPrice, endTime, vehicle } = auction;
  
  const mainImage = vehicle?.images?.[0] || DEFAULT_VEHICLE_IMAGE;
  const timeLeft = formatDistanceToNow(toJSDate(endTime) || new Date(), { addSuffix: true });
  const location = vehicle?.location ? `${vehicle.location.city}, ${vehicle.location.state}` : 'Unknown location';
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg">
      <Link to={`/auctions/${id}`}>
        <div className="relative h-48 overflow-hidden">
          <img 
            src={mainImage} 
            alt={title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <div className="flex items-center text-white">
              <MapPin size={16} className="mr-1" />
              <span className="text-sm">{location}</span>
            </div>
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/auctions/${id}`}>
          <h3 className="text-lg font-semibold mb-2 hover:text-blue-600 transition-colors">
            {title}
          </h3>
        </Link>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center text-gray-600">
            <Clock size={16} className="mr-1" />
            <span className="text-sm">{timeLeft}</span>
          </div>
          <div className="flex items-center font-semibold text-green-600">
            <DollarSign size={16} />
            <span>{currentPrice.toLocaleString('en-US')}</span>
          </div>
        </div>
        
        <div className="mt-4">
          <Link 
            to={`/auctions/${id}`} 
            className="block w-full py-2 text-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;
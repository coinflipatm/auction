import React from 'react';
import { Bid } from '../../types';
import { Timestamp } from 'firebase/firestore';

// In BidHistory.tsx
interface BidHistoryProps {
  bids: Bid[];
  auctionId: string;  // Add this property
  currentUserId?: string;
}

const formatDate = (timestamp: string | Timestamp): string => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toLocaleString();
  }
  return new Date(timestamp).toLocaleString();
};

const BidHistory: React.FC<BidHistoryProps> = ({ bids }) => {
  // Sort bids by timestamp (newest first)
  const sortedBids = [...bids].sort((a, b) => {
    const timeA = a.timestamp instanceof Timestamp ? a.timestamp.toMillis() : new Date(a.timestamp).getTime();
    const timeB = b.timestamp instanceof Timestamp ? b.timestamp.toMillis() : new Date(b.timestamp).getTime();
    return timeB - timeA;
  });

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">Bid History</h3>
      </div>
      {sortedBids.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {sortedBids.map((bid) => (
            <li key={bid.id} className="px-4 py-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    ${bid.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {bid.bidder?.username || bid.bidderId.substring(0, 6)}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(bid.timestamp)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-4 py-6 text-center text-sm text-gray-500">
          No bids have been placed yet.
        </div>
      )}
    </div>
  );
};

export default BidHistory;
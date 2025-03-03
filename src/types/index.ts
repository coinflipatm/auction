// src/types/index.ts
import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'bidder' | 'seller';
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
  startTime: string | Timestamp;
  endTime: string | Timestamp;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isVerified?: boolean;
  walletAddress?: string;
  watchedAuctions?: string[];
}

export interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  mileage: number;
  condition: string;
  description: string;
  images: string[];
  location: {
    city: string;
    state: string;
    zip: string;
  };
  towDate: string | Timestamp;
  lotNumber?: string;
  features: string[];
  damages: string[];
  estimatedValue: number;
  source: 'towbook' | 'manual';
  sourceId?: string;
  metadata: Record<string, any>;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidder?: User;
  amount: number;
  timestamp: string | Timestamp;
  status: 'placed' | 'winning' | 'outbid' | 'cancelled' | 'rejected';
  signature?: string;
  transactionHash?: string;
  metadata?: Record<string, any>;
}

export interface Auction {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle;
  title: string;
  description: string;
  startingPrice: number;
  currentPrice: number;
  reservePrice?: number;
  incrementAmount: number;
  startTime: string | Timestamp;
  endTime: string | Timestamp;
  status: 'draft' | 'scheduled' | 'active' | 'ended' | 'cancelled';
  winningBidId?: string;
  winningBidderId?: string;
  bids: Bid[];
  viewCount: number;
  createdBy: string;
  signature?: string;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
  images?: string[];
  featured?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  username: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface VerificationDocument {
  id: string;
  userId: string;
  type: 'drivers_license' | 'passport' | 'id_card' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  documentUrl: string;
  notes?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'bid_placed' | 'outbid' | 'auction_won' | 'auction_ending' | 'payment_received' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  auctionId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'credit_card' | 'bank_transfer';
  cardDetails?: {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
  };
  transactionId?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}
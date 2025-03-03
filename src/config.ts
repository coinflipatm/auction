// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Application Configuration
export const APP_NAME = 'TowBid';
export const APP_DESCRIPTION = 'Specialized auction platform for tow vehicles';

// Feature Flags
export const FEATURES = {
  WEB3_ENABLED: false, // Set to true when implementing Web3 features
  REAL_TIME_BIDDING: true,
  IMAGE_GALLERY: true,
};

// Time Configuration (in milliseconds)
export const AUCTION_REFRESH_INTERVAL = 10000; // 10 seconds
export const SESSION_TIMEOUT = 3600000; // 1 hour

// Pagination
export const DEFAULT_PAGE_SIZE = 10;

// Image Configuration
export const DEFAULT_VEHICLE_IMAGE = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
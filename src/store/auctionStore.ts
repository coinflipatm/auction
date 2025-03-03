import { create } from 'zustand';
import { Auction,} from '../types';
import { 
  fetchAllAuctions, 
  fetchFeaturedAuctions, 
  fetchAuctionById, 
  placeBid,
  watchAuction,
  unwatchAuction,
  getWatchedAuctions
} from '../services/auctionService';
import { useAuthStore } from './authStore';

interface AuctionState {
  auctions: Auction[];
  featuredAuctions: Auction[];
  currentAuction: Auction | null;
  watchedAuctions: Auction[];
  isLoading: boolean;
  error: string | null;
}

interface AuctionStore extends AuctionState {
  fetchAuctions: () => Promise<void>;
  fetchFeaturedAuctions: () => Promise<void>;
  fetchAuctionById: (id: string) => Promise<void>;
  createBid: (auctionId: string, amount: number) => Promise<boolean>;
  watchAuction: (auctionId: string) => Promise<boolean>;
  unwatchAuction: (auctionId: string) => Promise<boolean>;
  fetchWatchedAuctions: () => Promise<void>;
  clearError: () => void;
}

export const useAuctionStore = create<AuctionStore>((set, get) => ({
  auctions: [],
  featuredAuctions: [],
  currentAuction: null,
  watchedAuctions: [],
  isLoading: false,
  error: null,

  fetchAuctions: async () => {
    set({ isLoading: true, error: null });
    try {
      const auctions = await fetchAllAuctions();
      set({ auctions, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to fetch auctions', 
        isLoading: false 
      });
    }
  },

  fetchFeaturedAuctions: async () => {
    set({ isLoading: true, error: null });
    try {
      const featuredAuctions = await fetchFeaturedAuctions();
      set({ featuredAuctions, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to fetch featured auctions', 
        isLoading: false 
      });
    }
  },

  fetchAuctionById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const auction = await fetchAuctionById(id);
      set({ currentAuction: auction, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to fetch auction', 
        isLoading: false 
      });
    }
  },

  createBid: async (auctionId: string, amount: number) => {
    set({ isLoading: true, error: null });
    try {
      // Get the current user ID from your auth store
      const authStore = useAuthStore.getState();
      const userId = authStore.user?.id;
      
      if (!userId) {
        throw new Error('You must be logged in to place a bid');
      }
      
      // Pass the userId as the third parameter
      const bid = await placeBid(auctionId, amount, userId);
      
      // Update the current auction with the new bid
      const currentAuction = get().currentAuction;
      if (currentAuction && currentAuction.id === auctionId) {
        const updatedAuction = {
          ...currentAuction,
          currentPrice: amount,
          bids: [...currentAuction.bids, bid]
        };
        set({ currentAuction: updatedAuction });
      }
      
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to place bid', 
        isLoading: false 
      });
      return false;
    }
  },

  watchAuction: async (auctionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const authStore = useAuthStore.getState();
      const userId = authStore.user?.id;
      
      if (!userId) {
        throw new Error('You must be logged in to watch auctions');
      }
      
      await watchAuction(userId, auctionId);
      await get().fetchWatchedAuctions();
      
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to watch auction', 
        isLoading: false 
      });
      return false;
    }
  },

  unwatchAuction: async (auctionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const authStore = useAuthStore.getState();
      const userId = authStore.user?.id;
      
      if (!userId) {
        throw new Error('You must be logged in to watch auctions');
      }
      
      await unwatchAuction(userId, auctionId);
      await get().fetchWatchedAuctions();
      
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to watch auction', 
        isLoading: false 
      });
      return false;
    }
  },

  fetchWatchedAuctions: async () => {
    set({ isLoading: true, error: null });
    try {
      const authStore = useAuthStore.getState();
      const userId = authStore.user?.id;
      
      if (!userId) {
        set({ watchedAuctions: [], isLoading: false });
        return;
      }
      
      const watchedAuctions = await getWatchedAuctions(userId);
      set({ watchedAuctions, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch watched auctions', 
        isLoading: false 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));
import { db, storage } from '../firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  query, 
  where,
  orderBy,
  Timestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
  DocumentData,
  CollectionReference,
  Query,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Auction, Bid } from '../types';

interface AuctionFilters {
  status?: string;
}

// Helper function to safely convert Firestore data to our app types
const convertTimestampFields = (data: DocumentData): any => {
  const result = { ...data };
  
  // Convert Timestamp fields to Date objects
  if (result.startTime instanceof Timestamp) {
    result.startTime = result.startTime;
  }
  
  if (result.endTime instanceof Timestamp) {
    result.endTime = result.endTime;
  }
  
  if (result.createdAt instanceof Timestamp) {
    result.createdAt = result.createdAt;
  }
  
  if (result.updatedAt instanceof Timestamp) {
    result.updatedAt = result.updatedAt;
  }
  
  return result;
};

export const watchAuction = async (userId: string, auctionId: string): Promise<{ success: boolean }> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      watchedAuctions: arrayUnion(auctionId)
    });
    return { success: true };
  } catch (error) {
    console.error('Error watching auction:', error);
    throw error;
  }
};

export const unwatchAuction = async (userId: string, auctionId: string): Promise<{ success: boolean }> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      watchedAuctions: arrayRemove(auctionId)
    });
    return { success: true };
  } catch (error) {
    console.error('Error unwatching auction:', error);
    throw error;
  }
};

export const getWatchedAuctions = async (userId: string): Promise<Auction[]> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    const watchedAuctionIds = userData.watchedAuctions || [];
    
    if (watchedAuctionIds.length === 0) {
      return [];
    }
    
    // Get all watched auctions
    const auctionsQuery = query(
      collection(db, 'auctions') as CollectionReference<DocumentData>,
      where('__name__', 'in', watchedAuctionIds)
    );
    
    const auctionsSnapshot = await getDocs(auctionsQuery);
    return auctionsSnapshot.docs.map(doc => {
      const data = convertTimestampFields(doc.data());
      return {
        id: doc.id,
        ...data,
        bids: data.bids || []
      } as Auction;
    });
  } catch (error) {
    console.error('Error getting watched auctions:', error);
    throw error;
  }
};

export const getAuctions = async (filters: AuctionFilters = {}): Promise<Auction[]> => {
  let auctionsRef = collection(db, 'auctions') as CollectionReference<DocumentData>;
  let auctionsQuery: Query<DocumentData> = auctionsRef;
  
  // Apply filters if provided
  if (filters.status) {
    auctionsQuery = query(auctionsRef, where('status', '==', filters.status));
  }
  
  auctionsQuery = query(auctionsQuery, orderBy('endTime', 'desc'));
  
  const snapshot = await getDocs(auctionsQuery);
  return snapshot.docs.map(doc => {
    const data = convertTimestampFields(doc.data());
    return {
      id: doc.id,
      ...data,
      bids: data.bids || []
    } as Auction;
  });
};

export const getAuctionById = async (auctionId: string): Promise<Auction> => {
  const docRef = doc(db, 'auctions', auctionId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error('Auction not found');
  }
  
  const data = convertTimestampFields(docSnap.data());
  return {
    id: docSnap.id,
    ...data,
    bids: data.bids || []
  } as Auction;
};

export const createAuction = async (auctionData: Partial<Auction>, images: File[] = []): Promise<Auction> => {
  try {
    // Upload images first
    const imageUrls = [];
    
    for (const image of images) {
      const storageRef = ref(storage, `auctions/${Date.now()}-${image.name}`);
      const uploadResult = await uploadBytes(storageRef, image);
      const imageUrl = await getDownloadURL(uploadResult.ref);
      imageUrls.push(imageUrl);
    }
    
    // Create a base auction with required fields
    const baseAuction = {
      title: auctionData.title || '',
      description: auctionData.description || '',
      vehicleId: auctionData.vehicleId || '',
      startingPrice: auctionData.startingPrice || 0,
      currentPrice: auctionData.startingPrice || 0,
      incrementAmount: auctionData.incrementAmount || 0,
      status: auctionData.status || 'draft',
      viewCount: 0,
      bids: [],
      createdBy: auctionData.createdBy || '',
      images: imageUrls
    };
    
    // Convert dates to Firestore timestamps
    const auctionWithDates = {
      ...baseAuction,
      ...auctionData,
      startTime: auctionData.startTime ? 
        (auctionData.startTime instanceof Timestamp ? 
          auctionData.startTime : 
          Timestamp.fromDate(new Date(auctionData.startTime))) : 
        Timestamp.fromDate(new Date()),
      endTime: auctionData.endTime ? 
        (auctionData.endTime instanceof Timestamp ? 
          auctionData.endTime : 
          Timestamp.fromDate(new Date(auctionData.endTime))) : 
        Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };
    
    const docRef = await addDoc(collection(db, 'auctions'), auctionWithDates);
    return { id: docRef.id, ...auctionWithDates } as Auction;
  } catch (error) {
    console.error('Error creating auction:', error);
    throw error;
  }
};

// Make fetchAllAuctions an alias for getAuctions
export const fetchAllAuctions = getAuctions;

// Fetch featured auctions
export const fetchFeaturedAuctions = async (): Promise<Auction[]> => {
  const auctionsRef = collection(db, 'auctions') as CollectionReference<DocumentData>;
  const auctionsQuery = query(auctionsRef, where('featured', '==', true));
  
  const snapshot = await getDocs(auctionsQuery);
  return snapshot.docs.map(doc => {
    const data = convertTimestampFields(doc.data());
    return {
      id: doc.id,
      ...data,
      bids: data.bids || []
    } as Auction;
  });
};

// Alias for getAuctionById
export const fetchAuctionById = getAuctionById;

// Place a bid on an auction
export const placeBid = async (auctionId: string, bidAmount: number, userId: string): Promise<Bid> => {
  try {
    const bidData = {
      auctionId,
      bidderId: userId,
      amount: bidAmount,
      timestamp: Timestamp.fromDate(new Date()),
      status: 'placed' as const
    };
    
    const bidRef = await addDoc(collection(db, 'bids'), bidData);
    
    // Update auction's current price
    const auctionRef = doc(db, 'auctions', auctionId);
    await updateDoc(auctionRef, {
      currentPrice: bidAmount,
      bids: arrayUnion({ id: bidRef.id, ...bidData })
    });
    
    return { id: bidRef.id, ...bidData } as Bid;
  } catch (error) {
    console.error('Error placing bid:', error);
    throw error;
  }
};

// Update an auction
export const updateAuction = async (auctionId: string, auctionData: Partial<Auction>): Promise<Auction> => {
  try {
    const auctionRef = doc(db, 'auctions', auctionId);
    
    // Clone data to avoid modifying the original
    const updatedData: Record<string, any> = { ...auctionData };
    
    // Update timestamp
    updatedData.updatedAt = Timestamp.fromDate(new Date());
    
    // Convert date fields to Timestamps if they exist and aren't already
    if (updatedData.startTime && !(updatedData.startTime instanceof Timestamp)) {
      updatedData.startTime = Timestamp.fromDate(
        typeof updatedData.startTime === 'string' ? 
          new Date(updatedData.startTime) : 
          updatedData.startTime
      );
    }
    
    if (updatedData.endTime && !(updatedData.endTime instanceof Timestamp)) {
      updatedData.endTime = Timestamp.fromDate(
        typeof updatedData.endTime === 'string' ? 
          new Date(updatedData.endTime) : 
          updatedData.endTime
      );
    }
    
    await updateDoc(auctionRef, updatedData);
    return getAuctionById(auctionId);
  } catch (error) {
    console.error('Error updating auction:', error);
    throw error;
  }
};

// Upload vehicle images
export const uploadVehicleImages = async (vehicleId: string, images: File[]): Promise<string[]> => {
  try {
    const imageUrls = [];
    
    for (const image of images) {
      const storageRef = ref(storage, `vehicles/${vehicleId}/${Date.now()}-${image.name}`);
      const uploadResult = await uploadBytes(storageRef, image);
      const imageUrl = await getDownloadURL(uploadResult.ref);
      imageUrls.push(imageUrl);
    }
    
    // Update vehicle document with new images
    if (vehicleId) {
      const vehicleRef = doc(db, 'vehicles', vehicleId);
      await updateDoc(vehicleRef, {
        images: arrayUnion(...imageUrls)
      });
    }
    
    return imageUrls;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

// Real-time subscription to auction updates
export const subscribeToAuction = (auctionId: string, callback: (auction: Auction) => void) => {
  const auctionRef = doc(db, "auctions", auctionId);
  return onSnapshot(auctionRef, (doc) => {
    if (doc.exists()) {
      const data = convertTimestampFields(doc.data());
      callback({
        id: doc.id,
        ...data,
        bids: data.bids || []
      } as Auction);
    }
  });
};
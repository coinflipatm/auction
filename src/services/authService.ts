import { jwtDecode } from 'jwt-decode';
import { LoginCredentials, RegisterData, User } from '../types';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

import { db } from '../firebase';

// Parse JWT token to get user data
const parseJwt = (token: string): User | null => {
  try {
    return jwtDecode<User>(token);
  } catch (e) {
    return null;
  }
};

// Login user
export const loginUser = async (credentials: LoginCredentials) => {
  try {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      credentials.email, 
      credentials.password
    );
    
    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};
    
    // Create a mock token for now (replace with actual Firebase auth token)
    const mockToken = 'firebase-auth-token';
    localStorage.setItem('token', mockToken);
    
    return { 
      user: {
        id: userCredential.user.uid,
        email: userCredential.user.email || '',
        username: userData.username || credentials.email.split('@')[0],
        role: userData.role || 'bidder',
        createdAt: userData.createdAt || new Date().toISOString(),
        updatedAt: userData.updatedAt || new Date().toISOString()
      }, 
      token: mockToken 
    };
  } catch (error) {
    throw error;
  }
};

// Register new user
export const registerUser = async (data: RegisterData) => {
  try {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      data.email, 
      data.password
    );
    
    // Store additional user data in Firestore
    const userRef = doc(db, "users", userCredential.user.uid);
    await setDoc(userRef, {
      username: data.username,
      email: data.email,
      role: 'bidder',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Create a mock token for now (replace with actual Firebase auth token)
    const mockToken = 'firebase-auth-token';
    localStorage.setItem('token', mockToken);
    
    return { 
      user: {
        id: userCredential.user.uid,
        username: data.username,
        email: data.email,
        role: 'bidder',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, 
      token: mockToken 
    };
  } catch (error) {
    throw error;
  }
};

// Verify token
export const verifyToken = async () => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User not found in database');
    }
    
    const userData = userDoc.data();
    
    return { 
      user: {
        id: currentUser.uid,
        email: currentUser.email || '',
        username: userData.username || '',
        role: userData.role || 'bidder',
        createdAt: userData.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        updatedAt: userData.updatedAt?.toDate?.().toISOString() || new Date().toISOString()
      }
    };
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    const auth = getAuth();
    await auth.signOut();
    
    // Remove tokens from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Update user profile
export const updateProfile = async (userId: string, profileData: Partial<User>) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    });
    
    const updatedUser = await getDoc(userRef);
    return updatedUser.data();
  } catch (error) {
    throw error;
  }
};

// Change password
// Change password function
export const changePassword = async (userId: string, data: { currentPassword: string; newPassword: string }): Promise<{ success: boolean }> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user || !user.email) {
      throw new Error('No authenticated user');
    }
    
    // Re-authenticate user with current password for security
    const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, data.newPassword);
    
    return { success: true };
  } catch (error: any) {
    console.error('Password change error:', error);
    if (error.code === 'auth/wrong-password') {
      throw new Error('Current password is incorrect');
    }
    throw error;
  }
};

// Request password reset
export const requestPasswordReset = async (email: string) => {
  try {
    const auth = getAuth();
    // This would use Firebase's sendPasswordResetEmail function
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Reset password with token
export const resetPassword = async (token: string, newPassword: string) => {
  try {
    // This would use Firebase's confirmPasswordReset function
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Verify user identity
export const submitIdentityVerification = async (userId: string, documentType: string, documentFile: File) => {
  try {
    // This would upload the file to Firebase Storage and update user verification status
    return { 
      status: 'pending',
      message: 'Your verification has been submitted and is pending review.'
    };
  } catch (error) {
    throw error;
  }
};

// Get verification status
export const getVerificationStatus = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    
    return { 
      status: userData.verificationStatus || 'none',
      message: userData.verificationMessage || 'No verification has been submitted yet.'
    };
  } catch (error) {
    throw error;
  }
};
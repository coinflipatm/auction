import { create } from 'zustand';
import { AuthState, LoginCredentials, RegisterData, User } from '../types';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUserProfile: (profileData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

// Change password function
export const changePassword = async (
  userId: string, 
  data: { currentPassword: string; newPassword: string }
): Promise<{ success: boolean }> => {
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

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      // For demo purposes, simulate a successful login
      const mockUser: User = {
        id: '123',
        username: credentials.email.split('@')[0],
        email: credentials.email,
        role: 'bidder',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        firstName: '',
        lastName: '',
        phone: '',
        isVerified: false,
        walletAddress: '',
        watchedAuctions: []
      };
      
      const mockToken = 'mock-jwt-token';
      localStorage.setItem('token', mockToken);
      
      set({ 
        user: mockUser, 
        token: mockToken, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Login failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      // For demo purposes, simulate a successful registration
      const mockUser: User = {
        id: '123',
        username: data.username,
        email: data.email,
        role: 'bidder',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        firstName: '',
        lastName: '',
        phone: '',
        isVerified: false,
        walletAddress: '',
        watchedAuctions: []
      };
      
      const mockToken = 'mock-jwt-token';
      localStorage.setItem('token', mockToken);
      
      set({ 
        user: mockUser, 
        token: mockToken, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Registration failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    const token = localStorage.getItem('token');
    
    if (!token) {
      set({ isAuthenticated: false, isLoading: false });
      return;
    }
    
    try {
      // For demo purposes, simulate a successful auth check
      const mockUser: User = {
        id: '123',
        username: 'demouser',
        email: 'demo@example.com',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        firstName: 'Demo',
        lastName: 'User',
        phone: '',
        isVerified: true,
        walletAddress: '',
        watchedAuctions: []
      };
      
      set({ user: mockUser, token, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: error.response?.data?.message || error.message || 'Authentication failed'
      });
    }
  },

  updateUserProfile: async (profileData: Partial<User>) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = get();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // For demo purposes, simulate a successful profile update
      const updatedUser: User = {
        ...user,
        ...profileData,
        updatedAt: new Date().toISOString()
      };
      
      set({ user: updatedUser, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Profile update failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));
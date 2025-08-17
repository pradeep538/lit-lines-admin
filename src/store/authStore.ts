import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, signOut } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { adminApi } from '@/services/api';

// Whitelist of email addresses that can access the admin panel
const ADMIN_EMAIL_WHITELIST = [
  'pradeepmr538@gmail.com',
  'test@example.com', // Test email for local testing
  // Add more admin emails here
];

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

interface AuthState {
  user: User | null;
  userData: UserData | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  isRestored: boolean; // Flag to prevent multiple restorations
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  checkAdminAccess: (email: string) => boolean;
  validateAdminAccess: () => Promise<boolean>;
  restoreAuthState: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      userData: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      error: null,
      isRestored: false,
      
      setUser: (user: User | null) => {
        if (user) {
          const userData: UserData = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || undefined,
            photoURL: user.photoURL || undefined,
          };
          set({
            user,
            userData,
            isAuthenticated: true,
            isAdmin: false, // Will be validated with backend
            error: null,
            isRestored: true, // Mark as restored when user is set
          });
        } else {
          set({
            user: null,
            userData: null,
            isAuthenticated: false,
            isAdmin: false,
            error: null,
            isRestored: false,
          });
        }
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      setError: (error: string | null) => {
        set({ error });
      },
      
      logout: async () => {
        try {
          // Sign out from Firebase
          await signOut(auth);
          
          // Clear local state
          set({
            user: null,
            userData: null,
            isAuthenticated: false,
            isAdmin: false,
            error: null,
            isRestored: false,
          });
        } catch (error) {
          console.error('Logout error:', error);
          // Even if Firebase logout fails, clear local state
          set({
            user: null,
            userData: null,
            isAuthenticated: false,
            isAdmin: false,
            error: null,
            isRestored: false,
          });
        }
      },
      
      checkAdminAccess: (email: string) => {
        return ADMIN_EMAIL_WHITELIST.includes(email.toLowerCase());
      },
      
      validateAdminAccess: async () => {
        try {
          console.log('Starting admin validation...');
          
          const response = await adminApi.validateAccess();
          console.log('Admin validation response:', response);
          const isAdmin = (response as any)?.isAdmin || false;
          console.log('Setting isAdmin to:', isAdmin);
          set({ isAdmin });
          return isAdmin;
        } catch (error: any) {
          console.error('Failed to validate admin access:', error);
          console.error('Error details:', {
            message: error?.message,
            status: error?.response?.status,
            data: error?.response?.data,
            config: error?.config
          });
          
          // If it's a 401 error, don't set isAdmin to false immediately
          // This might be a temporary issue with token refresh
          if (error?.response?.status === 401) {
            console.log('401 error during admin validation - will retry later');
            return false;
          }
          
          set({ isAdmin: false });
          return false;
        }
      },
      
      // Method to restore authentication state from persisted data
      restoreAuthState: async () => {
        const state = get();
        if (state.userData && state.isAuthenticated && !state.isRestored) {
          console.log('Restoring auth state from persisted data:', state.userData);
          // The Firebase auth state will be restored by the AuthProvider
          // We just need to validate admin access if not already validated
          if (!state.isAdmin) {
            try {
              await state.validateAdminAccess();
            } catch (error) {
              console.error('Failed to validate admin access during restore:', error);
            }
          }
          // Mark as restored to prevent multiple restorations
          set({ isRestored: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        userData: state.userData,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        isRestored: state.isRestored,
      }),
    }
  )
); 
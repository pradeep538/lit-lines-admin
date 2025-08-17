import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, signOut, getAuth } from 'firebase/auth';
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
            // Don't set isRestored here - let the restoration logic handle it
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
          
          // If it's a 401 error, try to refresh the token and retry once
          if (error?.response?.status === 401) {
            console.log('401 error during admin validation - attempting token refresh...');
            try {
              // Force token refresh
              const auth = getAuth();
              const user = auth.currentUser;
              if (user) {
                await user.getIdToken(true); // Force refresh
                console.log('Token refreshed, retrying admin validation...');
                const retryResponse = await adminApi.validateAccess();
                const retryIsAdmin = (retryResponse as any)?.isAdmin || false;
                console.log('Retry admin validation response:', retryIsAdmin);
                set({ isAdmin: retryIsAdmin });
                return retryIsAdmin;
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }
            
            // If refresh fails, clear the session
            console.log('Token refresh failed, clearing session...');
            set({
              user: null,
              userData: null,
              isAuthenticated: false,
              isAdmin: false,
              isRestored: false,
              error: 'Session expired. Please log in again.'
            });
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
          
          // Set loading state during restoration
          set({ isLoading: true });
          
          try {
            // Validate admin access if not already validated
            if (!state.isAdmin) {
              console.log('Validating admin access during restoration...');
              await state.validateAdminAccess();
            }
            
            // Mark as restored to prevent multiple restorations
            set({ isRestored: true, isLoading: false });
            console.log('Auth state restoration completed successfully');
          } catch (error) {
            console.error('Failed to restore auth state:', error);
            // If restoration fails, clear the state to force re-authentication
            set({
              user: null,
              userData: null,
              isAuthenticated: false,
              isAdmin: false,
              isRestored: false,
              isLoading: false,
              error: 'Session restoration failed. Please log in again.'
            });
          }
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
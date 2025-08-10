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

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  checkAdminAccess: (email: string) => boolean;
  validateAdminAccess: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      error: null,
      
      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
          isAdmin: false, // Will be validated with backend
          error: null,
        });
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
            isAuthenticated: false,
            isAdmin: false,
            error: null,
          });
        } catch (error) {
          console.error('Logout error:', error);
          // Even if Firebase logout fails, clear local state
          set({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            error: null,
          });
        }
      },
      
      checkAdminAccess: (email: string) => {
        return ADMIN_EMAIL_WHITELIST.includes(email.toLowerCase());
      },
      
      validateAdminAccess: async () => {
        try {
          const response = await adminApi.validateAccess();
          const isAdmin = response.isAdmin;
          set({ isAdmin });
          return isAdmin;
        } catch (error) {
          console.error('Failed to validate admin access:', error);
          set({ isAdmin: false });
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
); 
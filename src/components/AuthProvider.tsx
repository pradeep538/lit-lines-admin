import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { setUser, setLoading, validateAdminAccess, userData, isAuthenticated, isRestored, restoreAuthState } = useAuthStore();

  useEffect(() => {
    console.log('AuthProvider: Setting up Firebase auth state listener');
    console.log('AuthProvider: Current persisted state:', { userData, isAuthenticated, isRestored });
    
    // Set loading to true while checking auth state
    setLoading(true);

    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        console.log('AuthProvider: Firebase auth state changed:', user?.email);
        
        if (user) {
          // User is signed in
          console.log('AuthProvider: User authenticated:', user.email);
          setUser(user);
          
          // Validate admin access
          try {
            await validateAdminAccess();
          } catch (error) {
            console.error('AuthProvider: Admin validation failed:', error);
          }
        } else {
          // User is signed out
          console.log('AuthProvider: User signed out');
          setUser(null);
        }
        
        // Set loading to false after auth state is determined
        setLoading(false);
      },
      (error) => {
        console.error('AuthProvider: Firebase auth error:', error);
        setUser(null);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      console.log('AuthProvider: Cleaning up auth listener');
      unsubscribe();
    };
  }, [setUser, setLoading, validateAdminAccess]); // Removed userData and isAuthenticated from dependencies

  // Restore authentication state from persisted data on mount (only once)
  useEffect(() => {
    // Only restore if we have persisted data and haven't restored yet
    if (userData && isAuthenticated && !isRestored) {
      console.log('AuthProvider: Restoring authentication state from persisted data');
      console.log('AuthProvider: User data:', userData);
      
      // Wait for Firebase auth state to be restored
      // Firebase auth state restoration can take a moment on page refresh
      const checkFirebaseAuth = () => {
        const currentUser = auth.currentUser;
        console.log('AuthProvider: Checking Firebase auth state:', currentUser?.email);
        
        if (currentUser && currentUser.email === userData.email) {
          console.log('AuthProvider: Firebase auth state matches persisted state');
          // Firebase auth is restored, proceed with admin validation
          restoreAuthState();
        } else if (currentUser && currentUser.email !== userData.email) {
          console.log('AuthProvider: Firebase auth state does not match persisted state');
          console.log('AuthProvider: Current Firebase user:', currentUser.email);
          console.log('AuthProvider: Persisted user:', userData.email);
          
          // Firebase auth state doesn't match, clear the persisted state
          setUser(null);
        } else {
          // Firebase auth state is not yet restored, wait a bit and try again
          console.log('AuthProvider: Firebase auth state not yet restored, waiting...');
          setTimeout(checkFirebaseAuth, 100); // Check again in 100ms
        }
      };
      
      // Start checking Firebase auth state
      checkFirebaseAuth();
    } else if (!userData && !isAuthenticated) {
      console.log('AuthProvider: No persisted authentication state found');
      setLoading(false);
    }
  }, []); // Empty dependency array - only run once on mount

  return <>{children}</>;
};

export default AuthProvider; 
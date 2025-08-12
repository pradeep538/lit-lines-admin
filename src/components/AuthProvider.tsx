import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { setUser, setLoading, validateAdminAccess } = useAuthStore();

  useEffect(() => {
    console.log('AuthProvider: Setting up Firebase auth state listener');
    
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
  }, [setUser, setLoading, validateAdminAccess]);

  return <>{children}</>;
};

export default AuthProvider; 
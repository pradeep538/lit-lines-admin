import React, { useEffect } from 'react';
import { Card, Button, Typography, Alert, Spin, Space } from 'antd';
import { GoogleOutlined, LockOutlined } from '@ant-design/icons';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const { user, userData, isAuthenticated, isAdmin, isLoading, error, setUser, setLoading, setError, validateAdminAccess } = useAuthStore();
  
  // Use userData as fallback if user object is not available
  const currentUser = user || userData;

  // Remove the duplicate Firebase auth listener from Login component
  // The AuthProvider already handles this

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      
      // Validate admin access with backend after successful login
      try {
        console.log('Validating admin access after login for user:', result.user.email);
        await validateAdminAccess();
      } catch (error) {
        console.error('Failed to validate admin access:', error);
        setError('Login successful but admin access validation failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(error.message || 'Logout failed. Please try again.');
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Space direction="vertical" align="center">
          <Spin size="large" />
          <Text style={{ color: 'white' }}>Loading...</Text>
        </Space>
      </div>
    );
  }

  if (isAuthenticated && !isAdmin) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Card style={{ width: 400, textAlign: 'center' }}>
          <LockOutlined style={{ fontSize: 48, color: '#ff4d4f', marginBottom: 16 }} />
          <Title level={3}>Access Denied</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
            Your email ({currentUser?.email}) is not authorized to access the admin panel.
          </Text>
          <Button type="primary" onClick={handleLogout} block>
            Sign Out
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, textAlign: 'center' }}>
        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            LitLines Admin
          </Title>
          <Text type="secondary">
            Sign in to access the content management system
          </Text>
        </div>

        {error && (
          <Alert
            message="Authentication Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Button
          type="primary"
          size="large"
          icon={<GoogleOutlined />}
          onClick={handleGoogleLogin}
          loading={isLoading}
          block
          style={{ height: 48, fontSize: 16 }}
        >
          Sign in with Google
        </Button>

        <div style={{ marginTop: 24 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Only authorized administrators can access this panel.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login; 
import React from 'react';
import { Layout, Avatar, Dropdown, Space, Badge, Button } from 'antd';
import { BellOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuthStore } from '@/store/authStore';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const { user, userData, logout } = useAuthStore();
  
  // Use userData as fallback if user object is not available
  const currentUser = user || userData;

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
    },
  ];

  const handleUserMenuClick: MenuProps['onClick'] = async ({ key }) => {
    switch (key) {
      case 'logout':
        await logout();
        break;
      default:
        console.log('Menu item clicked:', key);
    }
  };

  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        marginLeft: 250, // Account for fixed sidebar
      }}
    >
      <Space size="large">
        <Badge count={5} size="small">
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: '18px' }} />}
            style={{ border: 'none', boxShadow: 'none' }}
          />
        </Badge>
        
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
          placement="bottomRight"
          arrow
        >
          <Space style={{ cursor: 'pointer' }}>
            <Avatar 
              src={currentUser?.photoURL || undefined}
              icon={!currentUser?.photoURL ? <UserOutlined /> : undefined}
            />
            <span style={{ color: '#333' }}>
              {currentUser?.displayName || currentUser?.email || 'Admin User'}
            </span>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header; 
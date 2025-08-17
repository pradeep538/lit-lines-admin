import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  FileTextOutlined,
  UploadOutlined,
  BarChartOutlined,
  SettingOutlined,
  GlobalOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  AppstoreOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/content',
      icon: <FileTextOutlined />,
      label: 'Content Management',
    },
    {
      key: '/feeds',
      icon: <AppstoreOutlined />,
      label: 'Feeds',
    },
    {
      key: '/bulk-upload',
      icon: <UploadOutlined />,
      label: 'Bulk Upload',
    },
    {
      type: 'divider' as const,
    },
    {
      key: '/languages',
      icon: <GlobalOutlined />,
      label: 'Languages',
    },
    {
      key: '/categories',
      icon: <FolderOutlined />,
      label: 'Categories',
    },
    {
      key: '/subcategories',
      icon: <FolderOpenOutlined />,
      label: 'Subcategories',
    },
    {
      type: 'divider' as const,
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
    {
      key: '/feed-analytics',
      icon: <BarChartOutlined />,
      label: 'Feed Analytics',
    },
    {
      key: '/user-preferences',
      icon: <UserOutlined />,
      label: 'User Preferences',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Sider
      width={250}
      style={{
        background: '#001529',
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
          LitLines Admin
        </h1>
        <p style={{ color: '#8c8c8c', margin: '4px 0 0 0', fontSize: '12px' }}>
          Content Management System
        </p>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
};

export default Sidebar; 
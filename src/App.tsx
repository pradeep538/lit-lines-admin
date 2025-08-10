import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';

import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Dashboard from '@/pages/Dashboard';
import ContentManagement from '@/pages/ContentManagement';
import BulkUpload from '@/pages/BulkUpload';
import LanguageManagement from '@/pages/LanguageManagement';
import CategoryManagement from '@/pages/CategoryManagement';
import SubcategoryManagement from '@/pages/SubcategoryManagement';
import Feeds from '@/pages/Feeds';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';

const { Content } = Layout;

const App: React.FC = () => {
  return (
    <ProtectedRoute>
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
        <Layout>
          <Header />
          <Content style={{ margin: '24px 16px 24px 274px', padding: 24, background: '#fff' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/content" element={<ContentManagement />} />
              <Route path="/feeds" element={<Feeds />} />
              <Route path="/bulk-upload" element={<BulkUpload />} />
              <Route path="/languages" element={<LanguageManagement />} />
              <Route path="/categories" element={<CategoryManagement />} />
              <Route path="/subcategories" element={<SubcategoryManagement />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </ProtectedRoute>
  );
};

export default App; 
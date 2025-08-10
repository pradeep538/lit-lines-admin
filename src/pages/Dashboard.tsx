import React from 'react';
import { Row, Col, Card, Statistic, Table, Progress } from 'antd';
import { useQuery } from '@tanstack/react-query';
import {
  FileTextOutlined,
  UserOutlined,
  HeartOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { analyticsApi } from '@/services/api';
import type { AnalyticsData } from '@/types';

const Dashboard: React.FC = () => {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsApi.getAnalytics(),
    staleTime: 30000, // 30 seconds
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Use fallback data when API is not available
  const stats = analytics?.data || {
    total_content: 0,
    total_users: 0,
    total_likes: 0,
    total_saves: 0,
    content_by_type: {
      quote: 0,
      meme: 0,
      dialogue: 0,
    },
    content_by_language: {},
  };

  // Show demo mode indicator if API is not available
  const isDemoMode = !analytics && !isLoading;

  const recentContentColumns = [
    {
      title: 'Content',
      dataIndex: 'text',
      key: 'text',
      render: (text: string) => (
        <div style={{ maxWidth: 300 }}>
          <div style={{ fontWeight: 500 }}>{text.substring(0, 50)}...</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Author</div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: '4px', 
          backgroundColor: type === 'quote' ? '#e6f7ff' : '#f6ffed',
          color: type === 'quote' ? '#1890ff' : '#52c41a'
        }}>
          {type}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: '4px', 
          backgroundColor: status === 'active' ? '#f6ffed' : '#fff2e8',
          color: status === 'active' ? '#52c41a' : '#fa8c16'
        }}>
          {status}
        </span>
      ),
    },
    {
      title: 'Engagement',
      dataIndex: 'engagement',
      key: 'engagement',
      render: (engagement: any) => (
        <div>
          <div>❤️ {engagement?.total_likes || 0}</div>
          <div>💾 {engagement?.total_saves || 0}</div>
        </div>
      ),
    },
  ];

  const mockRecentContent = [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
          Dashboard
        </h1>
        {isDemoMode && (
          <div style={{ 
            padding: '8px 16px', 
            backgroundColor: '#e6f7ff', 
            border: '1px solid #91d5ff', 
            borderRadius: '6px',
            color: '#1890ff',
            fontSize: '14px'
          }}>
            Demo Mode - Using sample data
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Content"
              value={stats.total_content}
              prefix={<FileTextOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.total_users}
              prefix={<UserOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Likes"
              value={stats.total_likes}
              prefix={<HeartOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Saves"
              value={stats.total_saves}
              prefix={<BookOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Content Distribution */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Content by Type" loading={isLoading}>
            {Object.entries(stats.content_by_type).length > 0 ? (
              Object.entries(stats.content_by_type).map(([type, count]) => (
                <div key={type} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{type}</span>
                    <span>{count}</span>
                  </div>
                  <Progress 
                    percent={Math.round((count as number / stats.total_content) * 100)} 
                    size="small"
                    showInfo={false}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                No content type data available
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Content by Language" loading={isLoading}>
            {Object.entries(stats.content_by_language).length > 0 ? (
              Object.entries(stats.content_by_language).map(([language, count]) => (
                <div key={language} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 500 }}>{language}</span>
                    <span>{count}</span>
                  </div>
                  <Progress 
                    percent={Math.round((count as number / stats.total_content) * 100)} 
                    size="small"
                    showInfo={false}
                    strokeColor={{
                      '0%': '#722ed1',
                      '100%': '#eb2f96',
                    }}
                  />
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                No language data available
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Content */}
      <Card title="Recent Content">
        <Table
          columns={recentContentColumns}
          dataSource={mockRecentContent}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default Dashboard; 
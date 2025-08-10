import React from 'react';
import { Row, Col, Card, Statistic, Progress, Table, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import {
  FileTextOutlined,
  UserOutlined,
  HeartOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { analyticsApi } from '@/services/api';

const { Title } = Typography;

const Analytics: React.FC = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsApi.getAnalytics(),
  });

  const { data: userAnalytics } = useQuery({
    queryKey: ['user-analytics'],
    queryFn: () => analyticsApi.getUserAnalytics(),
  });

  const stats = analytics?.data || {
    total_content: 0,
    total_users: 0,
    total_likes: 0,
    total_saves: 0,
    content_by_type: {},
    content_by_language: {},
  };

  const topContentColumns = [
    {
      title: 'Content',
      dataIndex: 'text',
      key: 'text',
      render: (text: string) => (
        <div style={{ maxWidth: 300 }}>
          {text.length > 60 ? `${text.substring(0, 60)}...` : text}
        </div>
      ),
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'Likes',
      dataIndex: 'likes',
      key: 'likes',
      sorter: (a: any, b: any) => a.likes - b.likes,
    },
    {
      title: 'Saves',
      dataIndex: 'saves',
      key: 'saves',
      sorter: (a: any, b: any) => a.saves - b.saves,
    },
    {
      title: 'Views',
      dataIndex: 'views',
      key: 'views',
      sorter: (a: any, b: any) => a.views - b.views,
    },
  ];

  const mockTopContent = [
    {
      key: '1',
      text: 'The only way to do great work is to love what you do.',
      author: 'Steve Jobs',
      likes: 1250,
      saves: 450,
      views: 8900,
    },
    {
      key: '2',
      text: 'Success is not final, failure is not fatal.',
      author: 'Winston Churchill',
      likes: 980,
      saves: 320,
      views: 7200,
    },
    {
      key: '3',
      text: 'The future belongs to those who believe in the beauty of their dreams.',
      author: 'Eleanor Roosevelt',
      likes: 850,
      saves: 280,
      views: 6500,
    },
  ];

  return (
    <div>
      <Title level={2}>Analytics Dashboard</Title>

      {/* Key Metrics */}
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
            {Object.entries(stats.content_by_type).map(([type, count]) => (
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
            ))}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Content by Language" loading={isLoading}>
            {Object.entries(stats.content_by_language).map(([language, count]) => (
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
            ))}
          </Card>
        </Col>
      </Row>

      {/* Engagement Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={8}>
          <Card title="Engagement Rate">
            <Statistic
              title="Average Likes per Content"
              value={stats.total_content > 0 ? Math.round(stats.total_likes / stats.total_content) : 0}
              prefix={<HeartOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Save Rate">
            <Statistic
              title="Average Saves per Content"
              value={stats.total_content > 0 ? Math.round(stats.total_saves / stats.total_content) : 0}
              prefix={<BookOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="User Engagement">
            <Statistic
              title="Content per User"
              value={stats.total_users > 0 ? Math.round(stats.total_content / stats.total_users) : 0}
              prefix={<FileTextOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Top Performing Content */}
      <Card title="Top Performing Content">
        <Table
          columns={topContentColumns}
          dataSource={mockTopContent}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default Analytics; 
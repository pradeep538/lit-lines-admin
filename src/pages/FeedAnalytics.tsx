import React, { useState } from 'react';
import { Card, Table, Select, DatePicker, Space, Statistic, Row, Col, Tag, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { feedApi } from '@/services/api';
import { BarChartOutlined, UserOutlined, EyeOutlined, LikeOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

const FeedAnalytics: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<string>('');
  const [dateRange, setDateRange] = useState<[string, string]>(['', '']);

  const { data: feedStats, isLoading } = useQuery({
    queryKey: ['feed-analytics', selectedSegment, dateRange],
    queryFn: () => feedApi.getFeedAnalytics({
      user_segment: selectedSegment,
      start_date: dateRange[0],
      end_date: dateRange[1],
    }),
  });

  const { data: userSegments } = useQuery({
    queryKey: ['user-segments'],
    queryFn: () => feedApi.getUserSegments(),
  });

  const { data: feedPerformance } = useQuery({
    queryKey: ['feed-performance', selectedSegment],
    queryFn: () => feedApi.getFeedPerformance({
      user_segment: selectedSegment,
      date_range: '30d',
    }),
  });

  const columns = [
    {
      title: 'User Segment',
      dataIndex: 'user_segment',
      key: 'user_segment',
      render: (segment: string) => (
        <Tag color={
          segment === 'power_user' ? 'red' : 
          segment === 'engaged_user' ? 'orange' : 
          segment === 'preference_set' ? 'blue' : 'green'
        }>
          {segment.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Total Users',
      dataIndex: 'total_users',
      key: 'total_users',
      sorter: (a: any, b: any) => a.total_users - b.total_users,
    },
    {
      title: 'Avg. Engagement Rate',
      dataIndex: 'avg_engagement_rate',
      key: 'avg_engagement_rate',
      render: (value: number) => `${(value * 100).toFixed(2)}%`,
      sorter: (a: any, b: any) => a.avg_engagement_rate - b.avg_engagement_rate,
    },
    {
      title: 'Avg. Content Views',
      dataIndex: 'avg_content_views',
      key: 'avg_content_views',
      sorter: (a: any, b: any) => a.avg_content_views - b.avg_content_views,
    },
    {
      title: 'Feed Strategy',
      dataIndex: 'feed_strategy',
      key: 'feed_strategy',
      render: (strategy: string) => (
        <Tag color={
          strategy === 'personalized' ? 'purple' : 
          strategy === 'preference' ? 'blue' : 'green'
        }>
          {strategy.toUpperCase()}
        </Tag>
      ),
    },
  ];

  const performanceColumns = [
    {
      title: 'Metric',
      dataIndex: 'metric',
      key: 'metric',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value: any, record: any) => {
        if (record.type === 'percentage') {
          return `${(value * 100).toFixed(2)}%`;
        }
        if (record.type === 'number') {
          return value.toLocaleString();
        }
        return value;
      },
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (change: number) => (
        <span style={{ color: change >= 0 ? 'green' : 'red' }}>
          {change >= 0 ? '+' : ''}{change.toFixed(2)}%
        </span>
      ),
    },
  ];

  const performanceData = feedPerformance?.data ? [
    {
      key: '1',
      metric: 'Total Feeds Generated',
      value: feedPerformance.data.total_feeds_generated,
      type: 'number',
      change: 5.2,
    },
    {
      key: '2',
      metric: 'Average Feed Views',
      value: feedPerformance.data.avg_feed_views,
      type: 'number',
      change: 2.1,
    },
    {
      key: '3',
      metric: 'Engagement Rate',
      value: feedPerformance.data.avg_engagement_rate,
      type: 'percentage',
      change: 1.8,
    },
    {
      key: '4',
      metric: 'Top Performing Segment',
      value: feedPerformance.data.top_performing_segment,
      type: 'text',
      change: 0,
    },
  ] : [];

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading feed analytics...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChartOutlined />
          Feed Analytics
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#666' }}>
          Monitor feed performance and user engagement across different segments
        </p>
      </div>
      
      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Space size="large">
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              User Segment
            </label>
            <Select
              placeholder="All Segments"
              value={selectedSegment}
              onChange={setSelectedSegment}
              allowClear
              style={{ width: 200 }}
            >
              {userSegments?.data?.map((segment: any) => (
                <Option key={segment.segment} value={segment.segment}>
                  {segment.segment.replace('_', ' ').toUpperCase()}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              Date Range
            </label>
            <RangePicker
              onChange={(dates) => {
                if (dates) {
                  setDateRange([
                    dates[0]?.format('YYYY-MM-DD') || '',
                    dates[1]?.format('YYYY-MM-DD') || ''
                  ]);
                } else {
                  setDateRange(['', '']);
                }
              }}
            />
          </div>
        </Space>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Active Users"
              value={feedStats?.data?.total_active_users || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg. Daily Feed Views"
              value={feedStats?.data?.avg_daily_feed_views || 0}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Content Engagement Rate"
              value={feedStats?.data?.content_engagement_rate || 0}
              suffix="%"
              prefix={<LikeOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="User Retention Rate"
              value={feedStats?.data?.user_retention_rate || 0}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Metrics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card title="Feed Performance Metrics">
            <Table
              columns={performanceColumns}
              dataSource={performanceData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="User Segments Distribution">
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                {userSegments?.data?.map((segment: any) => (
                  <div key={segment.segment} style={{ marginBottom: '8px' }}>
                    <Tag color={
                      segment.segment === 'power_user' ? 'red' : 
                      segment.segment === 'engaged_user' ? 'orange' : 
                      segment.segment === 'preference_set' ? 'blue' : 'green'
                    }>
                      {segment.segment.replace('_', ' ').toUpperCase()}
                    </Tag>
                    <span style={{ marginLeft: '8px' }}>
                      {segment.count} users ({segment.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* User Segments Table */}
      <Card title="User Segments Performance">
        <Table
          columns={columns}
          dataSource={feedStats?.data?.user_segments_performance || []}
          loading={isLoading}
          rowKey="user_segment"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </Card>
    </div>
  );
};

export default FeedAnalytics;

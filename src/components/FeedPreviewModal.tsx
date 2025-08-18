import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, Space, Card, List, Tag, Spin, Empty, Typography, Divider } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { EyeOutlined, UserOutlined, BarChartOutlined } from '@ant-design/icons';
import { contentApi, feedApi } from '@/services/api';
import type { Content } from '@/types';

const { Option } = Select;
const { Title, Text } = Typography;

interface FeedPreviewModalProps {
  visible: boolean;
  onCancel: () => void;
  contentId?: string;
}

interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: string;
}

const userSegments: UserSegment[] = [
  {
    id: 'new_user',
    name: 'New User',
    description: 'Users with no engagement history',
    criteria: 'No likes/saves recorded'
  },
  {
    id: 'preference_set',
    name: 'Preference Set',
    description: 'Users who have set preferences',
    criteria: 'Has language/category preferences'
  },
  {
    id: 'engaged_user',
    name: 'Engaged User',
    description: 'Users with moderate engagement',
    criteria: '10-50 total likes/saves'
  },
  {
    id: 'power_user',
    name: 'Power User',
    description: 'Highly engaged users',
    criteria: '50+ total likes/saves'
  }
];

const FeedPreviewModal: React.FC<FeedPreviewModalProps> = ({
  visible,
  onCancel,
  contentId,
}) => {
  const [selectedSegment, setSelectedSegment] = useState<string>('new_user');
  const [selectedUserId, setSelectedUserId] = useState<string>('test-user');

  // Get feed preview for selected user segment
  const { data: feedData, isLoading: feedLoading, refetch: refetchFeed } = useQuery({
    queryKey: ['feed-preview', selectedSegment, selectedUserId],
    queryFn: () => contentApi.getFeedPreview({
      user_id: selectedUserId,
      segment: selectedSegment,
      limit: 10
    }),
    enabled: visible,
    staleTime: 30000,
  });

  // Get feed analytics for the selected segment
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['feed-analytics', selectedSegment],
    queryFn: () => feedApi.getFeedAnalytics({ segment: selectedSegment }),
    enabled: visible,
    staleTime: 60000,
  });

  const handleSegmentChange = (segment: string) => {
    setSelectedSegment(segment);
  };

  const handleRefresh = () => {
    refetchFeed();
  };

  const renderContentItem = (content: Content, index: number) => (
    <Card 
      key={content.id} 
      size="small" 
      style={{ marginBottom: '8px' }}
      bodyStyle={{ padding: '12px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#666'
        }}>
          #{index + 1}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>
            {content.text.length > 100 ? `${content.text.substring(0, 100)}...` : content.text}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            by {content.author || 'Unknown'} • {content.type}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Tag size="small" color={content.status === 'active' ? 'green' : 'orange'}>
              {content.status}
            </Tag>
            {content.category && (
              <Tag size="small" color="blue">
                {content.category.name?.en || content.category.category_id}
              </Tag>
            )}
            {content.engagement && (
              <span style={{ fontSize: '11px', color: '#999' }}>
                ❤️ {content.engagement.total_likes} 💾 {content.engagement.total_saves}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  const selectedSegmentInfo = userSegments.find(seg => seg.id === selectedSegment);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EyeOutlined />
          Feed Preview
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Close
        </Button>,
        <Button key="refresh" onClick={handleRefresh} loading={feedLoading}>
          Refresh
        </Button>,
      ]}
    >
      <div style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>User Segment:</Text>
            <Select
              value={selectedSegment}
              onChange={handleSegmentChange}
              style={{ width: 200, marginLeft: '8px' }}
            >
              {userSegments.map(segment => (
                <Option key={segment.id} value={segment.id}>
                  {segment.name}
                </Option>
              ))}
            </Select>
          </div>
          
          {selectedSegmentInfo && (
            <Card size="small" style={{ backgroundColor: '#f8f9fa' }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                {selectedSegmentInfo.name}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                {selectedSegmentInfo.description}
              </div>
              <div style={{ fontSize: '11px', color: '#999' }}>
                <strong>Criteria:</strong> {selectedSegmentInfo.criteria}
              </div>
            </Card>
          )}
        </Space>
      </div>

      <Divider />

      {/* Feed Analytics Summary */}
      {analyticsData && (
        <div style={{ marginBottom: '16px' }}>
          <Title level={5} style={{ marginBottom: '8px' }}>
            <BarChartOutlined /> Feed Performance for {selectedSegmentInfo?.name}
          </Title>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Card size="small" style={{ flex: 1, minWidth: '120px' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Total Users</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {analyticsData.data?.total_users || 0}
              </div>
            </Card>
            <Card size="small" style={{ flex: 1, minWidth: '120px' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Avg. Engagement</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {analyticsData.data?.avg_engagement_rate || 0}%
              </div>
            </Card>
            <Card size="small" style={{ flex: 1, minWidth: '120px' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Retention Rate</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {analyticsData.data?.retention_rate || 0}%
              </div>
            </Card>
          </div>
        </div>
      )}

      <Divider />

      {/* Feed Content Preview */}
      <div>
        <Title level={5} style={{ marginBottom: '12px' }}>
          <UserOutlined /> Feed Content Preview
        </Title>
        
        {feedLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px', color: '#666' }}>
              Loading feed preview...
            </div>
          </div>
        ) : feedData?.content && feedData.content.length > 0 ? (
          <div>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
              Showing {feedData.content.length} items from personalized feed
            </div>
            {feedData.content.map((content: Content, index: number) => 
              renderContentItem(content, index)
            )}
          </div>
        ) : (
          <Empty 
            description="No content available in feed for this user segment"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>

      {/* Feed Info */}
      {feedData?.feed_info && (
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0f8ff', borderRadius: '6px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            Feed Generation Info:
          </div>
          <div style={{ fontSize: '11px', color: '#999' }}>
            Strategy: {feedData.feed_info.strategy} • 
            Discovery Ratio: {feedData.feed_info.discovery_ratio}% • 
            Generated: {new Date(feedData.feed_info.generated_at).toLocaleString()}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default FeedPreviewModal;


import React, { useState } from 'react';
import { 
  Card, 
  Space, 
  Input, 
  Select, 
  Button, 
  Table, 
  Tag, 
  Row,
  Col,
  Statistic,
  Empty
} from 'antd';
import { useQuery } from '@tanstack/react-query';
import { 
  SearchOutlined, 
  FilterOutlined,
  LikeOutlined,
  BookOutlined
} from '@ant-design/icons';
import { contentApi, categoriesApi, languagesApi } from '@/services/api';
import type { Content, Category, Language } from '@/types';

const { Option } = Select;

interface FeedFilters {
  search: string;
  language: string;
  category: string;
  subcategory: string;
  type: string;
  status: string;
}

const Feeds: React.FC = () => {
  const [filters, setFilters] = useState<FeedFilters>({
    search: '',
    language: '',
    category: '',
    subcategory: '',
    type: '',
    status: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Queries
  const { data: contentData, isLoading: contentLoading } = useQuery({
    queryKey: ['content', filters, currentPage, pageSize],
    queryFn: () => contentApi.getContentList({
      page: currentPage,
      limit: pageSize,
      search: filters.search || undefined,
      language_id: filters.language || undefined,
      category_id: filters.category || undefined,
      subcategory_id: filters.subcategory || undefined,
      type: filters.type || undefined,
      status: filters.status || undefined,
    }),
    staleTime: 30000,
    retry: 1,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories(),
  });

  const { data: languagesData } = useQuery({
    queryKey: ['languages'],
    queryFn: () => languagesApi.getLanguages(),
  });

  // Get subcategories for selected category
  // const selectedCategory = categoriesData?.categories?.find((cat: Category) => cat.category_id === filters.category);
  // For now, we'll use an empty array since subcategories are embedded in content
  const subcategories: any[] = [];

  const handleFilterChange = (key: keyof FeedFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset subcategory when category changes
      ...(key === 'category' && { subcategory: '' })
    }));
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      language: '',
      category: '',
      subcategory: '',
      type: '',
      status: '',
    });
    setCurrentPage(1);
  };

  const content = contentData?.content || [];
  const totalContent = contentData?.total || 0;

  // Calculate statistics
  const activeContent = content.filter((item: Content) => item.status === 'active').length;
  const draftContent = content.filter((item: Content) => item.status === 'draft').length;
  const totalEngagement = content.reduce((sum: number, item: Content) => {
    return sum + (item.engagement?.total_likes || 0) + (item.engagement?.total_saves || 0);
  }, 0);

  const columns = [
    {
      title: 'Content',
      key: 'content',
      render: (_: any, record: Content) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ fontWeight: 500, fontSize: '14px' }}>
            {record.text.length > 100 ? `${record.text.substring(0, 100)}...` : record.text}
          </div>
          <Space size="small">
            <Tag color="blue">{record.type}</Tag>
            <Tag color={record.status === 'active' ? 'green' : 'orange'}>{record.status}</Tag>
            {record.language && (
              <Tag color="purple">{record.language.name}</Tag>
            )}
          </Space>
          <div style={{ fontSize: '12px', color: '#666' }}>
            By {record.author} • {record.source}
          </div>
        </Space>
      ),
    },
    {
      title: 'Category',
      key: 'category',
      render: (_: any, record: Content) => (
        <Space direction="vertical" size="small">
          {record.category && (
            <div>
              <div style={{ fontWeight: 500 }}>{record.category.name?.en || 'N/A'}</div>
              {record.subcategory && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {record.subcategory.name?.en || 'N/A'}
                </div>
              )}
            </div>
          )}
        </Space>
      ),
    },
    {
      title: 'Engagement',
      key: 'engagement',
      render: (_: any, record: Content) => (
        <Space direction="vertical" size="small">
          <div>
            <LikeOutlined style={{ color: '#1890ff', marginRight: 4 }} />
            {record.engagement?.total_likes || 0}
          </div>
          <div>
            <BookOutlined style={{ color: '#52c41a', marginRight: 4 }} />
            {record.engagement?.total_saves || 0}
          </div>
          <div>
            <BookOutlined style={{ color: '#faad14', marginRight: 4 }} />
            {record.engagement?.total_shares || 0}
          </div>
        </Space>
      ),
    },
    {
      title: 'Views',
      dataIndex: 'engagement',
      key: 'views',
      render: (engagement: any) => (
        <div>
          <BookOutlined style={{ color: '#722ed1', marginRight: 4 }} />
          {engagement?.view_count || 0}
        </div>
      ),
    },
    {
      title: 'Popularity',
      dataIndex: 'popularity_score',
      key: 'popularity_score',
      render: (score: number) => (
        <Tag color={score > 80 ? 'green' : score > 50 ? 'orange' : 'red'}>
          {score || 0}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
          Content Feeds
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#666' }}>
          Manage and monitor your content feeds with advanced filtering
        </p>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Content"
              value={totalContent}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Content"
              value={activeContent}
              valueStyle={{ color: '#3f8600' }}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Draft Content"
              value={draftContent}
              valueStyle={{ color: '#cf1322' }}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Engagement"
              value={totalEngagement}
              valueStyle={{ color: '#1890ff' }}
              prefix={<LikeOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>
            <FilterOutlined style={{ marginRight: 8 }} />
            Filters
          </h3>
          <Button onClick={clearFilters} size="small">
            Clear All
          </Button>
        </div>
        
        <Row gutter={16}>
          <Col span={6}>
            <Input
              placeholder="Search content..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Language"
              value={filters.language}
              onChange={(value) => handleFilterChange('language', value)}
              allowClear
              style={{ width: '100%' }}
            >
              {languagesData?.languages?.map((lang: Language) => (
                <Option key={lang.language_id} value={lang.language_id}>
                  {lang.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Category"
              value={filters.category}
              onChange={(value) => handleFilterChange('category', value)}
              allowClear
              style={{ width: '100%' }}
            >
              {categoriesData?.categories?.map((category: Category) => (
                <Option key={category.category_id} value={category.category_id}>
                  {category.name?.en || category.category_id}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Subcategory"
              value={filters.subcategory}
              onChange={(value) => handleFilterChange('subcategory', value)}
              allowClear
              style={{ width: '100%' }}
              disabled={!filters.category}
            >
              {subcategories.map((subcat: any) => (
                <Option key={subcat.subcategory_id} value={subcat.subcategory_id}>
                  {subcat.name?.en || subcat.subcategory_id}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={3}>
            <Select
              placeholder="Type"
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="quote">Quote</Option>
              <Option value="meme">Meme</Option>
              <Option value="dialogue">Dialogue</Option>
            </Select>
          </Col>
          <Col span={3}>
            <Select
              placeholder="Status"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="draft">Draft</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Content Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={content}
          loading={contentLoading}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalContent,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} items`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            onShowSizeChange: (_: any, size: number) => {
              setCurrentPage(1);
              setPageSize(size);
            },
          }}
          locale={{
            emptyText: (
              <Empty
                description="No content found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default Feeds; 
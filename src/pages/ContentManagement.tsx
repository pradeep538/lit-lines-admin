import React, { useState } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Input, 
  Select, 
  Tag, 
  Modal, 
  Form, 
  message,
  Popconfirm,
  Tooltip
} from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import { contentApi, categoriesApi, subcategoriesApi, languagesApi } from '@/services/api';
import type { Content } from '@/types';
import ContentForm from '@/components/ContentForm';
import SchedulingModal from '@/components/SchedulingModal';
import FeedPreviewModal from '@/components/FeedPreviewModal';
import { useAuthStore } from '@/store/authStore';

const { Option } = Select;

const ContentManagement: React.FC = () => {
  const { user, userData, isAuthenticated, isLoading: authLoading } = useAuthStore();
  
  // Check if user is authenticated - we need the actual Firebase user object
  const isUserAuthenticated = !!user;
  
  const [searchText, setSearchText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  
  // Scheduling states
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);
  const [schedulingModalVisible, setSchedulingModalVisible] = useState(false);
  const [feedPreviewModalVisible, setFeedPreviewModalVisible] = useState(false);

  // Queries - only run when user is authenticated
  const { data: contentData, isLoading } = useQuery({
    queryKey: ['content', { search: searchText, language: selectedLanguage, category: selectedCategory, subcategory: selectedSubcategory, type: selectedType, status: selectedStatus }, currentPage, pageSize],
    queryFn: () => contentApi.getContentList({
      page: currentPage,
      limit: pageSize,
      search: searchText,
      language_id: selectedLanguage,
      category_id: selectedCategory,
      subcategory_id: selectedSubcategory,
      type: selectedType,
      status: selectedStatus,
    }),
    enabled: isUserAuthenticated, // Only run when user is authenticated
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories(),
    enabled: isUserAuthenticated, // Only run when user is authenticated
  });

  const { data: subcategoriesData } = useQuery({
    queryKey: ['subcategories'],
    queryFn: () => subcategoriesApi.getSubcategories(),
    enabled: isUserAuthenticated, // Only run when user is authenticated
  });

  const { data: languagesData } = useQuery({
    queryKey: ['languages'],
    queryFn: () => languagesApi.getLanguages(),
    enabled: isUserAuthenticated, // Only run when user is authenticated
  });

  const { data: contentFiltersData } = useQuery({
    queryKey: ['content-filters'],
    queryFn: () => contentApi.getContentFilters(),
    enabled: isUserAuthenticated, // Only run when user is authenticated
  });

  // Mutations
  const createContentMutation = useMutation({
    mutationFn: (data: { content: Content; user_id: string }) => 
      contentApi.createContent(data),
    onSuccess: () => {
      message.success('Content created successfully');
      queryClient.invalidateQueries({ queryKey: ['content'] });
      setIsModalVisible(false);
      setEditingContent(null);
      form.resetFields();
    },
    onError: () => {
      message.error('Failed to create content');
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: (data: { content: Content[]; user_id: string }) => 
      contentApi.updateContent(data),
    onSuccess: (response) => {
      // Check if any content was created instead of updated
      const results = response.data?.results || [];
      const createdCount = results.filter((r: any) => r.status === 'created').length;
      const updatedCount = results.filter((r: any) => r.status === 'success').length;
      
      if (createdCount > 0 && updatedCount === 0) {
        message.success(`Content created successfully (${createdCount} items)`);
      } else if (createdCount > 0 && updatedCount > 0) {
        message.success(`Content updated successfully (${updatedCount} updated, ${createdCount} created)`);
      } else {
        message.success('Content updated successfully');
      }
      
      queryClient.invalidateQueries({ queryKey: ['content'] });
      setIsModalVisible(false);
      setEditingContent(null);
      form.resetFields();
    },
    onError: () => {
      message.error('Failed to update content');
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: (data: { content_ids: string[]; user_id: string }) => 
      contentApi.deleteContent(data),
    onSuccess: () => {
      message.success('Content deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
    onError: () => {
      message.error('Failed to delete content');
    },
  });

  // Scheduling mutations
  const scheduleContentMutation = useMutation({
    mutationFn: (data: { content_id: string; scheduled_at: string }) => 
      contentApi.scheduleContent(data),
    onSuccess: () => {
      message.success('Content scheduled successfully');
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
    onError: () => {
      message.error('Failed to schedule content');
    },
  });

  const publishContentMutation = useMutation({
    mutationFn: (data: { content_id: string }) => 
      contentApi.publishContent(data),
    onSuccess: () => {
      message.success('Content published successfully');
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
    onError: () => {
      message.error('Failed to publish content');
    },
  });

  const bulkScheduleMutation = useMutation({
    mutationFn: (data: { content_ids: string[]; scheduled_at: string }) => 
      contentApi.bulkScheduleContent(data),
    onSuccess: () => {
      message.success('Content bulk scheduled successfully');
      queryClient.invalidateQueries({ queryKey: ['content'] });
      setSelectedContentIds([]);
    },
    onError: () => {
      message.error('Failed to bulk schedule content');
    },
  });

  const handleEdit = (record: Content) => {
    setEditingContent(record);
    form.setFieldsValue({
      text: record.text,
      author: record.author,
      source: record.source,
      language_id: record.language_id,
      type: record.type,
      category_id: record.category?.category_id,
      subcategory_id: record.subcategory?.subcategory_id,
      background_image_url: record.background_image_url,
      shareable_image_url: record.shareable_image_url,
      tags: record.tags,
      status: record.status,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (contentId: string) => {
    deleteContentMutation.mutate({
      content_ids: [contentId],
      user_id: 'admin-user', // This should come from auth context
    });
  };

  const handleSchedule = (record: Content) => {
    // For now, schedule for 1 hour from now
    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    scheduleContentMutation.mutate({
      content_id: record.id,
      scheduled_at: scheduledAt,
    });
  };

  const handlePublish = (record: Content) => {
    publishContentMutation.mutate({
      content_id: record.id,
    });
  };

  const handleDeactivate = (record: Content) => {
    // Update content status to inactive
    updateContentMutation.mutate({
      content: [{
        ...record,
        status: 'inactive',
        updated_at: new Date().toISOString(),
      }],
      user_id: 'admin-user',
    });
  };

  const handleExport = async () => {
    try {
      const blob = await contentApi.exportContent({
        format: 'json',
        language_id: selectedLanguage,
        type: selectedType,
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'content-export.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      message.success('Content exported successfully');
    } catch (error) {
      message.error('Failed to export content');
    }
  };

  const columns = [
    {
      title: 'Content',
      dataIndex: 'text',
      key: 'text',
      render: (text: string, record: Content) => (
        <div style={{ maxWidth: 300 }}>
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>
            {text.length > 80 ? `${text.substring(0, 80)}...` : text}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            by {record.author}
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {record.source}
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'quote' ? 'blue' : 'green'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Language',
      dataIndex: 'language',
      key: 'language',
      render: (language: any) => (
        <span>{language?.name || 'Unknown'}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Content) => (
        <div>
          <Tag color={
            status === 'active' ? 'green' : 
            status === 'scheduled' ? 'blue' : 
            status === 'draft' ? 'orange' : 'red'
          }>
            {status}
          </Tag>
          {record.scheduled_at && (
            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
              Scheduled: {new Date(record.scheduled_at).toLocaleString()}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Engagement',
      dataIndex: 'engagement',
      key: 'engagement',
      render: (engagement: any) => (
        <div style={{ fontSize: '12px' }}>
          <div>❤️ {engagement?.total_likes || 0}</div>
          <div>💾 {engagement?.total_saves || 0}</div>
        </div>
      ),
    },
    {
      title: 'Feed Performance',
      key: 'feed_performance',
      render: (record: Content) => {
        const engagement = record.engagement;
        if (!engagement) return <span style={{ color: '#999' }}>No data</span>;
        
        const totalInteractions = (engagement.total_likes || 0) + (engagement.total_saves || 0);
        const viewCount = engagement.view_count || 0;
        const engagementRate = viewCount > 0 ? ((totalInteractions / viewCount) * 100) : 0;
        const engagementRateDisplay = engagementRate.toFixed(1);
        
        return (
          <div style={{ fontSize: '12px' }}>
            <div style={{ fontWeight: 500, color: engagementRate > 5 ? '#52c41a' : engagementRate > 2 ? '#faad14' : '#ff4d4f' }}>
              {engagementRateDisplay}% engagement
            </div>
            <div style={{ color: '#666' }}>
              {viewCount.toLocaleString()} views
            </div>
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Content) => (
        <Space size="small">
          <Tooltip title="View">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          {record.status === 'draft' && (
            <Tooltip title="Schedule">
              <Button 
                type="text" 
                icon={<ClockCircleOutlined />} 
                size="small"
                onClick={() => handleSchedule(record)}
              />
            </Tooltip>
          )}
          {record.status === 'scheduled' && (
            <Tooltip title="Publish Now">
              <Button 
                type="text" 
                icon={<PlayCircleOutlined />} 
                size="small"
                onClick={() => handlePublish(record)}
              />
            </Tooltip>
          )}
          {record.status === 'active' && (
            <Tooltip title="Deactivate">
              <Button 
                type="text" 
                icon={<StopOutlined />} 
                size="small"
                onClick={() => handleDeactivate(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this content?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button 
                type="text" 
                icon={<DeleteOutlined />} 
                size="small"
                danger
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Show loading when auth is being restored
  if (authLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <div>Restoring session...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
          Content Management
        </h1>
        <Space>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
          >
            Export
          </Button>
          <Button 
            icon={<EyeOutlined />}
            onClick={() => setFeedPreviewModalVisible(true)}
          >
            Feed Preview
          </Button>
          {selectedContentIds.length > 0 && (
            <Button 
              icon={<ClockCircleOutlined />}
              onClick={() => setSchedulingModalVisible(true)}
            >
              Bulk Schedule ({selectedContentIds.length})
            </Button>
          )}
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingContent(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Add Content
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Space wrap>
          <Input
            placeholder="Search content..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Language"
            value={selectedLanguage}
            onChange={setSelectedLanguage}
            allowClear
            style={{ width: 150 }}
          >
            {contentFiltersData?.data?.languages?.map((langId: string) => (
              <Option key={langId} value={langId}>
                {langId.toUpperCase()}
              </Option>
            )) || languagesData?.languages?.map((lang: any) => (
              <Option key={lang.language_id} value={lang.language_id}>
                {lang.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Category"
            value={selectedCategory}
            onChange={setSelectedCategory}
            allowClear
            style={{ width: 150 }}
          >
            {contentFiltersData?.data?.categories?.map((categoryId: string) => (
              <Option key={categoryId} value={categoryId}>
                {categoryId}
              </Option>
            )) || categoriesData?.categories?.map((category: any) => (
              <Option key={category.category_id} value={category.category_id}>
                {category.name?.en || category.category_id}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Subcategory"
            value={selectedSubcategory}
            onChange={setSelectedSubcategory}
            allowClear
            style={{ width: 150 }}
          >
            {contentFiltersData?.data?.subcategories?.map((subcategoryId: string) => (
              <Option key={subcategoryId} value={subcategoryId}>
                {subcategoryId}
              </Option>
            )) || subcategoriesData?.subcategories?.map((subcategory: any) => (
              <Option key={subcategory.subcategory_id} value={subcategory.subcategory_id}>
                {subcategory.name?.en || subcategory.subcategory_id}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Type"
            value={selectedType}
            onChange={setSelectedType}
            allowClear
            style={{ width: 120 }}
          >
            {contentFiltersData?.data?.types?.map((typeValue: string) => (
              <Option key={typeValue} value={typeValue}>
                {typeValue.charAt(0).toUpperCase() + typeValue.slice(1)}
              </Option>
            )) || [
              <Option key="quote" value="quote">Quote</Option>,
              <Option key="meme" value="meme">Meme</Option>,
              <Option key="dialogue" value="dialogue">Dialogue</Option>
            ]}
          </Select>
          <Select
            placeholder="Status"
            value={selectedStatus}
            onChange={setSelectedStatus}
            allowClear
            style={{ width: 120 }}
          >
            <Option value="draft">Draft</Option>
            <Option value="scheduled">Scheduled</Option>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
          <Button
            onClick={() => {
              setSearchText('');
              setSelectedLanguage('');
              setSelectedCategory('');
              setSelectedSubcategory('');
              setSelectedType('');
              setSelectedStatus('');
              setCurrentPage(1);
            }}
            style={{ marginLeft: '8px' }}
          >
            Clear Filters
          </Button>
        </Space>
        
        {/* Active Filters Summary */}
        {(searchText || selectedLanguage || selectedCategory || selectedSubcategory || selectedType || selectedStatus) && (
          <div style={{ marginTop: '16px' }}>
            <Space wrap>
              <span style={{ fontWeight: 500, color: '#666' }}>Active Filters:</span>
              {searchText && (
                <Tag closable onClose={() => setSearchText('')}>
                  Search: {searchText}
                </Tag>
              )}
              {selectedLanguage && (
                <Tag closable onClose={() => setSelectedLanguage('')}>
                  Language: {selectedLanguage.toUpperCase()}
                </Tag>
              )}
              {selectedCategory && (
                <Tag closable onClose={() => setSelectedCategory('')}>
                  Category: {selectedCategory}
                </Tag>
              )}
              {selectedSubcategory && (
                <Tag closable onClose={() => setSelectedSubcategory('')}>
                  Subcategory: {selectedSubcategory}
                </Tag>
              )}
              {selectedType && (
                <Tag closable onClose={() => setSelectedType('')}>
                  Type: {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
                </Tag>
              )}
              {selectedStatus && (
                <Tag closable onClose={() => setSelectedStatus('')}>
                  Status: {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
                </Tag>
              )}
            </Space>
          </div>
        )}
      </Card>

      {/* Content Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={contentData?.content || []}
          loading={isLoading}
          rowKey="id"
          rowSelection={{
            selectedRowKeys: selectedContentIds,
            onChange: (selectedRowKeys) => {
              setSelectedContentIds(selectedRowKeys as string[]);
            },
            getCheckboxProps: (record) => ({
              disabled: record.status === 'active', // Can't schedule active content
            }),
          }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: contentData?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} items`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            onShowSizeChange: (current, size) => {
              setCurrentPage(1);
              setPageSize(size);
            },
          }}
        />
      </Card>

      {/* Edit/Add Modal */}
      <Modal
        title={editingContent ? 'Edit Content' : 'Add New Content'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingContent(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <ContentForm
          form={form}
          categories={categoriesData?.categories || []}
          subcategories={subcategoriesData?.subcategories || []}
          languages={languagesData?.languages || []}
          onSubmit={(values) => {
            const contentObject = {
              ...values,
              id: editingContent?.id || '',
              content_group_id: editingContent?.content_group_id || '',
              popularity_score: editingContent?.popularity_score || 0,
              is_visible: true,
              created_at: editingContent?.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            
            // Use create mutation for new content, update mutation for existing content
            if (editingContent?.id) {
              // Update expects array format
              const updateData = {
                content: [contentObject],
                user_id: 'admin-user', // This should come from auth context
              };
              updateContentMutation.mutate(updateData);
            } else {
              // Create expects single object format
              const createData = {
                content: contentObject,
                user_id: 'admin-user', // This should come from auth context
              };
              createContentMutation.mutate(createData);
            }
          }}
          loading={createContentMutation.isPending || updateContentMutation.isPending}
        />
      </Modal>

      {/* Scheduling Modal */}
      <SchedulingModal
        visible={schedulingModalVisible}
        onCancel={() => setSchedulingModalVisible(false)}
        onSchedule={(scheduledAt) => {
          bulkScheduleMutation.mutate({
            content_ids: selectedContentIds,
            scheduled_at: scheduledAt,
          });
          setSchedulingModalVisible(false);
        }}
        loading={bulkScheduleMutation.isPending}
        contentCount={selectedContentIds.length}
      />

      {/* Feed Preview Modal */}
      <FeedPreviewModal
        visible={feedPreviewModalVisible}
        onCancel={() => setFeedPreviewModalVisible(false)}
        contentId={editingContent?.id}
      />
    </div>
  );
};

export default ContentManagement; 
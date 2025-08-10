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
  DownloadOutlined
} from '@ant-design/icons';
import { contentApi, categoriesApi, subcategoriesApi, languagesApi } from '@/services/api';
import type { Content } from '@/types';
import ContentForm from '@/components/ContentForm';

const { Option } = Select;

const ContentManagement: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Queries
  const { data: contentData, isLoading } = useQuery({
    queryKey: ['content', { search: searchText, language: selectedLanguage, type: selectedType, status: selectedStatus }, currentPage, pageSize],
    queryFn: () => contentApi.getContentList({
      page: currentPage,
      limit: pageSize,
      search: searchText,
      language_id: selectedLanguage,
      type: selectedType,
      status: selectedStatus,
    }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories(),
  });

  const { data: subcategoriesData } = useQuery({
    queryKey: ['subcategories'],
    queryFn: () => subcategoriesApi.getSubcategories(),
  });

  const { data: languagesData } = useQuery({
    queryKey: ['languages'],
    queryFn: () => languagesApi.getLanguages(),
  });

  // Mutations
  const updateContentMutation = useMutation({
    mutationFn: (data: { content: Content[]; user_id: string }) => 
      contentApi.updateContent(data),
    onSuccess: () => {
      message.success('Content updated successfully');
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
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>
          {status}
        </Tag>
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
            {languagesData?.languages?.map((lang: any) => (
              <Option key={lang.language_id} value={lang.language_id}>
                {lang.name}
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
            <Option value="quote">Quote</Option>
            <Option value="meme">Meme</Option>
            <Option value="dialogue">Dialogue</Option>
          </Select>
          <Select
            placeholder="Status"
            value={selectedStatus}
            onChange={setSelectedStatus}
            allowClear
            style={{ width: 120 }}
          >
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
            <Option value="draft">Draft</Option>
          </Select>
        </Space>
      </Card>

      {/* Content Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={contentData?.content || []}
          loading={isLoading}
          rowKey="id"
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
            const contentData = {
              content: [{
                ...values,
                id: editingContent?.id || '',
                content_group_id: editingContent?.content_group_id || '',
                popularity_score: editingContent?.popularity_score || 0,
                is_visible: true,
                created_at: editingContent?.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }],
              user_id: 'admin-user', // This should come from auth context
            };
            
            updateContentMutation.mutate(contentData);
          }}
          loading={updateContentMutation.isPending}
        />
      </Modal>
    </div>
  );
};

export default ContentManagement; 
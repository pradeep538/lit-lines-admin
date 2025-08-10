import React, { useState } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Input, 
  Modal, 
  message,
  Popconfirm,
  Tooltip,
  Tag,
  Select
} from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined,
  TranslationOutlined
} from '@ant-design/icons';
import { categoriesApi, languagesApi } from '@/services/api';
import type { Category, CategoryFormData } from '@/types';
import SimplifiedCategoryForm from '@/components/SimplifiedCategoryForm';
import TranslationManager from '@/components/TranslationManager';

const { Option } = Select;

const CategoryManagement: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const queryClient = useQueryClient();

  // Queries
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories', currentPage, pageSize],
    queryFn: () => categoriesApi.getCategories(currentPage, pageSize),
    staleTime: 30000,
    retry: 1,
  });

  // No fallback data - use only API data

  const { data: languagesData } = useQuery({
    queryKey: ['languages'],
    queryFn: () => languagesApi.getLanguages(),
  });

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: (data: { category: CategoryFormData; user_id: string }) => 
      categoriesApi.createCategory(data),
    onSuccess: () => {
      message.success('Category created successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalVisible(false);
      setEditingCategory(null);
    },
    onError: (error) => {
      message.error('Failed to create category');
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (data: { id: string; category: CategoryFormData; user_id: string }) => 
      categoriesApi.updateCategory(data.id, { category: data.category, user_id: data.user_id }),
    onSuccess: () => {
      message.success('Category updated successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalVisible(false);
      setEditingCategory(null);
    },
    onError: (error) => {
      message.error('Failed to update category');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (data: { id: string; user_id: string }) => 
      categoriesApi.deleteCategory(data.id, { user_id: data.user_id }),
    onSuccess: () => {
      message.success('Category deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      message.error('Failed to delete category');
    },
  });

  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: Category) => {
    setEditingCategory(record);
    setIsModalVisible(true);
  };

  const handleDelete = (categoryId: string) => {
    deleteCategoryMutation.mutate({
      id: categoryId,
      user_id: 'admin-user',
    });
  };



  const categories = categoriesData?.categories || [];
  const filteredCategories = categories.filter((category: Category) => {
    const matchesSearch = category.name.en?.toLowerCase().includes(searchText.toLowerCase()) ||
                         category.description.en?.toLowerCase().includes(searchText.toLowerCase());
    const matchesLanguage = !selectedLanguage || category.language_context === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  const columns = [
    {
      title: 'Category',
      key: 'category',
      render: (_, record: Category) => (
        <Space>
          {record.image_url && (
            <img 
              src={record.image_url} 
              alt={record.name.en}
              style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }}
            />
          )}
          <div>
            <div style={{ fontWeight: 500 }}>{record.name.en}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.description.en?.substring(0, 60)}...
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Language Context',
      dataIndex: 'language_context',
      key: 'language_context',
      render: (context: string) => (
        <Tag color="blue">{context}</Tag>
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
      title: 'Sort Order',
      dataIndex: 'sort_order',
      key: 'sort_order',
      sorter: (a: Category, b: Category) => a.sort_order - b.sort_order,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Category) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Manage Translations">
            <TranslationManager
              type="category"
              itemId={record.category_id}
              itemName={record.name?.en || record.category_id}
              languages={languagesData?.languages || []}
              existingTranslations={record.name}
              onSuccess={() => queryClient.invalidateQueries({ queryKey: ['categories'] })}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this category?"
              onConfirm={() => handleDelete(record.category_id)}
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
          Category Management
        </h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Category
        </Button>
      </div>

      {/* Search and Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Space wrap>
          <Input
            placeholder="Search categories..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filter by language"
            value={selectedLanguage}
            onChange={setSelectedLanguage}
            allowClear
            style={{ width: 200 }}
          >
            {languagesData?.languages?.map((lang: any) => (
              <Option key={lang.language_id} value={lang.language_id}>
                {lang.name}
              </Option>
            )) || [
              { language_id: 'en', name: 'English' },
              { language_id: 'es', name: 'Spanish' },
              { language_id: 'fr', name: 'French' },
            ].map((lang: any) => (
              <Option key={lang.language_id} value={lang.language_id}>
                {lang.name}
              </Option>
            ))}
          </Select>
        </Space>
      </Card>

      {/* Categories Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={categoriesData?.categories || []}
          loading={isLoading}
          rowKey="category_id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: categoriesData?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} categories`,
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

      {/* Add/Edit Modal */}
      <Modal
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingCategory(null);
        }}
        footer={null}
        width={600}
      >
        <SimplifiedCategoryForm
          editingCategory={editingCategory}
          onSuccess={() => {
            setIsModalVisible(false);
            setEditingCategory(null);
            queryClient.invalidateQueries({ queryKey: ['categories'] });
          }}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingCategory(null);
          }}
          languages={languagesData?.languages || []}
        />
      </Modal>
    </div>
  );
};

export default CategoryManagement; 
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
import { subcategoriesApi, categoriesApi, languagesApi } from '@/services/api';
import type { Subcategory, SubcategoryFormData } from '@/types';
import SimplifiedSubcategoryForm from '@/components/SimplifiedSubcategoryForm';
import TranslationManager from '@/components/TranslationManager';

const { Option } = Select;

const SubcategoryManagement: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const queryClient = useQueryClient();

  // Queries
  const { data: subcategoriesData, isLoading } = useQuery({
    queryKey: ['subcategories', selectedCategory, currentPage, pageSize],
    queryFn: () => subcategoriesApi.getSubcategories(selectedCategory, currentPage, pageSize),
    staleTime: 30000,
    retry: 1,
  });

  // No fallback data - use only API data

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories(),
  });

  const { data: languagesData } = useQuery({
    queryKey: ['languages'],
    queryFn: () => languagesApi.getLanguages(),
  });

  // Mutations
  const createSubcategoryMutation = useMutation({
    mutationFn: (data: { subcategory: SubcategoryFormData; user_id: string }) => 
      subcategoriesApi.createSubcategory(data),
    onSuccess: () => {
      message.success('Subcategory created successfully');
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      setIsModalVisible(false);
      setEditingSubcategory(null);
    },
    onError: (error) => {
      message.error('Failed to create subcategory');
    },
  });

  const updateSubcategoryMutation = useMutation({
    mutationFn: (data: { id: string; subcategory: SubcategoryFormData; user_id: string }) => 
      subcategoriesApi.updateSubcategory(data.id, { subcategory: data.subcategory, user_id: data.user_id }),
    onSuccess: () => {
      message.success('Subcategory updated successfully');
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      setIsModalVisible(false);
      setEditingSubcategory(null);
    },
    onError: (error) => {
      message.error('Failed to update subcategory');
    },
  });

  const deleteSubcategoryMutation = useMutation({
    mutationFn: (data: { id: string; user_id: string }) => 
      subcategoriesApi.deleteSubcategory(data.id, { user_id: data.user_id }),
    onSuccess: () => {
      message.success('Subcategory deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    },
    onError: (error) => {
      message.error('Failed to delete subcategory');
    },
  });

  const handleAdd = () => {
    setEditingSubcategory(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: Subcategory) => {
    setEditingSubcategory(record);
    setIsModalVisible(true);
  };

  const handleDelete = (subcategoryId: string) => {
    deleteSubcategoryMutation.mutate({
      id: subcategoryId,
      user_id: 'admin-user',
    });
  };



  const subcategories = subcategoriesData?.subcategories || [];
  const filteredSubcategories = subcategories.filter((subcategory: Subcategory) => {
    const matchesSearch = subcategory.name.en?.toLowerCase().includes(searchText.toLowerCase()) ||
                         subcategory.description.en?.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = !selectedCategory || subcategory.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: string) => {
    const categories = categoriesData?.categories || [
      { category_id: 'cat1', name: { en: 'Inspiration' } },
      { category_id: 'cat2', name: { en: 'Wisdom' } },
    ];
    const category = categories.find((cat: any) => cat.category_id === categoryId);
    return category?.name?.en || 'Unknown Category';
  };

  const columns = [
    {
      title: 'Subcategory',
      key: 'subcategory',
      render: (_, record: Subcategory) => (
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
      title: 'Parent Category',
      dataIndex: 'category_id',
      key: 'category_id',
      render: (categoryId: string) => (
        <Tag color="purple">{getCategoryName(categoryId)}</Tag>
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
      sorter: (a: Subcategory, b: Subcategory) => a.sort_order - b.sort_order,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Subcategory) => (
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
              type="subcategory"
              itemId={record.subcategory_id}
              itemName={record.name?.en || record.subcategory_id}
              languages={languagesData?.languages || []}
              existingTranslations={record.name}
              onSuccess={() => queryClient.invalidateQueries({ queryKey: ['subcategories'] })}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this subcategory?"
              onConfirm={() => handleDelete(record.subcategory_id)}
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
          Subcategory Management
        </h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Subcategory
        </Button>
      </div>

      {/* Search and Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Space wrap>
          <Input
            placeholder="Search subcategories..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filter by category"
            value={selectedCategory}
            onChange={setSelectedCategory}
            allowClear
            style={{ width: 250 }}
          >
            {(categoriesData?.categories || [
              { category_id: 'cat1', name: { en: 'Inspiration' } },
              { category_id: 'cat2', name: { en: 'Wisdom' } },
            ]).map((category: any) => (
              <Option key={category.category_id} value={category.category_id}>
                {category.name.en}
              </Option>
            ))}
          </Select>
        </Space>
      </Card>

      {/* Subcategories Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={subcategoriesData?.subcategories || []}
          loading={isLoading}
          rowKey="subcategory_id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: subcategoriesData?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} subcategories`,
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
        title={editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingSubcategory(null);
        }}
        footer={null}
        width={600}
      >
        <SimplifiedSubcategoryForm
          editingSubcategory={editingSubcategory}
          onSuccess={() => {
            setIsModalVisible(false);
            setEditingSubcategory(null);
            queryClient.invalidateQueries({ queryKey: ['subcategories'] });
          }}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingSubcategory(null);
          }}
          categories={categoriesData?.categories || []}
        />
      </Modal>
    </div>
  );
};

export default SubcategoryManagement; 
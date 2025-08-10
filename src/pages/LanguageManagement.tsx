import React, { useState } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Input, 
  Modal, 
  Form, 
  message,
  Popconfirm,
  Tooltip,
  Tag,
  Switch,
  Select
} from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined
} from '@ant-design/icons';
import { languagesApi } from '@/services/api';
import type { Language, LanguageFormData } from '@/types';

const { Option } = Select;

const LanguageManagement: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Queries
  const { data: languagesData, isLoading } = useQuery({
    queryKey: ['languages', currentPage, pageSize],
    queryFn: () => languagesApi.getLanguages(currentPage, pageSize),
    staleTime: 30000,
    retry: 1,
  });

  // No fallback data - use only API data

  // Mutations
  const createLanguageMutation = useMutation({
    mutationFn: (data: { language: LanguageFormData; user_id: string }) => 
      languagesApi.createLanguage(data),
    onSuccess: () => {
      message.success('Language created successfully');
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      setIsModalVisible(false);
      setEditingLanguage(null);
      form.resetFields();
    },
    onError: () => {
      message.error('Failed to create language');
    },
  });

  const updateLanguageMutation = useMutation({
    mutationFn: (data: { id: string; language: LanguageFormData; user_id: string }) => 
      languagesApi.updateLanguage(data.id, { language: data.language, user_id: data.user_id }),
    onSuccess: () => {
      message.success('Language updated successfully');
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      setIsModalVisible(false);
      setEditingLanguage(null);
      form.resetFields();
    },
    onError: () => {
      message.error('Failed to update language');
    },
  });

  const deleteLanguageMutation = useMutation({
    mutationFn: (data: { id: string; user_id: string }) => 
      languagesApi.deleteLanguage(data.id, { user_id: data.user_id }),
    onSuccess: () => {
      message.success('Language deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['languages'] });
    },
    onError: () => {
      message.error('Failed to delete language');
    },
  });

  const handleAdd = () => {
    setEditingLanguage(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Language) => {
    setEditingLanguage(record);
    form.setFieldsValue({
      name: record.name,
      native_name: record.native_name,
      flag_icon_url: record.flag_icon_url,
      status: record.status,
      is_default: record.is_default,
      sort_order: record.sort_order,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (languageId: string) => {
    deleteLanguageMutation.mutate({
      id: languageId,
      user_id: 'admin-user',
    });
  };

  const handleSubmit = async (values: LanguageFormData) => {
    if (editingLanguage) {
      updateLanguageMutation.mutate({
        id: editingLanguage.language_id,
        language: values,
        user_id: 'admin-user',
      });
    } else {
      createLanguageMutation.mutate({
        language: values,
        user_id: 'admin-user',
      });
    }
  };

  const languages = languagesData?.languages || [];
  const filteredLanguages = languages.filter((lang: Language) =>
    lang.name.toLowerCase().includes(searchText.toLowerCase()) ||
    lang.native_name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Language',
      key: 'language',
      render: (_: any, record: Language) => (
        <Space>
          {record.flag_icon_url && (
            <img 
              src={record.flag_icon_url} 
              alt={record.name}
              style={{ width: 24, height: 16, borderRadius: 2 }}
            />
          )}
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.native_name}</div>
          </div>
        </Space>
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
      title: 'Default',
      dataIndex: 'is_default',
      key: 'is_default',
      render: (isDefault: boolean) => (
        <Tag color={isDefault ? 'blue' : 'default'}>
          {isDefault ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'Sort Order',
      dataIndex: 'sort_order',
      key: 'sort_order',
      sorter: (a: Language, b: Language) => a.sort_order - b.sort_order,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Language) => (
        <Space size="small">
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
              title="Are you sure you want to delete this language?"
              onConfirm={() => handleDelete(record.language_id)}
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
          Language Management
        </h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Language
        </Button>
      </div>

      {/* Search */}
      <Card style={{ marginBottom: '24px' }}>
        <Input
          placeholder="Search languages..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </Card>

      {/* Languages Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={languagesData?.languages || []}
          loading={isLoading}
          rowKey="language_id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: languagesData?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} languages`,
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
        title={editingLanguage ? 'Edit Language' : 'Add New Language'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingLanguage(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'active',
            is_default: false,
            sort_order: 0,
          }}
        >
          <Form.Item
            name="name"
            label="Language Name (English)"
            rules={[{ required: true, message: 'Please enter language name' }]}
          >
            <Input placeholder="e.g., English, Spanish, French" />
          </Form.Item>

          <Form.Item
            name="native_name"
            label="Native Name"
            rules={[{ required: true, message: 'Please enter native name' }]}
          >
            <Input placeholder="e.g., English, Español, Français" />
          </Form.Item>

          <Form.Item
            name="flag_icon_url"
            label="Flag Icon URL"
          >
            <Input placeholder="https://example.com/flag.png" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="is_default"
            label="Default Language"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="sort_order"
            label="Sort Order"
            rules={[{ required: true, message: 'Please enter sort order' }]}
          >
            <Input type="number" placeholder="0" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => form.resetFields()}>
                Reset
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={createLanguageMutation.isPending || updateLanguageMutation.isPending}
              >
                {editingLanguage ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LanguageManagement; 
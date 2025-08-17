import React, { useState } from 'react';
import { Card, Table, Button, Modal, Form, Select, InputNumber, Space, Tag, message, Spin } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/services/api';
import { UserOutlined, EditOutlined, SettingOutlined } from '@ant-design/icons';

const { Option } = Select;

const UserPreferences: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: () => userApi.getAllUserPreferences(),
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: any) => userApi.updateUserPreferences(data.user_id, data.preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      setIsModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      message.success('User preferences updated successfully');
    },
    onError: (error: any) => {
      message.error('Failed to update user preferences: ' + (error.response?.data?.message || error.message));
    },
  });

  const columns = [
    {
      title: 'User',
      dataIndex: 'display_name',
      key: 'display_name',
      render: (name: string, record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name || 'Unknown User'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: 'User Segment',
      dataIndex: 'engagement_level',
      key: 'engagement_level',
      render: (level: string) => (
        <Tag color={
          level === 'power_user' ? 'red' : 
          level === 'engaged_user' ? 'orange' : 
          level === 'preference_set' ? 'blue' : 'green'
        }>
          {level?.replace('_', ' ').toUpperCase() || 'NEW USER'}
        </Tag>
      ),
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
          {strategy?.toUpperCase() || 'POPULAR'}
        </Tag>
      ),
    },
    {
      title: 'Languages',
      dataIndex: 'preferences',
      key: 'languages',
      render: (preferences: any) => {
        const languages = preferences?.preferred_languages || preferences?.content_languages || [];
        return languages.length > 0 ? (
          <Space wrap>
            {languages.slice(0, 3).map((lang: string) => (
              <Tag key={lang}>{lang.toUpperCase()}</Tag>
            ))}
            {languages.length > 3 && <Tag>+{languages.length - 3}</Tag>}
          </Space>
        ) : (
          <span style={{ color: '#999' }}>Not set</span>
        );
      },
    },
    {
      title: 'Categories',
      dataIndex: 'preferences',
      key: 'categories',
      render: (preferences: any) => {
        const categories = preferences?.preferred_categories || [];
        return categories.length > 0 ? (
          <Space wrap>
            {categories.slice(0, 2).map((cat: string) => (
              <Tag key={cat} color="blue">{cat}</Tag>
            ))}
            {categories.length > 2 && <Tag>+{categories.length - 2}</Tag>}
          </Space>
        ) : (
          <span style={{ color: '#999' }}>Not set</span>
        );
      },
    },
    {
      title: 'Discovery Ratio',
      dataIndex: 'preferences',
      key: 'discovery_ratio',
      render: (preferences: any) => {
        const ratio = preferences?.discovery_ratio;
        return ratio !== undefined ? (
          <span>{(ratio * 100).toFixed(0)}%</span>
        ) : (
          <span style={{ color: '#999' }}>30%</span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => {
            setEditingUser(record);
            form.setFieldsValue({
              preferred_languages: record.preferences?.preferred_languages || record.preferences?.content_languages || [],
              preferred_categories: record.preferences?.preferred_categories || [],
              preferred_subcategories: record.preferences?.preferred_subcategories || [],
              feed_strategy: record.preferences?.feed_strategy || 'popular',
              discovery_ratio: record.preferences?.discovery_ratio || 0.3,
            });
            setIsModalVisible(true);
          }}
        >
          Edit Preferences
        </Button>
      ),
    },
  ];

  const handleUpdatePreferences = (values: any) => {
    updatePreferencesMutation.mutate({
      user_id: editingUser.user_id,
      preferences: {
        preferred_languages: values.preferred_languages,
        preferred_categories: values.preferred_categories,
        preferred_subcategories: values.preferred_subcategories,
        feed_strategy: values.feed_strategy,
        discovery_ratio: values.discovery_ratio,
      },
    });
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading user preferences...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserOutlined />
          User Preferences Management
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#666' }}>
          Manage user preferences and feed strategies for personalized content delivery
        </p>
      </div>
      
      <Card>
        <Table
          columns={columns}
          dataSource={usersData?.data?.users || []}
          loading={isLoading}
          rowKey="user_id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
          }}
        />
      </Card>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SettingOutlined />
            Edit User Preferences
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
        confirmLoading={updatePreferencesMutation.isPending}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdatePreferences}
        >
          <Form.Item
            name="preferred_languages"
            label="Preferred Languages"
            rules={[{ required: true, message: 'Please select languages' }]}
          >
            <Select mode="multiple" placeholder="Select languages">
              <Option value="en">English</Option>
              <Option value="es">Spanish</Option>
              <Option value="hi">Hindi</Option>
              <Option value="fr">French</Option>
              <Option value="de">German</Option>
              <Option value="zh">Chinese</Option>
              <Option value="ja">Japanese</Option>
              <Option value="ko">Korean</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="preferred_categories"
            label="Preferred Categories"
            rules={[{ required: true, message: 'Please select categories' }]}
          >
            <Select mode="multiple" placeholder="Select categories">
              <Option value="motivation">Motivation</Option>
              <Option value="wisdom">Wisdom</Option>
              <Option value="love">Love</Option>
              <Option value="success">Success</Option>
              <Option value="happiness">Happiness</Option>
              <Option value="relationships">Relationships</Option>
              <Option value="goals">Goals</Option>
              <Option value="inspiration">Inspiration</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="preferred_subcategories"
            label="Preferred Subcategories"
          >
            <Select mode="multiple" placeholder="Select subcategories">
              <Option value="success">Success</Option>
              <Option value="happiness">Happiness</Option>
              <Option value="relationships">Relationships</Option>
              <Option value="goals">Goals</Option>
              <Option value="leadership">Leadership</Option>
              <Option value="mindset">Mindset</Option>
              <Option value="growth">Growth</Option>
              <Option value="confidence">Confidence</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="feed_strategy"
            label="Feed Strategy"
            rules={[{ required: true, message: 'Please select feed strategy' }]}
          >
            <Select placeholder="Select feed strategy">
              <Option value="popular">Popular (Default for new users)</Option>
              <Option value="preference">Preference-based (Based on user selections)</Option>
              <Option value="personalized">Personalized (Based on engagement history)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="discovery_ratio"
            label="Discovery Ratio"
            rules={[{ required: true, message: 'Please set discovery ratio' }]}
            extra="Percentage of content that should be discovery content (new/different from preferences)"
          >
            <InputNumber
              min={0}
              max={1}
              step={0.1}
              placeholder="0.0 to 1.0"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserPreferences;

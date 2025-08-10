import React, { useState } from 'react';
import { Card, Button, Input, List, Space, Typography, Modal, message, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';

const { Title, Text } = Typography;

const AdminManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [newEmail, setNewEmail] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [adminEmails, setAdminEmails] = useState([
    'pradeepmr538@gmail.com',
    // Add more admin emails here
  ]);

  const handleAddEmail = () => {
    if (!newEmail || !newEmail.includes('@')) {
      message.error('Please enter a valid email address');
      return;
    }

    if (adminEmails.includes(newEmail.toLowerCase())) {
      message.error('This email is already in the admin list');
      return;
    }

    setAdminEmails([...adminEmails, newEmail.toLowerCase()]);
    setNewEmail('');
    setIsModalVisible(false);
    message.success('Admin email added successfully');
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    if (emailToRemove === user?.email) {
      message.error('You cannot remove your own email from the admin list');
      return;
    }

    setAdminEmails(adminEmails.filter(email => email !== emailToRemove));
    message.success('Admin email removed successfully');
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3}>Admin Access Management</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Add Admin
          </Button>
        </div>

        <Text type="secondary">
          Manage which email addresses can access the admin panel. Only authorized administrators can modify this list.
        </Text>

        <List
          dataSource={adminEmails}
          renderItem={(email) => (
            <List.Item
              actions={[
                email === user?.email ? (
                  <Tag color="blue">Current User</Tag>
                ) : (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveEmail(email)}
                  >
                    Remove
                  </Button>
                )
              ]}
            >
              <List.Item.Meta
                avatar={<UserOutlined />}
                title={email}
                description={email === user?.email ? 'Currently logged in' : 'Admin access granted'}
              />
            </List.Item>
          )}
        />

        <Modal
          title="Add Admin Email"
          open={isModalVisible}
          onOk={handleAddEmail}
          onCancel={() => {
            setIsModalVisible(false);
            setNewEmail('');
          }}
          okText="Add"
          cancelText="Cancel"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>Enter the email address to grant admin access:</Text>
            <Input
              placeholder="admin@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onPressEnter={handleAddEmail}
            />
          </Space>
        </Modal>
      </Space>
    </Card>
  );
};

export default AdminManagement; 
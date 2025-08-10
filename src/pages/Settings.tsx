import React from 'react';
import { Card, Form, Input, Button, Switch, Select, Space, Typography, Divider, Alert } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const Settings: React.FC = () => {
  const [form] = Form.useForm();

  const handleSave = (values: any) => {
    console.log('Settings saved:', values);
    // Here you would typically save settings to backend
  };

  return (
    <div>
      <Title level={2}>Settings</Title>
      
      <Alert
        message="Settings Configuration"
        description="Configure system settings and preferences for the LitLines admin panel."
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          apiKey: 'test-admin-api-key-here-32-chars',
          backendUrl: 'http://localhost:8081',
          enableNotifications: true,
          autoRefresh: true,
          refreshInterval: 30,
          defaultLanguage: 'en',
          itemsPerPage: 50,
        }}
      >
        <Card title="API Configuration" style={{ marginBottom: '24px' }}>
          <Form.Item
            name="apiKey"
            label="API Key"
            rules={[{ required: true, message: 'API key is required' }]}
          >
            <Input.Password placeholder="Enter API key" />
          </Form.Item>
          
          <Form.Item
            name="backendUrl"
            label="Backend URL"
            rules={[{ required: true, message: 'Backend URL is required' }]}
          >
            <Input placeholder="http://localhost:8081" />
          </Form.Item>
        </Card>

        <Card title="Interface Settings" style={{ marginBottom: '24px' }}>
          <Form.Item
            name="defaultLanguage"
            label="Default Language"
          >
            <Select placeholder="Select default language">
              <Option value="en">English</Option>
              <Option value="es">Spanish</Option>
              <Option value="fr">French</Option>
              <Option value="de">German</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="itemsPerPage"
            label="Items per Page"
          >
            <Select placeholder="Select items per page">
              <Option value={25}>25</Option>
              <Option value={50}>50</Option>
              <Option value={100}>100</Option>
            </Select>
          </Form.Item>
        </Card>

        <Card title="Notification Settings" style={{ marginBottom: '24px' }}>
          <Form.Item
            name="enableNotifications"
            label="Enable Notifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="autoRefresh"
            label="Auto Refresh"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="refreshInterval"
            label="Refresh Interval (seconds)"
            dependencies={['autoRefresh']}
          >
            <Select disabled={!form.getFieldValue('autoRefresh')}>
              <Option value={15}>15 seconds</Option>
              <Option value={30}>30 seconds</Option>
              <Option value={60}>1 minute</Option>
              <Option value={300}>5 minutes</Option>
            </Select>
          </Form.Item>
        </Card>

        <Card title="Data Management" style={{ marginBottom: '24px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Paragraph>
              Export all content data for backup or migration purposes.
            </Paragraph>
            <Button icon={<SaveOutlined />}>
              Export All Data
            </Button>
          </Space>
          
          <Divider />
          
          <Space direction="vertical" style={{ width: '100%' }}>
            <Paragraph>
              Clear all cached data and refresh from server.
            </Paragraph>
            <Button icon={<ReloadOutlined />}>
              Clear Cache
            </Button>
          </Space>
        </Card>

        <Form.Item style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={() => form.resetFields()}>
              Reset
            </Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Save Settings
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Settings; 
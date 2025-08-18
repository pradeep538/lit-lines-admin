import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Row, Col, Space, DatePicker, Switch, Divider } from 'antd';
import type { FormInstance } from 'antd';
import type { ContentFormData } from '@/types';
import ImageUpload from './ImageUpload';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface ContentFormProps {
  form: FormInstance;
  categories: any[];
  subcategories: any[];
  languages: any[];
  onSubmit: (values: ContentFormData) => void;
  loading?: boolean;
}

const ContentForm: React.FC<ContentFormProps> = ({
  form,
  categories,
  subcategories,
  languages,
  onSubmit,
  loading = false,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(
    form.getFieldValue('category_id')
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | undefined>(
    form.getFieldValue('subcategory_id')
  );
  const [isScheduled, setIsScheduled] = useState<boolean>(false);

  // Reset subcategory when category changes
  useEffect(() => {
    const categoryId = form.getFieldValue('category_id');
    const subcategoryId = form.getFieldValue('subcategory_id');
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(subcategoryId);
    
    if (categoryId) {
      // Clear subcategory if it doesn't belong to the selected category
      const currentSubcategoryId = form.getFieldValue('subcategory_id');
      const validSubcategories = subcategories.filter(sub => sub.category_id === categoryId);
      const isValidSubcategory = validSubcategories.some(sub => sub.subcategory_id === currentSubcategoryId);
      
      if (!isValidSubcategory) {
        form.setFieldValue('subcategory_id', undefined);
        setSelectedSubcategoryId(undefined);
      }
    } else {
      // Clear subcategory when no category is selected
      form.setFieldValue('subcategory_id', undefined);
      setSelectedSubcategoryId(undefined);
    }
  }, [form.getFieldValue('category_id'), form.getFieldValue('subcategory_id'), subcategories, form]);

  // Handle scheduling toggle
  useEffect(() => {
    const scheduledAt = form.getFieldValue('scheduled_at');
    const status = form.getFieldValue('status');
    
    if (scheduledAt) {
      setIsScheduled(true);
      if (status !== 'scheduled') {
        form.setFieldValue('status', 'scheduled');
      }
    } else {
      setIsScheduled(false);
      if (status === 'scheduled') {
        form.setFieldValue('status', 'draft');
      }
    }
  }, [form.getFieldValue('scheduled_at'), form.getFieldValue('status'), form]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    // Clear subcategory when category changes
    form.setFieldValue('subcategory_id', undefined);
    setSelectedSubcategoryId(undefined);
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
  };

  const handleSchedulingToggle = (checked: boolean) => {
    setIsScheduled(checked);
    if (checked) {
      // Set default scheduled time to 1 hour from now
      const defaultScheduledTime = dayjs().add(1, 'hour');
      form.setFieldValue('scheduled_at', defaultScheduledTime);
      form.setFieldValue('status', 'scheduled');
    } else {
      form.setFieldValue('scheduled_at', undefined);
      form.setFieldValue('status', 'draft');
    }
  };

  const handleScheduledDateChange = (date: any) => {
    if (date) {
      form.setFieldValue('scheduled_at', date);
      form.setFieldValue('status', 'scheduled');
      setIsScheduled(true);
    } else {
      form.setFieldValue('scheduled_at', undefined);
      form.setFieldValue('status', 'draft');
      setIsScheduled(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Convert scheduled_at to ISO string if it exists
      if (values.scheduled_at) {
        values.scheduled_at = values.scheduled_at.toISOString();
      }
      
      onSubmit(values);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      style={{ marginTop: '16px' }}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="text"
            label="Content Text"
            rules={[{ required: true, message: 'Please enter content text' }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter the content text..."
              maxLength={1000}
              showCount
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="author"
            label="Author"
          >
            <Input placeholder="Enter author name (optional)" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="source"
            label="Source"
          >
            <Input placeholder="Enter source (book, movie, etc.) - optional" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="language_id"
            label="Language"
            rules={[{ required: true, message: 'Please select language' }]}
          >
            <Select placeholder="Select language">
              {languages.map((lang) => (
                <Option key={lang.language_id} value={lang.language_id}>
                  {lang.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="type"
            label="Content Type"
            rules={[{ required: true, message: 'Please select content type' }]}
          >
            <Select placeholder="Select type">
              <Option value="quote">Quote</Option>
              <Option value="meme">Meme</Option>
              <Option value="dialogue">Dialogue</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="draft">Draft</Option>
              <Option value="scheduled">Scheduled</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="category_id"
            label="Category"
          >
            <Select 
              placeholder="Select category" 
              allowClear
              onChange={handleCategoryChange}
            >
              {categories.map((category) => (
                <Option key={category.category_id} value={category.category_id}>
                  {category.name?.en || category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="subcategory_id"
            label="Subcategory"
          >
            <Select 
              placeholder="Select subcategory" 
              allowClear
              disabled={!selectedCategoryId}
              onChange={handleSubcategoryChange}
            >
              {subcategories
                .filter(sub => selectedCategoryId && sub.category_id === selectedCategoryId)
                .map((subcategory) => (
                  <Option key={subcategory.subcategory_id} value={subcategory.subcategory_id}>
                    {subcategory.name?.en || subcategory.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* Scheduling Section */}
      <Divider orientation="left">Scheduling</Divider>
      
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Schedule Content"
            help="Enable to schedule this content for future publishing"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Switch
                checked={isScheduled}
                onChange={handleSchedulingToggle}
                checkedChildren="Scheduled"
                unCheckedChildren="Not Scheduled"
              />
              
              {isScheduled && (
                <Form.Item
                  name="scheduled_at"
                  label="Scheduled Date & Time"
                  rules={[
                    { required: isScheduled, message: 'Please select scheduled date and time' },
                    {
                      validator: (_, value) => {
                        if (value && value.isBefore(dayjs())) {
                          return Promise.reject('Scheduled time cannot be in the past');
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="Select date and time"
                    onChange={handleScheduledDateChange}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              )}
            </Space>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="background_image_url"
            label="Background Image"
            noStyle
          >
            <ImageUpload
              categoryId={selectedCategoryId || ''}
              subcategoryId={selectedSubcategoryId || ''}
              label="Upload Background Image"
              placeholder="Upload background image for the content"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="shareable_image_url"
            label="Shareable Image"
            noStyle
          >
            <ImageUpload
              categoryId={selectedCategoryId || ''}
              subcategoryId={selectedSubcategoryId || ''}
              label="Upload Shareable Image"
              placeholder="Upload shareable image for social media"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="tags"
            label="Tags"
          >
            <Select
              mode="tags"
              placeholder="Enter tags"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Space>
          <Button onClick={() => form.resetFields()}>
            Reset
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ContentForm; 
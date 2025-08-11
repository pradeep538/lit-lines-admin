import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Row, Col, Space } from 'antd';
import type { FormInstance } from 'antd';
import type { ContentFormData } from '@/types';
import ImageUpload from './ImageUpload';

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

  // Reset subcategory when category changes
  useEffect(() => {
    const categoryId = form.getFieldValue('category_id');
    setSelectedCategoryId(categoryId);
    
    if (categoryId) {
      // Clear subcategory if it doesn't belong to the selected category
      const currentSubcategoryId = form.getFieldValue('subcategory_id');
      const validSubcategories = subcategories.filter(sub => sub.category_id === categoryId);
      const isValidSubcategory = validSubcategories.some(sub => sub.subcategory_id === currentSubcategoryId);
      
      if (!isValidSubcategory) {
        form.setFieldValue('subcategory_id', undefined);
      }
    } else {
      // Clear subcategory when no category is selected
      form.setFieldValue('subcategory_id', undefined);
    }
  }, [form.getFieldValue('category_id'), subcategories, form]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    // Clear subcategory when category changes
    form.setFieldValue('subcategory_id', undefined);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
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
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="draft">Draft</Option>
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

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="background_image_url"
            label="Background Image"
            noStyle
          >
            <ImageUpload
              categoryId={form.getFieldValue('category_id') || ''}
              subcategoryId={form.getFieldValue('subcategory_id') || ''}
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
              categoryId={form.getFieldValue('category_id') || ''}
              subcategoryId={form.getFieldValue('subcategory_id') || ''}
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
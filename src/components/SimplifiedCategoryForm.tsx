import React from 'react';
import { Form, Input, Select, InputNumber, Button, message } from 'antd';
import { categoriesApi } from '@/services/api';
import ImageUpload from './ImageUpload';
import type { Category } from '@/types';

const { Option } = Select;
const { TextArea } = Input;

interface SimplifiedCategoryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  languages?: any[];
  editingCategory?: Category | null;
}

const SimplifiedCategoryForm: React.FC<SimplifiedCategoryFormProps> = ({
  onSuccess,
  onCancel,
  languages = [],
  editingCategory = null
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  // Set initial values when editing
  React.useEffect(() => {
    if (editingCategory) {
      form.setFieldsValue({
        language_context: editingCategory.language_context,
        name: editingCategory.name.en || '', // Assuming English as default
        description: editingCategory.description.en || '', // Assuming English as default
        image_url: editingCategory.image_url || '',
        status: editingCategory.status || 'active',
        sort_order: editingCategory.sort_order || 0,
      });
    }
  }, [editingCategory, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (editingCategory) {
        // Update existing category
        const categoryData = {
          language_context: values.language_context,
          name: { en: values.name }, // Simplified to single language for now
          description: { en: values.description }, // Simplified to single language for now
          image_url: values.image_url || '',
          status: values.status || 'active',
          sort_order: values.sort_order || 0,
        };

        await categoriesApi.updateCategory(editingCategory.category_id, {
          category: categoryData,
          user_id: 'admin-user',
        });
        message.success('Category updated successfully!');
      } else {
        // Create new category - use the format expected by CategoryCreateRequest
        const categoryData = {
          language_context: values.language_context,
          name: values.name, // Single string for the specified language
          description: values.description, // Single string for the specified language
          image_url: values.image_url || '',
          status: values.status || 'active',
          sort_order: values.sort_order || 0,
        };

        await categoriesApi.createCategorySimple({
          category: categoryData,
          user_id: 'admin-user',
        });
        message.success('Category created successfully!');
      }

      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error(editingCategory ? 'Failed to update category' : 'Failed to create category');
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        status: 'active',
        sort_order: 0,
      }}
    >
      <Form.Item
        name="language_context"
        label="Language Context"
        rules={[{ required: true, message: 'Please select a language context' }]}
      >
        <Select placeholder="Select language context">
          {languages.map((lang) => (
            <Option key={lang.language_id} value={lang.language_id}>
              {lang.name} ({lang.native_name})
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="name"
        label="Category Name"
        rules={[{ required: true, message: 'Please enter category name' }]}
      >
        <Input placeholder="Enter category name" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: 'Please enter description' }]}
      >
        <TextArea 
          rows={3} 
          placeholder="Enter category description"
        />
      </Form.Item>

      <Form.Item
        name="image_url"
        label="Category Image (Optional)"
        noStyle
      >
        <ImageUpload
          categoryId="categories" // Use a special category ID for category images
          subcategoryId="general" // Use a general subcategory for category images
          label="Upload Category Image"
          placeholder="Upload image for the category"
        />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
      >
        <Select>
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="sort_order"
        label="Sort Order"
      >
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {editingCategory ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default SimplifiedCategoryForm; 
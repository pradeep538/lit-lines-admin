import React from 'react';
import { Form, Input, Select, InputNumber, Button, message } from 'antd';
import { subcategoriesApi } from '@/services/api';
import ImageUpload from './ImageUpload';
import type { Subcategory } from '@/types';

const { Option } = Select;
const { TextArea } = Input;

interface SimplifiedSubcategoryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  categories?: any[];
  editingSubcategory?: Subcategory | null;
}

const SimplifiedSubcategoryForm: React.FC<SimplifiedSubcategoryFormProps> = ({
  onSuccess,
  onCancel,
  categories = [],
  editingSubcategory = null
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const [selectedCategory, setSelectedCategory] = React.useState<any>(null);

  // Set initial values when editing
  React.useEffect(() => {
    if (editingSubcategory) {
      const parentCategory = categories.find(cat => cat.category_id === editingSubcategory.category_id);
      setSelectedCategory(parentCategory);
      
      form.setFieldsValue({
        category_id: editingSubcategory.category_id,
        language_context: 'en', // Default to English since subcategories inherit from parent category
        name: editingSubcategory.name.en || '', // Assuming English as default
        description: editingSubcategory.description.en || '', // Assuming English as default
        image_url: editingSubcategory.image_url || '',
        status: editingSubcategory.status || 'active',
        sort_order: editingSubcategory.sort_order || 0,
      });
    }
  }, [editingSubcategory, categories, form]);

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(cat => cat.category_id === categoryId);
    setSelectedCategory(category);
    // Reset language context when category changes
    form.setFieldsValue({ language_context: undefined });
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (editingSubcategory) {
        // Update existing subcategory
        const subcategoryData = {
          category_id: values.category_id,
          name: { en: values.name }, // Simplified to single language for now
          description: { en: values.description }, // Simplified to single language for now
          image_url: values.image_url || '',
          status: values.status || 'active',
          sort_order: values.sort_order || 0,
        };

        await subcategoriesApi.updateSubcategory(editingSubcategory.subcategory_id, {
          subcategory: subcategoryData,
          user_id: 'admin-user',
        });
        message.success('Subcategory updated successfully!');
      } else {
        // Create new subcategory - use the format expected by SubcategoryCreateRequest
        const subcategoryData = {
          category_id: values.category_id,
          language_context: values.language_context,
          name: values.name, // Single string for the specified language
          description: values.description, // Single string for the specified language
          image_url: values.image_url || '',
          status: values.status || 'active',
          sort_order: values.sort_order || 0,
        };

        await subcategoriesApi.createSubcategorySimple({
          subcategory: subcategoryData,
          user_id: 'admin-user',
        });
        message.success('Subcategory created successfully!');
      }

      form.resetFields();
      setSelectedCategory(null);
      onSuccess();
    } catch (error) {
      message.error(editingSubcategory ? 'Failed to update subcategory' : 'Failed to create subcategory');
      console.error('Error saving subcategory:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ 
        background: '#f6f8fa', 
        padding: '12px', 
        borderRadius: '6px', 
        marginBottom: '16px',
        border: '1px solid #e1e4e8'
      }}>
        <div style={{ fontSize: '14px', color: '#586069', marginBottom: '4px' }}>
          <strong>ℹ️ Note:</strong> Subcategories use a specific language context from their parent category.
        </div>
        <div style={{ fontSize: '12px', color: '#6a737d' }}>
          Select the language context you want to use for this subcategory from the available languages in the parent category.
        </div>
      </div>
      
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
        name="category_id"
        label="Parent Category"
        rules={[{ required: true, message: 'Please select a parent category' }]}
      >
        <Select 
          placeholder="Select parent category"
          onChange={handleCategoryChange}
        >
          {categories.map((category) => (
            <Option key={category.category_id} value={category.category_id}>
              {category.name?.en || category.name || category.category_id}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="language_context"
        label="Language Context"
        rules={[{ required: true, message: 'Please select a language context' }]}
      >
        <Select 
          placeholder="Select language context"
          disabled={!selectedCategory}
        >
          {selectedCategory && Object.keys(selectedCategory.name || {}).map((langCode) => (
            <Option key={langCode} value={langCode}>
              {langCode.toUpperCase()} - {selectedCategory.name[langCode]}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="name"
        label="Subcategory Name"
        rules={[{ required: true, message: 'Please enter subcategory name' }]}
      >
        <Input placeholder="Enter subcategory name" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: 'Please enter description' }]}
      >
        <TextArea 
          rows={3} 
          placeholder="Enter subcategory description"
        />
      </Form.Item>

      <Form.Item
        name="image_url"
        label="Subcategory Image (Optional)"
        noStyle
      >
        <ImageUpload
          categoryId={form.getFieldValue('category_id') || 'subcategories'}
          subcategoryId="general"
          label="Upload Subcategory Image"
          placeholder="Upload image for the subcategory"
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
            {editingSubcategory ? 'Update Subcategory' : 'Create Subcategory'}
          </Button>
        </div>
      </Form.Item>
    </Form>
    </div>
  );
};

export default SimplifiedSubcategoryForm; 
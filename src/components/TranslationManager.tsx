import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, message, Space, Tag, List } from 'antd';
import { TranslationOutlined } from '@ant-design/icons';
import { categoriesApi, subcategoriesApi } from '@/services/api';

const { Option } = Select;
const { TextArea } = Input;

interface TranslationManagerProps {
  type: 'category' | 'subcategory';
  itemId: string;
  itemName: string;
  languages: any[];
  existingTranslations?: Record<string, any>;
  onSuccess: () => void;
}

const TranslationManager: React.FC<TranslationManagerProps> = ({
  type,
  itemId,
  itemName,
  languages,
  existingTranslations = {},
  onSuccess
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleAddTranslation = async (values: any) => {
    setLoading(true);
    try {
      const translationData = {
        language_id: values.language_id,
        name: values.name,
        description: values.description,
      };

      if (type === 'category') {
        await categoriesApi.addCategoryTranslation(itemId, {
          translation: translationData,
          user_id: 'admin-user',
        });
      } else {
        await subcategoriesApi.addSubcategoryTranslation(itemId, {
          translation: translationData,
          user_id: 'admin-user',
        });
      }

      message.success('Translation added successfully!');
      form.resetFields();
      setIsModalVisible(false);
      onSuccess();
    } catch (error) {
      message.error('Failed to add translation');
      console.error('Error adding translation:', error);
    } finally {
      setLoading(false);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Get available languages (excluding existing translations)
  const availableLanguages = languages.filter(
    lang => !existingTranslations[lang.language_id]
  );

  return (
    <>
      <Button 
        type="dashed" 
        icon={<TranslationOutlined />}
        onClick={showModal}
        size="small"
      >
        Manage Translations
      </Button>

      <Modal
        title={`Manage Translations - ${itemName}`}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        {type === 'subcategory' && (
          <div style={{ 
            background: '#f6f8fa', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '16px',
            border: '1px solid #e1e4e8'
          }}>
            <div style={{ fontSize: '14px', color: '#586069' }}>
              <strong>ℹ️ Note:</strong> Subcategories use a specific language context from their parent category. 
              You can add translations for other languages here.
            </div>
          </div>
        )}
        
        <div style={{ marginBottom: 16 }}>
          <h4>Existing Translations:</h4>
          <List
            size="small"
            dataSource={Object.entries(existingTranslations)}
            renderItem={([langId, translation]) => {
              const language = languages.find(l => l.language_id === langId);
              return (
                <List.Item>
                  <Space>
                    <Tag color="blue">{language?.name || langId}</Tag>
                    <span><strong>{translation.name}</strong></span>
                    <span style={{ color: '#666' }}>{translation.description}</span>
                  </Space>
                </List.Item>
              );
            }}
          />
        </div>

        {availableLanguages.length > 0 ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddTranslation}
          >
            <Form.Item
              name="language_id"
              label="Language"
              rules={[{ required: true, message: 'Please select a language' }]}
            >
              <Select placeholder="Select language to add translation">
                {availableLanguages.map((lang) => (
                  <Option key={lang.language_id} value={lang.language_id}>
                    {lang.name} ({lang.native_name})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter name' }]}
            >
              <Input placeholder="Enter name in selected language" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <TextArea 
                rows={3} 
                placeholder="Enter description in selected language"
              />
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Add Translation
                </Button>
              </div>
            </Form.Item>
          </Form>
        ) : (
          <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>
            All available languages have translations for this {type}.
          </div>
        )}
      </Modal>
    </>
  );
};

export default TranslationManager; 
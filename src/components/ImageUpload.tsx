import React, { useState } from 'react';
import { 
  Upload, 
  Button, 
  message, 
  Image, 
  Space, 
  Typography,
  Card,
  Progress,
  Spin
} from 'antd';
import { 
  UploadOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { uploadApi } from '@/services/api';
import type { UploadResponse } from '@/types';

const { Dragger } = Upload;
const { Text } = Typography;

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  categoryId: string;
  subcategoryId: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  categoryId,
  subcategoryId,
  label = 'Upload Image',
  placeholder = 'Click or drag image to this area to upload',
  disabled = false,
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadApi.uploadImage(file, categoryId, subcategoryId),
    onSuccess: (response: UploadResponse) => {
      message.success('Image uploaded successfully');
      onChange?.(response.url);
      setUploadProgress(0);
      setIsUploading(false);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || 'Failed to upload image');
      setUploadProgress(0);
      setIsUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (url: string) => uploadApi.deleteImage(url),
    onSuccess: () => {
      message.success('Image deleted successfully');
      onChange?.('');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || 'Failed to delete image');
    },
  });

  const handleUpload = (file: File) => {
    // Validate file type
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }

    // Validate file size (max 10MB)
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('Image must be smaller than 10MB!');
      return false;
    }

    // Check if category and subcategory are selected
    if (!categoryId || !subcategoryId) {
      message.error('Please select both category and subcategory before uploading');
      return false;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    uploadMutation.mutate(file, {
      onSettled: () => {
        clearInterval(progressInterval);
        setUploadProgress(100);
      },
    });

    return false; // Prevent default upload behavior
  };

  const handleDelete = () => {
    if (value) {
      deleteMutation.mutate(value);
    }
  };

  const renderUploadArea = () => (
    <Card 
      size="small" 
      style={{ 
        border: '1px dashed #d9d9d9',
        borderRadius: '6px',
        backgroundColor: '#fafafa',
        textAlign: 'center',
        padding: '16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {isUploading ? (
        <div>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          <div style={{ marginTop: 16 }}>
            <Text>Uploading...</Text>
            <Progress percent={uploadProgress} size="small" />
          </div>
        </div>
      ) : (
        <div>
          <UploadOutlined style={{ fontSize: 32, color: '#1890ff' }} />
          <div style={{ marginTop: 12 }}>
            <Text strong style={{ fontSize: 14 }}>{label}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{placeholder}</Text>
          </div>
        </div>
      )}
    </Card>
  );

  return (
    <div>
      {value ? (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Card size="small" style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Image
                src={value}
                alt="Uploaded image"
                width={80}
                height={80}
                style={{ objectFit: 'cover', borderRadius: 4 }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>
                  {label}
                </Text>
                <Text type="secondary" style={{ fontSize: 12, wordBreak: 'break-all' }}>
                  {value.length > 60 ? `${value.substring(0, 60)}...` : value}
                </Text>
              </div>
              <Space size="small">
                <Button 
                  type="text" 
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => window.open(value, '_blank')}
                >
                  View
                </Button>
                <Button 
                  type="text" 
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                  loading={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </Space>
            </div>
          </Card>
          
          {!disabled && (
            <Dragger
              name="file"
              accept="image/*"
              beforeUpload={handleUpload}
              showUploadList={false}
              disabled={isUploading}
            >
              {renderUploadArea()}
            </Dragger>
          )}
        </Space>
      ) : (
        <Dragger
          name="file"
          accept="image/*"
          beforeUpload={handleUpload}
          showUploadList={false}
          disabled={disabled || isUploading}
        >
          {renderUploadArea()}
        </Dragger>
      )}
    </div>
  );
};

export default ImageUpload; 
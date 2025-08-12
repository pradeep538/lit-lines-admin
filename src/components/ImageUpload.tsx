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

  // Check if upload should be disabled due to missing category/subcategory
  const isUploadDisabled = disabled || isUploading || !categoryId || !subcategoryId;

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadApi.uploadImageDirect(file, categoryId, subcategoryId),
    onSuccess: (response: UploadResponse) => {
      message.success('Image uploaded successfully');
      onChange?.(response.url);
      setUploadProgress(0);
      setIsUploading(false);
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      
      // Handle specific error types
      if (error.response?.status === 504) {
        message.error('Upload timed out. The server is taking too long to process your image. Please try again with a smaller image or contact support.');
      } else if (error.code === 'ECONNABORTED') {
        message.error('Upload timed out. Please check your connection and try again.');
      } else {
        const errorMessage = error.response?.data?.error || 'Failed to upload image';
        if (errorMessage.includes('upload service is disabled')) {
          message.warning('Image upload is not configured. Please contact administrator to set up DigitalOcean Spaces.');
        } else {
          message.error(errorMessage);
        }
      }
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
      const errorMessage = error.response?.data?.error || 'Failed to delete image';
      if (errorMessage.includes('upload service is disabled')) {
        message.warning('Image upload is not configured. Please contact administrator to set up DigitalOcean Spaces.');
      } else {
        message.error(errorMessage);
      }
    },
  });

  const handleUpload = (file: File) => {
    console.log('handleUpload called with:', {
      filename: file.name,
      size: file.size,
      type: file.type,
      categoryId,
      subcategoryId,
      isUploadDisabled
    });

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

    // Start upload with progress simulation
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90; // Don't go to 100% until actual completion
        }
        return prev + 10;
      });
    }, 500);

    // Check if category and subcategory are selected
    if (!categoryId || !subcategoryId) {
      message.error('Please select both category and subcategory before uploading');
      setIsUploading(false);
      setUploadProgress(0);
      return false;
    }

    console.log('Starting upload with direct method...');
    
    // Start upload
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
        cursor: isUploadDisabled ? 'not-allowed' : 'pointer',
        opacity: isUploadDisabled ? 0.6 : 1,
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
            <Text type="secondary" style={{ fontSize: 12 }}>
              {isUploadDisabled && (!categoryId || !subcategoryId) 
                ? 'Please select both category and subcategory to enable upload'
                : placeholder
              }
            </Text>
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
          
          {!isUploadDisabled && (
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
          disabled={isUploadDisabled}
        >
          {renderUploadArea()}
        </Dragger>
      )}
    </div>
  );
};

export default ImageUpload; 
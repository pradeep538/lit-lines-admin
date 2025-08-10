import React, { useState } from 'react';
import { 
  Card, 
  Upload, 
  Button, 
  Table, 
  Space, 
  message, 
  Progress, 
  Alert,
  Typography
} from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  UploadOutlined, 
  DownloadOutlined, 
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { contentApi } from '@/services/api';
import type { Content, BulkOperationResult } from '@/types';

const { Title } = Typography;
const { Dragger } = Upload;

const BulkUpload: React.FC = () => {
  const [uploadedData, setUploadedData] = useState<Content[]>([]);
  const [uploadResults, setUploadResults] = useState<BulkOperationResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (data: { content: Content[]; user_id: string }) => 
      contentApi.uploadContent(data),
    onSuccess: (response) => {
      message.success('Bulk upload completed successfully');
      setUploadResults(response.data?.results || []);
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
    onError: () => {
      message.error('Failed to upload content');
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        if (Array.isArray(content)) {
          setUploadedData(content);
          message.success(`Loaded ${content.length} content items`);
        } else {
          message.error('File must contain an array of content items');
        }
      } catch (error) {
        message.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    return false; // Prevent default upload behavior
  };

  const handleBulkUpload = () => {
    if (uploadedData.length === 0) {
      message.warning('Please upload a file first');
      return;
    }

    setIsUploading(true);
    uploadMutation.mutate({
      content: uploadedData,
      user_id: 'admin-user', // This should come from auth context
    });
  };

  const downloadTemplate = () => {
    const template = [
      {
        text: "Sample quote text here",
        author: "Author Name",
        source: "Book/Movie Title",
        language_id: "en",
        type: "quote",
        background_image_url: "https://example.com/image.jpg",
        shareable_image_url: "https://example.com/shareable.jpg",
        tags: ["inspiration", "motivation"],
        status: "active"
      }
    ];

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'content-template.json';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const columns = [
    {
      title: 'Content',
      dataIndex: 'text',
      key: 'text',
      render: (text: string) => (
        <div style={{ maxWidth: 300 }}>
          {text.length > 80 ? `${text.substring(0, 80)}...` : text}
        </div>
      ),
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  const resultColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span>
          {status === 'success' ? (
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
          ) : (
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
          )}
          {' '}{status}
        </span>
      ),
    },
    {
      title: 'Error',
      dataIndex: 'error',
      key: 'error',
      render: (error: string) => error || '-',
    },
  ];

  return (
    <div>
      <Title level={2}>Bulk Content Upload</Title>
      
      <Alert
        message="Bulk Upload Instructions"
        description="Upload a JSON file containing an array of content objects. Each content object should include text, author, source, language_id, type, and other required fields."
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      <Space style={{ marginBottom: '24px' }}>
        <Button 
          icon={<DownloadOutlined />} 
          onClick={downloadTemplate}
        >
          Download Template
        </Button>
      </Space>

      <Card title="Upload Content File" style={{ marginBottom: '24px' }}>
        <Dragger
          name="file"
          accept=".json"
          beforeUpload={handleFileUpload}
          showUploadList={false}
          disabled={isUploading}
        >
          <p className="ant-upload-drag-icon">
            <FileTextOutlined />
          </p>
          <p className="ant-upload-text">Click or drag JSON file to this area to upload</p>
          <p className="ant-upload-hint">
            Support for a single JSON file containing an array of content objects
          </p>
        </Dragger>
      </Card>

      {uploadedData.length > 0 && (
        <Card title={`Uploaded Content (${uploadedData.length} items)`} style={{ marginBottom: '24px' }}>
          <Space style={{ marginBottom: '16px' }}>
            <Button 
              type="primary" 
              icon={<UploadOutlined />}
              onClick={handleBulkUpload}
              loading={isUploading}
            >
              Upload to Database
            </Button>
            <Button onClick={() => setUploadedData([])}>
              Clear
            </Button>
          </Space>
          
          <Table
            columns={columns}
            dataSource={uploadedData}
            rowKey={(record, index) => index?.toString() || '0'}
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </Card>
      )}

      {uploadResults.length > 0 && (
        <Card title="Upload Results">
          <div style={{ marginBottom: '16px' }}>
            <Progress
              percent={Math.round((uploadResults.filter(r => r.status === 'success').length / uploadResults.length) * 100)}
              status="active"
            />
            <div style={{ marginTop: '8px' }}>
              Success: {uploadResults.filter(r => r.status === 'success').length} / {uploadResults.length}
            </div>
          </div>
          
          <Table
            columns={resultColumns}
            dataSource={uploadResults}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </Card>
      )}
    </div>
  );
};

export default BulkUpload; 
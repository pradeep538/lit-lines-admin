import React, { useState } from 'react';
import { Modal, Form, DatePicker, Button, Space, message } from 'antd';
import dayjs from 'dayjs';

interface SchedulingModalProps {
  visible: boolean;
  onCancel: () => void;
  onSchedule: (scheduledAt: string) => void;
  loading?: boolean;
  contentCount?: number;
}

const SchedulingModal: React.FC<SchedulingModalProps> = ({
  visible,
  onCancel,
  onSchedule,
  loading = false,
  contentCount = 0,
}) => {
  const [form] = Form.useForm();
  const [scheduledAt, setScheduledAt] = useState<dayjs.Dayjs | null>(null);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (values.scheduled_at) {
        onSchedule(values.scheduled_at.toISOString());
        form.resetFields();
        setScheduledAt(null);
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setScheduledAt(null);
    onCancel();
  };

  return (
    <Modal
      title={`Schedule ${contentCount} Content Item${contentCount !== 1 ? 's' : ''}`}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button 
          key="schedule" 
          type="primary" 
          onClick={handleSubmit}
          loading={loading}
          disabled={!scheduledAt}
        >
          Schedule
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="scheduled_at"
          label="Scheduled Date & Time"
          rules={[
            { required: true, message: 'Please select scheduled date and time' },
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
            onChange={(date) => setScheduledAt(date)}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
            style={{ width: '100%' }}
          />
        </Form.Item>
        
        {scheduledAt && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#f6f8fa', 
            borderRadius: '6px',
            marginTop: '16px'
          }}>
            <div style={{ fontWeight: 500, marginBottom: '4px' }}>
              Scheduling Summary:
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {contentCount} content item{contentCount !== 1 ? 's' : ''} will be scheduled for:
            </div>
            <div style={{ fontSize: '16px', fontWeight: 500, color: '#1890ff', marginTop: '4px' }}>
              {scheduledAt.format('MMMM D, YYYY [at] h:mm A')}
            </div>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default SchedulingModal;


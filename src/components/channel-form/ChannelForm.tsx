import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, InputNumber, Statistic, Tag, Row, Col, Divider } from 'antd';
import type { ChannelData } from '../../types/channel';
import './ChannelForm.scss';

const { useForm } = Form;

interface ChannelFormProps {
  channel: ChannelData | null;
  onSave: (channel: ChannelData) => void;
  onCancel: () => void;
}

export default function ChannelForm({ channel, onSave, onCancel }: ChannelFormProps) {
  const { t } = useTranslation();
  const [form] = useForm();

  useEffect(() => {
    if (channel) {
      form.setFieldsValue(channel);
      // Пересчитываем при загрузке
      calculateLosses(channel);
    }
  }, [channel, form]);

  const calculateLosses = (values: Partial<ChannelData>) => {
    const waterVolumeIn = values.waterVolumeIn || 0;
    const waterVolumeOut = values.waterVolumeOut || 0;
    const length = values.length || 1;

    if (waterVolumeIn > 0) {
      const lossVolume = waterVolumeIn - waterVolumeOut;
      const lossPercentage = (lossVolume / waterVolumeIn) * 100;
      const lossPerKm = length > 0 ? lossPercentage / length : 0;
      const efficiency = waterVolumeIn > 0 ? waterVolumeOut / waterVolumeIn : 1;
      const status = lossPercentage > 30 ? 'critical' : lossPercentage > 15 ? 'high-loss' : 'normal';

      form.setFieldsValue({
        lossVolume,
        lossPercentage,
        lossPerKm,
        efficiency,
        status,
      });
    }
  };

  const handleValuesChange = (changedValues: any, allValues: Partial<ChannelData>) => {
    // Пересчитываем при изменении входных/выходных данных
    if ('waterVolumeIn' in changedValues || 'waterVolumeOut' in changedValues || 'length' in changedValues) {
      calculateLosses(allValues);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!channel) return;

      const updatedChannel: ChannelData = {
        ...channel,
        ...values,
      } as ChannelData;

      onSave(updatedChannel);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  if (!channel) return null;

  const formValues = form.getFieldsValue();
  const getStatusTag = (status?: string) => {
    if (!status) return null;
    const statusMap = {
      'normal': { color: 'success', label: t('channelInfo.status.normal') },
      'high-loss': { color: 'warning', label: t('channelInfo.status.highLoss') },
      'critical': { color: 'error', label: t('channelInfo.status.critical') },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap];
    return statusInfo ? <Tag color={statusInfo.color}>{statusInfo.label}</Tag> : null;
  };

  return (
    <Modal
      title={`${t('form.title')}: ${channel.name}`}
      open={!!channel}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={800}
      okText={t('form.save')}
      cancelText={t('form.cancel')}
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        initialValues={channel}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="length"
              label={t('form.fields.length')}
              rules={[{ required: true, message: 'Обязательное поле' }]}
            >
              <InputNumber
                min={0}
                step={0.1}
                style={{ width: '100%' }}
                addonAfter="км"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="width"
              label={t('form.fields.width')}
              rules={[{ required: true, message: 'Обязательное поле' }]}
            >
              <InputNumber
                min={0}
                step={0.1}
                style={{ width: '100%' }}
                addonAfter="м"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="depth"
              label={t('form.fields.depth')}
              rules={[{ required: true, message: 'Обязательное поле' }]}
            >
              <InputNumber
                min={0}
                step={0.1}
                style={{ width: '100%' }}
                addonAfter="м"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="waterFlow"
              label={t('form.fields.waterFlow')}
              rules={[{ required: true, message: 'Обязательное поле' }]}
            >
              <InputNumber
                min={0}
                step={0.1}
                style={{ width: '100%' }}
                addonAfter="м³/с"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="waterVolumeIn"
              label={t('form.fields.waterVolumeIn')}
              rules={[{ required: true, message: 'Обязательное поле' }]}
            >
              <InputNumber
                min={0}
                step={0.01}
                style={{ width: '100%' }}
                addonAfter="м³/с"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="waterVolumeOut"
              label={t('form.fields.waterVolumeOut')}
              rules={[{ required: true, message: 'Обязательное поле' }]}
            >
              <InputNumber
                min={0}
                step={0.01}
                style={{ width: '100%' }}
                addonAfter="м³/с"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="lossPerKm"
              label={t('form.fields.lossPerKm')}
            >
              <InputNumber
                min={0}
                step={0.001}
                style={{ width: '100%' }}
                addonAfter="%"
                readOnly
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="filtrationCoefficient"
              label={t('form.fields.filtrationCoefficient')}
            >
              <InputNumber
                min={0}
                step={0.01}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider>{t('form.calculated.title')}</Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title={t('form.calculated.losses')}
              value={formValues.lossVolume || 0}
              precision={2}
              suffix="м³/с"
            />
            <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
              ({formValues.lossPercentage?.toFixed(1) || 0}%)
            </div>
          </Col>
          <Col span={8}>
            <Statistic
              title={t('form.calculated.efficiency')}
              value={(formValues.efficiency || 1) * 100}
              precision={0}
              suffix="%"
            />
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>
              <strong>{t('form.calculated.status')}:</strong>
            </div>
            {getStatusTag(formValues.status)}
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}


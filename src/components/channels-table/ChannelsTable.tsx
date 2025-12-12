import { useTranslation } from 'react-i18next';
import { Table, Tag, Button, Popconfirm, Space, Typography } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ChannelData } from '../../types/channel';
import type { ColumnsType } from 'antd/es/table';
import './ChannelsTable.scss';

const { Title, Text } = Typography;

interface ChannelsTableProps {
  channels: ChannelData[];
  onEdit: (channel: ChannelData) => void;
  onRemove: (channelId: string) => void;
}

export default function ChannelsTable({ channels, onEdit, onRemove }: ChannelsTableProps) {
  const { t } = useTranslation();

  const getStatusTag = (status: 'normal' | 'high-loss' | 'critical') => {
    const statusMap = {
      'normal': { color: 'success', label: t('channelInfo.status.normal') },
      'high-loss': { color: 'warning', label: t('channelInfo.status.highLoss') },
      'critical': { color: 'error', label: t('channelInfo.status.critical') },
    };
    const statusInfo = statusMap[status];
    return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
  };

  const columns: ColumnsType<ChannelData> = [
    {
      title: t('table.columns.number'),
      dataIndex: 'id',
      key: 'number',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: t('table.columns.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t('table.columns.length'),
      dataIndex: 'length',
      key: 'length',
      width: 100,
      sorter: (a, b) => a.length - b.length,
      render: (value) => `${value} км`,
    },
    {
      title: t('table.columns.flow'),
      dataIndex: 'waterFlow',
      key: 'waterFlow',
      width: 120,
      sorter: (a, b) => a.waterFlow - b.waterFlow,
      render: (value) => `${value.toFixed(2)} м³/с`,
    },
    {
      title: t('table.columns.losses'),
      dataIndex: 'lossPercentage',
      key: 'lossPercentage',
      width: 120,
      sorter: (a, b) => a.lossPercentage - b.lossPercentage,
      render: (value) => (
        <Text strong={value > 20} style={{ color: value > 20 ? '#dc2626' : undefined }}>
          {value.toFixed(1)}%
        </Text>
      ),
    },
    {
      title: t('table.columns.lossVolume'),
      dataIndex: 'lossVolume',
      key: 'lossVolume',
      width: 130,
      sorter: (a, b) => a.lossVolume - b.lossVolume,
      render: (value) => `${value.toFixed(2)} м³/с`,
    },
    {
      title: t('table.columns.lossPerKm'),
      dataIndex: 'lossPerKm',
      key: 'lossPerKm',
      width: 130,
      sorter: (a, b) => a.lossPerKm - b.lossPerKm,
      render: (value) => `${value.toFixed(3)}%`,
    },
    {
      title: t('table.columns.efficiency'),
      dataIndex: 'efficiency',
      key: 'efficiency',
      width: 100,
      sorter: (a, b) => a.efficiency - b.efficiency,
      render: (value) => `${(value * 100).toFixed(0)}%`,
    },
    {
      title: t('table.columns.status'),
      dataIndex: 'status',
      key: 'status',
      width: 130,
      filters: [
        { text: t('channelInfo.status.normal'), value: 'normal' },
        { text: t('channelInfo.status.highLoss'), value: 'high-loss' },
        { text: t('channelInfo.status.critical'), value: 'critical' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => getStatusTag(status),
    },
    {
      title: t('table.columns.actions'),
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            size="small"
          />
          <Popconfirm
            title={t('table.remove')}
            description="Вы уверены, что хотите удалить этот канал?"
            onConfirm={() => onRemove(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (channels.length === 0) {
    return (
      <div className="channels-table empty">
        <Text type="secondary">{t('table.empty')}</Text>
      </div>
    );
  }

  return (
    <div className="channels-table">
      <div className="table-header">
        <Title level={3}>{t('table.title')}</Title>
        <Text type="secondary">{t('table.total')}: {channels.length}</Text>
      </div>
      <Table
        columns={columns}
        dataSource={channels}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Всего ${total} каналов`,
        }}
        scroll={{ x: 1200 }}
        size="middle"
      />
    </div>
  );
}


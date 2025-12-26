import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Tag, Space, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, BarChartOutlined } from '@ant-design/icons';
import { useChannelsStore, type Channel } from '../../stores/channelsStore';
import { useSelectedChannelsStore } from '../../stores/selectedChannelsStore';
import EditChannelModal from './EditChannelModal';
import type { ColumnsType } from 'antd/es/table';
import './ChannelsList.scss';

export default function ChannelsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { channels, deleteChannel } = useChannelsStore();
  const { selectedChannelIds, removeChannel: removeSelectedChannel } = useSelectedChannelsStore();
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Показываем все каналы в таблице
  const tableChannels = useMemo(() => {
    return channels;
  }, [channels]);

  const hasSelectedChannels = selectedChannelIds.length > 0;

  const handleDelete = (id: string) => {
    deleteChannel(id);
    removeSelectedChannel(id); // Удаляем из выбранных
    message.success(t('channelsList.deleted', 'Канал удален'));
  };

  const handleEdit = (channel: Channel) => {
    setEditingChannel(channel);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditingChannel(null);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditingChannel(null);
  };

  const columns: ColumnsType<Channel> = [
    {
      title: t('channelsList.photo', 'Фото'),
      dataIndex: 'photo',
      key: 'photo',
      width: 100,
      fixed: 'left',
      render: (photo: string | undefined) => {
        if (photo) {
          return (
            <img
              src={photo}
              alt={t('channelsList.channelPhoto', 'Фото канала')}
              style={{
                width: 60,
                height: 60,
                objectFit: 'cover',
                borderRadius: '0.25rem',
                cursor: 'pointer',
              }}
              onClick={() => {
                // Открыть фото в полном размере
                const img = document.createElement('img');
                img.src = photo;
                img.style.maxWidth = '90vw';
                img.style.maxHeight = '90vh';
                img.style.objectFit = 'contain';
                const div = document.createElement('div');
                div.style.position = 'fixed';
                div.style.top = '0';
                div.style.left = '0';
                div.style.width = '100vw';
                div.style.height = '100vh';
                div.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                div.style.display = 'flex';
                div.style.justifyContent = 'center';
                div.style.alignItems = 'center';
                div.style.zIndex = '9999';
                div.style.cursor = 'pointer';
                div.appendChild(img);
                div.onclick = () => div.remove();
                document.body.appendChild(div);
              }}
            />
          );
        }
        return <span style={{ color: '#9ca3af' }}>—</span>;
      },
    },
    {
      title: t('channelsList.name', 'Название'),
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
    },
    {
      title: t('channelsList.length', 'Длина (км)'),
      dataIndex: 'length',
      key: 'length',
      sorter: (a, b) => a.length - b.length,
    },
    {
      title: t('channelsList.width', 'Ширина (м)'),
      dataIndex: 'width',
      key: 'width',
    },
    {
      title: t('channelsList.depth', 'Глубина (м)'),
      dataIndex: 'depth',
      key: 'depth',
    },
    {
      title: t('channelsList.coverage', 'Покрытие'),
      dataIndex: 'coverage',
      key: 'coverage',
      render: (coverage: string) => {
        const coverageMap: Record<string, string> = {
          earth: t('channelsList.coverageEarth', 'Земляное'),
          clay: t('channelsList.coverageClay', 'Глиняное'),
          stone: t('channelsList.coverageStone', 'Каменное/Бутовое'),
          brick: t('channelsList.coverageBrick', 'Кирпичное'),
          mixed: t('channelsList.coverageMixed', 'Смешанное'),
          asphalt: t('channelsList.coverageAsphalt', 'Асфальтобетонное'),
          concrete: t('channelsList.coverageConcrete', 'Бетонное'),
          plastic: t('channelsList.coveragePlastic', 'Пластиковое'),
          polyethylene: t('channelsList.coveragePolyethylene', 'Полиэтиленовое'),
          geomembrane: t('channelsList.coverageGeomembrane', 'Геомембрана'),
          composite: t('channelsList.coverageComposite', 'Композитное'),
          rubber: t('channelsList.coverageRubber', 'Резиновое'),
        };
        return coverageMap[coverage] || coverage;
      },
    },
    {
      title: t('channelsList.lossPercentage', 'Потери (%)'),
      dataIndex: 'lossPercentage',
      key: 'lossPercentage',
      sorter: (a, b) => a.lossPercentage - b.lossPercentage,
      render: (value: number) => `${value.toFixed(1)}%`,
    },
    {
      title: t('channelsList.status', 'Статус'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
          normal: { color: 'green', text: t('channelsList.statusNormal', 'Норма') },
          'high-loss': { color: 'orange', text: t('channelsList.statusHighLoss', 'Высокие потери') },
          critical: { color: 'red', text: t('channelsList.statusCritical', 'Критический') },
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: t('channelsList.actions', 'Действия'),
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_: unknown, record: Channel) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title={t('channelsList.edit', 'Редактировать')}
            style={{ color: '#1890ff' }}
          />
          <Popconfirm
            title={t('channelsList.deleteConfirm', 'Удалить канал?')}
            onConfirm={() => handleDelete(record.id)}
            okText={t('channelsList.yes', 'Да')}
            cancelText={t('channelsList.no', 'Нет')}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title={t('channelsList.delete', 'Удалить')}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="channels-list-page">
      <div className="page-header">
        <h1 className="page-title">{t('channelsList.title', 'База каналов')}</h1>
        <Space>
          {hasSelectedChannels && (
            <Button
              type="default"
              icon={<BarChartOutlined />}
              onClick={() => navigate('/dashboard/chart')}
            >
              {t('channelsList.viewChart', 'График')}
            </Button>
          )}
          <Button
            type="primary"
            onClick={() => navigate('/dashboard/add-channel')}
          >
            {t('channelsList.addChannel', 'Добавить канал')}
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={tableChannels}
        rowKey="id"
        scroll={{ x: 1100 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => t('channelsList.total', `Всего: ${total}`),
        }}
        locale={{
          emptyText: t('channelsList.empty', 'Нет каналов. Добавьте первый канал на карте.'),
        }}
      />

      <EditChannelModal
        channel={editingChannel}
        open={isEditModalOpen}
        onClose={handleEditCancel}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}


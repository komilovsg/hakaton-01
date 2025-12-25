import { useTranslation } from 'react-i18next';
import { Card, Avatar, Typography, Table, Tag, Space, Empty } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import { useAuditStore } from '../../stores/auditStore';
import type { ColumnsType } from 'antd/es/table';
import type { AuditLog } from '../../stores/auditStore';
import './Profile.scss';

const { Title, Text } = Typography;

export default function Profile() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const logs = useAuditStore((state) => state.getLogsByUser(user?.id || ''));

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <PlusOutlined style={{ color: '#52c41a' }} />;
      case 'update':
        return <EditOutlined style={{ color: '#1890ff' }} />;
      case 'delete':
        return <DeleteOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return null;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create':
        return t('profile.actionCreate', 'Добавление');
      case 'update':
        return t('profile.actionUpdate', 'Изменение');
      case 'delete':
        return t('profile.actionDelete', 'Удаление');
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'green';
      case 'update':
        return 'blue';
      case 'delete':
        return 'red';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<AuditLog> = [
    {
      title: t('profile.action', 'Действие'),
      key: 'action',
      width: 120,
      render: (_: any, record: AuditLog) => (
        <Space>
          {getActionIcon(record.action)}
          <Tag color={getActionColor(record.action)}>
            {getActionLabel(record.action)}
          </Tag>
        </Space>
      ),
    },
    {
      title: t('profile.entity', 'Объект'),
      key: 'entity',
      render: (_: any, record: AuditLog) => (
        <div>
          <Text strong>{record.entityName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '0.85rem' }}>
            {record.entityType === 'channel' ? t('profile.entityChannel', 'Канал') : record.entityType}
          </Text>
        </div>
      ),
    },
    {
      title: t('profile.details', 'Детали'),
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
    },
    {
      title: t('profile.date', 'Дата и время'),
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      defaultSortOrder: 'descend',
      render: (timestamp: string) => {
        const date = new Date(timestamp);
        return (
          <div>
            <div>{date.toLocaleDateString('ru-RU')}</div>
            <Text type="secondary" style={{ fontSize: '0.85rem' }}>
              {date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </div>
        );
      },
    },
  ];

  const stats = {
    total: logs.length,
    created: logs.filter((log) => log.action === 'create').length,
    updated: logs.filter((log) => log.action === 'update').length,
    deleted: logs.filter((log) => log.action === 'delete').length,
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <Card className="profile-card">
          <div className="profile-info">
            <Avatar
              size={80}
              icon={<UserOutlined />}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                marginBottom: '1rem',
              }}
            />
            <Title level={2} style={{ margin: '0.5rem 0' }}>
              {user?.name || t('profile.user', 'Пользователь')}
            </Title>
            <Text type="secondary">{user?.email}</Text>
          </div>
        </Card>

        <div className="profile-stats">
          <Card className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">{t('profile.totalActions', 'Всего действий')}</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value" style={{ color: '#52c41a' }}>
              {stats.created}
            </div>
            <div className="stat-label">{t('profile.created', 'Добавлено')}</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value" style={{ color: '#1890ff' }}>
              {stats.updated}
            </div>
            <div className="stat-label">{t('profile.updated', 'Изменено')}</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value" style={{ color: '#ff4d4f' }}>
              {stats.deleted}
            </div>
            <div className="stat-label">{t('profile.deleted', 'Удалено')}</div>
          </Card>
        </div>
      </div>

      <Card className="history-card">
        <Title level={3} style={{ marginBottom: '1.5rem' }}>
          {t('profile.history', 'История действий')}
        </Title>
        {logs.length > 0 ? (
          <Table
            columns={columns}
            dataSource={logs}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => t('profile.totalRecords', { total: total.toString() }, `Всего записей: ${total}`),
            }}
            locale={{
              emptyText: <Empty description={t('profile.noHistory', 'Нет истории действий')} />,
            }}
          />
        ) : (
          <Empty
            description={t('profile.noHistory', 'Нет истории действий')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
    </div>
  );
}


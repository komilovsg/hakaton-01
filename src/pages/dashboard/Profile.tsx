import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Avatar, Typography, Table, Tag, Space, Empty, Input, Select, Statistic } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import { useAuditStore } from '../../stores/auditStore';
import type { ColumnsType } from 'antd/es/table';
import type { AuditLog } from '../../stores/auditStore';
import './Profile.scss';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function Profile() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const getLogsByUser = useAuditStore((state) => state.getLogsByUser);
  
  const allLogs = useMemo(() => {
    return user?.id ? getLogsByUser(user.id) : [];
  }, [user, getLogsByUser]);
  
  const [searchText, setSearchText] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    let filtered = allLogs;

    // Фильтр по действию
    if (actionFilter !== 'all') {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    // Поиск по тексту
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.entityName.toLowerCase().includes(searchLower) ||
          log.details?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [allLogs, actionFilter, searchText]);

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
      render: (_: unknown, record: AuditLog) => (
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
      render: (_: unknown, record: AuditLog) => (
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
    total: allLogs.length,
    created: allLogs.filter((log) => log.action === 'create').length,
    updated: allLogs.filter((log) => log.action === 'update').length,
    deleted: allLogs.filter((log) => log.action === 'delete').length,
  };

  return (
    <div className="profile-page">
      <Title level={1} className="page-title">
        {t('profile.title', 'Профиль пользователя')}
      </Title>

      <div className="profile-header">
        <Card className="profile-card" hoverable>
          <div className="profile-info">
            <div className="avatar-wrapper">
              <Avatar
                size={100}
                icon={<UserOutlined />}
                className="profile-avatar"
              />
              <div className="avatar-badge">
                <UserOutlined />
              </div>
            </div>
            <Title level={2} className="profile-name">
              {user?.name || t('profile.user', 'Пользователь')}
            </Title>
            <Text type="secondary" className="profile-email">
              {user?.email}
            </Text>
            <div className="profile-meta">
              <Text type="secondary" className="meta-item">
                {t('profile.memberSince', 'Участник с')} {new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })}
              </Text>
            </div>
          </div>
        </Card>

        <div className="profile-stats">
          <Card className="stat-card stat-card-total" hoverable>
            <Statistic
              title={t('profile.totalActions', 'Всего действий')}
              value={stats.total}
              valueStyle={{ color: '#1f2937', fontSize: '2.5rem', fontWeight: 700 }}
              prefix={<UserOutlined />}
            />
          </Card>
          <Card className="stat-card stat-card-created" hoverable>
            <Statistic
              title={t('profile.created', 'Добавлено')}
              value={stats.created}
              valueStyle={{ color: '#52c41a', fontSize: '2.5rem', fontWeight: 700 }}
              prefix={<PlusOutlined />}
            />
          </Card>
          <Card className="stat-card stat-card-updated" hoverable>
            <Statistic
              title={t('profile.updated', 'Изменено')}
              value={stats.updated}
              valueStyle={{ color: '#1890ff', fontSize: '2.5rem', fontWeight: 700 }}
              prefix={<EditOutlined />}
            />
          </Card>
          <Card className="stat-card stat-card-deleted" hoverable>
            <Statistic
              title={t('profile.deleted', 'Удалено')}
              value={stats.deleted}
              valueStyle={{ color: '#ff4d4f', fontSize: '2.5rem', fontWeight: 700 }}
              prefix={<DeleteOutlined />}
            />
          </Card>
        </div>
      </div>

      <Card className="history-card" hoverable>
        <div className="history-header">
          <Title level={3} className="history-title">
            {t('profile.history', 'История действий')}
          </Title>
          <div className="history-filters">
            <Search
              placeholder={t('profile.searchPlaceholder', 'Поиск по названию или деталям...')}
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300, marginRight: '1rem' }}
              className="history-search"
            />
            <Select
              value={actionFilter}
              onChange={setActionFilter}
              size="large"
              style={{ width: 180 }}
              className="history-filter"
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">{t('profile.filterAll', 'Все действия')}</Option>
              <Option value="create">{t('profile.actionCreate', 'Добавление')}</Option>
              <Option value="update">{t('profile.actionUpdate', 'Изменение')}</Option>
              <Option value="delete">{t('profile.actionDelete', 'Удаление')}</Option>
            </Select>
          </div>
        </div>

        {filteredLogs.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredLogs}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total: number) => `Всего записей: ${total}`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            locale={{
              emptyText: <Empty description={t('profile.noResults', 'Нет результатов по заданным фильтрам')} />,
            }}
            className="history-table"
          />
        ) : allLogs.length === 0 ? (
          <Empty
            description={t('profile.noHistory', 'Нет истории действий')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="history-empty"
          />
        ) : (
          <Empty
            description={t('profile.noResults', 'Нет результатов по заданным фильтрам')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="history-empty"
          />
        )}
      </Card>
    </div>
  );
}


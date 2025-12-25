import { useState, useEffect } from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useTranslation } from 'react-i18next';
import { Layout, Menu, Button } from 'antd';
import {
  DashboardOutlined,
  EnvironmentOutlined,
  PlusCircleOutlined,
  TableOutlined,
  CloudOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import './Dashboard.scss';

const { Sider, Content } = Layout;

export default function Dashboard() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Состояние свернутой панели (загружаем из localStorage)
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Сохраняем состояние в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t('dashboard.overview', 'Обзор'),
    },
    {
      key: '/dashboard/map',
      icon: <EnvironmentOutlined />,
      label: t('dashboard.map', 'Карта Таджикистана'),
    },
    {
      key: '/dashboard/add-channel',
      icon: <PlusCircleOutlined />,
      label: t('dashboard.addChannel', 'Добавить канал'),
    },
    {
      key: '/dashboard/channels',
      icon: <TableOutlined />,
      label: t('dashboard.channels', 'База каналов'),
    },
    {
      key: '/dashboard/chart',
      icon: <BarChartOutlined />,
      label: t('dashboard.chart', 'Графики'),
    },
    {
      key: '/dashboard/weather',
      icon: <CloudOutlined />,
      label: t('dashboard.weather', 'Прогноз погоды'),
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
  };

  const selectedKey = location.pathname;

  return (
    <Layout className="dashboard-layout">
      <Sider
        width={250}
        collapsedWidth={80}
        collapsed={collapsed}
        className="dashboard-sidebar"
        breakpoint="lg"
        trigger={null}
      >
        <div className="dashboard-logo" onClick={() => setCollapsed(!collapsed)}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            className="sidebar-toggle-btn"
            title={collapsed ? t('dashboard.expand', 'Развернуть') : t('dashboard.collapse', 'Свернуть')}
            onClick={(e) => e.stopPropagation()} // Предотвращаем всплытие события
          />
          <div className="logo-content">
            {!collapsed && <h2>{t('dashboard.title', 'Панель управления')}</h2>}
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          className="dashboard-menu"
          inlineCollapsed={collapsed}
        />
      </Sider>
      <Layout>
        <Content className={`dashboard-content ${collapsed ? 'collapsed' : ''}`}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

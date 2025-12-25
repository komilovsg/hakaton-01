import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import Logo from './Logo';
import { Dropdown, Avatar } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  PlusCircleOutlined,
  TableOutlined,
  CloudOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import './Header.scss';

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuthStore();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const { i18n } = useTranslation();

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: t('header.profile', 'Профиль'),
      icon: <UserOutlined />,
      onClick: () => navigate('/dashboard/profile'),
    },
    {
      key: 'language',
      label: t('header.language', 'Язык'),
      icon: <span style={{ fontSize: '16px' }}>🌐</span>,
      children: [
        {
          key: 'lang-ru',
          label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🇷🇺</span>
              <span>Русский</span>
            </div>
          ),
          onClick: () => i18n.changeLanguage('ru'),
        },
        {
          key: 'lang-tj',
          label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🇹🇯</span>
              <span>Тоҷикӣ</span>
            </div>
          ),
          onClick: () => i18n.changeLanguage('tj'),
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: t('header.logout', 'Выйти'),
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setMobileMenuOpen(false);
  };

  const isHomePage = location.pathname === '/';
  const isDashboard = location.pathname.startsWith('/dashboard');

  // Dashboard menu items для мобильного меню
  const dashboardMenuItems = isAuthenticated && isDashboard ? [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t('dashboard.overview', 'Обзор'),
      onClick: () => {
        navigate('/dashboard');
        setMobileMenuOpen(false);
      },
    },
    {
      key: '/dashboard/map',
      icon: <EnvironmentOutlined />,
      label: t('dashboard.map', 'Карта Таджикистана'),
      onClick: () => {
        navigate('/dashboard/map');
        setMobileMenuOpen(false);
      },
    },
    {
      key: '/dashboard/add-channel',
      icon: <PlusCircleOutlined />,
      label: t('dashboard.addChannel', 'Добавить канал'),
      onClick: () => {
        navigate('/dashboard/add-channel');
        setMobileMenuOpen(false);
      },
    },
    {
      key: '/dashboard/channels',
      icon: <TableOutlined />,
      label: t('dashboard.channels', 'База каналов'),
      onClick: () => {
        navigate('/dashboard/channels');
        setMobileMenuOpen(false);
      },
    },
    {
      key: '/dashboard/chart',
      icon: <BarChartOutlined />,
      label: t('dashboard.chart', 'Графики'),
      onClick: () => {
        navigate('/dashboard/chart');
        setMobileMenuOpen(false);
      },
    },
    {
      key: '/dashboard/weather',
      icon: <CloudOutlined />,
      label: t('dashboard.weather', 'Прогноз погоды'),
      onClick: () => {
        navigate('/dashboard/weather');
        setMobileMenuOpen(false);
      },
    },
    {
      key: '/dashboard/profile',
      icon: <UserOutlined />,
      label: t('header.profile', 'Профиль'),
      onClick: () => {
        navigate('/dashboard/profile');
        setMobileMenuOpen(false);
      },
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('header.logout', 'Выйти'),
      onClick: () => {
        handleLogout();
        setMobileMenuOpen(false);
      },
    },
  ] : [];

  return (
    <header className={`header ${scrolled ? 'scrolled' : 'transparent'}`}>
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="logo-icon">
            <Logo />
          </div>
          <span className="logo-text desktop-only">
            {t('header.title', 'Smart Water Control')}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="header-nav desktop-only">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="nav-link"
              >
                {t('header.dashboard', 'Панель управления')}
              </button>
            </>
          ) : isHomePage ? (
            <>
              <button
                onClick={() => scrollToSection('map')}
                className="nav-link"
              >
                {t('header.map', 'Карта')}
              </button>
              <button
                onClick={() => scrollToSection('calculator')}
                className="nav-link"
              >
                {t('header.calculator', 'Калькулятор')}
              </button>
              <button
                onClick={() => scrollToSection('analytics')}
                className="nav-link"
              >
                {t('header.analytics', 'Аналитика')}
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="nav-link"
              >
                {t('header.about', 'О проекте')}
              </button>
            </>
          ) : (
            <Link to="/" className="nav-link">
              {t('header.home', 'Главная')}
            </Link>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="header-actions">
          {/* Desktop User Avatar / Login Button */}
          {isAuthenticated ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" className="desktop-only">
              <div className="user-avatar">
                <Avatar
                  size="default"
                  icon={<UserOutlined />}
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', cursor: 'pointer' }}
                />
              </div>
            </Dropdown>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="login-button desktop-only"
            >
              {t('header.login', 'Войти')}
              <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="arrow-icon"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu - Fullscreen */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)}>
        <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
          {/* Dashboard Menu Items */}
          {isAuthenticated && isDashboard ? (
            <>
              {dashboardMenuItems.map((item, index) => {
                if (item.type === 'divider') {
                  return <div key={`divider-${index}`} className="mobile-menu-divider"></div>;
                }
                return (
                  <button
                    key={item.key}
                    onClick={item.onClick}
                    className={`mobile-nav-link ${location.pathname === item.key ? 'active' : ''}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </>
          ) : isAuthenticated ? (
            <>
              <button
                onClick={() => {
                  navigate('/dashboard');
                  setMobileMenuOpen(false);
                }}
                className="mobile-nav-link"
              >
                <DashboardOutlined />
                <span>{t('header.dashboard', 'Панель управления')}</span>
              </button>
              <div className="mobile-menu-divider"></div>
              <button
                onClick={handleLogout}
                className="mobile-logout-button"
              >
                <LogoutOutlined />
                <span>{t('header.logout', 'Выйти')}</span>
              </button>
            </>
          ) : isHomePage ? (
            <>
              <button onClick={() => scrollToSection('map')} className="mobile-nav-link">
                <EnvironmentOutlined />
                <span>{t('header.map', 'Карта')}</span>
              </button>
              <button onClick={() => scrollToSection('calculator')} className="mobile-nav-link">
                <span>{t('header.calculator', 'Калькулятор')}</span>
              </button>
              <button onClick={() => scrollToSection('analytics')} className="mobile-nav-link">
                <span>{t('header.analytics', 'Аналитика')}</span>
              </button>
              <button onClick={() => scrollToSection('about')} className="mobile-nav-link">
                <span>{t('header.about', 'О проекте')}</span>
              </button>
              <div className="mobile-menu-divider"></div>
              <button
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                className="mobile-login-button"
              >
                <span>{t('header.login', 'Войти')}</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                <span>{t('header.home', 'Главная')}</span>
              </Link>
              <div className="mobile-menu-divider"></div>
              <button
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                className="mobile-login-button"
              >
                <span>{t('header.login', 'Войти')}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


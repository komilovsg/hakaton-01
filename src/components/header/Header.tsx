import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import Logo from './Logo';
import LanguageSwitcher from '../language-switcher/LanguageSwitcher';
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
  DatabaseOutlined,
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

  // Block body scroll when mobile menu is open and hide map controls
  useEffect(() => {
    if (mobileMenuOpen) {
      const scrollY = window.scrollY;
      const body = document.body;
      const html = document.documentElement;
      
      // Add class to body to hide map controls
      body.classList.add('mobile-menu-open');
      
      // Hide map controls directly via JavaScript
      const hideMapControls = () => {
        // Leaflet controls
        const leafletControls = document.querySelectorAll(
          '.leaflet-control-zoom, .leaflet-control-zoom-in, .leaflet-control-zoom-out, .leaflet-control-attribution, .leaflet-control-layers, .leaflet-top, .leaflet-right, .leaflet-bottom, .leaflet-left'
        );
        leafletControls.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
            el.style.zIndex = '-9999';
          }
        });
        
        // 2GIS controls
        const dgControls = document.querySelectorAll(
          '[class*="dg-controls"], [class*="dg-zoom"], [class*="dg-attribution"], [id*="dg-controls"], [id*="dg-zoom"]'
        );
        dgControls.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
            el.style.zIndex = '-9999';
          }
        });
      };
      
      // Hide controls immediately and set up observer for dynamically added controls
      hideMapControls();
      const observer = new MutationObserver(hideMapControls);
      observer.observe(document.body, { childList: true, subtree: true });
      
      // Save current scroll position
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
      
      return () => {
        // Stop observing
        observer.disconnect();
        
        // Remove class from body
        body.classList.remove('mobile-menu-open');
        
        // Restore map controls
        const restoreMapControls = () => {
          const allControls = document.querySelectorAll(
            '.leaflet-control-zoom, .leaflet-control-zoom-in, .leaflet-control-zoom-out, .leaflet-control-attribution, .leaflet-control-layers, [class*="dg-controls"], [class*="dg-zoom"]'
          );
          allControls.forEach((el) => {
            if (el instanceof HTMLElement) {
              el.style.display = '';
              el.style.visibility = '';
              el.style.opacity = '';
              el.style.pointerEvents = '';
              el.style.zIndex = '';
            }
          });
        };
        restoreMapControls();
        
        // Restore scroll position
        body.style.position = '';
        body.style.top = '';
        body.style.width = '';
        body.style.overflow = '';
        html.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    } else {
      // Ensure styles are cleared when menu is closed
      document.body.classList.remove('mobile-menu-open');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      
      // Restore map controls
      const allControls = document.querySelectorAll(
        '.leaflet-control-zoom, .leaflet-control-zoom-in, .leaflet-control-zoom-out, .leaflet-control-attribution, .leaflet-control-layers, [class*="dg-controls"], [class*="dg-zoom"]'
      );
      allControls.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.display = '';
          el.style.visibility = '';
          el.style.opacity = '';
          el.style.pointerEvents = '';
          el.style.zIndex = '';
        }
      });
    }
  }, [mobileMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    // Закрываем меню
    setMobileMenuOpen(false);
    
    const scrollToElement = () => {
      // Пробуем найти элемент несколько раз с интервалами
      const tryScroll = (attempts = 0) => {
        const element = document.getElementById(sectionId);
        if (element) {
          // Учитываем высоту header при скролле
          const headerHeight = 80;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - headerHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          return true;
        } else if (attempts < 10) {
          // Пробуем еще раз через 100ms
          setTimeout(() => tryScroll(attempts + 1), 100);
          return false;
        }
        return false;
      };
      
      tryScroll();
    };

    if (location.pathname !== '/') {
      // Если не на главной странице, сначала переходим
      navigate('/');
      // Ждем закрытия меню и загрузки страницы
      setTimeout(() => {
        scrollToElement();
      }, 500);
    } else {
      // Если уже на главной странице, ждем закрытия меню
      setTimeout(() => {
        scrollToElement();
      }, 300);
    }
  };

  const isHomePage = location.pathname === '/';
  const isDashboard = location.pathname.startsWith('/dashboard');
  // const isLoginPage = location.pathname === '/login';

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
      key: '/dashboard/source-data',
      icon: <DatabaseOutlined />,
      label: t('dashboard.sourceData', 'Исходные данные'),
      onClick: () => {
        navigate('/dashboard/source-data');
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
            <Logo className="w-8 h-8" />
          </div>
          {/* {!isLoginPage && (
            <span className="logo-text desktop-only">
              {t('header.title', 'Smart Water Control')}
            </span>
          )} */}
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
                onClick={() => scrollToSection('features')}
                className="nav-link"
              >
                {t('header.features', 'Возможности')}
              </button>
              <button
                onClick={() => scrollToSection('benefits')}
                className="nav-link"
              >
                {t('header.benefits', 'Преимущества')}
              </button>
              <button
                onClick={() => scrollToSection('stats')}
                className="nav-link"
              >
                {t('header.stats', 'Статистика')}
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
          {/* Language Switcher */}
          <div className="header-language-switcher">
            <LanguageSwitcher />
          </div>
          
          {/* Desktop User Avatar / Login Button */}
          {isAuthenticated ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" className="desktop-only">
              <div className="user-avatar">
                <Avatar
                  size="default"
                  src={user?.avatar}
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
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          {/* Logo */}
          <div className="mobile-menu-logo">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <div className="logo-icon">
                <Logo className="w-8 h-8" />
              </div>
              <span className="logo-text">{t('header.title', 'Smart Water Control')}</span>
            </Link>
          </div>
          
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
              <button onClick={() => scrollToSection('features')} className="mobile-nav-link">
                <span>{t('header.features', 'Возможности')}</span>
              </button>
              <button onClick={() => scrollToSection('benefits')} className="mobile-nav-link">
                <span>{t('header.benefits', 'Преимущества')}</span>
              </button>
              <button onClick={() => scrollToSection('stats')} className="mobile-nav-link">
                <span>{t('header.stats', 'Статистика')}</span>
              </button>
              <button onClick={() => scrollToSection('about')} className="mobile-nav-link">
                <span>{t('header.about', 'О проекте')}</span>
              </button>
              <div className="mobile-menu-divider"></div>
              <div className="mobile-language-switcher">
                <LanguageSwitcher />
              </div>
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
              <div className="mobile-language-switcher">
                <LanguageSwitcher />
              </div>
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


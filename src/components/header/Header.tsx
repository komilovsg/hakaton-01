import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import Logo from './Logo';
import { Dropdown, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
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

  return (
    <header className={`header ${scrolled ? 'scrolled' : 'transparent'}`}>
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <div className="logo-icon">
            <Logo />
          </div>
          <span className="logo-text">
            {t('header.title', 'Smart Water Control')}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="header-nav">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="nav-link"
              >
                {t('header.dashboard', 'Панель управления')}
              </button>
              <button
                onClick={() => navigate('/channels')}
                className="nav-link"
              >
                {t('header.channels', 'Каналы')}
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="nav-link"
              >
                {t('header.analytics', 'Аналитика')}
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
          {isAuthenticated ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
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
              className="login-button"
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

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          {/* Navigation Links */}
          {isAuthenticated ? (
            <>
              <button
                onClick={() => {
                  navigate('/dashboard');
                  setMobileMenuOpen(false);
                }}
                className="mobile-nav-link"
              >
                {t('header.dashboard', 'Панель управления')}
              </button>
              <button
                onClick={() => {
                  navigate('/channels');
                  setMobileMenuOpen(false);
                }}
                className="mobile-nav-link"
              >
                {t('header.channels', 'Каналы')}
              </button>
              <button
                onClick={() => {
                  navigate('/analytics');
                  setMobileMenuOpen(false);
                }}
                className="mobile-nav-link"
              >
                {t('header.analytics', 'Аналитика')}
              </button>
              <div className="mobile-menu-divider"></div>
              <button
                onClick={handleLogout}
                className="mobile-logout-button"
              >
                <LogoutOutlined style={{ marginRight: '8px' }} />
                {t('header.logout', 'Выйти')}
              </button>
            </>
          ) : isHomePage ? (
            <>
              <button onClick={() => scrollToSection('map')} className="mobile-nav-link">
                {t('header.map', 'Карта')}
              </button>
              <button onClick={() => scrollToSection('calculator')} className="mobile-nav-link">
                {t('header.calculator', 'Калькулятор')}
              </button>
              <button onClick={() => scrollToSection('analytics')} className="mobile-nav-link">
                {t('header.analytics', 'Аналитика')}
              </button>
              <button onClick={() => scrollToSection('about')} className="mobile-nav-link">
                {t('header.about', 'О проекте')}
              </button>
              <div className="mobile-menu-divider"></div>
              <button
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                className="mobile-login-button"
              >
                {t('header.login', 'Войти')}
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                {t('header.home', 'Главная')}
              </Link>
              <div className="mobile-menu-divider"></div>
              <button
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                className="mobile-login-button"
              >
                {t('header.login', 'Войти')}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


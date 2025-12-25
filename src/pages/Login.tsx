import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Logo from '../components/header/Logo';
import LanguageSwitcher from '../components/language-switcher/LanguageSwitcher';
import './Login.scss';

const { Title, Text } = Typography;

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const success = await login(values.email, values.password);
      if (success) {
        message.success(t('login.success', 'Успешный вход!'));
        navigate('/dashboard');
      } else {
        message.error(t('login.error', 'Неверный email или пароль'));
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error(t('login.error', 'Ошибка при входе'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Minimal Header */}
      <header className="login-header">
        <div className="login-header-container">
          <div className="login-header-logo">
            <div className="logo-icon">
              <Logo />
            </div>
            <span className="logo-text">
              {t('header.title', 'Smart Water Control')}
            </span>
          </div>
          <div className="login-header-actions">
            <LanguageSwitcher />
            <a href="/" className="home-link">
              {t('header.home', 'Главная')}
            </a>
          </div>
        </div>
      </header>

      <div className="login-content">
        <Card className="login-card">
          <div className="login-card-header">
            <div className="login-icon">
              <UserOutlined />
            </div>
            <Title level={2} className="login-title">
              {t('login.title', 'Вход в систему')}
            </Title>
            <Text className="login-subtitle">
              {t('login.subtitle', 'Войдите в свой аккаунт для доступа к панели управления')}
            </Text>
          </div>

          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            autoComplete="off"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: t('login.emailRequired', 'Введите email') },
                { type: 'email', message: t('login.emailInvalid', 'Некорректный email') },
              ]}
            >
              <Input
                prefix={<UserOutlined className="input-icon" />}
                placeholder={t('login.emailPlaceholder', 'Email')}
                className="login-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: t('login.passwordRequired', 'Введите пароль') },
                { min: 1, message: t('login.passwordMin', 'Минимум 1 символ') },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="input-icon" />}
                placeholder={t('login.passwordPlaceholder', 'Пароль')}
                className="login-input"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="login-submit-button"
              >
                {t('login.submit', 'Войти')}
              </Button>
            </Form.Item>
          </Form>

          <div className="login-demo-info">
            <Text className="demo-text">
              {t('login.demo', 'Демо: admin@water.tj / admin123')}
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
}


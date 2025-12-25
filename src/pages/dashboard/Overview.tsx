import { useTranslation } from 'react-i18next';
import { Card, Row, Col, Statistic } from 'antd';
import { useChannelsStore } from '../../stores/channelsStore';
import { ThunderboltOutlined, EnvironmentOutlined, AlertOutlined } from '@ant-design/icons';
import './Overview.scss';

export default function Overview() {
  const { t } = useTranslation();
  const channels = useChannelsStore((state) => state.channels);

  const totalChannels = channels.length;
  const totalLength = channels.reduce((sum, ch) => sum + ch.length, 0);
  const criticalChannels = channels.filter((ch) => ch.status === 'critical').length;
  const highLossChannels = channels.filter((ch) => ch.status === 'high-loss').length;

  return (
    <div className="overview-page">
      <h1 className="page-title">{t('dashboard.overview', 'Обзор')}</h1>
      
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.totalChannels', 'Всего каналов')}
              value={totalChannels}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.totalLength', 'Общая длина')}
              value={totalLength.toFixed(1)}
              suffix="км"
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.criticalChannels', 'Критические')}
              value={criticalChannels}
              valueStyle={{ color: '#cf1322' }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.highLossChannels', 'Высокие потери')}
              value={highLossChannels}
              valueStyle={{ color: '#faad14' }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card className="welcome-card">
        <h2>{t('dashboard.welcome', 'Добро пожаловать в панель управления')}</h2>
        <p>{t('dashboard.welcomeText', 'Используйте меню слева для навигации между разделами')}</p>
      </Card>
    </div>
  );
}


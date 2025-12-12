import { useTranslation } from 'react-i18next';
import { Card, Statistic, Tag, Row, Col, Typography, Divider } from 'antd';
import type { ChannelData } from '../../types/channel';
import './ChannelInfo.scss';

const { Title, Text, Paragraph } = Typography;

interface ChannelInfoProps {
  channel: ChannelData | null;
}

export default function ChannelInfo({ channel }: ChannelInfoProps) {
  const { t } = useTranslation();
  
  if (!channel) {
    return (
      <div className="channel-info empty">
        <Text type="secondary">{t('channelInfo.selectChannel')}</Text>
      </div>
    );
  }

  const getStatusTag = (status: 'normal' | 'high-loss' | 'critical') => {
    const statusMap = {
      'normal': { color: 'success', label: t('channelInfo.status.normal') },
      'high-loss': { color: 'warning', label: t('channelInfo.status.highLoss') },
      'critical': { color: 'error', label: t('channelInfo.status.critical') },
    };
    const statusInfo = statusMap[status];
    return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
  };

  return (
    <div className="channel-info">
      <Card>
        <div className="channel-header">
          <Title level={2}>{channel.name}</Title>
          {getStatusTag(channel.status)}
        </div>

        <Divider />

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title={t('channelInfo.length')}
              value={channel.length}
              suffix="км"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title={t('channelInfo.losses')}
              value={channel.lossPercentage}
              precision={1}
              suffix="%"
              valueStyle={{ color: channel.lossPercentage > 20 ? '#dc2626' : undefined }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {channel.lossVolume.toFixed(2)} м³/с
            </Text>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title={t('channelInfo.lossPerKm')}
              value={channel.lossPerKm}
              precision={3}
              suffix="%"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title={t('channelInfo.efficiency')}
              value={channel.efficiency * 100}
              precision={0}
              suffix="%"
              valueStyle={{ color: channel.efficiency > 0.8 ? '#10b981' : '#f59e0b' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title={t('channelInfo.width')}
              value={channel.width}
              precision={2}
              suffix="м"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title={t('channelInfo.depth')}
              value={channel.depth}
              precision={2}
              suffix="м"
            />
          </Col>
        </Row>

        <Divider>{t('channelInfo.waterFlow')}</Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title={t('channelInfo.waterFlow')}
              value={channel.waterFlow}
              precision={2}
              suffix="м³/с"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title={t('channelInfo.waterFlowIn')}
              value={channel.waterVolumeIn}
              precision={2}
              suffix="м³/с"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title={t('channelInfo.waterFlowOut')}
              value={channel.waterVolumeOut}
              precision={2}
              suffix="м³/с"
            />
          </Col>
        </Row>

        <Divider />
        
        <Paragraph>
          <Text strong>{t('channelInfo.losses')}:</Text>{' '}
          <Text>{channel.lossVolume.toFixed(2)} м³/с ({channel.lossPercentage.toFixed(1)}%)</Text>
        </Paragraph>

        {channel.recommendations && channel.recommendations.length > 0 && (
          <>
            <Divider>{t('channelInfo.recommendations')}</Divider>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {channel.recommendations.map((rec, index) => (
                <li key={index}>
                  <Text>{rec}</Text>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}


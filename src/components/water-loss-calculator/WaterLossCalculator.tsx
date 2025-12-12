import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, InputNumber, Button, Statistic, Tag, Row, Col, Divider, Typography, Space } from 'antd';
import './WaterLossCalculator.scss';

const { Title, Text } = Typography;

interface CalculationResult {
  totalLoss: number; // общие потери (м³/с)
  lossPercentage: number; // процент потерь
  lossPerKm: number; // потери на 1 км (%)
  efficiency: number; // КПД
  evaporationLoss?: number; // потери на испарение (упрощенный расчет)
}

export default function WaterLossCalculator() {
  const { t } = useTranslation();
  const [channelLength, setChannelLength] = useState<number>(0);
  const [waterFlowIn, setWaterFlowIn] = useState<number>(0);
  const [waterFlowOut, setWaterFlowOut] = useState<number>(0);
  const [channelWidth, setChannelWidth] = useState<number>(0);
  const [channelDepth, setChannelDepth] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(25); // средняя температура
  const [humidity, setHumidity] = useState<number>(60); // влажность (%)
  const [windSpeed, setWindSpeed] = useState<number>(2); // скорость ветра (м/с)
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Расчет потерь по формуле водного баланса: P = Q_вх - Q_вых
  const calculateWaterBalance = (): CalculationResult => {
    if (channelLength <= 0 || waterFlowIn <= 0) {
      return {
        totalLoss: 0,
        lossPercentage: 0,
        lossPerKm: 0,
        efficiency: 1,
      };
    }

    const totalLoss = waterFlowIn - waterFlowOut;
    const lossPercentage = (totalLoss / waterFlowIn) * 100;
    const lossPerKm = channelLength > 0 ? lossPercentage / channelLength : 0;
    const efficiency = waterFlowIn > 0 ? waterFlowOut / waterFlowIn : 1;

    // Упрощенный расчет испарения (на основе формулы Пенмана-Монтейта)
    // Упрощенная версия для практического использования
    const evaporationRate = calculateEvaporation(temperature, humidity, windSpeed);
    const waterSurfaceArea = channelLength * 1000 * channelWidth; // площадь в м²
    const evaporationLoss = (evaporationRate * waterSurfaceArea) / (1000 * 86400); // м³/с

    return {
      totalLoss,
      lossPercentage,
      lossPerKm,
      efficiency,
      evaporationLoss: evaporationLoss > 0 ? evaporationLoss : undefined,
    };
  };

  // Упрощенный расчет испарения (на основе формулы Пенмана-Монтейта)
  // Возвращает мм/день
  const calculateEvaporation = (temp: number, hum: number, wind: number): number => {
    // Упрощенная формула на основе Пенмана-Монтейта
    // ET0 ≈ 0.0023 * (Tavg + 17.8) * sqrt(Tmax - Tmin) * (1 - RH/100) * (0.5 + 0.54 * u2)
    const saturationVaporPressure = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
    const actualVaporPressure = saturationVaporPressure * (hum / 100);
    const vaporPressureDeficit = saturationVaporPressure - actualVaporPressure;
    
    // Упрощенная формула для практического использования
    const et0 = 0.0023 * (temp + 17.8) * Math.sqrt(5) * (vaporPressureDeficit / 10) * (0.5 + 0.54 * wind);
    
    return Math.max(0, et0); // мм/день
  };

  const handleCalculate = () => {
    const calculationResult = calculateWaterBalance();
    setResult(calculationResult);
  };

  const handleReset = () => {
    setChannelLength(0);
    setWaterFlowIn(0);
    setWaterFlowOut(0);
    setChannelWidth(0);
    setChannelDepth(0);
    setTemperature(25);
    setHumidity(60);
    setWindSpeed(2);
    setResult(null);
  };

  const getStatus = (lossPercentage: number): 'normal' | 'high-loss' | 'critical' => {
    if (lossPercentage > 30) return 'critical';
    if (lossPercentage > 15) return 'high-loss';
    return 'normal';
  };

  const getStatusLabel = (status: 'normal' | 'high-loss' | 'critical') => {
    if (status === 'critical') return t('channelInfo.status.critical');
    if (status === 'high-loss') return t('channelInfo.status.highLoss');
    return t('channelInfo.status.normal');
  };

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
    <div className="water-loss-calculator">
      <Card>
        <Title level={2}>{t('calculator.title')}</Title>
        <Text type="secondary">{t('calculator.description')}</Text>

        <Divider>{t('calculator.basicParams')}</Divider>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>{t('calculator.fields.length')} <Text type="danger">*</Text></Text>
            </div>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.1}
              value={channelLength}
              onChange={(value) => setChannelLength(value || 0)}
              placeholder={t('calculator.placeholders.length')}
              addonAfter={<span style={{ whiteSpace: 'nowrap' }}>км</span>}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>{t('calculator.fields.flowIn')} <Text type="danger">*</Text></Text>
            </div>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              value={waterFlowIn}
              onChange={(value) => setWaterFlowIn(value || 0)}
              placeholder={t('calculator.placeholders.flowIn')}
              addonAfter={<span style={{ whiteSpace: 'nowrap' }}>м³/с</span>}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>{t('calculator.fields.flowOut')} <Text type="danger">*</Text></Text>
            </div>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              value={waterFlowOut}
              onChange={(value) => setWaterFlowOut(value || 0)}
              placeholder={t('calculator.placeholders.flowOut')}
              addonAfter={<span style={{ whiteSpace: 'nowrap' }}>м³/с</span>}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>{t('calculator.fields.width')}</Text>
            </div>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.1}
              value={channelWidth}
              onChange={(value) => setChannelWidth(value || 0)}
              placeholder={t('calculator.placeholders.width')}
              addonAfter={<span style={{ whiteSpace: 'nowrap' }}>м</span>}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>{t('calculator.fields.depth')}</Text>
            </div>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.1}
              value={channelDepth}
              onChange={(value) => setChannelDepth(value || 0)}
              placeholder={t('calculator.placeholders.depth')}
              addonAfter={<span style={{ whiteSpace: 'nowrap' }}>м</span>}
            />
          </Col>
        </Row>

        <Divider>{t('calculator.climateParams')}</Divider>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>{t('calculator.fields.temperature')}</Text>
            </div>
            <InputNumber
              style={{ width: '100%' }}
              value={temperature}
              step={0.1}
              onChange={(value) => setTemperature(value || 25)}
              placeholder={t('calculator.placeholders.temperature')}
              addonAfter={<span style={{ whiteSpace: 'nowrap' }}>°C</span>}
            />
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
              {t('calculator.notes.temperature')}
            </Text>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>{t('calculator.fields.humidity')}</Text>
            </div>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={100}
              step={1}
              value={humidity}
              onChange={(value) => setHumidity(value || 60)}
              placeholder={t('calculator.placeholders.humidity')}
              addonAfter={<span style={{ whiteSpace: 'nowrap' }}>%</span>}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>{t('calculator.fields.windSpeed')}</Text>
            </div>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.1}
              value={windSpeed}
              onChange={(value) => setWindSpeed(value || 2)}
              placeholder={t('calculator.placeholders.windSpeed')}
              addonAfter={<span style={{ whiteSpace: 'nowrap' }}>м/с</span>}
            />
          </Col>
        </Row>

        <Divider />

        <Space>
          <Button type="primary" size="large" onClick={handleCalculate}>
            {t('calculator.calculate')}
          </Button>
          <Button onClick={handleReset}>
            {t('calculator.reset')}
          </Button>
        </Space>

        {result && (
          <>
            <Divider>{t('calculator.results.title')}</Divider>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title={t('calculator.results.totalLosses')}
                  value={result.totalLoss}
                  precision={2}
                  suffix="м³/с"
                  valueStyle={{ color: result.lossPercentage > 20 ? '#dc2626' : undefined }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {result.lossPercentage.toFixed(1)}%
                </Text>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title={t('calculator.results.lossPerKm')}
                  value={result.lossPerKm}
                  precision={3}
                  suffix="%"
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title={t('calculator.results.efficiency')}
                  value={result.efficiency * 100}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: result.efficiency > 0.8 ? '#10b981' : '#f59e0b' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>{t('calculator.results.status')}</Text>
                </div>
                {getStatusTag(getStatus(result.lossPercentage))}
              </Col>
            </Row>

            {result.evaporationLoss && (
              <>
                <Divider>{t('calculator.evaporation.title')}</Divider>
                <Statistic
                  title={t('calculator.results.evaporation')}
                  value={result.evaporationLoss}
                  precision={4}
                  suffix="м³/с"
                />
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                  {t('calculator.evaporation.note')}
                </Text>
              </>
            )}

            <Divider>{t('calculator.formulas.title')}</Divider>
            <div className="formulas-info">
              <div className="formula-item">
                <Text strong>{t('calculator.formulas.balance')}:</Text>
                <code>P = Q<sub>вх</sub> - Q<sub>вых</sub></code>
                <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                  {t('calculator.formulas.balanceDesc')}
                </Text>
              </div>
              <div className="formula-item" style={{ marginTop: 16 }}>
                <Text strong>{t('calculator.formulas.lossPerKm')}:</Text>
                <code>P<sub>1км</sub> = (P / Q<sub>вх</sub>) × 100% / L</code>
                <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                  {t('calculator.formulas.lossPerKmDesc')}
                </Text>
              </div>
              <div className="formula-item" style={{ marginTop: 16 }}>
                <Text strong>{t('calculator.formulas.efficiency')}:</Text>
                <code>{t('calculator.formulas.efficiency')} = Q<sub>вых</sub> / Q<sub>вх</sub></code>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}


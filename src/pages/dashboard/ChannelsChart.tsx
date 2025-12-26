import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useChannelsStore } from '../../stores/channelsStore';
import { Card, Empty } from 'antd';
import './ChannelsChart.scss';

export default function ChannelsChart() {
  const { t } = useTranslation();
  const allChannels = useChannelsStore((state) => state.channels);

  // Всегда показываем все каналы из таблицы в графике
  const channelsForChart = useMemo(() => {
    return allChannels;
  }, [allChannels]);

  if (channelsForChart.length === 0) {
    return (
      <div className="channels-chart-page">
        <h1 className="page-title">{t('chart.title', 'Графики каналов')}</h1>
        <Card>
          <Empty
            description={t('chart.empty', 'Нет каналов для отображения графика. Добавьте каналы в таблицу.')}
          />
        </Card>
      </div>
    );
  }

  // Подготовка данных для графика
  const chartData = channelsForChart.map((channel) => ({
    name: channel.name.length > 15 ? channel.name.substring(0, 15) + '...' : channel.name,
    fullName: channel.name,
    'Потери, %': channel.lossPercentage,
    'КПД, %': channel.efficiency * 100,
    'Потери, м³/с': channel.lossVolume,
    'Расход, м³/с': channel.waterFlow,
    'Длина, км': channel.length,
  }));

  return (
    <div className="channels-chart-page">
      <h1 className="page-title">{t('chart.title', 'Графики каналов')}</h1>

      <Card className="chart-card">
        <div className="chart-header">
          <h3>{t('chart.lossesAndEfficiency', 'Потери и КПД каналов')}</h3>
          <p className="chart-description">
            {t('chart.description', 'График показывает потери воды и КПД по выбранным каналам')}
          </p>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '8px',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'КПД, %') {
                    return [`${value.toFixed(1)}%`, name];
                  }
                  if (name === 'Потери, %') {
                    return [`${value.toFixed(1)}%`, name];
                  }
                  return [value.toFixed(2), name];
                }}
                labelFormatter={(label) => {
                  const fullName = chartData.find((d) => d.name === label)?.fullName;
                  return fullName || label;
                }}
              />
              <Legend />
              <Bar
                dataKey="Потери, %"
                fill="#f59e0b"
                name={t('chart.lossesPercent', 'Потери, %')}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="КПД, %"
                fill="#10b981"
                name={t('chart.efficiencyPercent', 'КПД, %')}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="chart-card">
        <div className="chart-header">
          <h3>{t('chart.flowAndLosses', 'Расход и потери воды')}</h3>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '8px',
                }}
                formatter={(value: number) => `${value.toFixed(2)} м³/с`}
                labelFormatter={(label) => {
                  const fullName = chartData.find((d) => d.name === label)?.fullName;
                  return fullName || label;
                }}
              />
              <Legend />
              <Bar
                dataKey="Расход, м³/с"
                fill="#0284c7"
                name={t('chart.flow', 'Расход, м³/с')}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Потери, м³/с"
                fill="#f59e0b"
                name={t('chart.losses', 'Потери, м³/с')}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="chart-card">
        <div className="chart-header">
          <h3>{t('chart.lengthComparison', 'Сравнение длин каналов')}</h3>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '8px',
                }}
                formatter={(value: number) => `${value.toFixed(1)} км`}
                labelFormatter={(label) => {
                  const fullName = chartData.find((d) => d.name === label)?.fullName;
                  return fullName || label;
                }}
              />
              <Legend />
              <Bar
                dataKey="Длина, км"
                fill="#8b5cf6"
                name={t('chart.length', 'Длина, км')}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}


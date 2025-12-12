import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChannelData } from '../../types/channel';
import './ChannelsChart.scss';

interface ChannelsChartProps {
  channels: ChannelData[];
}

export default function ChannelsChart({ channels }: ChannelsChartProps) {
  if (channels.length === 0) {
    return (
      <div className="channels-chart empty">
        <p>Нет данных для отображения графика. Добавьте каналы в таблицу.</p>
      </div>
    );
  }

  // Подготовка данных для графика
  const chartData = channels.map(channel => ({
    name: channel.name,
    'Потери, %': channel.lossPercentage,
    'КПД, %': channel.efficiency * 100,
    'Потери, м³/с': channel.lossVolume,
    'Расход, м³/с': channel.waterFlow,
  }));

  return (
    <div className="channels-chart">
      <div className="chart-header">
        <h3>Визуализация данных каналов</h3>
        <p className="chart-description">
          График показывает потери воды, КПД и расход по всем каналам
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
                padding: '8px'
              }}
            />
            <Legend />
            <Bar 
              dataKey="Потери, %" 
              fill="#dc2626" 
              name="Потери, %"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="КПД, %" 
              fill="#10b981" 
              name="КПД, %"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h4>Расход и потери воды (м³/с)</h4>
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
                padding: '8px'
              }}
            />
            <Legend />
            <Bar 
              dataKey="Расход, м³/с" 
              fill="#0284c7" 
              name="Расход, м³/с"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="Потери, м³/с" 
              fill="#f59e0b" 
              name="Потери, м³/с"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


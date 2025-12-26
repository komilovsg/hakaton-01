import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Table, Typography, Button, Space } from 'antd';
import { DatabaseOutlined, InfoCircleOutlined, BarChartOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { table16Part1Data, table16Part2Data } from '../../components/official-data/data';
import type { ColumnsType } from 'antd/es/table';
import type { Table16Part1Row, Table16Part2Row } from '../../components/official-data/data';
import './SourceData.scss';

const { Title, Text } = Typography;

export default function SourceData() {
  const { t } = useTranslation();
  const [showChartPart1, setShowChartPart1] = useState(false);
  const [showChartPart2, setShowChartPart2] = useState(false);

  // Форматирование числа с пробелами для тысяч
  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '—';
    return num.toLocaleString('ru-RU', { 
      minimumFractionDigits: 1, 
      maximumFractionDigits: 1 
    });
  };

  // Подготовка данных для графика первой таблицы (Апрель-Июнь)
  const chartDataPart1 = (() => {
    const monthNames: Record<string, string> = {
      apr: t('sourceData.april', 'Апрел'),
      may: t('sourceData.may', 'Май'),
      jun: t('sourceData.june', 'Июн'),
    };
    
    return ['apr', 'may', 'jun'].flatMap((month) => {
      return [0, 1, 2].map((idx) => ({
        name: `${monthNames[month]} ${idx === 0 ? 'I' : idx === 1 ? 'II' : 'III'}`,
        ...table16Part1Data.reduce((acc, row) => {
          const value = row.decades[month as 'apr' | 'may' | 'jun'][idx];
          acc[row.name] = value !== null && value !== undefined ? value : 0;
          return acc;
        }, {} as Record<string, number>),
      }));
    });
  })();

  // Подготовка данных для графика второй таблицы (Июль-Октябрь)
  const chartDataPart2 = (() => {
    const monthNames: Record<string, string> = {
      jul: t('sourceData.july', 'Июл'),
      aug: t('sourceData.august', 'Август'),
      sep: t('sourceData.september', 'Сентиябр'),
      oct: t('sourceData.october', 'Октябр'),
    };
    
    return ['jul', 'aug', 'sep', 'oct'].flatMap((month) => {
      const decades = month === 'oct' ? [0, 1] : [0, 1, 2];
      return decades.map((idx) => ({
        name: `${monthNames[month]} ${idx === 0 ? 'I' : idx === 1 ? 'II' : 'III'}`,
        ...table16Part2Data.reduce((acc, row) => {
          const value = month === 'oct' 
            ? (row.decades.oct[idx] ?? null)
            : row.decades[month as 'jul' | 'aug' | 'sep'][idx];
          acc[row.name] = value !== null && value !== undefined ? value : 0;
          return acc;
        }, {} as Record<string, number>),
      }));
    });
  })();

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Колонки для первой таблицы (Апрель-Июнь)
  const columnsPart1: ColumnsType<Table16Part1Row> = [
    {
      title: t('sourceData.number', '№ т/р'),
      dataIndex: 'number',
      key: 'number',
      width: 60,
      fixed: 'left',
      align: 'center',
    },
    {
      title: t('sourceData.table16Part1ColumnHeader', 'Название каналов Группы пользователей воды'),
      dataIndex: 'name',
      key: 'name',
      width: 300,
      fixed: 'left',
    },
    {
      title: t('sourceData.area', 'Майдони кишт, га'),
      dataIndex: 'area',
      key: 'area',
      width: 120,
      align: 'right',
      render: (area: number) => formatNumber(area),
    },
    {
      title: 'Ω',
      dataIndex: 'omega',
      key: 'omega',
      width: 100,
      align: 'right',
      render: (omega: number) => formatNumber(omega),
    },
    {
      title: t('sourceData.april', 'Апрел'),
      key: 'april',
      children: [
        {
          title: 'I',
          dataIndex: ['decades', 'apr', 0],
          key: 'apr1',
          width: 100,
          align: 'right',
          render: (_: unknown, record: Table16Part1Row) => formatNumber(record.decades.apr[0]),
        },
        {
          title: 'II',
          dataIndex: ['decades', 'apr', 1],
          key: 'apr2',
          width: 100,
          align: 'right',
          render: (_: unknown, record: Table16Part1Row) => formatNumber(record.decades.apr[1]),
        },
        {
          title: 'III',
          dataIndex: ['decades', 'apr', 2],
          key: 'apr3',
          width: 100,
          align: 'right',
          render: (_: unknown, record: Table16Part1Row) => formatNumber(record.decades.apr[2]),
        },
      ],
    },
    {
      title: t('sourceData.may', 'Май'),
      key: 'may',
      children: [
        {
          title: 'I',
          dataIndex: ['decades', 'may', 0],
          key: 'may1',
          width: 100,
          align: 'right',
          render: (_: unknown, record: Table16Part1Row) => formatNumber(record.decades.may[0]),
        },
        {
          title: 'II',
          dataIndex: ['decades', 'may', 1],
          key: 'may2',
          width: 100,
          align: 'right',
          render: (_: unknown, record: Table16Part1Row) => formatNumber(record.decades.may[1]),
        },
        {
          title: 'III',
          dataIndex: ['decades', 'may', 2],
          key: 'may3',
          width: 100,
          align: 'right',
          render: (_: unknown, record: Table16Part1Row) => formatNumber(record.decades.may[2]),
        },
      ],
    },
    {
      title: t('sourceData.june', 'Июн'),
      key: 'june',
      children: [
        {
          title: 'I',
          dataIndex: ['decades', 'jun', 0],
          key: 'jun1',
          width: 100,
          align: 'right',
          render: (_: unknown, record: Table16Part1Row) => formatNumber(record.decades.jun[0]),
        },
        {
          title: 'II',
          dataIndex: ['decades', 'jun', 1],
          key: 'jun2',
          width: 100,
          align: 'right',
          render: (_: unknown, record: Table16Part1Row) => formatNumber(record.decades.jun[1]),
        },
        {
          title: 'III',
          dataIndex: ['decades', 'jun', 2],
          key: 'jun3',
          width: 100,
          align: 'right',
          render: (_: unknown, record: Table16Part1Row) => formatNumber(record.decades.jun[2]),
        },
      ],
    },
  ];

  // Колонки для второй таблицы (Июль-Октябрь)
  const columnsPart2: ColumnsType<Table16Part2Row> = [
    {
      title: t('sourceData.number', '№ т/р'),
      dataIndex: 'number',
      key: 'number',
      width: 60,
      fixed: 'left',
      align: 'center',
    },
    {
      title: t('sourceData.table16Part2ColumnHeader', 'Название каналов АИО'),
      dataIndex: 'name',
      key: 'name',
      width: 300,
      fixed: 'left',
    },
    {
      title: t('sourceData.area', 'Майдони кишт, га'),
      dataIndex: 'area',
      key: 'area',
      width: 120,
      align: 'right',
      render: (area: number) => formatNumber(area),
    },
    {
      title: t('sourceData.july', 'Июл'),
      key: 'july',
      children: [
        {
          title: 'I',
          dataIndex: ['decades', 'jul', 0],
          key: 'jul1',
          width: 100,
          align: 'right',
          render: (_: unknown, record: Table16Part2Row) => formatNumber(record.decades.jul[0]),
        },
        {
          title: 'II',
          dataIndex: ['decades', 'jul', 1],
          key: 'jul2',
          width: 100,
          align: 'right',
          render: (_: unknown, record: Table16Part2Row) => formatNumber(record.decades.jul[1]),
        },
        {
          title: 'III',
          dataIndex: ['decades', 'jul', 2],
          key: 'jul3',
          width: 100,
          align: 'right',
          render: (_: unknown, record: Table16Part2Row) => formatNumber(record.decades.jul[2]),
        },
      ],
    },
    {
      title: t('sourceData.august', 'Август'),
      key: 'august',
      children: [
        {
          title: 'I',
          dataIndex: ['decades', 'aug', 0],
          key: 'aug1',
          width: 100,
          align: 'right',
          render: (_: unknown, record: Table16Part2Row) => formatNumber(record.decades.aug[0]),
        },
        {
          title: 'II',
          dataIndex: ['decades', 'aug', 1],
          key: 'aug2',
          width: 100,
          align: 'right',
          render: (_: unknown, record: Table16Part2Row) => formatNumber(record.decades.aug[1]),
        },
        {
          title: 'III',
          dataIndex: ['decades', 'aug', 2],
          key: 'aug3',
          width: 100,
          align: 'right',
          render: (_: unknown, record: Table16Part2Row) => formatNumber(record.decades.aug[2]),
        },
      ],
    },
    {
      title: t('sourceData.september', 'Сентиябр'),
      key: 'september',
      children: [
        {
          title: 'I',
          dataIndex: ['decades', 'sep', 0],
          key: 'sep1',
          width: 100,
          align: 'right',
          render: (_: unknown, record: Table16Part2Row) => formatNumber(record.decades.sep[0]),
        },
        {
          title: 'II',
          dataIndex: ['decades', 'sep', 1],
          key: 'sep2',
          width: 100,
          align: 'right',
          render: (_: unknown, record: Table16Part2Row) => formatNumber(record.decades.sep[1]),
        },
        {
          title: 'III',
          dataIndex: ['decades', 'sep', 2],
          key: 'sep3',
          width: 100,
          align: 'right',
          render: (_: unknown, record: Table16Part2Row) => formatNumber(record.decades.sep[2]),
        },
      ],
    },
    {
      title: t('sourceData.october', 'Октябр'),
      key: 'october',
      children: [
        {
          title: 'I',
          dataIndex: ['decades', 'oct', 0],
          key: 'oct1',
          width: 100,
          align: 'right',
          render: (_: unknown, record: Table16Part2Row) => formatNumber(record.decades.oct[0]),
        },
        {
          title: 'II',
          dataIndex: ['decades', 'oct', 1],
          key: 'oct2',
          width: 100,
          align: 'right',
          render: (_: unknown, record: Table16Part2Row) => formatNumber(record.decades.oct[1]),
        },
      ],
    },
  ];

  return (
    <div className="source-data-page">
      <div className="page-header">
        <Title level={1} className="page-title">
          <DatabaseOutlined /> {t('sourceData.title', 'Исходные данные')}
        </Title>
        <Card className="info-card">
          <Space>
            <InfoCircleOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
            <Text type="secondary">
              {t('sourceData.description', 'Данные таблицы 16, используемые для расчета таблицы 14. В продакшене данные будут поступать из API.')}
            </Text>
          </Space>
        </Card>
      </div>

      <Card 
        className="table-card" 
        title={
          <div className="card-title-wrapper">
            <span>{t('sourceData.table16Title', 'Таблица 16. Расход каналов между хозяйствами в ПК 0 - и, АИО и магистральных района Рудаки')}</span>
            <Button
              type="primary"
              icon={<BarChartOutlined />}
              onClick={() => setShowChartPart1(!showChartPart1)}
            >
              {showChartPart1 ? t('sourceData.hideChart', 'Скрыть график') : t('sourceData.showChart', 'График')}
            </Button>
          </div>
        }
      >
        <Table
          columns={columnsPart1}
          dataSource={table16Part1Data}
          rowKey="number"
          pagination={false}
          scroll={{ x: 1400 }}
          bordered
          size="middle"
          className="source-data-table"
        />
        
        {showChartPart1 && (
          <div className="chart-container">
            <Title level={4} className="chart-title">
              {t('sourceData.chartTitle', 'График расхода воды по декадам (Апрель-Июнь)')}
            </Title>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartDataPart1} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                  formatter={(value: number) => formatNumber(value)}
                />
                <Legend />
                {table16Part1Data.map((row, index) => (
                  <Line
                    key={row.number}
                    type="monotone"
                    dataKey={row.name}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card 
        className="table-card" 
        title={
          <div className="card-title-wrapper">
            <span>{t('sourceData.table16Continuation', 'Продолжение таблицы 16.')}</span>
            <Button
              type="primary"
              icon={<BarChartOutlined />}
              onClick={() => setShowChartPart2(!showChartPart2)}
            >
              {showChartPart2 ? t('sourceData.hideChart', 'Скрыть график') : t('sourceData.showChart', 'График')}
            </Button>
          </div>
        }
      >
        <Table
          columns={columnsPart2}
          dataSource={table16Part2Data}
          rowKey="number"
          pagination={false}
          scroll={{ x: 1400 }}
          bordered
          size="middle"
          className="source-data-table"
        />
        
        {showChartPart2 && (
          <div className="chart-container">
            <Title level={4} className="chart-title">
              {t('sourceData.chartTitle2', 'График расхода воды по декадам (Июль-Октябрь)')}
            </Title>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartDataPart2} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                  formatter={(value: number) => formatNumber(value)}
                />
                <Legend />
                {table16Part2Data.map((row, index) => (
                  <Line
                    key={row.number}
                    type="monotone"
                    dataKey={row.name}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}


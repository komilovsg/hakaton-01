import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { message, Button, Space } from 'antd';
import Map from '../map/Map';
import ChannelInfo from '../channel-info/ChannelInfo';
import ChannelsTable from '../channels-table/ChannelsTable';
import ChannelForm from '../channel-form/ChannelForm';
import ChannelsChart from '../channels-chart/ChannelsChart';
import WaterLossCalculator from '../water-loss-calculator/WaterLossCalculator';
import OfficialData from '../official-data/OfficialData';
import AIAnalysis from '../ai-analysis/AIAnalysis';
import LanguageSwitcher from '../language-switcher/LanguageSwitcher';
import type { ChannelData } from '../../types/channel';
import './Landing.scss';

// Данные каналов на основе таблицы и каналов Душанбе (позже будут приходить с бэка)
// Координаты размещены в пределах Таджикистана
const mockChannels: ChannelData[] = [
  // Каналы из таблицы
  {
    id: '1',
    name: 'Гулама',
    length: 42,
    coordinates: [
      [38.4000, 68.5000], // Северо-запад Таджикистана
      [38.4500, 68.6000],
      [38.5000, 68.7000],
      [38.5500, 68.8000],
      [38.6000, 68.9000],
      [38.6500, 69.0000],
    ],
    width: 3.5,
    depth: 1.8,
    waterFlow: 5.0,
    waterVolumeIn: 5.0,
    waterVolumeOut: 5.0, // Данные о потерях отсутствуют
    lossPerKm: 0,
    lossVolume: 0,
    filtrationCoefficient: 0,
    lossPercentage: 0,
    efficiency: 1.0,
    status: 'normal',
  },
  {
    id: '2',
    name: 'Пиёзи',
    length: 16,
    coordinates: [
      [38.5500, 68.7000], // Центральная часть Таджикистана
      [38.5600, 68.7500],
      [38.5700, 68.8000],
      [38.5800, 68.8500],
    ],
    width: 2.5,
    depth: 1.5,
    waterFlow: 1.0,
    waterVolumeIn: 1.0,
    waterVolumeOut: 0.888, // Примерный расчет: 1.0 - (16 * 0.007 * 1.0 / 100)
    lossPerKm: 0.700,
    lossVolume: 0.112, // Примерный расчет
    filtrationCoefficient: 0.15,
    lossPercentage: 11.2,
    efficiency: 0.888,
    status: 'high-loss',
    recommendations: [
      'Рекомендуется проверить участки с высокими потерями',
      'Рассмотреть возможность бетонирования критических участков',
    ],
  },
  {
    id: '3',
    name: 'ВМК',
    length: 51,
    coordinates: [
      [37.9000, 68.2000], // Юго-запад Таджикистана
      [37.9500, 68.3000],
      [38.0000, 68.4000],
      [38.0500, 68.5000],
      [38.1000, 68.6000],
      [38.1500, 68.7000],
      [38.2000, 68.8000],
      [38.2500, 68.9000],
    ],
    width: 4.0,
    depth: 2.0,
    waterFlow: 17.0,
    waterVolumeIn: 17.0,
    waterVolumeOut: 13.11, // 17.0 - 3.89
    lossPerKm: 0.299,
    lossVolume: 3.89,
    filtrationCoefficient: 0.25,
    lossPercentage: 23,
    efficiency: 0.77,
    status: 'high-loss',
    recommendations: [
      'Требуется ремонт участков с высокими потерями (23%)',
      'Рекомендуется бетонирование наиболее проблемных участков',
      'Провести детальное обследование канала',
    ],
  },
  {
    id: '4',
    name: 'БГК',
    length: 51,
    coordinates: [
      [38.5809, 68.7759], // Начало (голова) БГК — Варзоб/Душанбе
      [38.5606, 68.3181], // Устье (река Каратаг)
    ],
    width: 5.0,
    depth: 2.5,
    waterFlow: 41.0,
    waterVolumeIn: 41.0,
    waterVolumeOut: 33.79, // 41.0 - 7.21
    lossPerKm: 0.230,
    lossVolume: 7.21,
    filtrationCoefficient: 0.18,
    lossPercentage: 18,
    efficiency: 0.82,
    status: 'high-loss',
    recommendations: [
      'Несмотря на относительно низкие потери на 1 км, общие потери значительны',
      'Рекомендуется оптимизация участков с наибольшими потерями',
      'Рассмотреть возможность улучшения состояния канала',
    ],
  },
  {
    id: '12',
    name: 'Каналы района Рудаки',
    length: 40,
    coordinates: [
      [38.6300, 68.9000], // север района
      [38.5000, 68.7000], // южная часть района
    ],
    width: 3.0,
    depth: 1.5,
    waterFlow: 6.5,
    waterVolumeIn: 6.5,
    waterVolumeOut: 5.2,
    lossPerKm: 0.325,
    lossVolume: 1.3,
    filtrationCoefficient: 0.22,
    lossPercentage: 20,
    efficiency: 0.80,
    status: 'high-loss',
    recommendations: [
      'Учитывать многочисленные рукава (Говкуш, Чоряккорон, Кампиркала) при планировании ремонта',
      'Провести детальное обследование локальных участков по данным декадного расхода',
    ],
  },
  
  // Каналы Душанбе
  {
    id: '5',
    name: 'Душанбинский Канал',
    length: 25,
    coordinates: [
      [38.6400, 68.7900], // Начало от реки Варзоб
      [38.6300, 68.7850],
      [38.6200, 68.7820],
      [38.6100, 68.7800],
      [38.6000, 68.7890],
      [38.5900, 68.7895],
      [38.5835, 68.7891], // Участок входа в черту города
      [38.5800, 68.7880],
      [38.5750, 68.7870],
    ],
    width: 4.5,
    depth: 2.2,
    waterFlow: 12.0,
    waterVolumeIn: 12.0,
    waterVolumeOut: 10.8, // Потери около 10%
    lossPerKm: 0.400,
    lossVolume: 1.2,
    filtrationCoefficient: 0.20,
    lossPercentage: 10,
    efficiency: 0.90,
    status: 'normal',
    recommendations: [
      'Главный искусственный водовод, отводящий воду из реки Варзоб',
      'Питает питьевую систему, водохранилище и ирригационные арыки в городе',
    ],
  },
  {
    id: '6',
    name: 'Река Душанбинка',
    length: 15,
    coordinates: [
      [38.5700, 68.7700], // Начало
      [38.5650, 68.7750],
      [38.5600, 68.7800], // Участок в районе центра
      [38.5550, 68.7850],
      [38.5500, 68.7900],
      [38.5450, 68.7950],
    ],
    width: 3.0,
    depth: 1.5,
    waterFlow: 3.5,
    waterVolumeIn: 3.5,
    waterVolumeOut: 2.8, // Потери около 20%
    lossPerKm: 1.333,
    lossVolume: 0.7,
    filtrationCoefficient: 0.30,
    lossPercentage: 20,
    efficiency: 0.80,
    status: 'high-loss',
    recommendations: [
      'Естественное русло, протекающее через центральную часть города',
      'Критически важна для дренажа и водоотведения',
      'Требуется очистка русла и укрепление берегов',
    ],
  },
  {
    id: '7',
    name: 'Река Варзоб',
    length: 35,
    coordinates: [
      [38.7000, 68.8200], // Верхнее течение
      [38.6800, 68.8100],
      [38.6600, 68.8000],
      [38.6400, 68.7900], // Участок в Варзобском ущелье
      [38.6200, 68.7850],
      [38.6000, 68.7800],
    ],
    width: 8.0,
    depth: 3.5,
    waterFlow: 45.0,
    waterVolumeIn: 45.0,
    waterVolumeOut: 42.3, // Потери около 6%
    lossPerKm: 0.171,
    lossVolume: 2.7,
    filtrationCoefficient: 0.12,
    lossPercentage: 6,
    efficiency: 0.94,
    status: 'normal',
    recommendations: [
      'Основной горный источник, питающий Душанбинский канал',
      'Обеспечивает водоснабжение столицы',
      'Состояние хорошее, минимальные потери',
    ],
  },
  {
    id: '8',
    name: 'Река Кафирниган',
    length: 40,
    coordinates: [
      [38.5500, 68.6500], // Западная часть
      [38.5300, 68.6700],
      [38.5150, 68.6850],
      [38.5050, 68.6950], // Участок у южных границ города
      [38.5000, 68.7050],
      [38.4950, 68.7150],
    ],
    width: 6.5,
    depth: 2.8,
    waterFlow: 28.0,
    waterVolumeIn: 28.0,
    waterVolumeOut: 24.6, // Потери около 12%
    lossPerKm: 0.300,
    lossVolume: 3.4,
    filtrationCoefficient: 0.22,
    lossPercentage: 12,
    efficiency: 0.88,
    status: 'normal',
    recommendations: [
      'Крупная река, протекающая по западной/южной границе города',
      'Питает ирригационные сети пригородных и сельскохозяйственных районов',
    ],
  },
  {
    id: '9',
    name: 'Городские Арыки (Северный)',
    length: 8,
    coordinates: [
      [38.5800, 68.7850],
      [38.5750, 68.7900],
      [38.5700, 68.7950],
      [38.5650, 68.8000],
    ],
    width: 1.5,
    depth: 0.8,
    waterFlow: 0.8,
    waterVolumeIn: 0.8,
    waterVolumeOut: 0.6, // Потери около 25%
    lossPerKm: 3.125,
    lossVolume: 0.2,
    filtrationCoefficient: 0.35,
    lossPercentage: 25,
    efficiency: 0.75,
    status: 'high-loss',
    recommendations: [
      'Второстепенная, открытая ирригационная сеть',
      'Вода поступает из Душанбинского канала для полива парков, улиц и частных садов',
      'Требуется бетонирование для снижения потерь',
    ],
  },
  {
    id: '10',
    name: 'Городские Арыки (Центральный)',
    length: 6,
    coordinates: [
      [38.5600, 68.7750],
      [38.5580, 68.7780],
      [38.5560, 68.7810],
      [38.5540, 68.7840],
    ],
    width: 1.2,
    depth: 0.6,
    waterFlow: 0.5,
    waterVolumeIn: 0.5,
    waterVolumeOut: 0.35, // Потери около 30%
    lossPerKm: 5.000,
    lossVolume: 0.15,
    filtrationCoefficient: 0.40,
    lossPercentage: 30,
    efficiency: 0.70,
    status: 'high-loss',
    recommendations: [
      'Открытая ирригационная сеть в центральной части города',
      'Высокие потери из-за открытого русла',
      'Рекомендуется модернизация системы',
    ],
  },
  {
    id: '11',
    name: 'Городские Арыки (Южный)',
    length: 7,
    coordinates: [
      [38.5400, 68.7800],
      [38.5380, 68.7850],
      [38.5360, 68.7900],
      [38.5340, 68.7950],
    ],
    width: 1.3,
    depth: 0.7,
    waterFlow: 0.6,
    waterVolumeIn: 0.6,
    waterVolumeOut: 0.42, // Потери около 30%
    lossPerKm: 4.286,
    lossVolume: 0.18,
    filtrationCoefficient: 0.38,
    lossPercentage: 30,
    efficiency: 0.70,
    status: 'high-loss',
    recommendations: [
      'Ирригационная сеть в южной части города',
      'Требуется ремонт и оптимизация',
    ],
  },
  // Каналы в Гисаре
  {
    id: '12',
    name: 'Гиссарский магистральный канал',
    length: 35,
    coordinates: [
      [38.5200, 68.5500], // Гисар
      [38.5300, 68.5800],
      [38.5400, 68.6100],
      [38.5500, 68.6400],
      [38.5600, 68.6700],
      [38.5700, 68.7000],
      [38.5800, 68.7300],
    ],
    width: 5.0,
    depth: 2.5,
    waterFlow: 12.0,
    waterVolumeIn: 12.0,
    waterVolumeOut: 9.6,
    lossPerKm: 0.686,
    lossVolume: 2.4,
    filtrationCoefficient: 0.22,
    lossPercentage: 20,
    efficiency: 0.80,
    status: 'high-loss',
    recommendations: [
      'Главный канал Гиссарской долины',
      'Требуется частичный ремонт участков с высокими потерями',
    ],
  },
  {
    id: '13',
    name: 'Гиссарский распределительный канал №1',
    length: 18,
    coordinates: [
      [38.5100, 68.5400],
      [38.5150, 68.5500],
      [38.5200, 68.5600],
      [38.5250, 68.5700],
      [38.5300, 68.5800],
    ],
    width: 3.0,
    depth: 1.8,
    waterFlow: 4.5,
    waterVolumeIn: 4.5,
    waterVolumeOut: 3.87,
    lossPerKm: 3.5,
    lossVolume: 0.63,
    filtrationCoefficient: 0.28,
    lossPercentage: 14,
    efficiency: 0.86,
    status: 'normal',
    recommendations: [
      'Распределительный канал в Гиссаре',
      'Состояние удовлетворительное',
    ],
  },
  {
    id: '14',
    name: 'Гиссарский распределительный канал №2',
    length: 22,
    coordinates: [
      [38.5300, 68.5600],
      [38.5400, 68.5700],
      [38.5500, 68.5800],
      [38.5600, 68.5900],
      [38.5700, 68.6000],
      [38.5800, 68.6100],
    ],
    width: 2.8,
    depth: 1.6,
    waterFlow: 3.2,
    waterVolumeIn: 3.2,
    waterVolumeOut: 2.56,
    lossPerKm: 2.909,
    lossVolume: 0.64,
    filtrationCoefficient: 0.30,
    lossPercentage: 20,
    efficiency: 0.80,
    status: 'high-loss',
    recommendations: [
      'Второй распределительный канал в Гиссаре',
      'Требуется ремонт участков с протечками',
    ],
  },
  // Каналы в Варзобе (к северу от Душанбе)
  {
    id: '15',
    name: 'Варзобский магистральный канал',
    length: 28,
    coordinates: [
      [38.7500, 68.8000], // Варзоб
      [38.7400, 68.8200],
      [38.7300, 68.8400],
      [38.7200, 68.8600],
      [38.7100, 68.8800],
      [38.7000, 68.9000],
    ],
    width: 4.5,
    depth: 2.2,
    waterFlow: 10.5,
    waterVolumeIn: 10.5,
    waterVolumeOut: 8.82,
    lossPerKm: 0.6,
    lossVolume: 1.68,
    filtrationCoefficient: 0.20,
    lossPercentage: 16,
    efficiency: 0.84,
    status: 'normal',
    recommendations: [
      'Магистральный канал Варзобского района',
      'Состояние хорошее, требуется профилактический осмотр',
    ],
  },
  {
    id: '16',
    name: 'Варзобский оросительный канал',
    length: 15,
    coordinates: [
      [38.7600, 68.8100],
      [38.7550, 68.8150],
      [38.7500, 68.8200],
      [38.7450, 68.8250],
      [38.7400, 68.8300],
    ],
    width: 2.5,
    depth: 1.4,
    waterFlow: 2.8,
    waterVolumeIn: 2.8,
    waterVolumeOut: 2.38,
    lossPerKm: 2.8,
    lossVolume: 0.42,
    filtrationCoefficient: 0.25,
    lossPercentage: 15,
    efficiency: 0.85,
    status: 'normal',
    recommendations: [
      'Оросительный канал в Варзобском районе',
      'Работает в нормальном режиме',
    ],
  },
  // Каналы в Турсунзаде (к западу от Душанбе)
  {
    id: '17',
    name: 'Турсунзаде магистральный канал',
    length: 32,
    coordinates: [
      [38.5100, 68.2300], // Турсунзаде
      [38.5200, 68.2600],
      [38.5300, 68.2900],
      [38.5400, 68.3200],
      [38.5500, 68.3500],
      [38.5600, 68.3800],
    ],
    width: 4.8,
    depth: 2.3,
    waterFlow: 11.5,
    waterVolumeIn: 11.5,
    waterVolumeOut: 8.97,
    lossPerKm: 0.79,
    lossVolume: 2.53,
    filtrationCoefficient: 0.24,
    lossPercentage: 22,
    efficiency: 0.78,
    status: 'high-loss',
    recommendations: [
      'Магистральный канал Турсунзаде',
      'Требуется срочный ремонт участков с высокими потерями',
      'Рекомендуется бетонирование критических участков',
    ],
  },
  {
    id: '18',
    name: 'Турсунзаде распределительный канал',
    length: 20,
    coordinates: [
      [38.5000, 68.2400],
      [38.5050, 68.2500],
      [38.5100, 68.2600],
      [38.5150, 68.2700],
      [38.5200, 68.2800],
    ],
    width: 3.2,
    depth: 1.7,
    waterFlow: 5.2,
    waterVolumeIn: 5.2,
    waterVolumeOut: 4.16,
    lossPerKm: 2.6,
    lossVolume: 1.04,
    filtrationCoefficient: 0.27,
    lossPercentage: 20,
    efficiency: 0.80,
    status: 'high-loss',
    recommendations: [
      'Распределительный канал в Турсунзаде',
      'Требуется ремонт и оптимизация',
    ],
  },
  // Каналы в Гиссарской долине (между Гисаром и Душанбе)
  {
    id: '19',
    name: 'Гиссарская долина - канал №1',
    length: 25,
    coordinates: [
      [38.4800, 68.4500],
      [38.4900, 68.4800],
      [38.5000, 68.5100],
      [38.5100, 68.5400],
      [38.5200, 68.5700],
      [38.5300, 68.6000],
    ],
    width: 3.8,
    depth: 2.0,
    waterFlow: 7.5,
    waterVolumeIn: 7.5,
    waterVolumeOut: 6.38,
    lossPerKm: 0.448,
    lossVolume: 1.12,
    filtrationCoefficient: 0.21,
    lossPercentage: 14.9,
    efficiency: 0.85,
    status: 'normal',
    recommendations: [
      'Канал в Гиссарской долине',
      'Состояние хорошее',
    ],
  },
  {
    id: '20',
    name: 'Гиссарская долина - канал №2',
    length: 19,
    coordinates: [
      [38.4700, 68.4600],
      [38.4750, 68.4800],
      [38.4800, 68.5000],
      [38.4850, 68.5200],
      [38.4900, 68.5400],
    ],
    width: 2.6,
    depth: 1.5,
    waterFlow: 3.8,
    waterVolumeIn: 3.8,
    waterVolumeOut: 2.85,
    lossPerKm: 5.0,
    lossVolume: 0.95,
    filtrationCoefficient: 0.32,
    lossPercentage: 25,
    efficiency: 0.75,
    status: 'critical',
    recommendations: [
      'Канал в Гиссарской долине - критическое состояние',
      'Требуется срочный капитальный ремонт',
      'Высокие потери воды требуют немедленного вмешательства',
    ],
  },
  // Каналы в районе Рудаки (к югу от Душанбе)
  {
    id: '21',
    name: 'Рудаки магистральный канал',
    length: 30,
    coordinates: [
      [38.4500, 68.7500], // Район Рудаки
      [38.4600, 68.7600],
      [38.4700, 68.7700],
      [38.4800, 68.7800],
      [38.4900, 68.7900],
      [38.5000, 68.8000],
    ],
    width: 4.2,
    depth: 2.1,
    waterFlow: 9.8,
    waterVolumeIn: 9.8,
    waterVolumeOut: 8.33,
    lossPerKm: 0.49,
    lossVolume: 1.47,
    filtrationCoefficient: 0.19,
    lossPercentage: 15,
    efficiency: 0.85,
    status: 'normal',
    recommendations: [
      'Магистральный канал района Рудаки',
      'Состояние удовлетворительное',
    ],
  },
  {
    id: '22',
    name: 'Рудаки оросительный канал',
    length: 16,
    coordinates: [
      [38.4400, 68.7400],
      [38.4450, 68.7500],
      [38.4500, 68.7600],
      [38.4550, 68.7700],
      [38.4600, 68.7800],
    ],
    width: 2.4,
    depth: 1.3,
    waterFlow: 2.5,
    waterVolumeIn: 2.5,
    waterVolumeOut: 2.0,
    lossPerKm: 3.125,
    lossVolume: 0.5,
    filtrationCoefficient: 0.26,
    lossPercentage: 20,
    efficiency: 0.80,
    status: 'high-loss',
    recommendations: [
      'Оросительный канал в районе Рудаки',
      'Требуется ремонт участков с протечками',
    ],
  },
];

export default function Landing() {
  const { t } = useTranslation();
  const [selectedChannel, setSelectedChannel] = useState<ChannelData | null>(null);
  const [tableChannels, setTableChannels] = useState<ChannelData[]>([]);
  const [editingChannel, setEditingChannel] = useState<ChannelData | null>(null);
  const [showAddToTablePrompt, setShowAddToTablePrompt] = useState(false);
  const problemItemsRaw = t('problem.items', { returnObjects: true });
  const solutionItemsRaw = t('solution.items', { returnObjects: true });
  const problemItems = Array.isArray(problemItemsRaw) ? (problemItemsRaw as string[]) : [];
  const solutionItems = Array.isArray(solutionItemsRaw) ? (solutionItemsRaw as string[]) : [];

  // Обработка выбора канала на карте
  const handleChannelSelect = (channel: ChannelData | null) => {
    setSelectedChannel(channel);
    
    // Проверяем, есть ли канал уже в таблице
    if (channel) {
      const existsInTable = tableChannels.some(c => c.id === channel.id);
      if (!existsInTable) {
        setShowAddToTablePrompt(true);
      }
    }
  };

  // Добавление канала в таблицу
  const handleAddToTable = () => {
    if (selectedChannel && !tableChannels.some(c => c.id === selectedChannel.id)) {
      setTableChannels(prev => [...prev, selectedChannel]);
      setShowAddToTablePrompt(false);
      message.success(t('map.addButton') + ' - ' + selectedChannel.name);
    }
  };

  // Редактирование канала
  const handleEditChannel = (channel: ChannelData) => {
    setEditingChannel(channel);
  };

  // Сохранение изменений канала
  const handleSaveChannel = (updatedChannel: ChannelData) => {
    setTableChannels(prev => 
      prev.map(c => c.id === updatedChannel.id ? updatedChannel : c)
    );
    setEditingChannel(null);
    
    // Обновляем выбранный канал, если он редактировался
    if (selectedChannel?.id === updatedChannel.id) {
      setSelectedChannel(updatedChannel);
    }
    
    message.success(t('form.save') + ' - ' + updatedChannel.name);
  };

  // Удаление канала из таблицы
  const handleRemoveChannel = (channelId: string) => {
    const channel = tableChannels.find(c => c.id === channelId);
    if (confirm('Вы уверены, что хотите удалить этот канал из таблицы?')) {
      setTableChannels(prev => prev.filter(c => c.id !== channelId));
      if (selectedChannel?.id === channelId) {
        setSelectedChannel(null);
      }
      if (channel) {
        message.success(t('table.remove') + ' - ' + channel.name);
      }
    }
  };

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="container">
          <div className="header-top">
            <LanguageSwitcher />
          </div>
          <h1 className="landing-title">
            {t('header.title')}
          </h1>
          <p className="landing-subtitle">
            {t('header.subtitle')}
          </p>
        </div>
      </header>

      <main className="landing-main">
        <div className="container">
          <section className="case-section">
            <h2>{t('case.title')}</h2>
            <p>{t('case.description')}</p>
          </section>

          <section className="problem-section">
            <h2>{t('problem.title')}</h2>
            <ul className="problem-list">
              {problemItems.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="solution-section">
            <h2>{t('solution.title')}</h2>
            <p>{t('solution.description')}</p>
            <ul className="solution-list">
              {solutionItems.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="map-section">
            <h2>{t('map.title')}</h2>
            <p className="section-description">
              {t('map.description')}
            </p>
            {showAddToTablePrompt && selectedChannel && (
              <div className="add-to-table-prompt">
                <p>{t('map.addToTable', { name: selectedChannel.name })}</p>
                <Space>
                  <Button type="primary" onClick={handleAddToTable}>
                    {t('map.addButton')}
                  </Button>
                  <Button onClick={() => setShowAddToTablePrompt(false)}>
                    {t('map.cancel')}
                  </Button>
                </Space>
              </div>
            )}
            <div className="map-wrapper">
              <Map 
                channels={mockChannels} 
                selectedChannel={selectedChannel}
                onChannelSelect={handleChannelSelect}
              />
            </div>
          </section>

          {selectedChannel && (
            <section className="info-section">
              <ChannelInfo channel={selectedChannel} />
              <div className="ai-section">
                <AIAnalysis channel={selectedChannel} />
              </div>
            </section>
          )}

          {tableChannels.length > 0 && (
            <section className="table-section">
              <ChannelsTable 
                channels={tableChannels}
                onEdit={handleEditChannel}
                onRemove={handleRemoveChannel}
              />
            </section>
          )}

          {tableChannels.length > 0 && (
            <section className="chart-section">
              <ChannelsChart channels={tableChannels} />
            </section>
          )}

          <section className="calculator-section">
            <WaterLossCalculator />
          </section>

          <section className="official-data-section">
            <OfficialData />
          </section>

          <section className="expected-result-section">
            <h2>{t('expectedResult.title')}</h2>
            <div className="result-grid">
              <div className="result-card">
                <h3>{t('expectedResult.items.prototype.title')}</h3>
                <p>{t('expectedResult.items.prototype.description')}</p>
              </div>
              <div className="result-card">
                <h3>{t('expectedResult.items.calculation.title')}</h3>
                <p>{t('expectedResult.items.calculation.description')}</p>
              </div>
              <div className="result-card">
                <h3>{t('expectedResult.items.map.title')}</h3>
                <p>{t('expectedResult.items.map.description')}</p>
              </div>
              <div className="result-card">
                <h3>{t('expectedResult.items.recommendations.title')}</h3>
                <p>{t('expectedResult.items.recommendations.description')}</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="landing-footer">
        <div className="container">
          <p>{t('footer.copyright')}</p>
        </div>
      </footer>

      {editingChannel && (
        <ChannelForm
          channel={editingChannel}
          onSave={handleSaveChannel}
          onCancel={() => setEditingChannel(null)}
        />
      )}
    </div>
  );
}


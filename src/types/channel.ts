export interface ChannelData {
  id: string;
  name: string;
  coordinates: [number, number][]; // массив координат для линии канала
  length: number; // длина канала в километрах
  width: number; // ширина в метрах
  depth: number; // глубина в метрах
  waterFlow: number; // расход воды в канале (м³/с)
  waterVolumeIn: number; // объем воды на входе (м³/с)
  waterVolumeOut: number; // объем воды на выходе (м³/с)
  lossPerKm: number; // потери воды в % на 1 км
  lossVolume: number; // потери воды в м³/с
  filtrationCoefficient: number; // коэффициент фильтрации
  lossPercentage: number; // процент потерь
  efficiency: number; // КПД (коэффициент полезного действия)
  status: 'normal' | 'high-loss' | 'critical'; // статус участка
  recommendations?: string[]; // рекомендации по ремонту
}

export interface ChannelSection {
  id: string;
  channelId: string;
  startPoint: [number, number];
  endPoint: [number, number];
  measurements: {
    width: number;
    depth: number;
    waterFlow: number;
    filtrationCoefficient: number;
  };
}


import type { Channel } from '../stores/channelsStore';

/**
 * Коэффициенты для улучшенного расчета потерь
 */

// Коэффициенты состояния канала
const CONDITION_COEFFICIENTS = {
  excellent: 0.9,
  good: 1.0,
  satisfactory: 1.2,
  poor: 1.4,
  critical: 1.6,
};

// Коэффициенты растительности
const VEGETATION_COEFFICIENTS = {
  none: 1.0,
  minimal: 1.03,
  moderate: 1.08,
  high: 1.12,
  critical: 1.15,
};

// Коэффициенты грунтовых вод
const getGroundwaterCoefficient = (depth: number | undefined): number => {
  if (!depth) return 1.0;
  if (depth < 2) return 0.8; // Высокий уровень - меньше фильтрации
  if (depth < 5) return 1.0; // Средний уровень
  return 1.2; // Низкий уровень - больше фильтрации
};

// Коэффициенты типа почвы
const SOIL_TYPE_COEFFICIENTS = {
  sandy: 1.5, // Высокая фильтрация
  loam: 1.0, // Средняя
  clay: 0.7, // Низкая
  mixed: 1.0,
};

// Сезонные коэффициенты (для Таджикистана)
const SEASON_COEFFICIENTS = {
  spring: 1.1, // Апрель-Май: таяние снега
  summer: 1.2, // Июнь-Август: максимальное испарение
  autumn: 1.0, // Сентябрь-Октябрь: норма
  winter: 0.8, // Ноябрь-Март: минимальные потери
};

// Коэффициенты покрытия канала (влияют на фильтрацию)
const COVERAGE_COEFFICIENTS = {
  earth: 1.5, // Земляное - высокая фильтрация
  clay: 1.2, // Глиняное - средняя-высокая фильтрация
  stone: 1.1, // Каменное/бутовое - средняя фильтрация
  brick: 1.0, // Кирпичное - средняя фильтрация
  mixed: 1.3, // Смешанное - средняя-высокая
  asphalt: 0.9, // Асфальтобетонное - низкая фильтрация
  concrete: 0.7, // Бетонное - очень низкая фильтрация
  plastic: 0.6, // Пластиковое - очень низкая фильтрация
  polyethylene: 0.5, // Полиэтиленовое/пленочное - минимальная фильтрация
  geomembrane: 0.4, // Геомембрана - минимальная фильтрация
  composite: 0.6, // Композитное - очень низкая фильтрация
  rubber: 0.5, // Резиновое - минимальная фильтрация
};

/**
 * Базовая формула потерь (текущая)
 * S = 10 × A × L × √(Qвх / 1000)
 */
export function calculateBaseLoss(
  waterVolumeIn: number,
  length: number,
  filtrationCoefficient: number = 2.08
): number {
  if (!waterVolumeIn || !length || waterVolumeIn <= 0 || length <= 0) return 0;
  const qxSqrt = Math.sqrt(waterVolumeIn / 1000);
  return 10 * filtrationCoefficient * length * qxSqrt;
}

/**
 * Улучшенный расчет потерь с учетом всех факторов
 */
export function calculateEnhancedLoss(channel: Partial<Channel>): {
  baseLoss: number;
  enhancedLoss: number;
  lossPercentage: number;
  lossPerKm: number;
  efficiency: number;
    factors: {
      condition: number;
      vegetation: number;
      groundwater: number;
      season: number;
      soilType: number;
      coverage: number;
    };
} {
  const {
    waterVolumeIn = 0,
    waterVolumeOut = 0,
    length = 0,
    filtrationCoefficient = 2.08,
    coverage = 'earth',
    condition = 'satisfactory',
    vegetation = 'moderate',
    groundwaterDepth,
    season,
    soilType = 'loam',
  } = channel;

  // Базовая потеря (фильтрация)
  const baseLoss = calculateBaseLoss(waterVolumeIn, length, filtrationCoefficient);

  // Коэффициенты
  const conditionCoeff = CONDITION_COEFFICIENTS[condition] || 1.0;
  const vegetationCoeff = VEGETATION_COEFFICIENTS[vegetation] || 1.0;
  const groundwaterCoeff = getGroundwaterCoefficient(groundwaterDepth);
  const seasonCoeff = season ? SEASON_COEFFICIENTS[season] || 1.0 : 1.0;
  const soilCoeff = SOIL_TYPE_COEFFICIENTS[soilType] || 1.0;
  const coverageCoeff = COVERAGE_COEFFICIENTS[coverage] || 1.0;

  // Улучшенная потеря с учетом всех факторов
  const enhancedLoss = baseLoss * conditionCoeff * vegetationCoeff * groundwaterCoeff * seasonCoeff * soilCoeff * coverageCoeff;

  // Процент потерь
  const lossPercentage = waterVolumeIn > 0 ? (enhancedLoss / waterVolumeIn) * 100 : 0;
  const lossPerKm = length > 0 ? lossPercentage / length : 0;
  const efficiency = waterVolumeIn > 0 ? (waterVolumeOut / waterVolumeIn) * 100 : 100;

  return {
    baseLoss,
    enhancedLoss,
    lossPercentage,
    lossPerKm,
    efficiency,
    factors: {
      condition: conditionCoeff,
      vegetation: vegetationCoeff,
      groundwater: groundwaterCoeff,
      season: seasonCoeff,
      soilType: soilCoeff,
      coverage: coverageCoeff,
    },
  };
}

/**
 * Определение статуса канала с учетом потерь и состояния
 */
export function determineChannelStatus(
  lossPercentage: number,
  condition?: Channel['condition']
): 'normal' | 'high-loss' | 'critical' {
  // Критический статус: высокие потери ИЛИ плохое состояние
  if (lossPercentage > 30 || condition === 'critical' || condition === 'poor') {
    return 'critical';
  }
  
  // Высокие потери: средние потери ИЛИ удовлетворительное состояние
  if (lossPercentage > 15 || condition === 'satisfactory') {
    return 'high-loss';
  }
  
  return 'normal';
}

/**
 * Получение сезона по дате
 */
export function getSeasonFromDate(date: string | Date): 'spring' | 'summer' | 'autumn' | 'winter' {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = d.getMonth() + 1; // 1-12
  
  if (month >= 3 && month <= 5) return 'spring'; // Март-Май
  if (month >= 6 && month <= 8) return 'summer'; // Июнь-Август
  if (month >= 9 && month <= 11) return 'autumn'; // Сентябрь-Ноябрь
  return 'winter'; // Декабрь-Февраль
}


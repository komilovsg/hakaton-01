/**
 * Ҷадвали 16. Масрафи каналҳои байни хоҷагҳо дар ПК 0 - и, АИО-ҳо ва магистралии ноҳияи Рудакӣ
 * Table 16. Consumption of inter-farm canals at PK 0 - and, AIOs and main canals of Rudaki district
 */

export type MonthKey = 'apr' | 'may' | 'jun' | 'jul' | 'aug' | 'sep' | 'oct';

/**
 * Полное название таблицы 16
 */
export const table16Title = 'Ҷадвали 16. Масрафи каналҳои байни хоҷагҳо дар ПК 0 - и, АИО-ҳо ва магистралии ноҳияи Рудакӣ';

/**
 * Заголовок первой таблицы (Апрель-Июнь)
 * Колонка: "Номгуи каналҳои Гуруҳи истифода барандагони об"
 */
export const table16Part1ColumnHeader = 'Номгуи каналҳои Гуруҳи истифода барандагони об';

/**
 * Заголовок второй таблицы (Июль-Октябрь)
 * Колонка: "Номгуи каналҳои АИО"
 */
export const table16Part2ColumnHeader = 'Номгуи каналҳои АИО';

/**
 * Заголовок продолжения таблицы
 */
export const table16ContinuationTitle = 'Давоми ҷадвали 16.';

export interface Table16Row {
  /** № т/р - порядковый номер */
  number: number;
  /** Название канала (одинаковое для обеих таблиц) */
  name: string;
  /** Майдони кишт, га - площадь в гектарах */
  area: number;
  /** Ω - коэффициент (только для первой таблицы) */
  omega?: number;
  /** Данные по декадам для каждого месяца */
  decades: {
    apr: [number, number, number];
    may: [number, number, number];
    jun: [number, number, number];
    jul: [number, number, number];
    aug: [number, number, number];
    sep: [number, number, number];
    oct: [number, number, number | null];
  };
}

/**
 * Данные первой части таблицы 16 (Апрель, Май, Июнь)
 * С заголовком колонки: "Номгуи каналҳои Гуруҳи истифода барандагони об"
 */
export interface Table16Part1Row extends Table16Row {
  /** Ω - коэффициент для первой таблицы */
  omega: number;
}

/**
 * Данные второй части таблицы 16 (Июль, Август, Сентябрь, Октябрь)
 * С заголовком колонки: "Номгуи каналҳои АИО"
 */
export interface Table16Part2Row extends Table16Row {
  omega?: never;
}

/**
 * Данные первой части таблицы 16 (Апрель, Май, Июнь)
 * Заголовок колонки: "Номгуи каналҳои Гуруҳи истифода барандагони об"
 * Включает колонку Ω (Omega)
 */
export const table16Part1Data: Table16Part1Row[] = [
  {
    number: 1,
    name: 'Канали байни хоҷагӣ 1-МК дар ПК91+50',
    area: 18155,
    omega: 1061.3,
    decades: {
      apr: [1061.3, 2028.5, 4788.9],
      may: [7823.8, 14670.0, 16878.8],
      jun: [17699.6, 20047.0, 9583.1],
      jul: [9737.3, 9170.0, 9002.7],
      aug: [7251.3, 6425.3, 5097.4],
      sep: [5215.0, 4723.6, 3931.5],
      oct: [3586.5, 2316.0, null],
    },
  },
  {
    number: 2,
    name: '1-1К, АИО - 1',
    area: 1663,
    omega: 97.2,
    decades: {
      apr: [97.2, 185.8, 438.7],
      may: [716.7, 1343.8, 1546.1],
      jun: [1621.3, 1836.3, 877.8],
      jul: [891.9, 840.0, 824.7],
      aug: [664.2, 588.6, 466.9],
      sep: [477.7, 432.7, 360.1],
      oct: [328.5, 212.1, null],
    },
  },
  {
    number: 3,
    name: '1-2К, АИО - 2',
    area: 2650,
    omega: 154.9,
    decades: {
      apr: [154.9, 296.1, 699.0],
      may: [1142.0, 2141.3, 2463.7],
      jun: [2583.5, 2926.2, 1398.8],
      jul: [1421.3, 1338.5, 1314.1],
      aug: [1058.4, 937.9, 744.0],
      sep: [761.2, 689.5, 573.9],
      oct: [523.5, 338.1, null],
    },
  },
  {
    number: 4,
    name: '1-3К, АИО - 3',
    area: 985,
    omega: 57.6,
    decades: {
      apr: [57.6, 110.1, 259.8],
      may: [424.5, 795.9, 915.8],
      jun: [960.3, 1087.7, 519.9],
      jul: [528.3, 497.5, 488.4],
      aug: [393.4, 348.6, 276.6],
      sep: [282.9, 256.3, 213.3],
      oct: [194.6, 125.7, null],
    },
  },
  {
    number: 5,
    name: '1-4К, АИО - 4',
    area: 694,
    omega: 40.6,
    decades: {
      apr: [40.6, 77.5, 183.1],
      may: [299.1, 560.8, 645.2],
      jun: [676.6, 766.3, 366.3],
      jul: [372.2, 350.5, 344.1],
      aug: [277.2, 245.6, 194.9],
      sep: [199.4, 180.6, 150.3],
      oct: [137.1, 88.5, null],
    },
  },
];

/**
 * Данные второй части таблицы 16 (Июль, Август, Сентябрь, Октябрь)
 * Заголовок колонки: "Номгуи каналҳои АИО"
 * Без колонки Ω (Omega)
 */
export const table16Part2Data: Table16Part2Row[] = [
  {
    number: 1,
    name: 'Канали байни хоҷагӣ 1-МК дар ПК91+50',
    area: 18155,
    decades: {
      apr: [1061.3, 2028.5, 4788.9],
      may: [7823.8, 14670.0, 16878.8],
      jun: [17699.6, 20047.0, 9583.1],
      jul: [9737.3, 9170.0, 9002.7],
      aug: [7251.3, 6425.3, 5097.4],
      sep: [5215.0, 4723.6, 3931.5],
      oct: [3586.5, 2316.0, null],
    },
  },
  {
    number: 2,
    name: '1-1К, АИО - 1',
    area: 1663,
    decades: {
      apr: [97.2, 185.8, 438.7],
      may: [716.7, 1343.8, 1546.1],
      jun: [1621.3, 1836.3, 877.8],
      jul: [891.9, 840.0, 824.7],
      aug: [664.2, 588.6, 466.9],
      sep: [477.7, 432.7, 360.1],
      oct: [328.5, 212.1, null],
    },
  },
  {
    number: 3,
    name: '1-2К, АИО - 2',
    area: 2650,
    decades: {
      apr: [154.9, 296.1, 699.0],
      may: [1142.0, 2141.3, 2463.7],
      jun: [2583.5, 2926.2, 1398.8],
      jul: [1421.3, 1338.5, 1314.1],
      aug: [1058.4, 937.9, 744.0],
      sep: [761.2, 689.5, 573.9],
      oct: [523.5, 338.1, null],
    },
  },
  {
    number: 4,
    name: '1-3К, АИО - 3',
    area: 985,
    decades: {
      apr: [57.6, 110.1, 259.8],
      may: [424.5, 795.9, 915.8],
      jun: [960.3, 1087.7, 519.9],
      jul: [528.3, 497.5, 488.4],
      aug: [393.4, 348.6, 276.6],
      sep: [282.9, 256.3, 213.3],
      oct: [194.6, 125.7, null],
    },
  },
  {
    number: 5,
    name: '1-4К, АИО - 4',
    area: 694,
    decades: {
      apr: [40.6, 77.5, 183.1],
      may: [299.1, 560.8, 645.2],
      jun: [676.6, 766.3, 366.3],
      jul: [372.2, 350.5, 344.1],
      aug: [277.2, 245.6, 194.9],
      sep: [199.4, 180.6, 150.3],
      oct: [137.1, 88.5, null],
    },
  },
];

/**
 * Объединенные данные таблицы 16 (для обратной совместимости)
 * @deprecated Используйте table16Part1Data и table16Part2Data для раздельного доступа к частям таблицы
 */
export const table16Data: Table16Row[] = table16Part1Data;

/**
 * Названия месяцев на таджикском языке
 */
export const monthNames: Record<MonthKey, string> = {
  apr: 'Апрел',
  may: 'Май',
  jun: 'Июн',
  jul: 'Июл',
  aug: 'Август',
  sep: 'Сентябр',
  oct: 'Октябр',
};

/**
 * Порядок месяцев для отображения
 */
export const monthsOrder: MonthKey[] = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct'];

/**
 * Месяцы первой части таблицы 16 (Апрель, Май, Июнь)
 */
export const table16Part1Months: MonthKey[] = ['apr', 'may', 'jun'];

/**
 * Месяцы второй части таблицы 16 (Июль, Август, Сентябрь, Октябрь)
 */
export const table16Part2Months: MonthKey[] = ['jul', 'aug', 'sep', 'oct'];

/**
 * Количество дней в каждом месяце
 */
export const monthDays: Record<MonthKey, number> = {
  apr: 30,
  may: 31,
  jun: 30,
  jul: 31,
  aug: 31,
  sep: 30,
  oct: 31,
};

// Таблица 3: Значения A и m в формуле САНИИРИ
export interface Table3Row {
  parameter: 'A' | 'm';
  weak: string; // Суст
  medium: string; // Миёна
  strong: string; // Зиёд
}

export const table3Data: Table3Row[] = [
  {
    parameter: 'A',
    weak: '1,0-1,30',
    medium: '1,87-2,30',
    strong: '2,80-3,50',
  },
  {
    parameter: 'm',
    weak: '0,50',
    medium: '0,50',
    strong: '0,50',
  },
];

// Среднее значение A для расчетов
export const averageA = 2.08;

/**
 * Интерфейсы для результатов расчета таблицы 14
 */
export interface CalculationResult {
  Qvx: number | null; // Входящий расход (л/с)
  S: number | null;   // Потери (л/с)
  Qfx: number | null; // Исходящий расход (л/с)
}

export interface CalculatedTableResults {
  [decadeKey: string]: { // Например: 'aug_i', 'sep_ii', 'oct_i'
    row1: CalculationResult;
    row2: CalculationResult;
    row3: CalculationResult;
    row4: CalculationResult;
    row5_Qg: number | null; // Общий расход Qг (л/с)
    row6_Wg: number | null; // Объем Wг (млн. м³)
    row7_Wtotal: number | null; // Общий объем W (млн. м³)
  };
}

/**
 * Функция расчета потерь S = 10 × A × L × sqrt(Qвх / 1000)
 */
export function calculateLoss(Qvx: number, L: number, A: number = averageA): number {
  if (!Qvx || !L || Qvx <= 0 || L <= 0) return 0;
  const qxSqrt = Math.sqrt(Qvx / 1000);
  return 10 * A * L * qxSqrt;
}

/**
 * Основная функция расчета таблицы расхода воды
 * @param inputDataPart1 - данные из table16Part1Data (Апрель-Июнь)
 * @param inputDataPart2 - данные из table16Part2Data (Июль-Октябрь)
 * @returns объект с рассчитанными данными для всех декад
 */
export function calculateHydrologyTable(
  inputDataPart1: Table16Part1Row[],
  inputDataPart2: Table16Part2Row[]
): CalculatedTableResults {
  const results: CalculatedTableResults = {};
  
  // Константы
  const A = averageA;
  const tDays = 10; // Дней в декаде
  const Wvn = 0; // Объем возвратных вод
  
  // Длины каналов для каждой строки (в км)
  const lengths = {
    row1: 3.030,
    row2: 6.020,
    row3: 6.030,
    row4: 0.744,
  };
  
  // Получаем данные из таблицы 16 (Part1 для Апрель-Июнь, Part2 для Июль-Октябрь)
  // НОВЫЙ ИСТОЧНИК ДАННЫХ ДЛЯ Q(1-МК)
  const row1_MK_part1 = inputDataPart1.find(row => row.number === 1); // Канали байни хочагӣ 1-МК дар ПК91+50
  const row1_MK_part2 = inputDataPart2.find(row => row.number === 1); // Канали байни хочагӣ 1-МК дар ПК91+50
  
  const row1_4K_part1 = inputDataPart1.find(row => row.number === 5); // 1-4К, АИО - 4
  const row1_2K_part1 = inputDataPart1.find(row => row.number === 3); // 1-2К, АИО - 2
  const row1_3K_part1 = inputDataPart1.find(row => row.number === 4); // 1-3К, АИО - 3
  
  const row1_4K_part2 = inputDataPart2.find(row => row.number === 5); // 1-4К, АИО - 4
  const row1_2K_part2 = inputDataPart2.find(row => row.number === 3); // 1-2К, АИО - 2
  const row1_3K_part2 = inputDataPart2.find(row => row.number === 4); // 1-3К, АИО - 3
  
  if (!row1_MK_part1 || !row1_MK_part2 ||
      !row1_4K_part1 || !row1_2K_part1 || !row1_3K_part1 || 
      !row1_4K_part2 || !row1_2K_part2 || !row1_3K_part2) {
    return results;
  }
  
  // Месяцы для расчета: Апрель, Май, Июнь, Июль, Август, Сентябрь, Октябрь
  const monthsToProcess: Array<'apr' | 'may' | 'jun' | 'jul' | 'aug' | 'sep' | 'oct'> = 
    ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct'];
  
  // Обрабатываем каждую декаду
  monthsToProcess.forEach((month) => {
    // Для каждого месяца проверяем доступные декады
    const maxDecades = month === 'oct' ? 2 : 3; // Октябрь имеет только 2 декады
    
    // Определяем, из какой части таблицы брать данные
    const isPart1 = month === 'apr' || month === 'may' || month === 'jun';
    const row1_MK = isPart1 ? row1_MK_part1 : row1_MK_part2;
    const row1_4K = isPart1 ? row1_4K_part1 : row1_4K_part2;
    const row1_2K = isPart1 ? row1_2K_part1 : row1_2K_part2;
    const row1_3K = isPart1 ? row1_3K_part1 : row1_3K_part2;
    
    for (let decadeIdx = 0; decadeIdx < maxDecades; decadeIdx++) {
      const decadeKey = `${month}_${decadeIdx === 0 ? 'i' : decadeIdx === 1 ? 'ii' : 'iii'}`;
      
      // Получаем значения Q из таблицы 16 для текущей декады
      const Q_1_MK = row1_MK.decades[month][decadeIdx];
      const Q_1_4K = row1_4K.decades[month][decadeIdx];
      const Q_1_2K = row1_2K.decades[month][decadeIdx];
      const Q_1_3K = row1_3K.decades[month][decadeIdx];
      
      // Пропускаем только если все значения null
      if (Q_1_MK === null && Q_1_4K === null && Q_1_2K === null && Q_1_3K === null) {
        continue; // Пропускаем если данных нет
      }
      
      // Для строки 1 обязательно нужны Q_1_MK и Q_1_4K
      if (Q_1_MK === null || Q_1_4K === null) {
        continue; // Не можем рассчитать строку 1 без Q_1_MK и Q_1_4K
      }
      
      // Для строк 2-4 нужны Q_1_2K и Q_1_3K
      // Для Июля строки 2-7 остаются пустыми (по спецификации)
      // Для остальных месяцев проверяем наличие данных
      if (month === 'jul') {
        // Для Июля рассчитываем только строку 1, остальные строки остаются пустыми
        // Строка 1: Qвх = Q(1-МК) + Q(1-4К)
        const row1_Qvx = Q_1_MK + Q_1_4K;
        const row1_S = calculateLoss(row1_Qvx, lengths.row1, A);
        const row1_Qfx = row1_Qvx + row1_S;
        
        results[decadeKey] = {
          row1: {
            Qvx: row1_Qvx,
            S: row1_S,
            Qfx: row1_Qfx,
          },
          // Для строк 2-7 в Июле значения null (пустые ячейки)
          row2: { Qvx: null, S: null, Qfx: null },
          row3: { Qvx: null, S: null, Qfx: null },
          row4: { Qvx: null, S: null, Qfx: null },
          row5_Qg: null,
          row6_Wg: null,
          row7_Wtotal: null,
        };
        continue;
      }
      
      // Для остальных месяцев проверяем наличие данных для строк 2-4
      if (Q_1_2K === null || Q_1_3K === null) {
        continue; // Пропускаем если нет данных для строк 2-4
      }
      
      // Строка 1: Qвх = Q(1-МК) + Q(1-4К)
      const row1_Qvx = Q_1_MK + Q_1_4K;
      const row1_S = calculateLoss(row1_Qvx, lengths.row1, A);
      const row1_Qfx = row1_Qvx + row1_S;
      
      // Строка 2: Qх = Qfx строки 1 + Q(1-2К) + Q(1-3К)
      const Q_1_2K_value = Q_1_2K !== null ? Q_1_2K : 0;
      const Q_1_3K_value = Q_1_3K !== null ? Q_1_3K : 0;
      const row2_Qvx = row1_Qfx + Q_1_2K_value + Q_1_3K_value;
      const row2_S = calculateLoss(row2_Qvx, lengths.row2, A);
      const row2_Qfx = row2_Qvx + row2_S;
      
      // Строка 3: Qх = Qfx 1-2K
      // Qfx 1-2K нужно рассчитать из Q(1-2К)
      // Но у нас нет длины для 1-2К отдельно, используем Q(1-2К) напрямую
      // По ТЗ: Qвх, 3 = Qfx строки 2 + Q(1-3К)
      const row3_Qvx = row2_Qfx + (Q_1_3K !== null ? Q_1_3K : 0);
      const row3_S = calculateLoss(row3_Qvx, lengths.row3, A);
      const row3_Qfx = row3_Qvx + row3_S;
      
      // Строка 4: Qх = Qfx 1-1MK1 + Qfx 1-1K
      // По ТЗ: Qвх, 4 = Qfx строки 3
      const row4_Qvx = row3_Qfx;
      const row4_S = calculateLoss(row4_Qvx, lengths.row4, A);
      const row4_Qfx = row4_Qvx + row4_S;
      
      // Строка 5: Qг = Qfx строки 4
      const row5_Qg = row4_Qfx;
      
      // Строка 6: Wг = 86.4 × 10 × Qг / 10^6
      const row6_Wg = (86.4 * tDays * row5_Qg) / 1000000;
      
      // Строка 7: Wобщ = Wг + Wвн
      const row7_Wtotal = row6_Wg + Wvn;
      
      // Сохраняем результаты
      results[decadeKey] = {
        row1: {
          Qvx: row1_Qvx,
          S: row1_S,
          Qfx: row1_Qfx,
        },
        row2: {
          Qvx: row2_Qvx,
          S: row2_S,
          Qfx: row2_Qfx,
        },
        row3: {
          Qvx: row3_Qvx,
          S: row3_S,
          Qfx: row3_Qfx,
        },
        row4: {
          Qvx: row4_Qvx,
          S: row4_S,
          Qfx: row4_Qfx,
        },
        row5_Qg: row5_Qg,
        row6_Wg: row6_Wg,
        row7_Wtotal: row7_Wtotal,
      };
    }
  });
  
  return results;
}


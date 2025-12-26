import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Spin, Alert, message } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  table16Part1Data,
  table16Part2Data,
  averageA,
  calculateHydrologyTable,
  type Table16Part1Row,
  type Table16Part2Row,
} from '../../components/official-data/data';
import { analyzeTable14, type DeepSeekAnalysis } from '../../services/deepseekApi';
import './Calculations.scss';

export default function Calculations() {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  
  // Определяем, мобильное ли устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Состояния для показа графика
  const [showTable14Chart, setShowTable14Chart] = useState(false);

  // Состояния для ИИ-анализа таблицы 14
  const [table14Analysis, setTable14Analysis] = useState<DeepSeekAnalysis | null>(null);
  const [analyzingTable14, setAnalyzingTable14] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Функция для расчета S = 10 × A × L × sqrt(Qх / 1000)
  const calculateS = (qx: number, length: number): number => {
    if (!qx || !length) return 0;
    const qxSqrt = Math.sqrt(qx / 1000);
    return 10 * averageA * length * qxSqrt;
  };

  // Рассчитываем данные для таблицы 14
  const calculatedTableData = useMemo(() => {
    return calculateHydrologyTable(table16Part1Data, table16Part2Data);
  }, []);

  // Функция для анализа таблицы 14
  const handleAnalyzeTable14 = async () => {
    setAnalyzingTable14(true);
    setAnalysisError(null);
    setTable14Analysis(null);
    
    const hide = message.loading(t('ai.analyzingText') || 'Анализ данных...', 0);

    try {
      // Подготовка данных для анализа
      const months = ['aug', 'sep', 'oct'] as const;
      const analysisData = {
        row1: [] as Array<{ Qvx: number; S: number; Qfx: number }>,
        row2: [] as Array<{ Qvx: number; S: number; Qfx: number }>,
        row3: [] as Array<{ Qvx: number; S: number; Qfx: number }>,
        row4: [] as Array<{ Qvx: number; S: number; Qfx: number }>,
        row5_Qg: [] as number[],
        row6_Wg: [] as number[],
        row7_Wtotal: [] as number[],
      };

      months.forEach((month) => {
        const maxDecades = month === 'oct' ? 1 : 2;
        for (let idx = 0; idx <= maxDecades; idx++) {
          const decadeKey = `${month}_${idx === 0 ? 'i' : idx === 1 ? 'ii' : 'iii'}`;
          const data = calculatedTableData[decadeKey];
          if (data) {
            // Фильтруем null значения - для анализа нужны только валидные данные
            if (data.row1.Qvx !== null && data.row1.S !== null && data.row1.Qfx !== null) {
              analysisData.row1.push({
                Qvx: data.row1.Qvx,
                S: data.row1.S,
                Qfx: data.row1.Qfx,
              });
            }
            if (data.row2.Qvx !== null && data.row2.S !== null && data.row2.Qfx !== null) {
              analysisData.row2.push({
                Qvx: data.row2.Qvx,
                S: data.row2.S,
                Qfx: data.row2.Qfx,
              });
            }
            if (data.row3.Qvx !== null && data.row3.S !== null && data.row3.Qfx !== null) {
              analysisData.row3.push({
                Qvx: data.row3.Qvx,
                S: data.row3.S,
                Qfx: data.row3.Qfx,
              });
            }
            if (data.row4.Qvx !== null && data.row4.S !== null && data.row4.Qfx !== null) {
              analysisData.row4.push({
                Qvx: data.row4.Qvx,
                S: data.row4.S,
                Qfx: data.row4.Qfx,
              });
            }
            if (data.row5_Qg !== null) {
              analysisData.row5_Qg.push(data.row5_Qg);
            }
            if (data.row6_Wg !== null) {
              analysisData.row6_Wg.push(data.row6_Wg);
            }
            if (data.row7_Wtotal !== null) {
              analysisData.row7_Wtotal.push(data.row7_Wtotal);
            }
          }
        }
      });

      const result = await analyzeTable14(analysisData);
      setTable14Analysis(result);
      hide();
      message.success(t('ai.analyze') || 'Анализ завершен успешно');
    } catch (error) {
      console.error('Ошибка при анализе таблицы 14:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Произошла ошибка при анализе');
      hide();
      message.error(t('ai.analysisError') || 'Ошибка при анализе данных');
    } finally {
      setAnalyzingTable14(false);
    }
  };

  return (
    <div className="calculations-page">
      <h1 className="page-title">{t('calculations.title', 'Расчеты')}</h1>
      
      <div className="table14-section">
        <div className="table-wrapper-header">
          <h3>{t('calculations.table14Title', 'Давоми ҷадвали 14.')}</h3>
          <div className="table-actions">
            <Button 
              type="primary" 
              onClick={() => setShowTable14Chart(!showTable14Chart)}
              className="chart-button"
            >
              {showTable14Chart ? t('calculations.hideChart', 'Скрыть график') : t('calculations.showChart', 'График')}
            </Button>
            <Button 
              type="default"
              onClick={handleAnalyzeTable14}
              loading={analyzingTable14}
              className="ai-analysis-button"
            >
              🤖 {t('calculations.aiAnalysis', 'ИИ Анализ')}
            </Button>
          </div>
        </div>
        <p>{t('calculations.table14Description', 'Расчет потерь воды в каналах по формулам')}</p>
        
        <div className="table14-wrapper">
          <table className="table14">
            <thead>
              <tr>
                <th rowSpan={2}>№ т/р</th>
                <th rowSpan={2}>{t('calculations.channelName', 'Номгӯи каналҳо, қитъаҳо ва пикетҳо')}</th>
                <th rowSpan={2}>{t('calculations.channelLength', 'Дарозии қитъаи канал, км')}</th>
                <th rowSpan={2}>{t('calculations.formulas', 'Формулаҳо барои ҳисобарорӣ ва воҳиди ченак')}</th>
                <th colSpan={3}>{t('calculations.april', 'Апрел')}</th>
                <th colSpan={3}>{t('calculations.may', 'Май')}</th>
                <th colSpan={3}>{t('calculations.june', 'Июн')}</th>
                <th colSpan={3}>{t('calculations.july', 'Июл')}</th>
                <th colSpan={3}>{t('calculations.august', 'Август')}</th>
                <th colSpan={3}>{t('calculations.september', 'Сентиябр')}</th>
                <th colSpan={2}>{t('calculations.october', 'Октябр')}</th>
              </tr>
              <tr>
                <th>I</th>
                <th>II</th>
                <th>III</th>
                <th>I</th>
                <th>II</th>
                <th>III</th>
                <th>I</th>
                <th>II</th>
                <th>III</th>
                <th>I</th>
                <th>II</th>
                <th>III</th>
                <th>I</th>
                <th>II</th>
                <th>III</th>
                <th>I</th>
                <th>II</th>
                <th>III</th>
                <th>I</th>
                <th>II</th>
              </tr>
            </thead>
            <tbody>
              {/* Первая строка - автоматически заполняется из таблицы 16, разбита на 3 строки по формулам */}
              {(() => {
                // Берем данные из таблицы 16 для строки 1
                // Нужны данные из строки "1-МК" (number === 1) и "1-4К, АИО - 4" (number === 5)
                // Для Апрель-Июнь используем Part1, для Июль-Октябрь - Part2
                const row1_MK_part1 = table16Part1Data.find(row => row.number === 1);
                const row1_MK_part2 = table16Part2Data.find(row => row.number === 1);
                const row1_4K_part1 = table16Part1Data.find(row => row.number === 5);
                const row1_4K_part2 = table16Part2Data.find(row => row.number === 5);
                if (!row1_MK_part1 || !row1_MK_part2 || !row1_4K_part1 || !row1_4K_part2) return null;
                
                // Месяцы для отображения
                const displayMonths: Array<{ key: 'apr' | 'may' | 'jun' | 'jul' | 'aug' | 'sep' | 'oct'; label: string; row1_MK: Table16Part1Row | Table16Part2Row; row1_4K: Table16Part1Row | Table16Part2Row }> = [
                  { key: 'apr', label: 'Апрел', row1_MK: row1_MK_part1, row1_4K: row1_4K_part1 },
                  { key: 'may', label: 'Май', row1_MK: row1_MK_part1, row1_4K: row1_4K_part1 },
                  { key: 'jun', label: 'Июн', row1_MK: row1_MK_part1, row1_4K: row1_4K_part1 },
                  { key: 'jul', label: 'Июл', row1_MK: row1_MK_part2, row1_4K: row1_4K_part2 },
                  { key: 'aug', label: 'Август', row1_MK: row1_MK_part2, row1_4K: row1_4K_part2 },
                  { key: 'sep', label: 'Сентиябр', row1_MK: row1_MK_part2, row1_4K: row1_4K_part2 },
                  { key: 'oct', label: 'Октябр', row1_MK: row1_MK_part2, row1_4K: row1_4K_part2 },
                ];
                
                const formulas = [
                  <>Q<sub>х</sub> = Q(1-МК) + Q(1-4К)</>,
                  <>S = 10 × A × L × Q<sub>х</sub><sup>0.5</sup>, л/с</>,
                  <>Q<sub>fx</sub> = Q<sub>х</sub> + S</>,
                ];
                
                // Для первой формулы берем сумму Q(1-МК) + Q(1-4К) из таблицы 16
                // ВАЖНО: сохраняем порядок и структуру для правильного отображения в колонках
                const firstFormulaValues: (number | null)[] = [];
                displayMonths.forEach(({ key, row1_MK, row1_4K }) => {
                  const values_MK = row1_MK.decades[key];
                  const values_4K = row1_4K.decades[key];
                  const maxDecades = key === 'oct' ? 2 : 3;
                  for (let idx = 0; idx < maxDecades; idx++) {
                    const value_MK = values_MK[idx];
                    const value_4K = values_4K[idx];
                    if (value_MK !== null && value_MK !== undefined && value_4K !== null && value_4K !== undefined) {
                      firstFormulaValues.push(value_MK + value_4K);
                    } else {
                      firstFormulaValues.push(null);
                    }
                  }
                });
                

                // Длина канала для первой строки
                const row1Length = 3.030; // км

                // Рассчитываем S для второй формулы
                const secondFormulaValues = firstFormulaValues.map((qx) => {
                  if (qx === null || qx === undefined || isNaN(qx) || qx <= 0) return null;
                  return calculateS(qx, row1Length);
                });

                // Рассчитываем Qfx для третьей формулы: Qfx = Qх + S
                const thirdFormulaValues = firstFormulaValues.map((qx, idx) => {
                  const s = secondFormulaValues[idx];
                  if (qx === null || qx === undefined || isNaN(qx) || s === null || s === undefined || isNaN(s)) return null;
                  return qx + s;
                });
                
                return formulas.map((formula, formulaIdx) => (
                  <tr key={`row1-formula-${formulaIdx}`}>
                    {formulaIdx === 0 && (
                      <>
                        <td rowSpan={3}>1</td>
                        <td rowSpan={3} className="name-cell">1-1МК ПК90+50 ПК60+20</td>
                        <td rowSpan={3}>3,030</td>
                      </>
                    )}
                    <td className="formula-cell">{formula}</td>
                    {formulaIdx === 0 ? (
                      // Первая формула - показываем данные из таблицы 16 (readOnly)
                      firstFormulaValues.map((value, idx) => {
                        const cellKey = `row1-qx-${idx}`;
                        const displayValue = value !== null && value !== undefined && !isNaN(value) ? value.toFixed(1) : '';
                        return (
                          <td key={cellKey} className="editable-cell">
                            <input
                              type="number"
                              step="0.1"
                              value={displayValue}
                              readOnly
                              style={{ backgroundColor: '#f0f0f0' }}
                              placeholder="—"
                            />
                          </td>
                        );
                      })
                    ) : formulaIdx === 1 ? (
                      // Вторая формула - автоматический расчет S
                      secondFormulaValues.map((calculatedS, idx) => {
                        const displayValue = calculatedS !== null && calculatedS !== undefined && !isNaN(calculatedS) && calculatedS > 0 ? calculatedS.toFixed(1) : '';
                        return (
                        <td key={`row1-s-${idx}`} className="editable-cell">
                          <input
                            type="number"
                            step="0.1"
                              value={displayValue}
                            readOnly
                            style={{ backgroundColor: '#f0f0f0' }}
                            placeholder="—"
                          />
                        </td>
                        );
                      })
                    ) : (
                      // Третья формула - автоматический расчет Qfx = Qх + S
                      thirdFormulaValues.map((qfx, idx) => {
                        const displayValue = qfx !== null && qfx !== undefined && !isNaN(qfx) && qfx > 0 ? qfx.toFixed(1) : '';
                        return (
                        <td key={`row1-qfx-${idx}`} className="editable-cell">
                          <input
                            type="number"
                            step="0.1"
                              value={displayValue}
                            readOnly
                            style={{ backgroundColor: '#f0f0f0' }}
                            placeholder="—"
                          />
                        </td>
                        );
                      })
                    )}
                  </tr>
                ));
              })()}
              
              {/* Остальные строки - разбиты по формулам, заполняются автоматически */}
              {(() => {
                // Функция для получения ключа декады
                const getDecadeKey = (month: string, decadeIdx: number): string => {
                  const monthMap: Record<string, string> = { 
                    apr: 'apr', 
                    may: 'may', 
                    jun: 'jun', 
                    jul: 'jul', 
                    aug: 'aug', 
                    sep: 'sep', 
                    oct: 'oct' 
                  };
                  const decadeMap: Record<number, string> = { 0: 'i', 1: 'ii', 2: 'iii' };
                  return `${monthMap[month]}_${decadeMap[decadeIdx]}`;
                };

                // Функция для получения значения из calculatedTableData
                const getValue = (rowNum: number, formulaIdx: number, month: string, decadeIdx: number): number | null => {
                  const decadeKey = getDecadeKey(month, decadeIdx);
                  const data = calculatedTableData[decadeKey];
                  
                  if (!data) return null;
                  
                  if (rowNum === 2) {
                    if (formulaIdx === 0) return data.row2.Qvx;
                    if (formulaIdx === 1) return data.row2.S;
                    if (formulaIdx === 2) return data.row2.Qfx;
                  } else if (rowNum === 3) {
                    if (formulaIdx === 0) return data.row3.Qvx;
                    if (formulaIdx === 1) return data.row3.S;
                    if (formulaIdx === 2) return data.row3.Qfx;
                  } else if (rowNum === 4) {
                    if (formulaIdx === 0) return data.row4.Qvx;
                    if (formulaIdx === 1) return data.row4.S;
                    if (formulaIdx === 2) return data.row4.Qfx;
                  } else if (rowNum === 5) {
                    return data.row5_Qg;
                  } else if (rowNum === 6) {
                    return data.row6_Wg;
                  } else if (rowNum === 7) {
                    return data.row7_Wtotal;
                  }
                  
                  return null;
                };

                return [
                  { num: 2, name: '1-1MK ПК60+20 – ПК00+00', length: '6,020', formulas: [
                    <>Q<sub>х</sub> = Q<sub>fx</sub> 1-1MK + Q<sub>fx</sub> 1-3K</>,
                    <>S = 10 × A × L × Q<sub>х</sub><sup>0.5</sup>, л/с</>,
                    <>Q<sub>fx</sub> = Q<sub>х</sub> + S</>,
                  ]},
                  { num: 3, name: '1-1МК1 ПК134+70 – ПК74+40', length: '6,030', formulas: [
                    <>Q<sub>х</sub> = Q<sub>fx</sub> 1-2K</>,
                    <>S = 10 × A × L × Q<sub>х</sub><sup>0.5</sup>, л/с</>,
                    <>Q<sub>fx</sub> = Q<sub>х</sub> + S</>,
                  ]},
                  { num: 4, name: '1-1МК1 ПК74+40 – ПК00+00', length: '0,744', formulas: [
                    <>Q<sub>х</sub> = Q<sub>fx</sub> 1-1MK1 + Q<sub>fx</sub> 1-1K</>,
                    <>S = 10 × A × L × Q<sub>х</sub><sup>0.5</sup>, л/с</>,
                    <>Q<sub>fx</sub> = Q<sub>х</sub> + S</>,
                  ]},
                  { num: 5, name: 'Масрафи обгирӣ аз дарё ба Канали калони Ҳисор', length: '', formulas: [
                    <>Q<sub>х</sub> = Q<sub>fx</sub> 1-1MK + Q<sub>fx</sub> 1-1MK1</>,
                  ]},
                  { num: 6, name: 'Ҳаҷми обгирӣ аз дарё ба Канали калони Ҳисор', length: '', formulas: [
                    <>W = 86,4 × t × Q<sub>fx</sub> / 10<sup>6</sup>, млн.м³</>,
                  ]},
                  { num: 7, name: 'Афсоиши хачми обгирӣ', length: '', formulas: [
                    <>W = W<sub>n-1</sub> + W<sub>n+1</sub>, млн.м³</>,
                  ]},
                ].map((rowData) => 
                  rowData.formulas.map((formula, formulaIdx) => (
                    <tr key={`row${rowData.num}-formula-${formulaIdx}`}>
                      {formulaIdx === 0 && (
                        <>
                          <td rowSpan={rowData.formulas.length}>{rowData.num}</td>
                          <td rowSpan={rowData.formulas.length} className="name-cell">{rowData.name}</td>
                          <td rowSpan={rowData.formulas.length}>{rowData.length || '—'}</td>
                        </>
                      )}
                      <td className="formula-cell">{formula}</td>
                      {['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct'].flatMap((month) => {
                        const isOct = month === 'oct';
                        return [0, 1, isOct ? null : 2].filter(idx => idx !== null).map((idx) => {
                          const value = getValue(rowData.num, formulaIdx, month, idx);
                          // Все поля readOnly, так как все рассчитывается автоматически из таблицы 16
                          const step = rowData.num >= 6 ? 0.001 : 0.1;
                          const precision = rowData.num >= 6 ? 3 : 1;
                          
                          return (
                            <td key={`row${rowData.num}-formula${formulaIdx}-${month}-${idx}`} className="editable-cell">
                              <input
                                type="number"
                                step={step}
                                value={value !== null ? value.toFixed(precision) : ''}
                                readOnly
                                style={{ backgroundColor: '#f0f0f0' }}
                                placeholder="—"
                                onChange={() => {}}
                              />
                            </td>
                          );
                        });
                      })}
                    </tr>
                  ))
                );
              })()}
            </tbody>
          </table>
          </div>
          
          {/* График для таблицы 14 */}
          {showTable14Chart && (
            <div className="chart-container">
              {(() => {
                // Подготовка данных для графика из calculatedTableData
                const months = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct'] as const;
                const chartData = months.flatMap((month) => {
                  const monthNames: Record<string, string> = {
                    apr: 'Апрел',
                    may: 'Май',
                    jun: 'Июн',
                    jul: 'Июл',
                    aug: 'Август',
                    sep: 'Сентиябр',
                    oct: 'Октябр',
                  };
                  const maxDecades = month === 'oct' ? 1 : 2;
                  return Array.from({ length: maxDecades + 1 }, (_, idx) => {
                    const decadeKey = `${month}_${idx === 0 ? 'i' : idx === 1 ? 'ii' : 'iii'}`;
                    const data = calculatedTableData[decadeKey];
                    if (!data) return null;
                    
                    return {
                      name: `${monthNames[month]} ${idx === 0 ? 'I' : idx === 1 ? 'II' : 'III'}`,
                      'Qfx строка 1': data.row1.Qfx ?? 0,
                      'Qfx строка 2': data.row2.Qfx ?? 0,
                      'Qfx строка 3': data.row3.Qfx ?? 0,
                      'Qfx строка 4': data.row4.Qfx ?? 0,
                      'Qг (строка 5)': data.row5_Qg ?? 0,
                      'Wг (строка 6)': (data.row6_Wg ?? 0) * 1000, // Умножаем для лучшей видимости
                    };
                  }).filter(Boolean);
                });
                
                return (
                  <ResponsiveContainer width="100%" height={isMobile ? 500 : 400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={isMobile ? -90 : -45} 
                        textAnchor={isMobile ? "middle" : "end"} 
                        height={isMobile ? 0 : 80}
                        tick={!isMobile}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Qfx строка 1" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="Qfx строка 2" stroke="#82ca9d" strokeWidth={2} />
                      <Line type="monotone" dataKey="Qfx строка 3" stroke="#ffc658" strokeWidth={2} />
                      <Line type="monotone" dataKey="Qfx строка 4" stroke="#ff7300" strokeWidth={2} />
                      <Line type="monotone" dataKey="Qг (строка 5)" stroke="#00ff00" strokeWidth={2} />
                      <Line type="monotone" dataKey="Wг (строка 6)" stroke="#ff00ff" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
          )}

        {/* Результаты ИИ-анализа таблицы 14 */}
        {analysisError && (
          <Alert
            message={t('calculations.error', 'Ошибка')}
            description={analysisError}
            type="error"
            showIcon
            style={{ marginTop: '1.5rem' }}
          />
        )}

        {analyzingTable14 && (
          <div className="ai-analysis-loading" style={{ marginTop: '1.5rem', textAlign: 'center', padding: '2rem' }}>
            <Spin size="large" tip={t('ai.analyzingText') || 'Анализ данных...'} />
          </div>
        )}

        {table14Analysis && (
          <div className="ai-analysis-result" style={{ marginTop: '1.5rem', background: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div className="analysis-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '2px solid #e5e7eb' }}>
              <h4 style={{ margin: 0, fontSize: '20px', color: '#1f2937' }}>🤖 {t('calculations.aiAnalysisResult', 'Результаты ИИ-анализа таблицы 14')}</h4>
              <span 
                className="priority-badge"
                style={{
                  backgroundColor: 
                    table14Analysis.priority === 'critical' ? '#dc2626' :
                    table14Analysis.priority === 'high' ? '#f59e0b' :
                    table14Analysis.priority === 'medium' ? '#3b82f6' : '#10b981',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                {t('calculations.status', 'Статус')}: {table14Analysis.priority === 'critical' ? t('calculations.critical', 'Критический') :
                 table14Analysis.priority === 'high' ? t('calculations.high', 'Высокий') :
                 table14Analysis.priority === 'medium' ? t('calculations.medium', 'Средний') : t('calculations.low', 'Низкий')}
              </span>
            </div>
            <div className="analysis-content">
              <div className="analysis-text" style={{ 
                marginBottom: '1.5rem', 
                padding: '1rem', 
                borderRadius: '6px',
                backgroundColor: '#e0f2fe',
                borderLeft: '4px solid #0284c7'
              }}>
                <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '16px', color: '#0c4a6e', fontWeight: '600' }}>{t('calculations.analysis', 'Анализ')}:</h5>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: '#075985', margin: 0 }}>{table14Analysis.analysis}</p>
              </div>
              {table14Analysis.recommendations && table14Analysis.recommendations.length > 0 && (
                <div className="analysis-recommendations" style={{
                  padding: '1rem',
                  borderRadius: '6px',
                  backgroundColor: '#fef9c3',
                  borderLeft: '4px solid #eab308'
                }}>
                  <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '16px', color: '#854d0e', fontWeight: '600' }}>{t('calculations.recommendations', 'Рекомендации')}:</h5>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#713f12' }}>
                    {table14Analysis.recommendations.map((rec, idx) => (
                      <li key={idx} style={{ marginBottom: '0.5rem', lineHeight: '1.6' }}>{rec}</li>
                    ))}
            </ul>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
    </div>
  );
}


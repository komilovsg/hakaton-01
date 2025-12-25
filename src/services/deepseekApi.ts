const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
// Используем прокси /openai (см. vite.config.ts), чтобы обойти CORS в браузере
const OPENAI_BASE_URL = import.meta.env.VITE_OPENAI_BASE_URL || '/openai';

export interface DeepSeekAnalysis {
  analysis: string;
  recommendations: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export async function analyzeChannel(
  channelData: {
    name: string;
    length: number;
    width: number;
    depth: number;
    waterFlow: number;
    waterVolumeIn: number;
    waterVolumeOut: number;
    lossPercentage: number;
    lossPerKm: number;
    efficiency: number;
    status: string;
  },
  language: string = 'ru'
): Promise<DeepSeekAnalysis> {
  const isTajik = language === 'tj';
  
  const statusText = channelData.status === 'critical' 
    ? (isTajik ? 'Критикӣ' : 'Критический')
    : channelData.status === 'high-loss'
    ? (isTajik ? 'Талафоти баланд' : 'Высокие потери')
    : (isTajik ? 'Одатӣ' : 'Норма');
  
  const requestPart = isTajik
    ? `Лутфан пешниҳод кунед:
1. Таҳлили муфассали ҳолати ҷории канал
2. Сабабҳои талафоти об (филтратсия, бухоршавӣ, рафтан ва ғайра)
3. Тавсияҳои мушаххас барои беҳтар кардан (бетон кардан, таъмир, оптимализатсия)
4. Аввалияти амалҳо (low, medium, high, critical)
5. Арзёбии самаранокии чораҳои пешниҳодшуда

Ҷавоб бояд ба забони тоҷикӣ бошад, сохторнок ва амалӣ барои мутахассисони хоҷагии оби Тоҷикистон.

Формати ҷавоб (JSON):
{
  "analysis": "таҳлили муфассал бо матн",
  "recommendations": ["тавсия 1", "тавсия 2", ...],
  "priority": "low|medium|high|critical"
}`
    : `Пожалуйста, предоставь:
1. Детальный анализ текущего состояния канала
2. Причины потерь воды (фильтрация, испарение, утечки и т.д.)
3. Конкретные рекомендации по улучшению (бетонирование, ремонт, оптимизация)
4. Приоритет действий (low, medium, high, critical)
5. Оценку эффективности предлагаемых мер

Ответ должен быть на русском языке, структурированным и практичным для специалистов водного хозяйства Таджикистана.

Формат ответа (JSON):
{
  "analysis": "детальный анализ текстом",
  "recommendations": ["рекомендация 1", "рекомендация 2", ...],
  "priority": "low|medium|high|critical"
}`;
  
  const prompt = isTajik
    ? `Маълумоти канали обро дар Тоҷикистон таҳлил кунед ва таҳлили муфассал бо тавсияҳо пешниҳод кунед.

Маълумоти канал:
- Ном: ${channelData.name}
- Дарозӣ: ${channelData.length} км
- Паҳнӣ: ${channelData.width} м
- Чуқурӣ: ${channelData.depth} м
- Сарфи об: ${channelData.waterFlow} м³/с
- Ҳаҷм дар вуруд: ${channelData.waterVolumeIn} м³/с
- Ҳаҷм дар хурӯҷ: ${channelData.waterVolumeOut} м³/с
- Талафоти об: ${channelData.lossPercentage.toFixed(1)}%
- Талафот дар 1 км: ${channelData.lossPerKm.toFixed(3)}%
- КПД: ${(channelData.efficiency * 100).toFixed(1)}%
- Ҳолат: ${statusText}

${requestPart}`
    : `Проанализируй данные о канале воды в Таджикистане и предоставь детальный анализ с рекомендациями.

Данные канала:
- Название: ${channelData.name}
- Длина: ${channelData.length} км
- Ширина: ${channelData.width} м
- Глубина: ${channelData.depth} м
- Расход воды: ${channelData.waterFlow} м³/с
- Объем на входе: ${channelData.waterVolumeIn} м³/с
- Объем на выходе: ${channelData.waterVolumeOut} м³/с
- Потери воды: ${channelData.lossPercentage.toFixed(1)}%
- Потери на 1 км: ${channelData.lossPerKm.toFixed(3)}%
- КПД: ${(channelData.efficiency * 100).toFixed(1)}%
- Статус: ${statusText}

${requestPart}`;

  try {
    const apiUrl = OPENAI_BASE_URL.startsWith('/') 
      ? `${window.location.origin}${OPENAI_BASE_URL}/v1/chat/completions`
      : `${OPENAI_BASE_URL}/v1/chat/completions`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: isTajik
              ? 'Шумо мутахассиси хоҷагии об ва системаҳои обёрии Тоҷикистон ҳастед. Шумо маълумоти каналҳоро таҳлил мекунед ва тавсияҳои амалӣ барои коҳиш додани талафоти об медиҳед.'
              : 'Ты эксперт по водному хозяйству и ирригационным системам в Таджикистане. Ты анализируешь данные о каналах и предоставляешь практические рекомендации по снижению потерь воды.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorJson = await response.json();
        errorMessage = errorJson?.error?.message ?? errorMessage;
      } catch {
        // ignore
      }
      throw new Error(`OpenAI API error (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Пытаемся извлечь JSON из ответа
    let analysisResult: DeepSeekAnalysis;
    try {
      // Ищем JSON в ответе
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        // Если JSON не найден, парсим текст
        analysisResult = {
          analysis: content,
          recommendations: extractRecommendations(content),
          priority: determinePriority(channelData.lossPercentage),
        };
      }
    } catch {
      // Если парсинг не удался, используем весь текст как анализ
      analysisResult = {
        analysis: content,
        recommendations: extractRecommendations(content),
        priority: determinePriority(channelData.lossPercentage),
      };
    }

    return analysisResult;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

function extractRecommendations(text: string): string[] {
  const recommendations: string[] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.startsWith('-') ||
      trimmed.startsWith('•') ||
      trimmed.match(/^\d+[.)]/) ||
      trimmed.includes('рекоменд') ||
      trimmed.includes('следует') ||
      trimmed.includes('необходимо')
    ) {
      const clean = trimmed.replace(/^[-•\d.)]\s*/, '').trim();
      if (clean.length > 20) {
        recommendations.push(clean);
      }
    }
  }
  
  return recommendations.length > 0 ? recommendations : [
    'Провести детальное обследование канала',
    'Рассмотреть возможность оптимизации системы',
  ];
}

function determinePriority(lossPercentage: number): 'low' | 'medium' | 'high' | 'critical' {
  if (lossPercentage > 30) return 'critical';
  if (lossPercentage > 15) return 'high';
  if (lossPercentage > 5) return 'medium';
  return 'low';
}

/**
 * Анализ данных таблицы 14 (Давоми ҷадвали 14) - расчет потерь воды в каналах
 */
export async function analyzeTable14(
  tableData: {
    row1: { Qvx: number; S: number; Qfx: number }[];
    row2: { Qvx: number; S: number; Qfx: number }[];
    row3: { Qvx: number; S: number; Qfx: number }[];
    row4: { Qvx: number; S: number; Qfx: number }[];
    row5_Qg: number[];
    row6_Wg: number[];
    row7_Wtotal: number[];
  },
  language: string = 'ru'
): Promise<DeepSeekAnalysis> {
  const isTajik = language === 'tj';
  
  // Подготовка данных для анализа
  const avgLosses = {
    row1: tableData.row1.reduce((sum, d) => sum + d.S, 0) / tableData.row1.length,
    row2: tableData.row2.reduce((sum, d) => sum + d.S, 0) / tableData.row2.length,
    row3: tableData.row3.reduce((sum, d) => sum + d.S, 0) / tableData.row3.length,
    row4: tableData.row4.reduce((sum, d) => sum + d.S, 0) / tableData.row4.length,
  };
  
  const totalWaterIntake = tableData.row5_Qg.reduce((sum, q) => sum + q, 0);
  const totalVolume = tableData.row6_Wg.reduce((sum, w) => sum + w, 0);
  const avgWaterIntake = totalWaterIntake / tableData.row5_Qg.length;
  
  const requestPart = isTajik
    ? `Лутфан пешниҳод кунед:
1. Таҳлили муфассали маълумоти ҷадвали 14 (расчети талафоти об дар каналҳо)
2. Таҳлили талафоти об дар ҳар як қитъаи канал (Qfx, S, Qг)
3. Таҳлили раванди тағйироти сарфи об дар давоми моҳҳо (Август, Сентябр, Октябр)
4. Тавсияҳои мушаххас барои коҳиш додани талафоти об
5. Аввалияти амалҳо (low, medium, high, critical)
6. Арзёбии самаранокии чораҳои пешниҳодшуда

Ҷавоб бояд ба забони тоҷикӣ бошад, сохторнок ва амалӣ барои мутахассисони хоҷагии оби Тоҷикистон.

Формати ҷавоб (JSON):
{
  "analysis": "таҳлили муфассал бо матн",
  "recommendations": ["тавсия 1", "тавсия 2", ...],
  "priority": "low|medium|high|critical"
}`
    : `Пожалуйста, предоставь:
1. Детальный анализ данных таблицы 14 (расчет потерь воды в каналах)
2. Анализ потерь воды на каждом участке канала (Qfx, S, Qг)
3. Анализ динамики изменения расхода воды в течение месяцев (Август, Сентябрь, Октябрь)
4. Конкретные рекомендации по снижению потерь воды
5. Приоритет действий (low, medium, high, critical)
6. Оценку эффективности предлагаемых мер

Ответ должен быть на русском языке, структурированным и практичным для специалистов водного хозяйства Таджикистана.

Формат ответа (JSON):
{
  "analysis": "детальный анализ текстом",
  "recommendations": ["рекомендация 1", "рекомендация 2", ...],
  "priority": "low|medium|high|critical"
}`;
  
  const prompt = isTajik
    ? `Маълумоти ҷадвали 14 (Давоми ҷадвали 14) - расчети талафоти об дар каналҳо дар Тоҷикистонро таҳлил кунед ва таҳлили муфассал бо тавсияҳо пешниҳод кунед.

Маълумоти ҷадвал:

Қитъаи 1 (1-1МК ПК90+50 ПК60+20, дарозӣ: 3.030 км):
- Миёнаи талафот (S): ${avgLosses.row1.toFixed(2)} л/с
- Миёнаи сарфи хурӯҷӣ (Qfx): ${(tableData.row1.reduce((sum, d) => sum + d.Qfx, 0) / tableData.row1.length).toFixed(2)} л/с

Қитъаи 2 (1-1MK ПК60+20 – ПК00+00, дарозӣ: 6.020 км):
- Миёнаи талафот (S): ${avgLosses.row2.toFixed(2)} л/с
- Миёнаи сарфи хурӯҷӣ (Qfx): ${(tableData.row2.reduce((sum, d) => sum + d.Qfx, 0) / tableData.row2.length).toFixed(2)} л/с

Қитъаи 3 (1-1МК1 ПК134+70 – ПК74+40, дарозӣ: 6.030 км):
- Миёнаи талафот (S): ${avgLosses.row3.toFixed(2)} л/с
- Миёнаи сарфи хурӯҷӣ (Qfx): ${(tableData.row3.reduce((sum, d) => sum + d.Qfx, 0) / tableData.row3.length).toFixed(2)} л/с

Қитъаи 4 (1-1МК1 ПК74+40 – ПК00+00, дарозӣ: 0.744 км):
- Миёнаи талафот (S): ${avgLosses.row4.toFixed(2)} л/с
- Миёнаи сарфи хурӯҷӣ (Qfx): ${(tableData.row4.reduce((sum, d) => sum + d.Qfx, 0) / tableData.row4.length).toFixed(2)} л/с

Масрафи умумии обгирӣ (Qг):
- Миёнаи сарф: ${avgWaterIntake.toFixed(2)} л/с
- Ҳаҷми умумии обгирӣ: ${totalVolume.toFixed(3)} млн.м³

${requestPart}`
    : `Проанализируй данные таблицы 14 (Давоми ҷадвали 14) - расчет потерь воды в каналах в Таджикистане и предоставь детальный анализ с рекомендациями.

Данные таблицы:

Участок 1 (1-1МК ПК90+50 ПК60+20, длина: 3.030 км):
- Средние потери (S): ${avgLosses.row1.toFixed(2)} л/с
- Средний расход на выходе (Qfx): ${(tableData.row1.reduce((sum, d) => sum + d.Qfx, 0) / tableData.row1.length).toFixed(2)} л/с

Участок 2 (1-1MK ПК60+20 – ПК00+00, длина: 6.020 км):
- Средние потери (S): ${avgLosses.row2.toFixed(2)} л/с
- Средний расход на выходе (Qfx): ${(tableData.row2.reduce((sum, d) => sum + d.Qfx, 0) / tableData.row2.length).toFixed(2)} л/с

Участок 3 (1-1МК1 ПК134+70 – ПК74+40, длина: 6.030 км):
- Средние потери (S): ${avgLosses.row3.toFixed(2)} л/с
- Средний расход на выходе (Qfx): ${(tableData.row3.reduce((sum, d) => sum + d.Qfx, 0) / tableData.row3.length).toFixed(2)} л/с

Участок 4 (1-1МК1 ПК74+40 – ПК00+00, длина: 0.744 км):
- Средние потери (S): ${avgLosses.row4.toFixed(2)} л/с
- Средний расход на выходе (Qfx): ${(tableData.row4.reduce((sum, d) => sum + d.Qfx, 0) / tableData.row4.length).toFixed(2)} л/с

Общий расход водозабора (Qг):
- Средний расход: ${avgWaterIntake.toFixed(2)} л/с
- Общий объем водозабора: ${totalVolume.toFixed(3)} млн.м³

${requestPart}`;

  try {
    const apiUrl = OPENAI_BASE_URL.startsWith('/') 
      ? `${window.location.origin}${OPENAI_BASE_URL}/v1/chat/completions`
      : `${OPENAI_BASE_URL}/v1/chat/completions`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: isTajik
              ? 'Шумо мутахассиси хоҷагии об ва системаҳои обёрии Тоҷикистон ҳастед. Шумо маълумоти ҷадвалҳои гидрологӣ ва талафоти обро таҳлил мекунед ва тавсияҳои амалӣ барои коҳиш додани талафоти об медиҳед.'
              : 'Ты эксперт по водному хозяйству и ирригационным системам в Таджикистане. Ты анализируешь данные гидрологических таблиц и потерь воды и предоставляешь практические рекомендации по снижению потерь воды.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorJson = await response.json();
        errorMessage = errorJson?.error?.message ?? errorMessage;
      } catch {
        // ignore
      }
      throw new Error(`OpenAI API error (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Пытаемся извлечь JSON из ответа
    let analysisResult: DeepSeekAnalysis;
    try {
      // Ищем JSON в ответе
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        // Если JSON не найден, парсим текст
        const totalAvgLoss = (avgLosses.row1 + avgLosses.row2 + avgLosses.row3 + avgLosses.row4) / 4;
        analysisResult = {
          analysis: content,
          recommendations: extractRecommendations(content),
          priority: determinePriority(totalAvgLoss / avgWaterIntake * 100),
        };
      }
    } catch {
      // Если парсинг не удался, используем весь текст как анализ
      const totalAvgLoss = (avgLosses.row1 + avgLosses.row2 + avgLosses.row3 + avgLosses.row4) / 4;
      analysisResult = {
        analysis: content,
        recommendations: extractRecommendations(content),
        priority: determinePriority(totalAvgLoss / avgWaterIntake * 100),
      };
    }

    return analysisResult;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Row, Col, Spin, Alert, Typography, Space, Input, Button } from 'antd';
import { EnvironmentOutlined, CloudOutlined, ThunderboltOutlined, SearchOutlined } from '@ant-design/icons';
import './Weather.scss';

const { Title, Text } = Typography;

interface WeatherData {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temperature: number;
    apparentTemperature: number;
    weatherCode: number;
    humidity: number;
    windSpeed: number;
    pressure: number;
  };
  forecast: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    weatherCode: number;
    precipitation: number;
  }>;
}

// Функция для преобразования weather_code в описание и иконку
const getWeatherInfo = (code: number) => {
  // WMO Weather interpretation codes (WW)
  const weatherCodes: Record<number, { text: string; icon: string }> = {
    0: { text: 'Ясно', icon: '☀️' },
    1: { text: 'Преимущественно ясно', icon: '🌤️' },
    2: { text: 'Переменная облачность', icon: '⛅' },
    3: { text: 'Пасмурно', icon: '☁️' },
    45: { text: 'Туман', icon: '🌫️' },
    48: { text: 'Иней', icon: '🌫️' },
    51: { text: 'Легкая морось', icon: '🌦️' },
    53: { text: 'Умеренная морось', icon: '🌦️' },
    55: { text: 'Сильная морось', icon: '🌦️' },
    56: { text: 'Легкая ледяная морось', icon: '🌨️' },
    57: { text: 'Сильная ледяная морось', icon: '🌨️' },
    61: { text: 'Небольшой дождь', icon: '🌧️' },
    63: { text: 'Умеренный дождь', icon: '🌧️' },
    65: { text: 'Сильный дождь', icon: '🌧️' },
    66: { text: 'Легкий ледяной дождь', icon: '🌨️' },
    67: { text: 'Сильный ледяной дождь', icon: '🌨️' },
    71: { text: 'Небольшой снег', icon: '❄️' },
    73: { text: 'Умеренный снег', icon: '❄️' },
    75: { text: 'Сильный снег', icon: '❄️' },
    77: { text: 'Снежные зерна', icon: '❄️' },
    80: { text: 'Небольшой ливень', icon: '🌦️' },
    81: { text: 'Умеренный ливень', icon: '🌦️' },
    82: { text: 'Сильный ливень', icon: '🌦️' },
    85: { text: 'Небольшой снегопад', icon: '❄️' },
    86: { text: 'Сильный снегопад', icon: '❄️' },
    95: { text: 'Гроза', icon: '⛈️' },
    96: { text: 'Гроза с градом', icon: '⛈️' },
    99: { text: 'Сильная гроза с градом', icon: '⛈️' },
  };

  return weatherCodes[code] || { text: 'Неизвестно', icon: '❓' };
};

export default function Weather() {
  const { t, i18n } = useTranslation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cityInput, setCityInput] = useState('');

  // Координаты Душанбе, Таджикистан (по умолчанию)
  const [coordinates, setCoordinates] = useState({ lat: 38.5731, lon: 68.7864 });
  const [locationName, setLocationName] = useState('Душанбе, Таджикистан');

  // Функция для поиска города
  const searchLocation = async (cityName: string) => {
    if (!cityName.trim()) return;

    try {
      const lang = i18n.language === 'tj' ? 'en' : i18n.language;
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=${lang}`
      );

      if (!response.ok) {
        throw new Error('Ошибка поиска города');
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        setCoordinates({ lat: result.latitude, lon: result.longitude });
        setLocationName(`${result.name}, ${result.country}`);
        setCityInput('');
        fetchWeather(result.latitude, result.longitude, `${result.name}, ${result.country}`);
      } else {
        setError(t('weather.cityNotFound', 'Город не найден'));
      }
    } catch (err) {
      console.error('Location search error:', err);
      setError(t('weather.searchError', 'Ошибка при поиске города'));
    }
  };

  // Функция для получения данных о погоде
  const fetchWeather = async (lat: number, lon: number, location: string) => {
    setLoading(true);
    setError(null);

    try {
      // Получаем текущую погоду и прогноз
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&forecast_days=7&timezone=auto&wind_speed_unit=kmh`
      );

      if (!response.ok) {
        throw new Error(t('weather.fetchError', 'Ошибка при получении данных о погоде'));
      }

      const data = await response.json();

      // Получаем информацию о стране для отображения
      const countryResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1`
      );
      let country = 'Таджикистан';
      if (countryResponse.ok) {
        const countryData = await countryResponse.json();
        if (countryData.results && countryData.results.length > 0) {
          country = countryData.results[0].country;
        }
      }

      const weatherData: WeatherData = {
        location: {
          name: location.split(',')[0],
          country: country,
          lat: lat,
          lon: lon,
        },
        current: {
          temperature: Math.round(data.current.temperature_2m),
          apparentTemperature: Math.round(data.current.apparent_temperature),
          weatherCode: data.current.weather_code,
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
          pressure: Math.round(data.current.surface_pressure),
        },
        forecast: data.daily.time.map((date: string, index: number) => ({
          date,
          maxTemp: Math.round(data.daily.temperature_2m_max[index]),
          minTemp: Math.round(data.daily.temperature_2m_min[index]),
          weatherCode: data.daily.weather_code[index],
          precipitation: data.daily.precipitation_sum[index] || 0,
        })),
      };

      setWeather(weatherData);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err instanceof Error ? err.message : t('weather.unknownError', 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(coordinates.lat, coordinates.lon, locationName);
  }, []);

  if (loading && !weather) {
    return (
      <div className="weather-page">
        <div className="loading-container">
          <Spin size="large" />
          <Text>{t('weather.loading', 'Загрузка данных о погоде...')}</Text>
        </div>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="weather-page">
        <Alert
          message={t('weather.error', 'Ошибка')}
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => fetchWeather(coordinates.lat, coordinates.lon, locationName)}>
              {t('weather.retry', 'Повторить')}
            </Button>
          }
        />
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  const currentWeather = getWeatherInfo(weather.current.weatherCode);

  return (
    <div className="weather-page">
      <Title level={1} className="page-title">
        {t('weather.title', 'Прогноз погоды')}
      </Title>

      {/* Поиск города */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder={t('weather.cityPlaceholder', 'Введите название города')}
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onPressEnter={() => searchLocation(cityInput)}
            size="large"
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => searchLocation(cityInput)}
            size="large"
            loading={loading}
          >
            {t('weather.search', 'Поиск')}
          </Button>
        </Space.Compact>
      </Card>

      <Card className="current-weather-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">{t('weather.location', 'Местоположение')}</Text>
                <Title level={3} style={{ margin: '0.5rem 0' }}>
                  <EnvironmentOutlined /> {weather.location.name}, {weather.location.country}
                </Title>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '1rem' }}>
                  {t('weather.current', 'Текущая погода')}
                </Text>
                <Title level={2} style={{ margin: '0.5rem 0', color: '#1890ff' }}>
                  {weather.current.temperature}°C
                </Title>
                <Text>
                  {t('weather.feelsLike', 'Ощущается как')}: {weather.current.apparentTemperature}°C
                </Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={12}>
            <div className="weather-icon-container">
              <div style={{ fontSize: '80px', lineHeight: '1' }}>{currentWeather.icon}</div>
              <Text style={{ fontSize: '1.1rem', marginTop: '1rem' }}>{currentWeather.text}</Text>
            </div>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '2rem' }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <CloudOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <Text type="secondary">{t('weather.humidity', 'Влажность')}</Text>
                <Text strong>{weather.current.humidity}%</Text>
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <ThunderboltOutlined style={{ fontSize: '24px', color: '#faad14' }} />
                <Text type="secondary">{t('weather.wind', 'Ветер')}</Text>
                <Text strong>{weather.current.windSpeed} км/ч</Text>
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <Text type="secondary">{t('weather.pressure', 'Давление')}</Text>
                <Text strong>{weather.current.pressure} гПа</Text>
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <Text type="secondary">{t('weather.coordinates', 'Координаты')}</Text>
                <Text strong style={{ fontSize: '0.85rem' }}>
                  {weather.location.lat.toFixed(4)}, {weather.location.lon.toFixed(4)}
                </Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      <Title level={2} style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        {t('weather.forecast', 'Прогноз на 7 дней')}
      </Title>

      <Row gutter={[16, 16]}>
        {weather.forecast.map((day, index) => {
          const dayWeather = getWeatherInfo(day.weatherCode);
          const date = new Date(day.date);
          const isToday = index === 0;
          const isTomorrow = index === 1;

          return (
            <Col xs={24} sm={12} md={8} lg={6} key={day.date}>
              <Card className="forecast-card">
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  <Text strong>
                    {isToday
                      ? t('weather.today', 'Сегодня')
                      : isTomorrow
                      ? t('weather.tomorrow', 'Завтра')
                      : date.toLocaleDateString(i18n.language === 'tj' ? 'en-US' : 'ru-RU', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                  </Text>
                  <div style={{ fontSize: '48px', lineHeight: '1' }}>{dayWeather.icon}</div>
                  <Text style={{ fontSize: '0.9rem', textAlign: 'center' }}>{dayWeather.text}</Text>
                  <div>
                    <Text strong style={{ fontSize: '1.2rem', color: '#1890ff' }}>
                      {day.maxTemp}°
                    </Text>
                    <Text type="secondary" style={{ marginLeft: '0.5rem' }}>
                      {day.minTemp}°
                    </Text>
                  </div>
                  {day.precipitation > 0 && (
                    <div style={{ fontSize: '0.85rem', color: '#1890ff' }}>
                      💧 {day.precipitation.toFixed(1)} мм
                    </div>
                  )}
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}

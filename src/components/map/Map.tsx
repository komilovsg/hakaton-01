import { useEffect, useState, useRef, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Polyline, Popup, useMap } from 'react-leaflet';
import { Button, Space } from 'antd';
import { load } from '@2gis/mapgl';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ChannelData } from '../../types/channel';
import './Map.scss';

// Типы для 2GIS MapGL API будут использоваться из возвращаемого значения load()
type MapGLAPI = Awaited<ReturnType<typeof load>>;
type MapGLMap = InstanceType<MapGLAPI['Map']>;
type MapGLPopup = InstanceType<MapGLAPI['HtmlMarker']>;
type MapGLGeoJsonSource = InstanceType<MapGLAPI['GeoJsonSource']>;

// Фикс для иконок Leaflet
// @ts-expect-error - Leaflet icon fix for default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapProps {
  channels: ChannelData[];
  selectedChannel?: ChannelData | null;
  onChannelSelect?: (channel: ChannelData | null) => void;
}

function MapBounds({ channels }: { channels: ChannelData[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (channels.length === 0) return;
    
    const bounds = channels.flatMap(channel => channel.coordinates);
    if (bounds.length > 0) {
      map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50] });
    }
  }, [channels, map]);
  
  return null;
}

// Компонент-обертка для контейнера карты (избегает повторного рендеринга)
const Map2GISContainer = memo(
  () => {
    return <div id="map-2gis-container" style={{ width: '100%', height: '100%' }} />;
  },
  () => true
);

// Компонент для 2GIS MapGL карты
function Map2GIS({ channels, selectedChannel, onChannelSelect }: MapProps) {
  const { t } = useTranslation();
  const mapRef = useRef<MapGLMap | null>(null);
  const mapglAPIRef = useRef<MapGLAPI | null>(null);
  const popupsRef = useRef<MapGLPopup[]>([]);
  const sourcesRef = useRef<MapGLGeoJsonSource[]>([]);
  const DG_API_KEY = 'e4b41575-a619-44af-93dd-a8456b00c05e';

  useEffect(() => {
    let map: MapGLMap | null = null;

    // Загружаем MapGL API согласно документации
    load().then((mapglAPI) => {
      mapglAPIRef.current = mapglAPI;
      
      const container = document.getElementById('map-2gis-container');
      if (!container) return;

      // Инициализация 2GIS MapGL карты
      map = new mapglAPI.Map('map-2gis-container', {
        key: DG_API_KEY,
        center: [68.7864, 38.5731], // Душанбе [lng, lat] - MapGL использует формат [lng, lat]
        zoom: 7,
      });

      mapRef.current = map;

      // Очистка предыдущих слоев
      channels.forEach((_, channelIndex) => {
        const layerId = `channel-layer-${channelIndex}`;
        try {
          if (map) {
            map.removeLayer(layerId);
          }
        } catch {
          // Игнорируем ошибки, если слои не существуют
        }
      });
      
      // Удаляем слой границ Таджикистана, если он существует
      try {
        if (map) {
          map.removeLayer('tajikistan-border');
        }
      } catch {
        // Игнорируем ошибки
      }
      
      // Очистка предыдущих popup
      popupsRef.current.forEach(popup => popup.destroy());
      popupsRef.current = [];
      sourcesRef.current.forEach(source => source.destroy());
      sourcesRef.current = [];

      // Добавляем выделение территории Таджикистана
      // Примерные границы Таджикистана: [lng, lat]
      const tajikistanBoundary = [
        [67.4, 36.7], // Юго-запад
        [75.1, 36.7], // Юго-восток
        [75.1, 40.5], // Северо-восток
        [67.4, 40.5], // Северо-запад
        [67.4, 36.7], // Замыкаем полигон
      ];

      const tajikistanGeoJson = {
        type: 'Feature' as const,
        properties: {
          name: 'Tajikistan',
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [tajikistanBoundary],
        },
      };

      const tajikistanSource = new mapglAPI.GeoJsonSource(map, {
        data: tajikistanGeoJson,
      });
      sourcesRef.current.push(tajikistanSource);

      // Добавляем слой для границы Таджикистана
      map.addLayer({
        id: 'tajikistan-border',
        type: 'line',
        source: tajikistanSource,
        paint: {
          'line-color': '#3b82f6', // Синий цвет для границы
          'line-width': 3,
          'line-opacity': 0.8,
        },
      });

      // Добавляем слой для заливки территории Таджикистана
      map.addLayer({
        id: 'tajikistan-fill',
        type: 'fill',
        source: tajikistanSource,
        paint: {
          'fill-color': '#3b82f6', // Синий цвет для заливки
          'fill-opacity': 0.1, // Полупрозрачная заливка
        },
      });

      // Добавление полилиний для каналов через GeoJSON
      channels.forEach((channel, channelIndex) => {
        const color = channel.status === 'critical' ? '#dc2626' :
                     channel.status === 'high-loss' ? '#f59e0b' : '#10b981';
        
        // MapGL использует формат [lng, lat], а у нас [lat, lng], нужно конвертировать
        const coordinates = channel.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
        
        // Создаем GeoJSON для полилинии
        const geoJsonData = {
          type: 'Feature' as const,
          properties: {
            channelId: channel.id,
            channelName: channel.name,
            color: color,
            weight: channel.status === 'critical' ? 5 : channel.status === 'high-loss' ? 4 : 3,
            opacity: selectedChannel?.id === channel.id ? 1 : 0.7,
          },
          geometry: {
            type: 'LineString' as const,
            coordinates: coordinates,
          },
        };

        // Создаем GeoJsonSource
        if (!map || !mapglAPI) return;
        
        const source = new mapglAPI.GeoJsonSource(map, {
          data: geoJsonData,
        });
        sourcesRef.current.push(source);

        // Добавляем слой для отображения линии
        const layerId = `channel-layer-${channelIndex}`;
        map.addLayer({
          id: layerId,
          type: 'line',
          source: source,
          paint: {
            'line-color': color,
            'line-width': channel.status === 'critical' ? 5 : channel.status === 'high-loss' ? 4 : 3,
            'line-opacity': selectedChannel?.id === channel.id ? 1 : 0.7,
          },
        });

        // Добавляем popup на первый маркер
        if (channel.coordinates.length > 0) {
          const firstPoint = channel.coordinates[0];
          const popupContent = `
            <div class="channel-popup">
              <h3>${channel.name}</h3>
              <div class="popup-info">
                <p><strong>${t('channelInfo.length')}:</strong> ${channel.length} км</p>
                <p><strong>${t('channelInfo.waterFlow')}:</strong> ${channel.waterFlow} м³/с</p>
                <p><strong>${t('channelInfo.losses')}:</strong> ${channel.lossPercentage.toFixed(1)}% (${channel.lossVolume.toFixed(2)} м³/с)</p>
                <p><strong>${t('channelInfo.lossPerKm')}:</strong> ${channel.lossPerKm.toFixed(3)}%</p>
                <p><strong>${t('channelInfo.efficiency')}:</strong> ${(channel.efficiency * 100).toFixed(0)}%</p>
                <p><strong>${t('table.columns.status')}:</strong> ${
                  channel.status === 'critical' ? t('channelInfo.status.critical') :
                  channel.status === 'high-loss' ? t('channelInfo.status.highLoss') : t('channelInfo.status.normal')
                }</p>
              </div>
            </div>
          `;

          if (!map || !mapglAPI) return;
          
          // Используем HtmlMarker для отображения popup
          const popup = new mapglAPI.HtmlMarker(map, {
            coordinates: [firstPoint[1], firstPoint[0]], // [lng, lat]
            html: popupContent,
          });

          popupsRef.current.push(popup);
        }
      });

      // Добавляем глобальный обработчик клика для всех каналов
      const handleMapClick = (e: { lngLat: number[] }) => {
        if (!map) return;
        
        // Проверяем, кликнули ли на какой-либо канал
        const clickedPoint = e.lngLat as [number, number];
        
        // Находим ближайший канал
        let closestChannel: ChannelData | null = null;
        let minDistance = Infinity;
        
        channels.forEach((channel) => {
          channel.coordinates.forEach((coord: [number, number]) => {
            const channelPoint = [coord[1], coord[0]] as [number, number];
            const distance = Math.sqrt(
              Math.pow(clickedPoint[0] - channelPoint[0], 2) + 
              Math.pow(clickedPoint[1] - channelPoint[1], 2)
            );
            
            // Учитываем масштаб карты для более точного определения клика
            const currentZoom = map ? map.getZoom() : 7;
            const threshold = 0.05 / Math.pow(2, currentZoom - 7);
            
            if (distance < threshold && distance < minDistance) {
              minDistance = distance;
              closestChannel = channel;
            }
          });
        });
        
        if (closestChannel) {
          onChannelSelect?.(closestChannel);
        }
      };
      
      map.on('click', handleMapClick);

      // Подгонка границ карты
      if (channels.length > 0) {
        const bounds = channels.flatMap(channel => channel.coordinates);
        if (bounds.length > 0) {
          const lngs = bounds.map((coord: [number, number]) => coord[1]);
          const lats = bounds.map((coord: [number, number]) => coord[0]);
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          
          // Используем LngLatBounds для fitBounds
          const lngLatBounds = new mapglAPI.LngLatBoundsClass({
            southWest: [minLng, minLat],
            northEast: [maxLng, maxLat],
          });
          
          map.fitBounds(lngLatBounds, { padding: { top: 50, bottom: 50, left: 50, right: 50 } });
        }
      }

      return () => {
        // Очистка слоев и источников
        channels.forEach((_, channelIndex) => {
          const layerId = `channel-layer-${channelIndex}`;
          try {
            if (map) {
              map.removeLayer(layerId);
            }
          } catch {
            // Игнорируем ошибки
          }
        });
        
        // Удаляем слои границ Таджикистана
        try {
          if (map) {
            map.removeLayer('tajikistan-border');
            map.removeLayer('tajikistan-fill');
          }
        } catch {
          // Игнорируем ошибки
        }
        
        sourcesRef.current.forEach(source => source.destroy());
        popupsRef.current.forEach(popup => popup.destroy());
        
        if (map) {
          map.destroy();
        }
      };
    });

    // Обработка обновления каналов
    if (mapRef.current && mapglAPIRef.current) {
      const map = mapRef.current;
      const mapglAPI = mapglAPIRef.current;

      // Очистка предыдущих слоев и источников
      channels.forEach((_, channelIndex) => {
        const layerId = `channel-layer-${channelIndex}`;
        try {
          map.removeLayer(layerId);
        } catch {
          // Игнорируем ошибки
        }
      });
      
      popupsRef.current.forEach(popup => popup.destroy());
      popupsRef.current = [];
      sourcesRef.current.forEach(source => source.destroy());
      sourcesRef.current = [];

      // Добавление новых каналов
      channels.forEach((channel, channelIndex) => {
        const color = channel.status === 'critical' ? '#dc2626' :
                     channel.status === 'high-loss' ? '#f59e0b' : '#10b981';
        
        const coordinates = channel.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
        
        const geoJsonData = {
          type: 'Feature' as const,
          properties: {
            channelId: channel.id,
            channelName: channel.name,
            color: color,
            weight: channel.status === 'critical' ? 5 : channel.status === 'high-loss' ? 4 : 3,
            opacity: selectedChannel?.id === channel.id ? 1 : 0.7,
          },
          geometry: {
            type: 'LineString' as const,
            coordinates: coordinates,
          },
        };

        const source = new mapglAPI.GeoJsonSource(map, {
          data: geoJsonData,
        });

        // Источник уже создан, добавляем его в массив для последующей очистки
        sourcesRef.current.push(source);

        const layerId = `channel-layer-${channelIndex}`;
        map.addLayer({
          id: layerId,
          type: 'line',
          source: source,
          paint: {
            'line-color': color,
            'line-width': channel.status === 'critical' ? 5 : channel.status === 'high-loss' ? 4 : 3,
            'line-opacity': selectedChannel?.id === channel.id ? 1 : 0.7,
          },
        });

        if (channel.coordinates.length > 0) {
          const firstPoint = channel.coordinates[0];
          const popupContent = `
            <div class="channel-popup">
              <h3>${channel.name}</h3>
              <div class="popup-info">
                <p><strong>${t('channelInfo.length')}:</strong> ${channel.length} км</p>
                <p><strong>${t('channelInfo.waterFlow')}:</strong> ${channel.waterFlow} м³/с</p>
                <p><strong>${t('channelInfo.losses')}:</strong> ${channel.lossPercentage.toFixed(1)}% (${channel.lossVolume.toFixed(2)} м³/с)</p>
                <p><strong>${t('channelInfo.lossPerKm')}:</strong> ${channel.lossPerKm.toFixed(3)}%</p>
                <p><strong>${t('channelInfo.efficiency')}:</strong> ${(channel.efficiency * 100).toFixed(0)}%</p>
                <p><strong>${t('table.columns.status')}:</strong> ${
                  channel.status === 'critical' ? t('channelInfo.status.critical') :
                  channel.status === 'high-loss' ? t('channelInfo.status.highLoss') : t('channelInfo.status.normal')
                }</p>
              </div>
            </div>
          `;

          const popup = new mapglAPI.HtmlMarker(map, {
            coordinates: [firstPoint[1], firstPoint[0]],
            html: popupContent,
          });

          popupsRef.current.push(popup);
        }
      });

      // Подгонка границ карты
      if (channels.length > 0) {
        const bounds = channels.flatMap(channel => channel.coordinates);
        if (bounds.length > 0) {
          const lngs = bounds.map((coord: [number, number]) => coord[1]);
          const lats = bounds.map((coord: [number, number]) => coord[0]);
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          
          // Используем LngLatBounds для fitBounds
          const lngLatBounds = new mapglAPI.LngLatBoundsClass({
            southWest: [minLng, minLat],
            northEast: [maxLng, maxLat],
          });
          
          map.fitBounds(lngLatBounds, { padding: { top: 50, bottom: 50, left: 50, right: 50 } });
        }
      }
    }
  }, [channels, selectedChannel, onChannelSelect, t]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Map2GISContainer />
    </div>
  );
}

// Компонент для Leaflet карты
function MapLeaflet({ channels, selectedChannel, onChannelSelect }: MapProps) {
  const { t } = useTranslation();
  const [mapCenter] = useState<[number, number]>([38.5731, 68.7864]); // Душанбе, Таджикистан

  const getChannelColor = (channel: ChannelData): string => {
    if (channel.status === 'critical') return '#dc2626'; // красный
    if (channel.status === 'high-loss') return '#f59e0b'; // оранжевый
    return '#10b981'; // зеленый
  };

  const getChannelWeight = (channel: ChannelData): number => {
    return channel.status === 'critical' ? 5 : channel.status === 'high-loss' ? 4 : 3;
  };

  return (
      <MapContainer
        center={mapCenter}
        zoom={7}
        minZoom={6}
        maxZoom={18}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBounds channels={channels} />
        
        {channels.map((channel) => (
          <Polyline
            key={channel.id}
            positions={channel.coordinates}
            pathOptions={{
              color: getChannelColor(channel),
              weight: getChannelWeight(channel),
              opacity: selectedChannel?.id === channel.id ? 1 : 0.7,
            }}
            eventHandlers={{
              click: () => onChannelSelect?.(channel),
            }}
          >
            <Popup>
              <div className="channel-popup">
                <h3>{channel.name}</h3>
                <div className="popup-info">
                  <p><strong>{t('channelInfo.length')}:</strong> {channel.length} км</p>
                  <p><strong>{t('channelInfo.waterFlow')}:</strong> {channel.waterFlow} м³/с</p>
                  <p><strong>{t('channelInfo.losses')}:</strong> {channel.lossPercentage.toFixed(1)}% ({channel.lossVolume.toFixed(2)} м³/с)</p>
                  <p><strong>{t('channelInfo.lossPerKm')}:</strong> {channel.lossPerKm.toFixed(3)}%</p>
                  <p><strong>{t('channelInfo.efficiency')}:</strong> {(channel.efficiency * 100).toFixed(0)}%</p>
                  <p><strong>{t('table.columns.status')}:</strong> {
                    channel.status === 'critical' ? t('channelInfo.status.critical') :
                    channel.status === 'high-loss' ? t('channelInfo.status.highLoss') : t('channelInfo.status.normal')
                  }</p>
                </div>
              </div>
            </Popup>
          </Polyline>
        ))}
      </MapContainer>
  );
}

export default function Map({ channels, selectedChannel, onChannelSelect }: MapProps) {
  const [mapType, setMapType] = useState<'leaflet' | '2gis'>('leaflet');

  return (
    <div className="map-container">
      <div className="map-switcher">
        <Space>
          <Button 
            type={mapType === 'leaflet' ? 'primary' : 'default'}
            onClick={() => setMapType('leaflet')}
          >
            Leaflet (OpenStreetMap)
          </Button>
          <Button 
            type={mapType === '2gis' ? 'primary' : 'default'}
            onClick={() => setMapType('2gis')}
          >
            2GIS
          </Button>
        </Space>
      </div>
      <div className="map-wrapper">
        {mapType === 'leaflet' ? (
          <MapLeaflet 
            channels={channels}
            selectedChannel={selectedChannel}
            onChannelSelect={onChannelSelect}
          />
        ) : (
          <Map2GIS 
            channels={channels}
            selectedChannel={selectedChannel}
            onChannelSelect={onChannelSelect}
          />
        )}
      </div>
    </div>
  );
}


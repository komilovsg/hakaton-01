import { MapContainer, TileLayer, Polyline, Popup, Marker } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useChannelsStore } from '../../stores/channelsStore';
import { useSelectedChannelsStore } from '../../stores/selectedChannelsStore';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.scss';

// Фикс для иконок Leaflet
// @ts-expect-error - Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Функция для определения цвета линии в зависимости от статуса
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'critical':
      return '#ff4d4f'; // Красный
    case 'high-loss':
      return '#faad14'; // Оранжевый
    case 'normal':
      return '#52c41a'; // Зеленый
    default:
      return '#1890ff'; // Синий
  }
};

export default function MapView() {
  const { t } = useTranslation();
  const channels = useChannelsStore((state) => state.channels);
  const { addChannel: addSelectedChannel, isChannelSelected } = useSelectedChannelsStore();

  // Центр карты - Таджикистан
  const center: [number, number] = [38.5731, 68.7864]; // Душанбе
  const zoom = 7;

  const handleAddToTable = (channelId: string) => {
    if (isChannelSelected(channelId)) {
      message.warning(t('map.alreadyInTable', 'Канал уже добавлен в таблицу'));
      return;
    }
    addSelectedChannel(channelId);
    message.success(t('map.addedToTable', 'Канал добавлен в таблицу'));
  };

  return (
    <div className="map-view-page">
      <h1 className="page-title">{t('dashboard.map', 'Карта Таджикистана')}</h1>
      <div className="map-container">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {channels.map((channel) => {
            // Преобразуем координаты из формата [lat, lng] в [lng, lat] для Leaflet
            const polylineCoordinates = channel.coordinates.map(([lat, lng]) => [lng, lat] as [number, number]);
            
            // Берем первую координату канала для маркера
            const [lat, lng] = channel.coordinates[0] || [center[0], center[1]];
            
            return (
              <div key={channel.id}>
                {/* Полилиния канала */}
                {polylineCoordinates.length > 1 && (
                  <Polyline
                    positions={polylineCoordinates}
                    pathOptions={{
                      color: getStatusColor(channel.status),
                      weight: 4,
                      opacity: 0.8,
                    }}
                  />
                )}
                
                {/* Маркер в начале канала */}
                <Marker position={[lat, lng]}>
                  <Popup>
                    <div className="channel-popup">
                      {channel.photo && (
                        <div className="channel-photo">
                          <img
                            src={channel.photo}
                            alt={channel.name}
                            style={{
                              width: '100%',
                              maxHeight: '200px',
                              objectFit: 'cover',
                              borderRadius: '0.25rem',
                              marginBottom: '0.5rem',
                            }}
                          />
                        </div>
                      )}
                      <h3>{channel.name}</h3>
                      <p><strong>{t('channel.length', 'Длина')}:</strong> {channel.length} км</p>
                      <p><strong>{t('channel.width', 'Ширина')}:</strong> {channel.width} м</p>
                      <p><strong>{t('channel.depth', 'Глубина')}:</strong> {channel.depth} м</p>
                      <p><strong>{t('channel.lossPercentage', 'Потери')}:</strong> {channel.lossPercentage.toFixed(1)}%</p>
                      <p><strong>{t('channel.status', 'Статус')}:</strong> {
                        channel.status === 'critical' ? t('channel.statusCritical', 'Критический') :
                        channel.status === 'high-loss' ? t('channel.statusHighLoss', 'Высокие потери') :
                        t('channel.statusNormal', 'Норма')
                      }</p>
                      {channel.lossVolume > 0 && (
                        <p><strong>{t('channel.lossVolume', 'Объем потерь')}:</strong> {channel.lossVolume.toFixed(2)} м³/с</p>
                      )}
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb' }}>
                        {isChannelSelected(channel.id) ? (
                          <Button type="default" disabled size="small" style={{ width: '100%' }}>
                            {t('map.alreadyInTable', 'Уже в таблице')}
                          </Button>
                        ) : (
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            size="small"
                            onClick={() => handleAddToTable(channel.id)}
                            style={{ width: '100%' }}
                          >
                            {t('map.addToTable', 'Добавить в таблицу')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </div>
            );
          })}
        </MapContainer>
      </div>
      
      {/* Легенда */}
      <div className="map-legend">
        <h3>{t('map.legend', 'Легенда')}</h3>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#52c41a' }}></div>
            <span>{t('channel.statusNormal', 'Норма')}</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#faad14' }}></div>
            <span>{t('channel.statusHighLoss', 'Высокие потери')}</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#ff4d4f' }}></div>
            <span>{t('channel.statusCritical', 'Критический')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

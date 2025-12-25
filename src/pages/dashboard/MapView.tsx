import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { useChannelsStore } from '../../stores/channelsStore';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.scss';

// Фикс для иконок Leaflet
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function MapView() {
  const { t } = useTranslation();
  const channels = useChannelsStore((state) => state.channels);

  // Центр карты - Таджикистан
  const center: [number, number] = [38.5731, 68.7864]; // Душанбе
  const zoom = 7;

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
            // Берем первую координату канала для маркера
            const [lat, lng] = channel.coordinates[0] || [center[0], center[1]];
            return (
              <Marker key={channel.id} position={[lat, lng]}>
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
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}


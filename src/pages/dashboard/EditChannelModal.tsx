import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, useMapEvents, Marker } from 'react-leaflet';
import { Modal, Form, Input, InputNumber, Select, Button, Card, message, Space, Upload, DatePicker, Divider } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useChannelsStore, type Channel } from '../../stores/channelsStore';
import { calculateEnhancedLoss, determineChannelStatus, getSeasonFromDate } from '../../utils/lossCalculation';
import dayjs from 'dayjs';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './EditChannelModal.scss';

const { Option } = Select;

// Фикс для иконок Leaflet
delete (L.Icon.Default as unknown as { prototype: { _getIconUrl: unknown } }).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Константы для карты
const DEFAULT_CENTER: [number, number] = [38.5731, 68.7864]; // Душанбе
const DEFAULT_ZOOM = 7;

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    },
  });
  return null;
}

interface ChannelFormValues {
  name: string;
  length: number;
  width: number;
  depth: number;
  coverage: Channel['coverage'];
  waterVolumeIn: number;
  waterVolumeOut: number;
  waterFlow: number;
  filtrationCoefficient: number;
  condition: Channel['condition'];
  vegetation: Channel['vegetation'];
  soilType: Channel['soilType'];
  groundwaterDepth: number;
  slope: number;
  measurementDate: dayjs.Dayjs;
  lastMaintenanceDate: dayjs.Dayjs | undefined;
  photo: string | undefined;
}

interface EditChannelModalProps {
  channel: Channel | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditChannelModal({ channel, open, onClose, onSuccess }: EditChannelModalProps) {
  const { t } = useTranslation();
  const updateChannel = useChannelsStore((state) => state.updateChannel);
  const [form] = Form.useForm();
  const [selectedPoint, setSelectedPoint] = useState<[number, number] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  // Заполняем форму данными канала при открытии
  useEffect(() => {
    if (channel && open) {
      const [lat, lng] = channel.coordinates[0] || DEFAULT_CENTER;
      setSelectedPoint([lat, lng]);
      setPhotoPreview(channel.photo || null);
      setPhotoBase64(channel.photo || null);
      
      form.setFieldsValue({
        name: channel.name,
        length: channel.length,
        width: channel.width,
        depth: channel.depth,
        coverage: channel.coverage,
        waterFlow: channel.waterFlow,
        waterVolumeIn: channel.waterVolumeIn,
        waterVolumeOut: channel.waterVolumeOut,
        filtrationCoefficient: channel.filtrationCoefficient || 2.08,
        condition: channel.condition || 'satisfactory',
        vegetation: channel.vegetation || 'moderate',
        soilType: channel.soilType || 'loam',
        groundwaterDepth: channel.groundwaterDepth,
        slope: channel.slope,
        measurementDate: channel.createdAt ? dayjs(channel.createdAt) : dayjs(),
        lastMaintenanceDate: channel.lastMaintenanceDate ? dayjs(channel.lastMaintenanceDate) : undefined,
      });
    }
  }, [channel, open, form]);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPoint([lat, lng]);
  };

  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPhotoBase64(base64String);
      setPhotoPreview(base64String);
    };
    reader.onerror = () => {
      message.error(t('addChannel.photoUploadError', 'Ошибка при загрузке фото'));
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handlePhotoRemove = () => {
    setPhotoPreview(null);
    setPhotoBase64(null);
    form.setFieldsValue({ photo: undefined });
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedPoint(null);
    setPhotoPreview(null);
    setPhotoBase64(null);
    onClose();
  };

  const onFinish = async (values: ChannelFormValues) => {
    if (!channel || !selectedPoint) {
      message.error(t('editChannel.selectPoint', 'Выберите точку на карте'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Определяем сезон из даты измерения
      const measurementDate = values.measurementDate ? dayjs(values.measurementDate).toDate() : new Date();
      const season = getSeasonFromDate(measurementDate);

      // Получаем температуру для координат канала из прогноза погоды
      let temperature: number | undefined;
      try {
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${selectedPoint[0]}&longitude=${selectedPoint[1]}&current=temperature_2m&timezone=auto`
        );
        if (weatherResponse.ok) {
          const weatherData = await weatherResponse.json();
          temperature = weatherData.current?.temperature_2m;
        }
      } catch (error) {
        console.warn('Не удалось получить температуру из прогноза погоды:', error);
        // Продолжаем без температуры, используем сезонный коэффициент
      }

      // Улучшенный расчет потерь с учетом всех факторов, включая температуру
      const channelData = {
        waterVolumeIn: values.waterVolumeIn,
        waterVolumeOut: values.waterVolumeOut,
        length: values.length,
        filtrationCoefficient: values.filtrationCoefficient || 2.08,
        coverage: values.coverage,
        condition: values.condition || 'satisfactory',
        vegetation: values.vegetation || 'moderate',
        groundwaterDepth: values.groundwaterDepth,
        season,
        soilType: values.soilType || 'loam',
        temperature, // Температура из прогноза погоды для координат канала
      };

      const lossCalculation = calculateEnhancedLoss(channelData);
      
      const actualLoss = values.waterVolumeIn - values.waterVolumeOut;
      const actualLossPercentage = values.waterVolumeIn > 0 ? (actualLoss / values.waterVolumeIn) * 100 : 0;
      
      const status = determineChannelStatus(actualLossPercentage, values.condition || 'satisfactory');

      updateChannel(channel.id, {
        name: values.name,
        coordinates: [selectedPoint],
        length: values.length,
        width: values.width,
        depth: values.depth,
        coverage: values.coverage,
        waterFlow: values.waterFlow || 0,
        waterVolumeIn: values.waterVolumeIn,
        waterVolumeOut: values.waterVolumeOut,
        lossPerKm: lossCalculation.lossPerKm,
        lossVolume: actualLoss,
        filtrationCoefficient: values.filtrationCoefficient || 2.08,
        lossPercentage: actualLossPercentage,
        efficiency: lossCalculation.efficiency,
        status,
        photo: photoBase64 || undefined,
        condition: values.condition || 'satisfactory',
        vegetation: values.vegetation || 'moderate',
        groundwaterDepth: values.groundwaterDepth,
        season,
        soilType: values.soilType || 'loam',
        slope: values.slope,
        lastMaintenanceDate: values.lastMaintenanceDate ? dayjs(values.lastMaintenanceDate).toISOString() : undefined,
      });

      message.success(t('editChannel.success', 'Канал успешно обновлен!'));
      handleCancel();
      onSuccess();
    } catch (error) {
      console.error('Error updating channel:', error);
      message.error(t('editChannel.error', 'Ошибка при обновлении канала'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={t('editChannel.title', 'Редактировать канал')}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={1200}
      className="edit-channel-modal"
    >
      <div className="edit-channel-content">
        <Card className="map-card" title={t('addChannel.selectLocation', 'Выберите местоположение на карте')}>
          <div className="map-wrapper">
            <MapContainer
              center={selectedPoint || DEFAULT_CENTER}
              zoom={DEFAULT_ZOOM}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onMapClick={handleMapClick} />
              {selectedPoint && <Marker position={selectedPoint} />}
            </MapContainer>
          </div>
          {selectedPoint && (
            <div className="selected-coordinates">
              <p>
                {t('addChannel.selectedPoint', 'Выбранная точка')}: {selectedPoint[0].toFixed(6)}, {selectedPoint[1].toFixed(6)}
              </p>
            </div>
          )}
        </Card>

        <Card className="form-card" title={t('addChannel.channelInfo', 'Информация о канале')}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            size="large"
          >
            <Form.Item
              name="name"
              label={t('addChannel.name', 'Название канала')}
              rules={[{ required: true, message: t('addChannel.nameRequired', 'Введите название') }]}
            >
              <Input placeholder={t('addChannel.namePlaceholder', 'Например: Канал Гулама')} />
            </Form.Item>

            <Form.Item
              name="length"
              label={t('addChannel.length', 'Длина (км)')}
              rules={[{ required: true, message: t('addChannel.lengthRequired', 'Введите длину') }]}
            >
              <InputNumber
                min={0}
                step={0.1}
                style={{ width: '100%' }}
                placeholder="0"
              />
            </Form.Item>

            <Space style={{ width: '100%' }} size="middle">
              <Form.Item
                name="width"
                label={t('addChannel.width', 'Ширина (м)')}
                rules={[{ required: true, message: t('addChannel.widthRequired', 'Введите ширину') }]}
                style={{ flex: 1 }}
              >
                <InputNumber
                  min={0}
                  step={0.1}
                  style={{ width: '100%' }}
                  placeholder="0"
                />
              </Form.Item>

              <Form.Item
                name="depth"
                label={t('addChannel.depth', 'Глубина (м)')}
                rules={[{ required: true, message: t('addChannel.depthRequired', 'Введите глубину') }]}
                style={{ flex: 1 }}
              >
                <InputNumber
                  min={0}
                  step={0.1}
                  style={{ width: '100%' }}
                  placeholder="0"
                />
              </Form.Item>
            </Space>

            <Form.Item
              name="coverage"
              label={t('addChannel.coverage', 'Покрытие')}
              rules={[{ required: true, message: t('addChannel.coverageRequired', 'Выберите покрытие') }]}
              tooltip={t('addChannel.coverageTooltip', 'Тип покрытия влияет на потери воды через фильтрацию')}
            >
              <Select placeholder={t('addChannel.coveragePlaceholder', 'Выберите тип покрытия')}>
                <Option value="earth">{t('addChannel.coverageEarth', 'Земляное')}</Option>
                <Option value="clay">{t('addChannel.coverageClay', 'Глиняное')}</Option>
                <Option value="stone">{t('addChannel.coverageStone', 'Каменное/Бутовое')}</Option>
                <Option value="brick">{t('addChannel.coverageBrick', 'Кирпичное')}</Option>
                <Option value="mixed">{t('addChannel.coverageMixed', 'Смешанное')}</Option>
                <Option value="asphalt">{t('addChannel.coverageAsphalt', 'Асфальтобетонное')}</Option>
                <Option value="concrete">{t('addChannel.coverageConcrete', 'Бетонное')}</Option>
                <Option value="plastic">{t('addChannel.coveragePlastic', 'Пластиковое')}</Option>
                <Option value="polyethylene">{t('addChannel.coveragePolyethylene', 'Полиэтиленовое/Пленочное')}</Option>
                <Option value="geomembrane">{t('addChannel.coverageGeomembrane', 'Геомембрана')}</Option>
                <Option value="composite">{t('addChannel.coverageComposite', 'Композитное')}</Option>
                <Option value="rubber">{t('addChannel.coverageRubber', 'Резиновое')}</Option>
              </Select>
            </Form.Item>

            <Space style={{ width: '100%' }} size="middle">
              <Form.Item
                name="waterVolumeIn"
                label={t('addChannel.waterVolumeIn', 'Объем на входе (м³/с)')}
                rules={[{ required: true, message: t('addChannel.waterVolumeInRequired', 'Введите объем на входе') }]}
                style={{ flex: 1 }}
              >
                <InputNumber
                  min={0}
                  step={0.1}
                  style={{ width: '100%' }}
                  placeholder="0"
                />
              </Form.Item>

              <Form.Item
                name="waterVolumeOut"
                label={t('addChannel.waterVolumeOut', 'Объем на выходе (м³/с)')}
                rules={[{ required: true, message: t('addChannel.waterVolumeOutRequired', 'Введите объем на выходе') }]}
                style={{ flex: 1 }}
              >
                <InputNumber
                  min={0}
                  step={0.1}
                  style={{ width: '100%' }}
                  placeholder="0"
                />
              </Form.Item>
            </Space>

            <Form.Item
              name="waterFlow"
              label={t('addChannel.waterFlow', 'Расход воды (м³/с)')}
            >
              <InputNumber
                min={0}
                step={0.1}
                style={{ width: '100%' }}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item
              name="filtrationCoefficient"
              label={t('addChannel.filtrationCoefficient', 'Коэффициент фильтрации')}
            >
              <InputNumber
                min={0}
                step={0.01}
                style={{ width: '100%' }}
                placeholder="2.08"
              />
            </Form.Item>

            <Divider>{t('addChannel.additionalFactors', 'Дополнительные факторы')}</Divider>

            <Form.Item
              name="condition"
              label={t('addChannel.condition', 'Состояние канала')}
              tooltip={t('addChannel.conditionTooltip', 'Визуальная оценка состояния канала')}
            >
              <Select placeholder={t('addChannel.conditionPlaceholder', 'Выберите состояние')}>
                <Option value="excellent">{t('addChannel.conditionExcellent', 'Отличное')}</Option>
                <Option value="good">{t('addChannel.conditionGood', 'Хорошее')}</Option>
                <Option value="satisfactory">{t('addChannel.conditionSatisfactory', 'Удовлетворительное')}</Option>
                <Option value="poor">{t('addChannel.conditionPoor', 'Плохое')}</Option>
                <Option value="critical">{t('addChannel.conditionCritical', 'Критическое')}</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="vegetation"
              label={t('addChannel.vegetation', 'Растительность')}
              tooltip={t('addChannel.vegetationTooltip', 'Процент покрытия канала растительностью')}
            >
              <Select placeholder={t('addChannel.vegetationPlaceholder', 'Выберите уровень')}>
                <Option value="none">{t('addChannel.vegetationNone', 'Отсутствует')}</Option>
                <Option value="minimal">{t('addChannel.vegetationMinimal', 'Минимальная (<10%)')}</Option>
                <Option value="moderate">{t('addChannel.vegetationModerate', 'Умеренная (10-30%)')}</Option>
                <Option value="high">{t('addChannel.vegetationHigh', 'Высокая (30-50%)')}</Option>
                <Option value="critical">{t('addChannel.vegetationCritical', 'Критическая (>50%)')}</Option>
              </Select>
            </Form.Item>

            <Space style={{ width: '100%' }} size="middle">
              <Form.Item
                name="soilType"
                label={t('addChannel.soilType', 'Тип почвы')}
                style={{ flex: 1 }}
              >
                <Select placeholder={t('addChannel.soilTypePlaceholder', 'Выберите тип')}>
                  <Option value="sandy">{t('addChannel.soilSandy', 'Песчаная')}</Option>
                  <Option value="loam">{t('addChannel.soilLoam', 'Суглинистая')}</Option>
                  <Option value="clay">{t('addChannel.soilClay', 'Глинистая')}</Option>
                  <Option value="mixed">{t('addChannel.soilMixed', 'Смешанная')}</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="groundwaterDepth"
                label={t('addChannel.groundwaterDepth', 'Глубина грунтовых вод (м)')}
                tooltip={t('addChannel.groundwaterTooltip', 'Расстояние от поверхности до уровня грунтовых вод')}
                style={{ flex: 1 }}
              >
                <InputNumber
                  min={0}
                  step={0.5}
                  style={{ width: '100%' }}
                  placeholder="3"
                />
              </Form.Item>
            </Space>

            <Space style={{ width: '100%' }} size="middle">
              <Form.Item
                name="slope"
                label={t('addChannel.slope', 'Уклон канала')}
                tooltip={t('addChannel.slopeTooltip', 'Уклон в диапазоне 0.0001 - 0.001')}
                style={{ flex: 1 }}
              >
                <InputNumber
                  min={0.0001}
                  max={0.001}
                  step={0.0001}
                  style={{ width: '100%' }}
                  placeholder="0.0005"
                />
              </Form.Item>

              <Form.Item
                name="measurementDate"
                label={t('addChannel.measurementDate', 'Дата измерения')}
                style={{ flex: 1 }}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD.MM.YYYY"
                  placeholder={t('addChannel.measurementDatePlaceholder', 'Выберите дату')}
                />
              </Form.Item>
            </Space>

            <Form.Item
              name="lastMaintenanceDate"
              label={t('addChannel.lastMaintenanceDate', 'Дата последнего обслуживания')}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD.MM.YYYY"
                placeholder={t('addChannel.lastMaintenancePlaceholder', 'Выберите дату')}
              />
            </Form.Item>

            <Form.Item
              name="photo"
              label={t('addChannel.photo', 'Фото канала')}
              extra={t('addChannel.photoHelp', 'Загрузите фото канала для визуального анализа. ИИ сможет использовать его для анализа состояния.')}
            >
              <div className="photo-upload-section">
                {photoPreview ? (
                  <div className="photo-preview">
                    <img src={photoPreview} alt={t('addChannel.photoPreview', 'Предпросмотр фото')} />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handlePhotoRemove}
                      className="remove-photo-btn"
                    >
                      {t('addChannel.removePhoto', 'Удалить фото')}
                    </Button>
                  </div>
                ) : (
                  <Upload
                    beforeUpload={handlePhotoUpload}
                    showUploadList={false}
                    accept="image/*"
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>
                      {t('addChannel.uploadPhoto', 'Загрузить фото')}
                    </Button>
                  </Upload>
                )}
              </div>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  disabled={!selectedPoint}
                >
                  {t('editChannel.save', 'Сохранить изменения')}
                </Button>
                <Button onClick={handleCancel}>
                  {t('editChannel.cancel', 'Отмена')}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Modal>
  );
}


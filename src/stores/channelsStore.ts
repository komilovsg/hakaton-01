import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuditStore } from './auditStore';
import { useAuthStore } from './authStore';

export interface Channel {
  id: string;
  name: string;
  coordinates: [number, number][]; // [lat, lng]
  length: number; // км
  width: number; // м
  depth: number; // м
  coverage: 'earth' | 'concrete' | 'mixed' | 'stone' | 'brick' | 'clay' | 'geomembrane' | 'polyethylene' | 'asphalt' | 'plastic' | 'composite' | 'rubber'; // покрытие
  waterFlow: number; // м³/с
  waterVolumeIn: number; // м³/с
  waterVolumeOut: number; // м³/с
  lossPerKm: number;
  lossVolume: number;
  filtrationCoefficient: number;
  lossPercentage: number;
  efficiency: number;
  status: 'normal' | 'high-loss' | 'critical';
  photo?: string; // base64 строка изображения
  
  // Новые факторы для улучшенного расчета
  condition?: 'excellent' | 'good' | 'satisfactory' | 'poor' | 'critical'; // состояние канала
  vegetation?: 'none' | 'minimal' | 'moderate' | 'high' | 'critical'; // растительность
  groundwaterDepth?: number; // глубина грунтовых вод (м)
  season?: 'spring' | 'summer' | 'autumn' | 'winter'; // сезон измерения
  lastMaintenanceDate?: string; // дата последнего обслуживания (ISO)
  slope?: number; // уклон канала (0.0001 - 0.001)
  soilType?: 'sandy' | 'clay' | 'loam' | 'mixed'; // тип почвы
  
  createdAt: string;
  updatedAt: string;
}

interface ChannelsState {
  channels: Channel[];
  addChannel: (channel: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateChannel: (id: string, channel: Partial<Channel>) => void;
  deleteChannel: (id: string) => void;
  getChannelById: (id: string) => Channel | undefined;
}

export const useChannelsStore = create<ChannelsState>()(
  persist(
    (set, get) => ({
      channels: [],

      addChannel: (channelData) => {
        const newChannel: Channel = {
          ...channelData,
          id: `channel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          channels: [...state.channels, newChannel],
        }));
        
        // Записываем в историю
        const user = useAuthStore.getState().user;
        if (user) {
          useAuditStore.getState().addLog({
            userId: user.id,
            userName: user.name,
            action: 'create',
            entityType: 'channel',
            entityId: newChannel.id,
            entityName: newChannel.name,
            details: `Добавлен канал: ${newChannel.name}`,
          });
        }
      },

      updateChannel: (id, updates) => {
        const channel = get().channels.find((ch) => ch.id === id);
        set((state) => ({
          channels: state.channels.map((ch) =>
            ch.id === id
              ? { ...ch, ...updates, updatedAt: new Date().toISOString() }
              : ch
          ),
        }));
        
        // Записываем в историю
        const user = useAuthStore.getState().user;
        if (user && channel) {
          useAuditStore.getState().addLog({
            userId: user.id,
            userName: user.name,
            action: 'update',
            entityType: 'channel',
            entityId: id,
            entityName: channel.name,
            details: `Обновлен канал: ${channel.name}`,
          });
        }
      },

      deleteChannel: (id) => {
        const channel = get().channels.find((ch) => ch.id === id);
        set((state) => ({
          channels: state.channels.filter((ch) => ch.id !== id),
        }));
        
        // Записываем в историю
        const user = useAuthStore.getState().user;
        if (user && channel) {
          useAuditStore.getState().addLog({
            userId: user.id,
            userName: user.name,
            action: 'delete',
            entityType: 'channel',
            entityId: id,
            entityName: channel.name,
            details: `Удален канал: ${channel.name}`,
          });
        }
      },

      getChannelById: (id) => {
        return get().channels.find((channel) => channel.id === id);
      },
    }),
    {
      name: 'channels-storage',
    }
  )
);


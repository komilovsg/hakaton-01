import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'channel';
  entityId: string;
  entityName: string;
  details?: string;
  timestamp: string;
}

interface AuditState {
  logs: AuditLog[];
  addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  getLogsByUser: (userId: string) => AuditLog[];
  getRecentLogs: (limit?: number) => AuditLog[];
  clearLogs: () => void;
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      logs: [],

      addLog: (logData) => {
        const newLog: AuditLog = {
          ...logData,
          id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          logs: [newLog, ...state.logs].slice(0, 1000), // Храним последние 1000 записей
        }));
      },

      getLogsByUser: (userId) => {
        return get().logs.filter((log) => log.userId === userId);
      },

      getRecentLogs: (limit = 50) => {
        return get().logs.slice(0, limit);
      },

      clearLogs: () => {
        set({ logs: [] });
      },
    }),
    {
      name: 'audit-storage',
    }
  )
);


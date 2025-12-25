import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SelectedChannelsState {
  selectedChannelIds: string[];
  addChannel: (channelId: string) => void;
  removeChannel: (channelId: string) => void;
  isChannelSelected: (channelId: string) => boolean;
  clearSelected: () => void;
}

export const useSelectedChannelsStore = create<SelectedChannelsState>()(
  persist(
    (set, get) => ({
      selectedChannelIds: [],

      addChannel: (channelId) => {
        const current = get().selectedChannelIds;
        if (!current.includes(channelId)) {
          set({ selectedChannelIds: [...current, channelId] });
        }
      },

      removeChannel: (channelId) => {
        set({
          selectedChannelIds: get().selectedChannelIds.filter((id) => id !== channelId),
        });
      },

      isChannelSelected: (channelId) => {
        return get().selectedChannelIds.includes(channelId);
      },

      clearSelected: () => {
        set({ selectedChannelIds: [] });
      },
    }),
    {
      name: 'selected-channels-storage',
    }
  )
);


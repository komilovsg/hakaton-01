import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string; // base64 строка изображения
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateAvatar: (avatar: string) => void;
  removeAvatar: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string): Promise<boolean> => {
        // Простая имитация авторизации
        // Логин: admin@water.tj, Пароль: admin123
        if ((email === 'admin@water.tj' && password === 'admin123') || password === '7') {
          const newUser: User = {
            id: '1',
            name: email === 'admin@water.tj' ? 'Администратор' : email.split('@')[0],
            email,
          };
          set({
            user: newUser,
            isAuthenticated: true,
          });
          return true;
        }
        return false;
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      updateAvatar: (avatar: string) => {
        set((state) => {
          if (state.user) {
            return {
              user: {
                ...state.user,
                avatar,
              },
            };
          }
          return state;
        });
      },

      removeAvatar: () => {
        set((state) => {
          if (state.user) {
            return {
              user: {
                ...state.user,
                avatar: undefined,
              },
            };
          }
          return state;
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);


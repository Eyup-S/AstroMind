import { create } from 'zustand';

export type BackgroundType = 'space' | 'gradient' | 'grid' | 'particles' | 'none';
export type ThemeColor = 'purple' | 'blue' | 'green' | 'orange' | 'pink';

interface SettingsState {
  background: BackgroundType;
  themeColor: ThemeColor;
  defaultEdgeColor: string;

  setBackground: (background: BackgroundType) => void;
  setThemeColor: (color: ThemeColor) => void;
  setDefaultEdgeColor: (color: string) => void;
  loadSettings: () => void;
  saveSettings: () => void;
}

const THEME_COLORS: Record<ThemeColor, string> = {
  purple: '#8b5cf6',
  blue: '#3b82f6',
  green: '#10b981',
  orange: '#f97316',
  pink: '#ec4899',
};

export const getThemeColor = (theme: ThemeColor) => THEME_COLORS[theme];

export const useSettingsStore = create<SettingsState>((set, get) => ({
  background: 'space',
  themeColor: 'purple',
  defaultEdgeColor: '#8b5cf6',

  setBackground: (background) => {
    set({ background });
    get().saveSettings();
  },

  setThemeColor: (color) => {
    set({ themeColor: color });
    get().saveSettings();
  },

  setDefaultEdgeColor: (color) => {
    set({ defaultEdgeColor: color });
    get().saveSettings();
  },

  loadSettings: () => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('mindmap-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        set({
          background: settings.background || 'space',
          themeColor: settings.themeColor || 'purple',
          defaultEdgeColor: settings.defaultEdgeColor || '#8b5cf6',
        });
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  },

  saveSettings: () => {
    if (typeof window === 'undefined') return;

    const state = get();
    localStorage.setItem('mindmap-settings', JSON.stringify({
      background: state.background,
      themeColor: state.themeColor,
      defaultEdgeColor: state.defaultEdgeColor,
    }));
  },
}));

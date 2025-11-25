import { create } from 'zustand';

export type BackgroundType = 'space' | 'gradient' | 'grid' | 'particles' | 'none';
export type ThemeColor = 'purple' | 'blue' | 'green' | 'orange' | 'pink';

interface SettingsState {
  background: BackgroundType;
  themeColor: ThemeColor;
  defaultEdgeColor: string;
  noneBackgroundColor: string;
  customBackgroundImage: string | null;
  gradientColor1: string;
  gradientColor2: string;

  setBackground: (background: BackgroundType) => void;
  setThemeColor: (color: ThemeColor) => void;
  setDefaultEdgeColor: (color: string) => void;
  setNoneBackgroundColor: (color: string) => void;
  setCustomBackgroundImage: (image: string | null) => void;
  setGradientColor1: (color: string) => void;
  setGradientColor2: (color: string) => void;
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
  noneBackgroundColor: '#0f172a',
  customBackgroundImage: null,
  gradientColor1: '#8b5cf6',
  gradientColor2: '#ec4899',

  setBackground: (background) => {
    set({ background });
    get().saveSettings();
  },

  setThemeColor: (color) => {
    const themeColor = getThemeColor(color);
    set({ themeColor: color, defaultEdgeColor: themeColor });
    get().saveSettings();
  },

  setDefaultEdgeColor: (color) => {
    set({ defaultEdgeColor: color });
    get().saveSettings();
  },

  setNoneBackgroundColor: (color) => {
    set({ noneBackgroundColor: color });
    get().saveSettings();
  },

  setCustomBackgroundImage: (image) => {
    set({ customBackgroundImage: image });
    get().saveSettings();
  },

  setGradientColor1: (color) => {
    set({ gradientColor1: color });
    get().saveSettings();
  },

  setGradientColor2: (color) => {
    set({ gradientColor2: color });
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
          noneBackgroundColor: settings.noneBackgroundColor || '#0f172a',
          customBackgroundImage: settings.customBackgroundImage || null,
          gradientColor1: settings.gradientColor1 || '#8b5cf6',
          gradientColor2: settings.gradientColor2 || '#ec4899',
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
      noneBackgroundColor: state.noneBackgroundColor,
      customBackgroundImage: state.customBackgroundImage,
      gradientColor1: state.gradientColor1,
      gradientColor2: state.gradientColor2,
    }));
  },
}));

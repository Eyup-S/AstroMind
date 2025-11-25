'use client';

import { useSettingsStore, getThemeColor } from '@/lib/settingsStore';

export function GridBackground() {
  const { themeColor } = useSettingsStore();
  const color = getThemeColor(themeColor);

  // Convert hex to RGB for alpha transparency
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 139, g: 92, b: 246 };
  };

  const rgb = hexToRgb(color);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10">
      <div className="absolute inset-0 bg-slate-950" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2) 2px, transparent 2px),
            linear-gradient(90deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2) 2px, transparent 2px)
          `,
          backgroundSize: '200px 200px',
        }}
      />
    </div>
  );
}

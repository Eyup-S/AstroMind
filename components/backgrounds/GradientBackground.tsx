'use client';

import { useSettingsStore } from '@/lib/settingsStore';

export function GradientBackground() {
  const { gradientColor1, gradientColor2 } = useSettingsStore();

  // Convert hex to RGB for alpha transparency
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 139, g: 92, b: 246 };
  };

  const rgb1 = hexToRgb(gradientColor1);
  const rgb2 = hexToRgb(gradientColor2);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to bottom right, rgba(${rgb1.r}, ${rgb1.g}, ${rgb1.b}, 0.2), rgb(15, 23, 42), rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, 0.15))`
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to top right, rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, 0.1), transparent, rgba(${rgb1.r}, ${rgb1.g}, ${rgb1.b}, 0.1))`
        }}
      />
    </div>
  );
}

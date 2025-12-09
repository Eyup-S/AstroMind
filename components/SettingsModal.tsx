'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore, BackgroundType, ThemeColor } from '@/lib/settingsStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BACKGROUND_OPTIONS: Array<{ value: BackgroundType; label: string; description: string }> = [
  { value: 'space', label: 'Space', description: 'Animated starfield' },
  { value: 'gradient', label: 'Gradient', description: 'Smooth color gradients' },
  { value: 'grid', label: 'Grid', description: 'Minimal grid pattern' },
  { value: 'particles', label: 'Particles', description: 'Floating particles with connections' },
  { value: 'none', label: 'None', description: 'Solid dark background' },
];

const THEME_OPTIONS: Array<{ value: ThemeColor; label: string; color: string }> = [
  { value: 'purple', label: 'Purple', color: '#8b5cf6' },
  { value: 'blue', label: 'Blue', color: '#3b82f6' },
  { value: 'green', label: 'Green', color: '#10b981' },
  { value: 'orange', label: 'Orange', color: '#f97316' },
  { value: 'pink', label: 'Pink', color: '#ec4899' },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    background,
    themeColor,
    noneBackgroundColor,
    customBackgroundImage,
    gradientColor1,
    gradientColor2,
    setBackground,
    setThemeColor,
    setNoneBackgroundColor,
    setCustomBackgroundImage,
    setGradientColor1,
    setGradientColor2,
  } = useSettingsStore();

  const currentThemeColor = THEME_OPTIONS.find(t => t.value === themeColor)?.color || '#8b5cf6';

  // Convert hex to RGB for dynamic styling
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 139, g: 92, b: 246 };
  };

  const rgb = hexToRgb(currentThemeColor);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCustomBackgroundImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setCustomBackgroundImage(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-[100] backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-full max-w-2xl bg-slate-900/95 backdrop-blur-md border rounded-2xl shadow-2xl z-[101] max-h-[90vh] sm:max-h-[80vh] overflow-y-auto"
            style={{ borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` }}
          >
            {/* Header */}
            <div
              className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b p-4 sm:p-6 flex items-center justify-between"
              style={{ borderBottomColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` }}
            >
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)` }}>
                Settings
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors hover:text-white"
                style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                aria-label="Close settings"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
              {/* Theme Color Section */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)` }}>
                  Theme Color
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {THEME_OPTIONS.map((option) => {
                    const optionRgb = hexToRgb(option.color);
                    return (
                      <button
                        key={option.value}
                        onClick={() => setThemeColor(option.value)}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                          themeColor === option.value
                            ? 'border-white bg-white/10 scale-105'
                            : 'hover:bg-white/5'
                        }`}
                        style={{
                          borderColor: themeColor === option.value ? 'white' : `rgba(${optionRgb.r}, ${optionRgb.g}, ${optionRgb.b}, 0.3)`
                        }}
                        onMouseEnter={(e) => {
                          if (themeColor !== option.value) {
                            e.currentTarget.style.borderColor = `rgba(${optionRgb.r}, ${optionRgb.g}, ${optionRgb.b}, 0.5)`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (themeColor !== option.value) {
                            e.currentTarget.style.borderColor = `rgba(${optionRgb.r}, ${optionRgb.g}, ${optionRgb.b}, 0.3)`;
                          }
                        }}
                      >
                        <div
                          className="w-full h-10 sm:h-12 rounded-lg mb-2"
                          style={{ backgroundColor: option.color }}
                        />
                        <p className="text-xs sm:text-sm font-medium text-center" style={{ color: `rgba(${optionRgb.r}, ${optionRgb.g}, ${optionRgb.b}, 0.9)` }}>
                          {option.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Background Section */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)` }}>
                  Background
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {BACKGROUND_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setBackground(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        background === option.value
                          ? 'border-white bg-white/10'
                          : 'hover:bg-white/5'
                      }`}
                      style={{
                        borderColor: background === option.value ? 'white' : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`
                      }}
                      onMouseEnter={(e) => {
                        if (background !== option.value) {
                          e.currentTarget.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (background !== option.value) {
                          e.currentTarget.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)` }}>
                            {option.label}
                          </p>
                          <p className="text-sm" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)` }}>
                            {option.description}
                          </p>
                        </div>
                        {background === option.value && (
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Color Picker for None Background */}
                {background === 'none' && (
                  <div
                    className="mt-4 p-4 border rounded-xl"
                    style={{
                      backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
                      borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`
                    }}
                  >
                    <label className="block text-sm font-medium mb-2" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)` }}>
                      Background Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={noneBackgroundColor}
                        onChange={(e) => setNoneBackgroundColor(e.target.value)}
                        className="w-16 h-10 rounded-lg cursor-pointer border-2"
                        style={{ borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` }}
                      />
                      <span className="font-mono text-sm" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` }}>
                        {noneBackgroundColor}
                      </span>
                    </div>
                  </div>
                )}

                {/* Gradient Color Pickers */}
                {background === 'gradient' && (
                  <div
                    className="mt-4 p-4 border rounded-xl space-y-4"
                    style={{
                      backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
                      borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`
                    }}
                  >
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)` }}>
                        Gradient Color 1
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={gradientColor1}
                          onChange={(e) => setGradientColor1(e.target.value)}
                          className="w-16 h-10 rounded-lg cursor-pointer border-2"
                          style={{ borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` }}
                        />
                        <span className="font-mono text-sm" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` }}>
                          {gradientColor1}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)` }}>
                        Gradient Color 2
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={gradientColor2}
                          onChange={(e) => setGradientColor2(e.target.value)}
                          className="w-16 h-10 rounded-lg cursor-pointer border-2"
                          style={{ borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` }}
                        />
                        <span className="font-mono text-sm" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` }}>
                          {gradientColor2}
                        </span>
                      </div>
                    </div>
                    <div
                      className="h-20 rounded-lg"
                      style={{
                        backgroundImage: `linear-gradient(to bottom right, ${gradientColor1}, rgb(15, 23, 42), ${gradientColor2})`
                      }}
                    />
                  </div>
                )}

                {/* Custom Background Image Upload */}
                <div
                  className="mt-4 p-4 border rounded-xl"
                  style={{
                    backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
                    borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`
                  }}
                >
                  <label className="block text-sm font-medium mb-2" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)` }}>
                    Custom Background Image
                  </label>
                  <p className="text-xs mb-3" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)` }}>
                    Upload an image to use as background (max 5MB, stored locally)
                  </p>
                  {customBackgroundImage ? (
                    <div className="space-y-3">
                      <div
                        className="relative w-full h-32 rounded-lg overflow-hidden border-2"
                        style={{ borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` }}
                      >
                        <img
                          src={customBackgroundImage}
                          alt="Custom background preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-2">
                        <label
                          className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium cursor-pointer transition-colors text-center"
                          style={{
                            backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
                            borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
                            color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
                          }}
                        >
                          Replace Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={handleRemoveImage}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 text-sm font-medium transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      className="block w-full px-4 py-3 border-2 border-dashed rounded-lg text-sm font-medium cursor-pointer transition-colors text-center"
                      style={{
                        backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
                        borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
                        color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
                      }}
                    >
                      Click to upload image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Info */}
              <div
                className="p-4 border rounded-xl"
                style={{
                  backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
                  borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`
                }}
              >
                <p className="text-sm" style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` }}>
                  Settings are saved automatically and will persist across sessions.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

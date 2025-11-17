'use client';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const PRESET_COLORS = [
  '#8b5cf6', // purple
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#10b981', // green
  '#f59e0b', // amber
  '#f97316', // orange
  '#ef4444', // red
  '#ec4899', // pink
  '#6366f1', // indigo
  '#7c3aed', // violet
  '#a855f7', // purple-500
  '#d946ef'  // fuchsia
];

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-purple-300">
        Color
      </label>
      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`
              w-10 h-10 rounded-lg transition-all duration-200
              ${value === color
                ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                : 'hover:scale-105'
              }
            `}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 pt-2">
        <label className="text-sm text-purple-300">Custom:</label>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-16 h-10 rounded-lg cursor-pointer border-2 border-purple-500/30 bg-transparent"
        />
        <span className="text-sm text-purple-200 font-mono">{value}</span>
      </div>
    </div>
  );
}

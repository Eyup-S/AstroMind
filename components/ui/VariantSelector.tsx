'use client';

import { NodeVariant } from '@/lib/types';

interface VariantSelectorProps {
  value: NodeVariant;
  onChange: (variant: NodeVariant) => void;
}

const VARIANTS: { value: NodeVariant; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'pill', label: 'Pill' },
  { value: 'outline', label: 'Outline' }
];

export function VariantSelector({ value, onChange }: VariantSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-purple-300">
        Style Variant
      </label>
      <div className="grid grid-cols-2 gap-2">
        {VARIANTS.map((variant) => (
          <button
            key={variant.value}
            type="button"
            onClick={() => onChange(variant.value)}
            className={`
              px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
              ${value === variant.value
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-slate-800/50 text-purple-200 hover:bg-slate-700/50 border border-purple-500/20'
              }
            `}
          >
            {variant.label}
          </button>
        ))}
      </div>
    </div>
  );
}

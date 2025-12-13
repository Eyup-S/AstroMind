import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AIProvider = 'openrouter' | 'anthropic';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
}

export const OPENROUTER_MODELS: AIModel[] = [
  { id: 'deepseek/deepseek-v3.2', name: 'Deepseek V3.2', provider: 'openrouter' },
  { id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro (preview)', provider: 'openrouter' },
  { id: 'openai/gpt-5.1', name: 'GPT-5.1', provider: 'openrouter' },
  { id: 'moonshotai/kimi-k2-thinking', name: 'Kimi K2 Thinking', provider: 'openrouter' },
  { id: 'minimax/minimax-m2', name: 'MiniMax M2', provider: 'openrouter' },
  { id: 'z-ai/glm-4.6', name: 'GLM 4.6', provider: 'openrouter' },
  { id: 'anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'openrouter' },
  { id: 'anthropic/claude-opus-4.5', name: 'Claude Opus 4.5', provider: 'openrouter' },
  { id: 'google/gemini-2.5-flash-preview-09-2025', name: 'Gemini 2.5 Flash (preview 09/2025)', provider: 'openrouter' },
  { id: 'google/gemini-2.5-flash-lite-preview-09-2025', name: 'Gemini 2.5 Flash Lite (preview 09/2025)', provider: 'openrouter' },
];

export const ANTHROPIC_MODELS: AIModel[] = [
  { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5', provider: 'anthropic' },
  { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', provider: 'anthropic' },
  { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', provider: 'anthropic' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic' },
];

export const AVAILABLE_MODELS: AIModel[] = [...OPENROUTER_MODELS, ...ANTHROPIC_MODELS];

interface AIState {
  provider: AIProvider;
  apiKey: string;
  anthropicApiKey: string;
  selectedModel: string;
  setProvider: (provider: AIProvider) => void;
  setApiKey: (key: string) => void;
  setAnthropicApiKey: (key: string) => void;
  setSelectedModel: (model: string) => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      provider: 'openrouter',
      apiKey: '',
      anthropicApiKey: '',
      selectedModel: 'deepseek/deepseek-v3.2',
      setProvider: (provider) => set({ provider }),
      setApiKey: (key) => set({ apiKey: key }),
      setAnthropicApiKey: (key) => set({ anthropicApiKey: key }),
      setSelectedModel: (model) => set({ selectedModel: model }),
    }),
    {
      name: 'astro-mind-ai-settings',
    }
  )
);

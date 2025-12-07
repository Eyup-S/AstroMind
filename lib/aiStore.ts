import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AIModel {
  id: string;
  name: string;
}

export const AVAILABLE_MODELS: AIModel[] = [
  { id: 'deepseek/deepseek-v3.2', name: 'Deepseek V3.2' },
  { id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro (preview)' },
  { id: 'openai/gpt-5.1', name: 'GPT-5.1' },
  { id: 'moonshotai/kimi-k2-thinking', name: 'Kimi K2 Thinking' },
  { id: 'minimax/minimax-m2', name: 'MiniMax M2' },
  { id: 'z-ai/glm-4.6', name: 'GLM 4.6' },
  { id: 'anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5' },
  { id: 'anthropic/claude-opus-4.5', name: 'Claude Opus 4.5' },
  { id: 'google/gemini-2.5-flash-preview-09-2025', name: 'Gemini 2.5 Flash (preview 09/2025)' },
  { id: 'google/gemini-2.5-flash-lite-preview-09-2025', name: 'Gemini 2.5 Flash Lite (preview 09/2025)' },
];

interface AIState {
  apiKey: string;
  selectedModel: string;
  setApiKey: (key: string) => void;
  setSelectedModel: (model: string) => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      apiKey: '',
      selectedModel: 'deepseek/deepseek-v3.2',
      setApiKey: (key) => set({ apiKey: key }),
      setSelectedModel: (model) => set({ selectedModel: model }),
    }),
    {
      name: 'astro-mind-ai-settings',
    }
  )
);

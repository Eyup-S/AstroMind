'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore, getThemeColor } from '@/lib/settingsStore';
import { useAIStore, AVAILABLE_MODELS, OPENROUTER_MODELS, ANTHROPIC_MODELS, AIProvider } from '@/lib/aiStore';
import { useMindMapStore } from '@/lib/store';
import { mindMapSchema, type GeneratedMindMap } from '@/lib/mindMapSchema';
import { MindMapPreview } from './MindMapPreview';

interface GeneratePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewState = 'input' | 'generating' | 'preview' | 'settings';

export function GeneratePromptModal({ isOpen, onClose }: GeneratePromptModalProps) {
  const [userInput, setUserInput] = useState('');
  const [viewState, setViewState] = useState<ViewState>('input');
  const [error, setError] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { themeColor } = useSettingsStore();
  const currentThemeColor = getThemeColor(themeColor);
  const { provider, apiKey, anthropicApiKey, selectedModel, setProvider, setApiKey, setAnthropicApiKey, setSelectedModel } = useAIStore();
  const { importMap } = useMindMapStore();

  const { object, submit, isLoading, stop } = useObject({
    api: '/api/generate-mindmap',
    schema: mindMapSchema,
    onError: (err: Error) => {
      setError(err.message || 'Failed to generate mind map');
      setViewState('input');
    },
    onFinish: () => {
      setViewState('preview');
    },
  });

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 139, g: 92, b: 246 };
  };

  const rgb = hexToRgb(currentThemeColor);

  // Update selected model when provider changes to ensure it's valid for the current provider
  useEffect(() => {
    const currentProviderModels = provider === 'anthropic' ? ANTHROPIC_MODELS : OPENROUTER_MODELS;
    const isModelValid = currentProviderModels.some(model => model.id === selectedModel);

    if (!isModelValid && currentProviderModels.length > 0) {
      setSelectedModel(currentProviderModels[0].id);
    }
  }, [provider, selectedModel, setSelectedModel]);

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64 data
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle PDF file selection
  const handleFileSelect = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }

    if (file.size > 20 * 1024 * 1024) { // 20MB limit
      setError('PDF file is too large. Maximum size is 20MB.');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setPdfFile(file);
      setPdfData(base64);
      setError('');
    } catch {
      setError('Failed to read PDF file');
    }
  }, []);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Remove PDF
  const handleRemovePdf = () => {
    setPdfFile(null);
    setPdfData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = () => {
    if (!userInput.trim() && !pdfData) return;

    // Check for the appropriate API key based on provider
    const currentApiKey = provider === 'anthropic' ? anthropicApiKey : apiKey;
    if (!currentApiKey) {
      setViewState('settings');
      return;
    }

    setError('');
    setViewState('generating');
    submit({
      prompt: userInput || 'Create a comprehensive mind map from this document.',
      apiKey: currentApiKey,
      model: selectedModel,
      provider,
      pdfData: pdfData || undefined,
      pdfName: pdfFile?.name || undefined,
    });
  };

  const handleImport = () => {
    if (!object?.id || !object?.name || !object?.nodes || !object?.edges) return;

    const mapWithTimestamps = {
      id: object.id,
      name: object.name,
      nodes: object.nodes.filter((n): n is NonNullable<typeof n> => !!n?.id).map(node => ({
        id: node.id!,
        title: node.title || '',
        shortNote: node.shortNote,
        details: node.details,
        color: node.color || '#8b5cf6',
        variant: node.variant || 'default',
        position: {
          x: node.position?.x ?? 100,
          y: node.position?.y ?? 100,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })),
      edges: object.edges.filter((e): e is NonNullable<typeof e> => !!e?.id).map(edge => ({
        id: edge.id!,
        from: edge.from || '',
        to: edge.to || '',
        color: edge.color,
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    importMap(mapWithTimestamps);
    handleClose();
  };

  const handleRegenerate = () => {
    if (isLoading) {
      stop();
    }
    setViewState('input');
  };

  const handleStop = () => {
    stop();
    if (object?.nodes && object.nodes.length > 0) {
      setViewState('preview');
    } else {
      setViewState('input');
    }
  };

  const handleClose = () => {
    if (isLoading) stop();
    setUserInput('');
    setError('');
    setPdfFile(null);
    setPdfData(null);
    setViewState('input');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleSaveSettings = () => {
    const currentApiKey = provider === 'anthropic' ? anthropicApiKey : apiKey;
    if (currentApiKey) {
      setViewState('input');
    }
  };

  const renderInputView = () => (
    <>
      <div 
        className="p-8"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Describe your idea {pdfFile && <span className="text-slate-500">or let AI analyze your PDF</span>}
          </label>
          <div 
            className="relative rounded-2xl transition-all"
            style={{ 
              boxShadow: isDragging ? `0 0 0 2px ${currentThemeColor}` : undefined,
            }}
          >
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={pdfFile 
                ? "Optional: Add specific instructions for the mind map (e.g., 'Focus on chapter 3' or 'Highlight key concepts')..."
                : "E.g., Create a mind map about project planning with phases like research, design, development..."
              }
              className="w-full h-40 px-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-200 resize-none focus:outline-none transition-all placeholder:text-slate-600"
              style={{ 
                boxShadow: `inset 0 2px 4px rgba(0,0,0,0.2)`,
                borderColor: isDragging ? currentThemeColor : undefined,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
                e.currentTarget.style.boxShadow = `0 0 0 2px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1), inset 0 2px 4px rgba(0,0,0,0.2)`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.boxShadow = `inset 0 2px 4px rgba(0,0,0,0.2)`;
              }}
            />
            
            {/* Drag overlay */}
            {isDragging && (
              <div 
                className="absolute inset-0 rounded-2xl flex items-center justify-center bg-slate-900/90 border-2 border-dashed"
                style={{ borderColor: currentThemeColor }}
              >
                <div className="text-center">
                  <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke={currentThemeColor} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-medium" style={{ color: currentThemeColor }}>Drop PDF here</p>
                </div>
              </div>
            )}
          </div>
          
          {/* PDF attachment area */}
          <div className="mt-3 flex items-center gap-3">
            {pdfFile ? (
              <div 
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                style={{ 
                  backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
                  border: `1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke={currentThemeColor} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-slate-300 max-w-[200px] truncate">{pdfFile.name}</span>
                <span className="text-slate-500 text-xs">({(pdfFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                <button
                  onClick={handleRemovePdf}
                  className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-slate-400 hover:text-white hover:bg-slate-800/50"
                title="Attach a PDF document"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span>Attach PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Model selector */}
        <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
          <div className="flex items-center gap-2 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className="text-sm font-medium">Model</span>
          </div>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="flex-1 bg-transparent border-none text-slate-200 text-sm focus:outline-none cursor-pointer hover:text-white transition-colors"
          >
            {(provider === 'anthropic' ? ANTHROPIC_MODELS : OPENROUTER_MODELS).map((model) => (
              <option key={model.id} value={model.id} className="bg-slate-900">
                {model.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setViewState('settings')}
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            style={{ color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` }}
            title="API Settings"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
          >
            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-200 text-sm">{error}</p>
          </motion.div>
        )}

        {!apiKey && !anthropicApiKey && (
          <div
            className="mt-6 p-4 rounded-xl text-sm flex items-start gap-3"
            style={{
              backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`,
              border: `1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
            }}
          >
             <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke={currentThemeColor} viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <span className="text-slate-300">
               Please configure your API key in settings to generate mind maps.
             </span>
          </div>
        )}
      </div>

      <div className="px-8 py-5 border-t border-slate-800/50 flex gap-3 justify-end bg-slate-900/30">
        <button
          onClick={handleClose}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleGenerate}
          disabled={!userInput.trim() && !pdfData}
          className="px-6 py-2.5 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
          style={{ 
            backgroundColor: currentThemeColor,
            boxShadow: `0 4px 12px -2px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {pdfData ? 'Generate from PDF' : 'Generate'}
        </button>
      </div>
    </>
  );

  const renderGeneratingView = () => (
    <>
      <div className="p-8 h-[500px] flex flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: currentThemeColor }}></span>
                <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: currentThemeColor }}></span>
              </div>
             <div>
                <h3 className="text-lg font-medium text-white leading-none mb-1.5">
                  {object?.name || 'Dreaming up ideas...'}
                </h3>
                <p className="text-slate-500 text-xs font-medium">
                  {object?.nodes?.length || 0} nodes • {object?.edges?.length || 0} edges
                </p>
             </div>
          </div>
        </div>

        <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800/50 shadow-inner bg-slate-950/30">
          <MindMapPreview mindMap={object} isLoading={true} />
        </div>
      </div>

      <div className="px-8 py-5 border-t border-slate-800/50 flex gap-3 justify-end bg-slate-900/30">
        <button
          onClick={handleStop}
          className="px-5 py-2.5 rounded-xl border border-slate-700/50 text-slate-300 text-sm font-medium hover:bg-slate-800/50 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
          Stop Generation
        </button>
      </div>
    </>
  );

  const renderPreviewView = () => (
    <>
      <div className="p-8 h-[500px] flex flex-col">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-1">{object?.name}</h3>
          <p className="text-slate-400 text-sm">
            {object?.nodes?.length || 0} nodes and {object?.edges?.length || 0} connections created
          </p>
        </div>

        <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800/50 shadow-inner bg-slate-950/30">
          <MindMapPreview mindMap={object} isLoading={false} />
        </div>
      </div>

      <div className="px-8 py-5 border-t border-slate-800/50 flex gap-3 justify-end bg-slate-900/30">
        <button
          onClick={handleRegenerate}
          className="px-5 py-2.5 rounded-xl border border-slate-700/50 text-slate-300 text-sm font-medium hover:bg-slate-800/50 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
        <button
          onClick={handleImport}
          className="px-6 py-2.5 text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
          style={{ 
            backgroundColor: currentThemeColor,
            boxShadow: `0 4px 12px -2px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Import Mind Map
        </button>
      </div>
    </>
  );

  const renderSettingsView = () => (
    <>
      <div className="p-8">
        <h3 className="text-lg font-medium text-white mb-6">AI Provider Configuration</h3>

        <div className="space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2.5">Provider</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setProvider('openrouter')}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  provider === 'openrouter'
                    ? 'border-purple-500 bg-purple-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">OpenRouter</span>
                </div>
              </button>
              <button
                onClick={() => setProvider('anthropic')}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  provider === 'anthropic'
                    ? 'border-purple-500 bg-purple-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  <span className="text-sm font-medium">Anthropic</span>
                </div>
              </button>
            </div>
          </div>

          {/* API Key for OpenRouter */}
          {provider === 'openrouter' && (
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2.5">OpenRouter API Key</label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none transition-all"
                  style={{
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
                    e.currentTarget.style.boxShadow = `0 0 0 1px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1), inset 0 2px 4px rgba(0,0,0,0.1)`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)';
                  }}
                />
              </div>
              <p className="text-slate-500 text-xs mt-3 flex items-center gap-1.5">
                <span>Get your key from</span>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline font-medium transition-colors"
                  style={{ color: currentThemeColor }}
                >
                  openrouter.ai/keys
                </a>
                <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </p>
            </div>
          )}

          {/* API Key for Anthropic */}
          {provider === 'anthropic' && (
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2.5">Anthropic API Key</label>
              <div className="relative">
                <input
                  type="password"
                  value={anthropicApiKey}
                  onChange={(e) => setAnthropicApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none transition-all"
                  style={{
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
                    e.currentTarget.style.boxShadow = `0 0 0 1px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1), inset 0 2px 4px rgba(0,0,0,0.1)`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)';
                  }}
                />
              </div>
              <p className="text-slate-500 text-xs mt-3 flex items-center gap-1.5">
                <span>Get your key from</span>
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline font-medium transition-colors"
                  style={{ color: currentThemeColor }}
                >
                  console.anthropic.com
                </a>
                <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </p>
            </div>
          )}

          {/* Model Selection */}
          <div>
             <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2.5">Default Model</label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none appearance-none cursor-pointer"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '';
                }}
              >
                {(provider === 'anthropic' ? ANTHROPIC_MODELS : OPENROUTER_MODELS).map((model) => (
                  <option key={model.id} value={model.id} className="bg-slate-900">
                    {model.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-5 border-t border-slate-800/50 flex gap-3 justify-end bg-slate-900/30">
        <button
          onClick={() => setViewState('input')}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
        >
          Back
        </button>
        <button
          onClick={handleSaveSettings}
          disabled={provider === 'openrouter' ? !apiKey : !anthropicApiKey}
          className="px-6 py-2.5 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95"
          style={{
            backgroundColor: currentThemeColor,
            boxShadow: `0 4px 12px -2px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`
          }}
        >
          Save Changes
        </button>
      </div>
    </>
  );

  const getHeaderTitle = () => {
    switch (viewState) {
      case 'settings':
        return 'AI Configuration';
      case 'preview':
        return 'Mind Map Preview';
      case 'generating':
        return 'Generating Mind Map';
      default:
        return 'Create Mind Map';
    }
  };

  const getHeaderSubtitle = () => {
    switch (viewState) {
      case 'settings':
        return 'Configure your AI provider settings';
      case 'preview':
        return 'Review and import your generated map';
      case 'generating':
        return 'AI is structuring your ideas...';
      default:
        return 'Describe your concept and let AI visualize it';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-all"
            style={{ zIndex: 9998 }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-slate-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto border border-slate-800/60"
            style={{
              boxShadow: `0 40px 60px -20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)`,
              zIndex: 9999,
            }}
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-800/60 flex items-start justify-between bg-slate-900/50">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {getHeaderTitle()}
                </h2>
                <p className="text-sm text-slate-400 mt-1 font-medium">{getHeaderSubtitle()}</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-gradient-to-b from-slate-900 to-slate-900/95">
              {viewState === 'input' && renderInputView()}
              {viewState === 'generating' && renderGeneratingView()}
              {viewState === 'preview' && renderPreviewView()}
              {viewState === 'settings' && renderSettingsView()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

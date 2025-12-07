import { streamObject } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { mindMapSchema } from '@/lib/mindMapSchema';
import { NextRequest } from 'next/server';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { prompt, apiKey, model } = await req.json();

  if (!prompt || !apiKey || !model) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const openrouter = createOpenRouter({
    apiKey,
  });

  const systemPrompt = `You are a mind map generator for Astro Mind, a visual mind mapping application.

Generate a structured mind map based on the user's request. Follow these guidelines:
- Create meaningful, well-organized nodes with clear titles
- Use shortNote for brief summaries and details for comprehensive content
- Choose appropriate colors for different categories (use hex codes like #8b5cf6, #3b82f6, #10b981, #f59e0b, #ef4444, #ec4899)
- Use varied node variants: "default", "rounded", "pill", "outline"
- Position nodes in a readable layout (x: 100-1000, y: 100-600), spreading them out to avoid overlap
- Connect related nodes with edges using from/to node IDs
- Generate unique IDs for all nodes and edges (use descriptive slugs like "node-main-topic", "edge-1-2")
- Create a hierarchical or network structure based on the topic`;

  const result = streamObject({
    model: openrouter.chat(model),
    schema: mindMapSchema,
    system: systemPrompt,
    prompt,
  });

  return result.toTextStreamResponse();
}

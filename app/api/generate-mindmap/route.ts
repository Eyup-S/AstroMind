import { streamObject } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { mindMapSchema } from '@/lib/mindMapSchema';
import { NextRequest } from 'next/server';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { prompt, apiKey, model, pdfData, pdfName } = await req.json();

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
- Create a hierarchical or network structure based on the topic
${pdfData ? '- The user has attached a PDF document. Analyze its content and create a mind map that captures the key concepts, structure, and relationships from the document.' : ''}`;

  // Build the messages array with optional PDF file
  // OpenRouter expects file_data as a data URL: data:application/pdf;base64,{base64_data}
  const userContent = pdfData
    ? [
        {
          type: 'file' as const,
          data: `data:application/pdf;base64,${pdfData}`,
          mediaType: 'application/pdf' as const,
        },
        {
          type: 'text' as const,
          text: pdfName 
            ? `Create a mind map from the attached PDF "${pdfName}". ${prompt || 'Focus on the main topics and their relationships.'}`
            : `Create a mind map from the attached PDF. ${prompt || 'Focus on the main topics and their relationships.'}`,
        },
      ]
    : [
        {
          type: 'text' as const,
          text: prompt as string,
        },
      ];

  const messages = [
    {
      role: 'user' as const,
      content: userContent,
    },
  ];

  const result = streamObject({
    model: openrouter.chat(model),
    schema: mindMapSchema,
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}

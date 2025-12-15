import { streamObject } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createAnthropic } from '@ai-sdk/anthropic';
import { mindMapSchema } from '@/lib/mindMapSchema';
import { NextRequest } from 'next/server';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { prompt, apiKey, model, pdfData, pdfName, provider } = await req.json();

  if (!prompt || !apiKey || !model || !provider) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Create the appropriate provider instance
  const aiProvider = provider === 'anthropic'
    ? createAnthropic({ apiKey })
    : createOpenRouter({ apiKey });

  const systemPrompt = `You are a mind map generator for Astro Mind, a visual mind mapping application.

Generate a structured mind map based on the user's request. Follow these guidelines:
- Create meaningful, well-organized nodes with clear titles
- Use shortNote for brief summaries and details for comprehensive content
- Choose appropriate colors for different categories (use hex codes like #8b5cf6, #3b82f6, #10b981, #f59e0b, #ef4444, #ec4899)
- Use varied node variants: "default", "rounded", "pill", "outline"
- Connect related nodes with edges using from/to node IDs
- Generate unique IDs for all nodes and edges (use descriptive slugs like "node-main-topic", "edge-1-2")

CRITICAL LAYOUT RULES - RADIAL/CIRCULAR DESIGN:
- Each node is 140x140 pixels in size
- ALWAYS place the root/main node at the CENTER: x: 650, y: 400
- Distribute other nodes in a CIRCULAR/RADIAL pattern around the root node at 360 degrees
- Use multiple concentric circles for different levels:
  * First level (direct children): 300-350px radius from center
  * Second level (sub-nodes): 550-600px radius from center
  * Third level (if needed): 800px+ radius from center
- Spread nodes evenly around the circle to avoid clustering
- Example positions for 6 first-level nodes around center (650, 400):
  * Node at 0°: (950, 400) - right
  * Node at 60°: (825, 225) - top-right
  * Node at 120°: (525, 225) - top-left
  * Node at 180°: (350, 400) - left
  * Node at 240°: (525, 575) - bottom-left
  * Node at 300°: (825, 575) - bottom-right
- Minimum spacing between any two nodes: 250 pixels
- Valid x range: 100-1200, valid y range: 50-750
- Calculate positions using: x = centerX + radius * cos(angle), y = centerY + radius * sin(angle)
- Dont use hierarchical top-to-bottom layouts unless specifically requested
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
    model: provider === 'anthropic' ? aiProvider(model) : aiProvider.chat(model),
    schema: mindMapSchema,
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}

import { z } from 'zod';

export const nodeVariantSchema = z.enum(['default', 'rounded', 'pill', 'outline']);

export const mindMapNodeSchema = z.object({
  id: z.string().describe('Unique identifier for the node'),
  title: z.string().describe('Title of the node'),
  shortNote: z.string().optional().describe('Brief note or summary'),
  details: z.string().optional().describe('Detailed content or description'),
  color: z.string().describe('Hex color code (e.g., "#8b5cf6")'),
  variant: nodeVariantSchema.describe('Visual style of the node'),
  position: z.object({
    x: z.number().describe('X coordinate (100-1000)'),
    y: z.number().describe('Y coordinate (100-600)'),
  }).describe('Position on the canvas'),
});

export const mindMapEdgeSchema = z.object({
  id: z.string().describe('Unique identifier for the edge'),
  from: z.string().describe('Source node ID'),
  to: z.string().describe('Target node ID'),
  color: z.string().optional().describe('Hex color code for the edge'),
});

export const mindMapSchema = z.object({
  id: z.string().describe('Unique identifier for the mind map'),
  name: z.string().describe('Name of the mind map'),
  nodes: z.array(mindMapNodeSchema).describe('Array of nodes in the mind map'),
  edges: z.array(mindMapEdgeSchema).describe('Array of edges connecting nodes'),
});

export type GeneratedMindMap = z.infer<typeof mindMapSchema>;

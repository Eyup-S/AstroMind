export type NodeVariant = 'default' | 'rounded' | 'pill' | 'outline';

export interface MindMapNode {
  id: string;
  title: string;
  shortNote?: string;
  details?: string;
  color: string;
  variant: NodeVariant;
  position: { x: number; y: number };
  createdAt: number;
  updatedAt: number;
}

export interface MindMapEdge {
  id: string;
  from: string; // node id
  to: string;   // node id
  color?: string; // edge color (optional, defaults to purple)
}

export interface MindMap {
  id: string;
  name: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  createdAt: number;
  updatedAt: number;
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export interface AppState {
  currentMapId: string | null;
  maps: MindMap[];
  selectedNodeId?: string;
  selectedEdgeId?: string;
  camera: Camera;
  version: number;
}

export type ConnectionMode = 'idle' | 'selecting-source' | 'selecting-target';

export interface ConnectionState {
  mode: ConnectionMode;
  sourceNodeId?: string;
}

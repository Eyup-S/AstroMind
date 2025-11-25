import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  AppState,
  MindMap,
  MindMapNode,
  MindMapEdge,
  Camera,
  ConnectionState
} from './types';
import {
  loadStateFromLocalStorage,
  saveStateToLocalStorage
} from './persistence';
import { debounce } from './utils';

interface MindMapStore extends AppState {
  connectionState: ConnectionState;
  // Map actions
  createNewMap: (name?: string) => void;
  setCurrentMap: (mapId: string) => void;
  updateMapName: (mapId: string, name: string) => void;
  deleteMap: (mapId: string) => void;
  importMap: (map: MindMap) => void;

  // Node actions
  addNode: (node: Omit<MindMapNode, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNode: (nodeId: string, updates: Partial<MindMapNode>) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNode: (nodeId?: string) => void;

  // Edge actions
  addEdge: (from: string, to: string) => void;
  updateEdge: (edgeId: string, updates: Partial<MindMapEdge>) => void;
  deleteEdge: (edgeId: string) => void;
  setSelectedEdge: (edgeId?: string) => void;

  // Connection mode
  startConnectionMode: () => void;
  setConnectionSource: (nodeId: string) => void;
  completeConnection: (targetNodeId: string) => void;
  cancelConnection: () => void;

  // Camera actions
  setCamera: (camera: Partial<Camera>) => void;

  // Persistence
  persist: () => void;
}

const DEFAULT_STATE: AppState = {
  currentMapId: null,
  maps: [],
  selectedNodeId: undefined,
  selectedEdgeId: undefined,
  camera: { x: 0, y: 0, zoom: 1 },
  version: 1
};

// Create a debounced save function
const debouncedSave = debounce((state: AppState) => {
  saveStateToLocalStorage(state);
}, 500);

export const useMindMapStore = create<MindMapStore>((set, get) => {
  // Try to load initial state from localStorage
  const initialState = loadStateFromLocalStorage() || DEFAULT_STATE;

  return {
    ...initialState,
    connectionState: { mode: 'idle' },

    createNewMap: (name = 'Untitled Map') => {
      const newMap: MindMap = {
        id: uuidv4(),
        name,
        nodes: [],
        edges: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      set((state) => ({
        maps: [...state.maps, newMap],
        currentMapId: newMap.id
      }));

      get().persist();
    },

    setCurrentMap: (mapId: string) => {
      set({ currentMapId: mapId, selectedNodeId: undefined, selectedEdgeId: undefined });
      get().persist();
    },

    updateMapName: (mapId: string, name: string) => {
      set((state) => ({
        maps: state.maps.map((map) =>
          map.id === mapId
            ? { ...map, name, updatedAt: Date.now() }
            : map
        )
      }));
      get().persist();
    },

    deleteMap: (mapId: string) => {
      set((state) => {
        const filteredMaps = state.maps.filter((map) => map.id !== mapId);
        return {
          maps: filteredMaps,
          currentMapId:
            state.currentMapId === mapId
              ? filteredMaps[0]?.id || null
              : state.currentMapId
        };
      });
      get().persist();
    },

    importMap: (map: MindMap) => {
      const newMap = { ...map, id: uuidv4() };
      set((state) => ({
        maps: [...state.maps, newMap],
        currentMapId: newMap.id
      }));
      get().persist();
    },

    addNode: (nodeData) => {
      const state = get();
      if (!state.currentMapId) return;

      const newNode: MindMapNode = {
        ...nodeData,
        id: uuidv4(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      set((state) => ({
        maps: state.maps.map((map) =>
          map.id === state.currentMapId
            ? {
                ...map,
                nodes: [...map.nodes, newNode],
                updatedAt: Date.now()
              }
            : map
        )
      }));

      get().persist();
    },

    updateNode: (nodeId, updates) => {
      set((state) => ({
        maps: state.maps.map((map) =>
          map.id === state.currentMapId
            ? {
                ...map,
                nodes: map.nodes.map((node) =>
                  node.id === nodeId
                    ? { ...node, ...updates, updatedAt: Date.now() }
                    : node
                ),
                updatedAt: Date.now()
              }
            : map
        )
      }));

      get().persist();
    },

    deleteNode: (nodeId) => {
      set((state) => ({
        maps: state.maps.map((map) =>
          map.id === state.currentMapId
            ? {
                ...map,
                nodes: map.nodes.filter((node) => node.id !== nodeId),
                edges: map.edges.filter(
                  (edge) => edge.from !== nodeId && edge.to !== nodeId
                ),
                updatedAt: Date.now()
              }
            : map
        ),
        selectedNodeId:
          state.selectedNodeId === nodeId ? undefined : state.selectedNodeId
      }));

      get().persist();
    },

    setSelectedNode: (nodeId) => {
      set({ selectedNodeId: nodeId, selectedEdgeId: undefined });
    },

    addEdge: (from, to) => {
      const state = get();
      //console.log('addEdge called:', { from, to, currentMapId: state.currentMapId });

      if (!state.currentMapId) {
        console.warn('No current map ID');
        return;
      }

      // Prevent self-loops and duplicate edges
      const currentMap = state.maps.find((m) => m.id === state.currentMapId);
      if (!currentMap) {
        console.warn('Current map not found');
        return;
      }

      if (from === to) {
        console.warn('Cannot create self-loop');
        return; // No self-loops
      }

      const edgeExists = currentMap.edges.some(
        (edge) => edge.from === from && edge.to === to
      );
      if (edgeExists) {
        console.warn('Edge already exists');
        return;
      }

      // Get default edge color from settings
      const defaultEdgeColor = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('mindmap-settings') || '{}').defaultEdgeColor || '#8b5cf6'
        : '#8b5cf6';

      const newEdge: MindMapEdge = {
        id: uuidv4(),
        from,
        to,
        color: defaultEdgeColor
      };

      //console.log('Creating new edge:', newEdge);

      set((state) => ({
        maps: state.maps.map((map) =>
          map.id === state.currentMapId
            ? {
                ...map,
                edges: [...map.edges, newEdge],
                updatedAt: Date.now()
              }
            : map
        )
      }));

      get().persist();
      //console.log('Edge created successfully');
    },

    updateEdge: (edgeId, updates) => {
      set((state) => ({
        maps: state.maps.map((map) =>
          map.id === state.currentMapId
            ? {
                ...map,
                edges: map.edges.map((edge) =>
                  edge.id === edgeId ? { ...edge, ...updates } : edge
                ),
                updatedAt: Date.now()
              }
            : map
        )
      }));

      get().persist();
    },

    deleteEdge: (edgeId) => {
      set((state) => ({
        maps: state.maps.map((map) =>
          map.id === state.currentMapId
            ? {
                ...map,
                edges: map.edges.filter((edge) => edge.id !== edgeId),
                updatedAt: Date.now()
              }
            : map
        ),
        selectedEdgeId:
          state.selectedEdgeId === edgeId ? undefined : state.selectedEdgeId
      }));

      get().persist();
    },

    setSelectedEdge: (edgeId) => {
      set({ selectedEdgeId: edgeId, selectedNodeId: undefined });
    },

    startConnectionMode: () => {
      set({
        connectionState: { mode: 'selecting-source' },
        selectedNodeId: undefined,
        selectedEdgeId: undefined
      });
    },

    setConnectionSource: (nodeId) => {
      console.log('Setting connection source:', nodeId);
      set({
        connectionState: { mode: 'selecting-target', sourceNodeId: nodeId }
      });
    },

    completeConnection: (targetNodeId) => {
      const state = get();
      const sourceId = state.connectionState.sourceNodeId;

      console.log('Completing connection:', { sourceId, targetNodeId });

      if (sourceId) {
        get().addEdge(sourceId, targetNodeId);
      }

      set({ connectionState: { mode: 'idle' } });
    },

    cancelConnection: () => {
      set({ connectionState: { mode: 'idle' } });
    },

    setCamera: (camera) => {
      set((state) => ({
        camera: { ...state.camera, ...camera }
      }));
      // Don't persist camera changes immediately to avoid too many writes
    },

    persist: () => {
      const state = get();
      const { connectionState, ...persistableState } = state as any;
      debouncedSave(persistableState);
    }
  };
});

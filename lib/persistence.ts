import { AppState, MindMap } from './types';

const STORAGE_KEY = 'astroMindState:v1';
const CURRENT_VERSION = 1;

export function loadStateFromLocalStorage(): AppState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as AppState;

    // Version check
    if (parsed.version !== CURRENT_VERSION) {
      console.warn('State version mismatch. Using default state.');
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return null;
  }
}

export function saveStateToLocalStorage(state: AppState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
}

export function exportMapAsJSON(map: MindMap): void {
  const dataStr = JSON.stringify(map, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${map.name || 'mind-map'}-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function exportAppStateAsJSON(state: AppState): void {
  const dataStr = JSON.stringify(state, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `astro-mind-state-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function validateMindMap(data: any): data is MindMap {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    Array.isArray(data.nodes) &&
    Array.isArray(data.edges) &&
    typeof data.createdAt === 'number' &&
    typeof data.updatedAt === 'number'
  );
}

export function importMapFromJSON(
  jsonString: string
): { success: true; map: MindMap } | { success: false; error: string } {
  try {
    const parsed = JSON.parse(jsonString);

    if (validateMindMap(parsed)) {
      return { success: true, map: parsed };
    } else {
      return { success: false, error: 'Invalid mind map structure' };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse JSON'
    };
  }
}

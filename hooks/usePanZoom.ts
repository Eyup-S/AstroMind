import { useRef, useCallback } from 'react';
import { useMindMapStore } from '@/lib/store';
import { clamp } from '@/lib/utils';

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2;

export function usePanZoom() {
  const { camera, setCamera } = useMindMapStore();
  const isPanningRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();

      const delta = -event.deltaY * 0.001;
      const newZoom = clamp(camera.zoom + delta, MIN_ZOOM, MAX_ZOOM);

      setCamera({ zoom: newZoom });
    },
    [camera.zoom, setCamera]
  );

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      // Only pan on middle mouse button or space+left click
      if (event.button === 1 || (event.button === 0 && event.shiftKey)) {
        event.preventDefault();
        isPanningRef.current = true;
        lastPosRef.current = { x: event.clientX, y: event.clientY };
      }
    },
    []
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isPanningRef.current) return;

      const dx = event.clientX - lastPosRef.current.x;
      const dy = event.clientY - lastPosRef.current.y;

      setCamera({
        x: camera.x + dx,
        y: camera.y + dy
      });

      lastPosRef.current = { x: event.clientX, y: event.clientY };
    },
    [camera.x, camera.y, setCamera]
  );

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  return {
    camera,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isPanning: isPanningRef.current
  };
}

import { useCallback } from 'react';
import { OnMoveEnd } from 'reactflow';
import { useGraphStore } from '../../store/graphStore';

/**
 * useGraphViewport - Custom hook for managing graph viewport
 * Handles viewport changes and transformations
 */
function useGraphViewport() {
  const { setViewport } = useGraphStore();
  
  // Handle viewport changes
  const onMoveEnd: OnMoveEnd = useCallback(
    (_, viewport) => {
      setViewport(viewport);
    },
    [setViewport]
  );
  
  return {
    onMoveEnd
  };
}

export default useGraphViewport; 
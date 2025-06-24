
import { useState, useEffect, useRef } from 'react';

export const useStableData = <T,>(data: T, key: string): T => {
  const [stableData, setStableData] = useState<T>(data);
  const lastDataRef = useRef<T>(data);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Se os dados mudaram, aguarda um pouco antes de atualizar
    // para evitar mudanças muito frequentes
    if (JSON.stringify(data) !== JSON.stringify(lastDataRef.current)) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setStableData(data);
        lastDataRef.current = data;
      }, 500); // 500ms de delay para estabilizar
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, key]);

  return stableData;
};

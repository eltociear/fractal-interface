import { useCallback, useEffect, useState } from 'react';

export const useUpdateTimer = (safeAddress?: string) => {
  const [timers, setTimers] = useState<NodeJS.Timer[]>([]);
  const thirtySeconds = 20000; // in milliseconds

  const setMethodonInterval = useCallback(
    (getMethod: () => Promise<void>, milliseconds: number = thirtySeconds) => {
      Promise.resolve(getMethod());
      const intervalId = setInterval(() => {
        Promise.resolve(getMethod());
      }, milliseconds);
      setTimers(prevState => [...prevState, intervalId]);
    },
    []
  );
  useEffect(() => {
    if (!safeAddress) {
      timers.forEach(timer => clearInterval(timer));
    }
  }, [safeAddress, timers]);
  return { setMethodonInterval };
};

import { useEffect } from 'react';

export const useResize = (fn: () => void): void => {
  useEffect(() => {
    fn();
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, [fn]);
};

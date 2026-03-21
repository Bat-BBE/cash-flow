'use client';

import { useEffect, useState } from 'react';

/** max-width breakpoint in px (Tailwind sm) */
export function useIsNarrow(breakpoint = 640) {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [breakpoint]);

  return narrow;
}

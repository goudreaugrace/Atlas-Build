'use client';

import { useEffect } from 'react';

export default function AtlasThinkingClient({ outputHref }: { outputHref: string }) {
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.location.replace(outputHref);
    }, 1350);

    return () => window.clearTimeout(timeout);
  }, [outputHref]);

  return null;
}

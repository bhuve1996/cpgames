'use client';

import { useEffect } from 'react';
import { ErrorShell } from '@/components/error-shell';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <ErrorShell
      code="500"
      title="Something went wrong"
      message="We hit a snag loading this page. Try again, or go back and pick a game to play."
      showRetry
      onRetry={reset}
    />
  );
}

'use client';

import { useEffect } from 'react';
import { ErrorShell } from '@/components/error-shell';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        <ErrorShell
          code="Error"
          title="Playground crashed"
          message="A critical error occurred. Refresh the page or return home to keep playing."
          showRetry
          onRetry={reset}
        />
      </body>
    </html>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Gamepad2, Home, RefreshCw } from 'lucide-react';

export function ErrorShell({
  code,
  title,
  message,
  showRetry,
  onRetry,
}: {
  code: string;
  title: string;
  message: string;
  showRetry?: boolean;
  onRetry?: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
      </div>

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-600 shadow-lg shadow-primary/25 mb-6">
        <Gamepad2 className="h-7 w-7 text-white" />
      </div>

      <p className="text-6xl font-black text-gradient tabular-nums mb-2">{code}</p>
      <h1 className="text-2xl md:text-3xl font-bold mb-3">{title}</h1>
      <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">{message}</p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link href="/" className="flex-1">
          <Button className="w-full gap-2">
            <Home className="h-4 w-4" /> Back home
          </Button>
        </Link>
        <Link href="/games" className="flex-1">
          <Button variant="outline" className="w-full">Browse games</Button>
        </Link>
      </div>

      {showRetry && onRetry && (
        <Button variant="ghost" className="mt-6 gap-2" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" /> Try again
        </Button>
      )}
    </div>
  );
}

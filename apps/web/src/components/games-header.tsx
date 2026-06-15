import Link from 'next/link';
import { Gamepad2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GamesHeader({
  backHref = '/games',
  backLabel = 'All games',
  title,
}: {
  backHref?: string;
  backLabel?: string;
  title?: string;
}) {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3 min-w-0">
          {backHref ? (
            <Link href={backHref}>
              <Button variant="ghost" size="sm" className="gap-1.5 shrink-0">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{backLabel}</span>
              </Button>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2 font-bold shrink-0">
              <Gamepad2 className="h-5 w-5 text-primary" />
              Playground
            </Link>
          )}
          {title && <h1 className="font-semibold truncate">{title}</h1>}
        </div>
        <Link href="/login">
          <Button variant="ghost" size="sm">Log in</Button>
        </Link>
      </div>
    </header>
  );
}

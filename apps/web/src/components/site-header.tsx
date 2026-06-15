'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

const PUBLIC_NAV = [
  { href: '/games', label: 'Games' },
  { href: '/register', label: 'Communities' },
] as const;

const APP_NAV = [
  { href: '/games', label: 'Games' },
  { href: '/dashboard', label: 'Communities' },
] as const;

export function SiteHeader({
  variant = 'default',
  backHref,
  backLabel = 'Back',
  title,
  user,
  onLogout,
}: {
  variant?: 'default' | 'subpage' | 'minimal';
  backHref?: string;
  backLabel?: string;
  title?: string;
  user?: { displayName: string };
  onLogout?: () => void;
}) {
  const pathname = usePathname();
  const nav = user ? APP_NAV : PUBLIC_NAV;

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3 min-w-0">
          {variant === 'subpage' && backHref ? (
            <Link href={backHref}>
              <Button variant="ghost" size="sm" className="gap-1.5 shrink-0 -ml-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{backLabel}</span>
              </Button>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
                <Gamepad2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight hidden sm:inline">Playground</span>
            </Link>
          )}

          {title && (
            <div className="hidden md:block border-l border-border/60 pl-3 min-w-0">
              <p className="font-semibold truncate text-sm">{title}</p>
            </div>
          )}
        </div>

        {variant !== 'minimal' && (
          <nav className="hidden md:flex items-center gap-1 rounded-full border border-border/50 bg-secondary/40 p-1">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                    active
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/60',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle className="bg-background/60" />

          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden lg:inline max-w-[120px] truncate">
                {user.displayName}
              </span>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                Log out
              </Button>
            </>
          ) : variant !== 'minimal' ? (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-gradient-to-r from-primary to-violet-600 hover:opacity-90 shadow-md shadow-primary/20">
                  Get started
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">Log in</Button>
            </Link>
          )}
        </div>
      </div>

      {title && (
        <div className="md:hidden border-t border-border/40 px-4 py-2">
          <p className="font-semibold text-sm truncate">{title}</p>
        </div>
      )}
    </header>
  );
}

export function AppHeader({
  title,
  subtitle,
  backHref = '/dashboard',
  actions,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/75 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={backHref}>
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="font-bold truncate">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {actions}
          <ThemeToggle className="bg-background/60" />
        </div>
      </div>
    </header>
  );
}

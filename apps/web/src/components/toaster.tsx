'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dismiss, subscribe, type ToastItem, type ToastType } from '@/lib/toast';

const ICONS: Record<ToastType, typeof Info> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const STYLES: Record<ToastType, string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error: 'border-destructive/40 bg-destructive/10',
  info: 'border-primary/30 bg-primary/10',
  warning: 'border-amber-500/40 bg-amber-500/10',
};

const ICON_STYLES: Record<ToastType, string> = {
  success: 'text-emerald-500',
  error: 'text-destructive',
  info: 'text-primary',
  warning: 'text-amber-500',
};

function ToastCard({ item }: { item: ToastItem }) {
  const Icon = ICONS[item.type];

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex w-full max-w-sm gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-md',
        'bg-card/95 animate-toast-in',
        STYLES[item.type],
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', ICON_STYLES[item.type])} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-tight">{item.title}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismiss(item.id)}
        className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => subscribe(setItems), []);

  if (items.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] sm:w-auto sm:max-w-sm"
      aria-live="polite"
    >
      {items.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </div>
  );
}

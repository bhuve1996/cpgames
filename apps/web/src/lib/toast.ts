export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration: number;
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener([...toasts]));
}

function scheduleDismiss(id: string, duration: number) {
  if (typeof window === 'undefined') return;
  window.setTimeout(() => dismiss(id), duration);
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  listener([...toasts]);
  return () => {
    listeners.delete(listener);
  };
}

export function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function push(toast: Omit<ToastItem, 'id'>) {
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  toasts = [...toasts, { ...toast, id }].slice(-5);
  emit();
  scheduleDismiss(id, toast.duration);
  return id;
}

export const toast = {
  success: (title: string, description?: string, duration = 4000) =>
    push({ title, description, type: 'success', duration }),
  error: (title: string, description?: string, duration = 5000) =>
    push({ title, description, type: 'error', duration }),
  info: (title: string, description?: string, duration = 4000) =>
    push({ title, description, type: 'info', duration }),
  warning: (title: string, description?: string, duration = 4500) =>
    push({ title, description, type: 'warning', duration }),
};

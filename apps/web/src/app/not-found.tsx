import { ErrorShell } from '@/components/error-shell';

export default function NotFound() {
  return (
    <ErrorShell
      code="404"
      title="Page not found"
      message="This page doesn't exist or may have moved. Head back home or jump into a game."
    />
  );
}

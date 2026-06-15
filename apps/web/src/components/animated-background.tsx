/** Soft animated gradient blobs for page backgrounds */
export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/25 blur-3xl animate-blob" />
      <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl animate-blob [animation-delay:2s]" />
      <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl animate-blob [animation-delay:4s]" />
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  );
}

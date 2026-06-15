import { cn } from '@/lib/utils';

const DEFAULT_ITEMS = ['🎮', '🧠', '🏆', '🎉', '⚡', '🎯'];

export function FloatingEmojis({
  items = DEFAULT_ITEMS,
  className,
}: {
  items?: string[];
  className?: string;
}) {
  const positions = [
    'top-[12%] left-[8%] text-3xl',
    'top-[20%] right-[10%] text-4xl',
    'top-[55%] left-[5%] text-2xl',
    'bottom-[25%] right-[8%] text-3xl',
    'bottom-[15%] left-[15%] text-2xl',
    'top-[40%] right-[18%] text-xl',
  ];

  return (
    <div className={cn('pointer-events-none fixed inset-0 -z-[5] overflow-hidden', className)} aria-hidden>
      {items.slice(0, positions.length).map((emoji, i) => (
        <span
          key={`${emoji}-${i}`}
          className={cn(
            'absolute select-none opacity-40 dark:opacity-30',
            positions[i],
            i % 2 === 0 ? 'animate-float' : 'animate-float-slow',
          )}
          style={{ animationDelay: `${i * 0.4}s` }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}

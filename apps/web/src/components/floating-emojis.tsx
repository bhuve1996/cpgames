import { cn } from '@/lib/utils';
import { FLOATING_PRESETS, type FloatingPreset } from '@/lib/floating-presets';

const POSITIONS = [
  { className: 'top-[8%] left-[6%] text-4xl', anim: 'animate-float' },
  { className: 'top-[14%] right-[7%] text-3xl', anim: 'animate-float-slow' },
  { className: 'top-[28%] left-[3%] text-2xl', anim: 'animate-wiggle' },
  { className: 'top-[35%] right-[12%] text-5xl', anim: 'animate-float' },
  { className: 'top-[48%] left-[10%] text-xl', anim: 'animate-float-slow' },
  { className: 'top-[52%] right-[4%] text-3xl', anim: 'animate-float' },
  { className: 'top-[65%] left-[4%] text-3xl', anim: 'animate-wiggle' },
  { className: 'top-[72%] right-[15%] text-2xl', anim: 'animate-float-slow' },
  { className: 'bottom-[22%] left-[14%] text-4xl', anim: 'animate-float' },
  { className: 'bottom-[18%] right-[8%] text-3xl', anim: 'animate-float-slow' },
  { className: 'bottom-[8%] left-[22%] text-2xl', anim: 'animate-wiggle' },
  { className: 'bottom-[10%] right-[22%] text-xl', anim: 'animate-float' },
  { className: 'top-[20%] left-[42%] text-2xl hidden lg:block', anim: 'animate-float-slow' },
  { className: 'bottom-[35%] right-[38%] text-3xl hidden md:block', anim: 'animate-float' },
] as const;

export function FloatingEmojis({
  items,
  preset = 'home',
  density = 'rich',
  className,
}: {
  items?: string[];
  preset?: FloatingPreset;
  density?: 'light' | 'normal' | 'rich';
  className?: string;
}) {
  const pool = items ?? FLOATING_PRESETS[preset];
  const count = density === 'light' ? 6 : density === 'normal' ? 10 : POSITIONS.length;
  const visible = pool.slice(0, count);

  return (
    <div className={cn('pointer-events-none fixed inset-0 -z-[5] overflow-hidden', className)} aria-hidden>
      {visible.map((emoji, i) => {
        const pos = POSITIONS[i % POSITIONS.length];
        return (
          <span
            key={`${emoji}-${i}`}
            className={cn(
              'absolute select-none opacity-[0.35] dark:opacity-[0.22]',
              pos.className,
              pos.anim,
            )}
            style={{
              animationDelay: `${i * 0.35}s`,
              animationDuration: `${3 + (i % 3)}s`,
            }}
          >
            {emoji}
          </span>
        );
      })}
    </div>
  );
}

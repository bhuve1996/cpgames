import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Decorative game art — SVG "GIF-style" loops from /public/illustrations.
 * Swap src to add real GIFs later without changing page layout.
 */
export function GameArt({
  src,
  alt,
  className,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const isSvg = src.endsWith('.svg');

  if (isSvg) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn('mx-auto select-none', className)}
        draggable={false}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={280}
      height={200}
      className={cn('mx-auto', className)}
      priority={priority}
      unoptimized={src.endsWith('.gif')}
    />
  );
}

/** Animated SVG hero — lightweight alternative to GIFs */
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <svg viewBox="0 0 320 240" className="w-full max-w-sm mx-auto drop-shadow-lg" fill="none">
        <ellipse cx="160" cy="200" rx="100" ry="12" className="fill-primary/20 animate-pulse-soft" />
        <g className="animate-float-slow" style={{ transformOrigin: '160px 120px' }}>
          <rect x="90" y="70" width="140" height="90" rx="20" className="fill-primary stroke-primary/50" strokeWidth="3" />
          <circle cx="125" cy="115" r="10" className="fill-primary-foreground/90" />
          <circle cx="160" cy="115" r="10" className="fill-primary-foreground/90" />
          <circle cx="195" cy="115" r="10" className="fill-primary-foreground/90" />
          <rect x="120" y="135" width="80" height="8" rx="4" className="fill-primary-foreground/60" />
          <path d="M160 70 L160 45" className="stroke-primary" strokeWidth="4" strokeLinecap="round" />
          <circle cx="160" cy="38" r="10" className="fill-amber-400 animate-pulse-soft" />
        </g>
        <text x="55" y="55" fontSize="28" className="animate-wiggle" style={{ animationDelay: '0.2s' }}>🎮</text>
        <text x="235" y="75" fontSize="24" className="animate-float" style={{ animationDelay: '0.5s' }}>🧠</text>
        <text x="240" y="175" fontSize="22" className="animate-float-slow" style={{ animationDelay: '0.8s' }}>🏆</text>
        <text x="40" y="170" fontSize="20" className="animate-wiggle" style={{ animationDelay: '1s' }}>⚡</text>
      </svg>
    </div>
  );
}

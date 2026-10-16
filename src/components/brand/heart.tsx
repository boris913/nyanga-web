import { HEART_PATH } from "@/lib/brand";

export function Heart({ className = "", title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden={title ? undefined : true} role={title ? "img" : undefined} aria-label={title}>
      <path d={HEART_PATH} fill="currentColor" />
    </svg>
  );
}

/** Logo A : cœur rouge portant un N blanc en Playfair italique. */
export function HeartMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <path d={HEART_PATH} fill="var(--color-brand)" />
      <text x="32" y="39.5" textAnchor="middle" fill="#fff" fontFamily="var(--font-playfair), Georgia, serif" fontStyle="italic" fontWeight="700" fontSize="26">
        N
      </text>
    </svg>
  );
}

/** Indicateur de chargement : un cœur qui bat. */
export function HeartLoader({ label = "Chargement…", className = "size-8" }: { label?: string; className?: string }) {
  return (
    <span role="status" className="inline-flex flex-col items-center gap-2 text-sm text-muted">
      <Heart className={`${className} animate-heartbeat text-brand`} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

// Positions fixes : le rendu serveur et le navigateur produisent le même décor.
const FLOATING = [
  { left: "6%", size: 18, delay: 0, duration: 11, tilt: -12, alpha: 0.35 },
  { left: "16%", size: 28, delay: 4, duration: 14, tilt: 10, alpha: 0.25 },
  { left: "29%", size: 14, delay: 7, duration: 10, tilt: -6, alpha: 0.4 },
  { left: "46%", size: 22, delay: 2, duration: 13, tilt: 14, alpha: 0.2 },
  { left: "61%", size: 16, delay: 9, duration: 12, tilt: -10, alpha: 0.35 },
  { left: "74%", size: 30, delay: 5, duration: 15, tilt: 8, alpha: 0.22 },
  { left: "86%", size: 18, delay: 1, duration: 11, tilt: -14, alpha: 0.32 },
  { left: "94%", size: 12, delay: 6, duration: 9, tilt: 6, alpha: 0.4 },
];

/** Décor de l'accueil : des cœurs qui montent doucement. */
export function FloatingHearts() {
  return (
    <div className="floating-hearts pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {FLOATING.map((h, i) => (
        <span
          key={i}
          className="absolute -bottom-10 text-brand"
          style={{
            left: h.left,
            width: h.size,
            height: h.size,
            animation: `float-heart ${h.duration}s linear ${h.delay}s infinite both`,
            ["--tilt" as string]: `${h.tilt}deg`,
            ["--alpha" as string]: h.alpha,
          }}
        >
          <Heart className="size-full" />
        </span>
      ))}
    </div>
  );
}

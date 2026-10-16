import type { Plan } from "@/lib/types";

export function VerifiedBadge() {
  return (
    <span className="chip bg-leaf-soft text-leaf" title="Photo vérifiée par l’équipe Nyanga">
      <svg viewBox="0 0 20 20" className="size-3.5" fill="currentColor" aria-hidden>
        <path d="M10 1.5 12.4 3l2.8-.2.9 2.7 2.3 1.6-.9 2.7.9 2.7-2.3 1.6-.9 2.7-2.8-.2L10 18.5 7.6 17l-2.8.2-.9-2.7-2.3-1.6.9-2.7-.9-2.7 2.3-1.6.9-2.7 2.8.2L10 1.5Zm3.6 6.2-1.2-1.1-3.4 3.7-1.5-1.5-1.2 1.2 2.7 2.7 4.6-5Z" />
      </svg>
      Vérifié
    </span>
  );
}

export function PlanBadge({ plan }: { plan: Plan }) {
  if (plan === "VIP") return <span className="chip bg-gradient-to-r from-[#7a4f08] to-gold text-white shadow-sm">♛ VIP</span>;
  if (plan === "PREMIUM") return <span className="chip bg-gradient-to-r from-brand-dark to-brand text-white shadow-sm">Premium</span>;
  return null;
}

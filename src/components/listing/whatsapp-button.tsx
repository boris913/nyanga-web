"use client";

import { useRef, useState } from "react";
import { api, errorMessage } from "@/lib/client-api";
import { heartBurst, toast } from "@/components/brand/effects";

export function WhatsappIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43zm8.03-17.46A11.3 11.3 0 0 0 12.05.7C5.8.7.7 5.8.7 12.05c0 2 .52 3.95 1.52 5.67L.6 23.4l5.82-1.53a11.3 11.3 0 0 0 5.62 1.43h.01c6.26 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.32-8.02z"
      />
    </svg>
  );
}

/** Bouton présent sur chaque annonce. Le lien (et donc le numéro) n'est demandé à l'API qu'au clic. */
export function WhatsappButton({ listingId, masked, compact = false }: { listingId: string; masked: string; compact?: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState(false);

  async function open() {
    heartBurst(ref.current);
    setPending(true);
    try {
      const { url } = await api<{ url: string }>(`/api/listings/${listingId}/whatsapp`, { method: "POST" });
      window.location.href = url;
    } catch (err) {
      toast(errorMessage(err), "error");
    }
    setPending(false);
  }

  return (
    <button ref={ref} type="button" onClick={open} disabled={pending} className="btn btn-whatsapp w-full flex-col gap-0.5 rounded-2xl">
      <span className="flex items-center gap-2">
        <WhatsappIcon className="size-6" />
        {pending ? "Ouverture…" : "Contacter sur WhatsApp"}
      </span>
      {!compact && <span className="text-sm font-medium tracking-wide text-white/85">{masked}</span>}
    </button>
  );
}

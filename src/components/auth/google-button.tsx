"use client";

import Script from "next/script";
import { useRef, useState } from "react";
import { api, errorMessage } from "@/lib/client-api";

type GoogleId = {
  initialize(opts: { client_id: string; callback: (r: { credential: string }) => void; ux_mode?: "popup"; locale?: string }): void;
  renderButton(el: HTMLElement, opts: Record<string, string | number>): void;
};
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/** Bouton officiel Google Identity Services ; le jeton reçu est vérifié par l'API. */
export function GoogleButton({ onSuccess }: { onSuccess: (r: { profileComplete: boolean }) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  if (!CLIENT_ID) return null;

  function setup() {
    const gid = window.google?.accounts.id;
    if (!gid || !ref.current) return;
    gid.initialize({
      client_id: CLIENT_ID!,
      ux_mode: "popup",
      locale: "fr",
      callback: async ({ credential }) => {
        setError(null);
        try {
          onSuccess(await api<{ profileComplete: boolean }>("/api/auth/google", { body: { credential } }));
        } catch (err) {
          setError(errorMessage(err));
        }
      },
    });
    gid.renderButton(ref.current, { theme: "outline", size: "large", shape: "pill", text: "continue_with", width: ref.current.offsetWidth || 320 });
  }

  return (
    <div className="flex flex-col gap-2">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={setup} />
      <div ref={ref} className="flex min-h-11 w-full justify-center" />
      {error && <p className="alert alert-error text-sm">{error}</p>}
    </div>
  );
}

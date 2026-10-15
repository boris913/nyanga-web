"use client";

import { useState } from "react";
import { api } from "@/lib/client-api";

export function LogoutButton() {
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-brand-dark hover:bg-brand-soft"
      onClick={async () => {
        setPending(true);
        await api("/api/auth/logout", { method: "POST", body: {} }).catch(() => {});
        // Rechargement complet voulu : vide l'état client lié à la session.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/");
      }}
    >
      Se déconnecter
    </button>
  );
}

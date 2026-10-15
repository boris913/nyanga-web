"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, errorMessage, uploadToBucket } from "@/lib/client-api";
import type { Verification } from "@/lib/types";

type Presign = { key: string; url: string; fields: Record<string, string> };

export function VerificationUpload({ status }: { status: Verification }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "VERIFIED") return <p className="alert alert-ok mt-3 text-sm">Votre photo est vérifiée : le badge apparaît sur votre annonce.</p>;
  if (status === "PENDING") return <p className="alert alert-info mt-3 text-sm">Selfie reçu, un modérateur le compare à vos photos.</p>;

  async function onFile(file: File) {
    setPending(true);
    setError(null);
    try {
      const presign = await api<Presign>("/api/me/verification/upload", { body: { contentType: file.type } });
      await uploadToBucket(presign, file);
      await api("/api/me/verification", { body: { key: presign.key } });
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    }
    setPending(false);
  }

  return (
    <div className="mt-3 flex flex-col gap-3 text-sm">
      {status === "REJECTED" && <p className="alert alert-error">La dernière vérification n’a pas abouti. Vous pouvez envoyer un nouveau selfie.</p>}
      <p className="text-muted">
        Prenez un selfie en faisant un « V » avec deux doigts. Il sert uniquement à la vérification et n’est jamais publié.
      </p>
      <label className={`btn btn-outline btn-sm self-start ${pending ? "pointer-events-none opacity-60" : ""}`}>
        {pending ? "Envoi…" : "Envoyer mon selfie"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="user"
          className="sr-only"
          disabled={pending}
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />
      </label>
      {error && <p className="alert alert-error">{error}</p>}
    </div>
  );
}

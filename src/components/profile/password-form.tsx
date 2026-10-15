"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError, errorMessage } from "@/lib/client-api";

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const router = useRouter();
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [status, setStatus] = useState<{ ok?: string; error?: string }>({});
  const [pending, setPending] = useState(false);

  return (
    <form
      className="mt-4 flex flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setStatus({});
        try {
          await api("/api/me/password", { method: "PUT", body: { currentPassword: hasPassword ? currentPassword : undefined, newPassword } });
          setCurrent("");
          setNew("");
          setStatus({ ok: "Mot de passe enregistré." });
          router.refresh();
        } catch (err) {
          setStatus({ error: err instanceof ApiError ? (err.field("newPassword") ?? err.message) : errorMessage(err) });
        }
        setPending(false);
      }}
    >
      {hasPassword && (
        <label className="field">
          <span className="label">Mot de passe actuel</span>
          <input className="input" type="password" autoComplete="current-password" required value={currentPassword} onChange={(e) => setCurrent(e.target.value)} />
        </label>
      )}
      <label className="field">
        <span className="label">Nouveau mot de passe</span>
        <input className="input" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={newPassword} onChange={(e) => setNew(e.target.value)} />
      </label>
      {status.error && <p className="alert alert-error text-sm">{status.error}</p>}
      {status.ok && <p className="alert alert-ok text-sm">{status.ok}</p>}
      <button type="submit" className="btn btn-outline btn-sm self-start" disabled={pending}>Enregistrer</button>
    </form>
  );
}

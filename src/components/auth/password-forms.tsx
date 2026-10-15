"use client";

import Link from "next/link";
import { useState } from "react";
import { api, ApiError, errorMessage } from "@/lib/client-api";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (sent) {
    return (
      <div className="card p-6 sm:p-8">
        <p className="alert alert-ok">
          Si un compte existe pour <strong>{email}</strong>, un email avec un lien vient d’être envoyé. Le lien est valable une heure.
        </p>
        <p className="mt-4 text-sm text-muted">Pensez à regarder dans les courriers indésirables.</p>
      </div>
    );
  }
  return (
    <form
      className="card flex flex-col gap-4 p-6 sm:p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        try {
          await api("/api/auth/password/forgot", { body: { email } });
          setSent(true);
        } catch (err) {
          setError(errorMessage(err));
          setPending(false);
        }
      }}
    >
      <label className="field">
        <span className="label">Email du compte</span>
        <input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {error && <p className="alert alert-error text-sm">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={pending}>Recevoir le lien</button>
      <Link href="/connexion" className="text-center text-sm font-semibold text-brand-dark hover:underline">Retour à la connexion</Link>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!token) {
    return (
      <div className="card p-6 sm:p-8">
        <p className="alert alert-error">Ce lien est incomplet.</p>
        <Link href="/mot-de-passe/oublie" className="btn btn-primary mt-4 w-full">Refaire une demande</Link>
      </div>
    );
  }
  return (
    <form
      className="card flex flex-col gap-4 p-6 sm:p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        if (password !== confirm) return setError("Les deux mots de passe ne correspondent pas.");
        setPending(true);
        setError(null);
        try {
          const r = await api<{ profileComplete: boolean }>("/api/auth/password/reset", { body: { token, password } });
          window.location.assign(r.profileComplete ? "/" : "/profil");
        } catch (err) {
          setError(err instanceof ApiError ? (err.field("password") ?? err.message) : errorMessage(err));
          setPending(false);
        }
      }}
    >
      <label className="field">
        <span className="label">Nouveau mot de passe</span>
        <input className="input" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} />
        <span className="hint">8 caractères minimum.</span>
      </label>
      <label className="field">
        <span className="label">Confirmer</span>
        <input className="input" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </label>
      {error && <p className="alert alert-error text-sm">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={pending}>Enregistrer et me connecter</button>
    </form>
  );
}

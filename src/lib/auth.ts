import { redirect } from "next/navigation";
import { getMe } from "./server-api";

/** Utilisateur connecté, sinon redirection vers la connexion avec retour sur `path`. */
export async function requireMe(path: string, { profile = false } = {}) {
  const me = await getMe();
  if (!me) redirect(`/connexion?suite=${encodeURIComponent(path)}`);
  if (profile && !me.profileComplete) redirect(`/profil?suite=${encodeURIComponent(path)}`);
  return me;
}

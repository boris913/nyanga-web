import type { Gender, Intent, ListingStatus, Plan } from './types';

export const INTENTS: Record<Intent, string> = {
  RELATION: 'Relation sérieuse',
  MARIAGE: 'Mariage',
  AMITIE: 'Amitié',
  SORTIES: 'Sorties',
};

export const GENDERS: Record<Gender, string> = { FEMME: 'Femme', HOMME: 'Homme' };

export const PLANS: Record<Plan, string> = { STANDARD: 'Gratuit', PREMIUM: 'Premium', VIP: 'VIP' };

export const LISTING_STATUS: Record<ListingStatus, string> = {
  PENDING: 'En cours de relecture',
  APPROVED: 'Publiée',
  REJECTED: 'Refusée',
  HIDDEN: 'Masquée',
};

export const formatXaf = (n: number) => `${new Intl.NumberFormat('fr-FR').format(n)} FCFA`;

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Douala' }).format(new Date(iso));

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Douala' }).format(new Date(iso));

export function timeAgo(iso: string, now = Date.now()) {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return 'à l’instant';
  const m = Math.round(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  if (d < 30) return `il y a ${d} j`;
  return `le ${formatDate(iso)}`;
}

/** Chemin interne sûr pour une redirection après connexion. */
export function safeNext(value: unknown, fallback = '/') {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\') ? value : fallback;
}

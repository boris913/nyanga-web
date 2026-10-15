import { cache } from 'react';
import { cookies } from 'next/headers';
import type { City, Me } from './types';

const API_URL = (process.env.API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

export class ApiUnavailableError extends Error {}

/**
 * Appel de l'API depuis un Server Component, avec le cookie de session de la requête.
 * Renvoie null sur 400/401/403/404 ; à appeler sous un <Suspense>.
 */
export async function apiGet<T>(path: string): Promise<T | null> {
  const jar = await cookies();
  const cookie = jar
    .getAll()
    .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
    .join('; ');
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { headers: cookie ? { cookie } : {}, cache: 'no-store' });
  } catch {
    throw new ApiUnavailableError('API injoignable');
  }
  if ([400, 401, 403, 404].includes(res.status)) return null;
  if (!res.ok) throw new ApiUnavailableError(`API ${res.status} sur ${path}`);
  return res.json() as Promise<T>;
}

/** Utilisateur connecté, mémorisé pour la durée de la requête. */
export const getMe = cache(() => apiGet<Me>('/api/me'));

export const getCities = cache(async () => (await apiGet<City[]>('/api/cities')) ?? []);

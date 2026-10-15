export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }

  /** Premier message d'erreur d'un champ renvoyé par la validation de l'API. */
  field(name: string): string | undefined {
    const d = this.details as Record<string, string[] | undefined> | undefined;
    return d && !Array.isArray(d) ? d[name]?.[0] : undefined;
  }
}

/** Appel de l'API depuis le navigateur, via la réécriture /api/* de next.config.ts. */
export async function api<T = unknown>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: init.method ?? (init.body === undefined ? 'GET' : 'POST'),
      headers: init.body === undefined ? undefined : { 'content-type': 'application/json' },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      credentials: 'same-origin',
    });
  } catch {
    throw new ApiError(0, 'Connexion impossible. Vérifiez votre réseau et réessayez.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const fallback = res.status === 429 ? 'Trop de tentatives, patientez un peu.' : 'Une erreur est survenue, réessayez.';
    throw new ApiError(res.status, data?.message ?? fallback, data?.details);
  }
  return data as T;
}

export const errorMessage = (err: unknown) => (err instanceof Error ? err.message : 'Une erreur est survenue, réessayez.');

/** Envoi direct navigateur → bucket avec le formulaire signé renvoyé par l'API. */
export async function uploadToBucket(presign: { url: string; fields: Record<string, string> }, file: File) {
  const form = new FormData();
  for (const [k, v] of Object.entries(presign.fields)) form.append(k, v);
  form.append('file', file);
  const res = await fetch(presign.url, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Envoi de la photo impossible (5 Mo maximum, JPEG, PNG ou WebP).');
}

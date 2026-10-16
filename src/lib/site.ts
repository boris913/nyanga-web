// Adresse publique du site, pour les liens absolus (aperçus de partage).
// SITE_URL une fois le nom de domaine acheté ; sinon l'adresse de production Vercel.
export const SITE_URL =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

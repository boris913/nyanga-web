import type { MetadataRoute } from "next";

// Le référencement attend le nom de domaine définitif : pas de sitemap pour l'instant.
// Les pages privées sont exclues ; les annonces portent elles-mêmes « noindex ».
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/messages", "/mon-annonce", "/profil", "/moderation", "/paiement", "/mot-de-passe"] },
  };
}

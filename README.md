# nyanga-web

Site Next.js 16 de Nyanga : annonces, connexion (email + mot de passe, Google), messagerie, offres et modération.

## Démarrer

```bash
cp .env.example .env.local   # API_URL et NEXT_PUBLIC_GOOGLE_CLIENT_ID
npm install
npm run dev                  # http://localhost:3000, l'API doit tourner sur API_URL
```

## Fonctionnement

- Le navigateur appelle `/api/*` sur le domaine du site ; `next.config.ts` réécrit ces appels vers l'API. Le cookie de session reste donc first-party.
- Les Server Components appellent l'API directement (`src/lib/server-api.ts`) en transmettant les cookies de la requête.
- `cacheComponents` est actif : tout accès aux cookies, à `params`, à `searchParams` ou à l'API se fait dans un composant sous `<Suspense>`, sinon `next build` échoue.

## Connexion Google

Créer un identifiant OAuth « Application Web » dans Google Cloud Console, avec l'origine JavaScript autorisée du site (ex. `https://nyanga.cm` et `http://localhost:3000`). Le même identifiant va dans `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (site) et `GOOGLE_CLIENT_ID` (API).

## Photos

Les photos partent directement du navigateur vers le bucket S3/R2 (formulaire signé par l'API). Le bucket doit autoriser en CORS les `POST` depuis l'origine du site.

import { getCities } from "@/lib/server-api";
import { GENDERS, INTENTS } from "@/lib/format";

export type SearchValues = { ville?: string; intention?: string; genre?: string; age_min?: string; age_max?: string };

// Formulaire GET classique : fonctionne sans JavaScript et donne des URLs partageables.
export async function SearchForm({ values = {}, compact = false }: { values?: SearchValues; compact?: boolean }) {
  const cities = await getCities().catch(() => []);
  return (
    <form action="/annonces" className={`grid gap-3 ${compact ? "sm:grid-cols-2 lg:grid-cols-6" : "sm:grid-cols-2"}`}>
      <label className="field">
        <span className="label">Ville</span>
        <select name="ville" defaultValue={values.ville ?? ""} className="input">
          <option value="">Tout le Cameroun</option>
          {cities.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span className="label">Je cherche</span>
        <select name="genre" defaultValue={values.genre ?? ""} className="input">
          <option value="">Femme ou homme</option>
          {Object.entries(GENDERS).map(([k, v]) => (
            <option key={k} value={k}>{v === "Femme" ? "Une femme" : "Un homme"}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span className="label">Pour</span>
        <select name="intention" defaultValue={values.intention ?? ""} className="input">
          <option value="">Toutes les intentions</option>
          {Object.entries(INTENTS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </label>
      {compact && (
        <div className="grid grid-cols-2 gap-3 lg:col-span-2">
          <label className="field">
            <span className="label">Âge min.</span>
            <input name="age_min" type="number" min={18} max={99} inputMode="numeric" defaultValue={values.age_min} placeholder="18" className="input" />
          </label>
          <label className="field">
            <span className="label">Âge max.</span>
            <input name="age_max" type="number" min={18} max={99} inputMode="numeric" defaultValue={values.age_max} placeholder="99" className="input" />
          </label>
        </div>
      )}
      <div className="flex items-end">
        <button type="submit" className="btn btn-primary w-full">Rechercher</button>
      </div>
    </form>
  );
}

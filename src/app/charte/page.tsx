import type { Metadata } from "next";
import { Container, PageTitle } from "@/components/ui";

export const metadata: Metadata = {
  title: "Charte et sécurité",
  description: "Les règles de Nyanga et nos conseils pour des rencontres en toute sécurité.",
};

const RULES = [
  ["Réservé aux adultes", "Nyanga est réservé aux personnes de 18 ans et plus. Tout profil d’une personne mineure est supprimé immédiatement."],
  ["Aucun service tarifé", "Les annonces proposant ou demandant de l’argent, des cadeaux ou des services sexuels sont interdites et entraînent un bannissement."],
  ["Vous, et seulement vous", "Publiez uniquement vos propres photos, visage visible et sans nudité. Une seule annonce par personne."],
  ["Respect", "Insultes, harcèlement, propos haineux ou menaces : le compte est suspendu."],
  ["Pas de coordonnées dans le texte", "Votre numéro va dans le champ WhatsApp prévu, jamais dans le titre ou la présentation : sur le site, il reste masqué."],
];

const TIPS = [
  "N’envoyez jamais d’argent, de crédit ou de code de transfert à quelqu’un rencontré en ligne, quelle que soit l’histoire racontée.",
  "Pour un premier rendez-vous, choisissez un lieu public et fréquenté, et prévenez un proche.",
  "Prenez le temps : une personne qui presse, refuse un appel vidéo ou change souvent de version doit vous alerter.",
  "Ne partagez ni adresse, ni lieu de travail, ni photos intimes au début d’un échange.",
  "Un doute ? Signalez l’annonce : un modérateur la regarde rapidement, et l’auteur n’est pas averti.",
];

export default function CharterPage() {
  return (
    <Container>
      <div className="max-w-3xl">
        <PageTitle title="Charte et sécurité" subtitle="Nyanga est un lieu de rencontre respectueux. Notre équipe surveille les annonces et traite chaque signalement." />

        <section>
          <h2 className="font-display text-2xl font-semibold">Les règles</h2>
          <dl className="mt-5 flex flex-col gap-4">
            {RULES.map(([title, text]) => (
              <div key={title} className="card p-5">
                <dt className="font-semibold">{title}</dt>
                <dd className="mt-1 text-muted">{text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">Se protéger</h2>
          <ul className="mt-5 flex flex-col gap-3">
            {TIPS.map((t) => (
              <li key={t} className="flex gap-3">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-brand" aria-hidden />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">Vos données</h2>
          <p className="mt-3 text-muted">
            Votre email et votre numéro Mobile Money ne sont jamais affichés. Votre numéro WhatsApp apparaît masqué sur le site
            (« +237 6XX XX XX XX ») : seule la personne qui ouvre WhatsApp pour vous écrire le voit en entier. Votre selfie de vérification est vu uniquement par l’équipe de
            modération. Les paiements sont traités par Chariow : Nyanga n’a pas accès à vos informations de paiement.
          </p>
        </section>
      </div>
    </Container>
  );
}

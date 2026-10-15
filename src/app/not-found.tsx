import { Container, EmptyState } from "@/components/ui";

export default function NotFound() {
  return (
    <Container>
      <div className="my-16">
        <EmptyState title="Page introuvable" action={{ href: "/annonces", label: "Voir les annonces" }}>
          Cette page n’existe pas, ou l’annonce n’est plus en ligne.
        </EmptyState>
      </div>
    </Container>
  );
}

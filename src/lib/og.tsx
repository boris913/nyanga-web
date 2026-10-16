import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { BRAND, HEART_PATH } from "./brand";

// Images générées (icônes, aperçus de partage) : la police est embarquée, aucune dépendance réseau.
const playfair = readFile(join(process.cwd(), "assets/PlayfairDisplay-BoldItalic.ttf"));

export async function brandFonts() {
  return [{ name: "Playfair", data: await playfair, style: "italic" as const, weight: 700 as const }];
}

/** Le logo A : cœur rouge portant un N blanc. `letter` à false pour les très petites tailles. */
export function HeartMark({ size, letter = true }: { size: number; letter?: boolean }) {
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex" }}>
      <svg width={size} height={size} viewBox="0 0 64 64">
        <path d={HEART_PATH} fill={BRAND.red} />
      </svg>
      {letter && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size,
            height: size,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: size * 0.1,
            lineHeight: 1,
            color: "#fff",
            fontFamily: "Playfair",
            fontStyle: "italic",
            fontSize: size * 0.42,
          }}
        >
          N
        </div>
      )}
    </div>
  );
}

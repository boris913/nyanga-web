import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";
import { HeartMark, brandFonts } from "@/lib/og";

export const alt = "Nyanga, rencontres au Cameroun";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: `linear-gradient(160deg, ${BRAND.rose} 0%, ${BRAND.cream} 70%)`,
          color: BRAND.ink,
          fontFamily: "Playfair",
          fontStyle: "italic",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <HeartMark size={150} />
          <div style={{ fontSize: 132 }}>Nyanga</div>
        </div>
        <div style={{ fontSize: 44, color: BRAND.redDark }}>Rencontres au Cameroun</div>
      </div>
    ),
    { ...size, fonts: await brandFonts() },
  );
}

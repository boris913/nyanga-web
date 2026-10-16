import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";
import { HeartMark, brandFonts } from "@/lib/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS arrondit lui-même les coins : fond plein, cœur centré.
export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: BRAND.cream }}>
        <HeartMark size={136} />
      </div>
    ),
    { ...size, fonts: await brandFonts() },
  );
}

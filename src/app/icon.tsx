import { ImageResponse } from "next/og";
import { HeartMark, brandFonts } from "@/lib/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(<HeartMark size={64} />, { ...size, fonts: await brandFonts() });
}

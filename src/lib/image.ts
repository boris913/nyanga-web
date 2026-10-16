// Préparation des photos dans le navigateur, avant l'envoi : réduites, compressées et, pour les annonces,
// marquées du filigrane Nyanga. Un téléphone envoie ainsi ~200 Ko au lieu de plusieurs Mo.
import { BRAND, HEART_PATH } from "./brand";

const MAIN_MAX = 1600;
const THUMB_MAX = 480;

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Navigateur ancien : repli sur <img>.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // WebP quand le navigateur sait l'encoder, sinon JPEG.
    canvas.toBlob(
      (webp) => {
        if (webp && webp.type === "image/webp") return resolve(webp);
        canvas.toBlob((jpeg) => (jpeg ? resolve(jpeg) : reject(new Error("Photo illisible"))), "image/jpeg", quality);
      },
      "image/webp",
      quality,
    );
  });
}

function draw(source: ImageBitmap | HTMLImageElement | HTMLCanvasElement, max: number) {
  const w = source.width;
  const h = source.height;
  const scale = Math.min(1, max / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Photo illisible");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return { canvas, ctx };
}

/** Filigrane « ♥ nyanga » en bas à droite, rouge Nyanga cerné de blanc pour rester lisible sur toute photo. */
async function watermark(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-playfair").trim() || "Georgia, serif";
  const fontSize = Math.round(Math.max(18, Math.min(canvas.width, canvas.height) * 0.1));
  const font = `italic 700 ${fontSize}px ${family}`;
  await document.fonts.load(font).catch(() => undefined);
  const margin = Math.round(fontSize * 0.55);
  const heart = fontSize * 0.9;
  ctx.font = font;
  ctx.textBaseline = "alphabetic";
  const text = "nyanga";
  const textWidth = ctx.measureText(text).width;
  const x = canvas.width - margin - textWidth;
  const y = canvas.height - margin;

  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.shadowColor = "rgba(255,255,255,0.7)";
  ctx.shadowBlur = fontSize * 0.15;
  // Cœur
  const hx = x - heart - fontSize * 0.15;
  const hy = y - heart * 0.92;
  ctx.translate(hx, hy);
  ctx.scale(heart / 64, heart / 64);
  const path = new Path2D(HEART_PATH);
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke(path);
  ctx.fillStyle = BRAND.red;
  ctx.fill(path);
  ctx.restore();
  // Texte
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.font = font;
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(2, fontSize * 0.09);
  ctx.strokeStyle = "#ffffff";
  ctx.strokeText(text, x, y);
  ctx.fillStyle = BRAND.red;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** Photo d'annonce : version principale filigranée (1600 px) et vignette (480 px). */
export async function prepareListingPhoto(file: File): Promise<{ main: Blob; thumb: Blob }> {
  const source = await loadBitmap(file);
  const main = draw(source, MAIN_MAX);
  await watermark(main.canvas, main.ctx);
  const thumb = draw(main.canvas, THUMB_MAX);
  if ("close" in source) source.close();
  return { main: await toBlob(main.canvas, 0.82), thumb: await toBlob(thumb.canvas, 0.78) };
}

/** Selfie de vérification : seulement réduit, sans filigrane (il n'est jamais public). */
export async function prepareSelfie(file: File): Promise<Blob> {
  const source = await loadBitmap(file);
  const { canvas } = draw(source, MAIN_MAX);
  if ("close" in source) source.close();
  return toBlob(canvas, 0.85);
}

// src/lib/image-fallback.ts — skip if the site already has it.
import type { ImageMetadata } from "astro";

// `<Picture formats={["webp"]}>` still emits an `<img>` fallback whose format
// Astro picks itself: PNG, unless the source is gif/svg/jpg/jpeg. A webp or avif
// featured image would therefore ship a PNG fallback several times its size.
// Mirror the source for those two; return undefined otherwise so Astro's
// correct same-format fallback applies.
export function fallbackFormat(img: ImageMetadata): "webp" | undefined {
  return img.format === "webp" || img.format === "avif" ? "webp" : undefined;
}

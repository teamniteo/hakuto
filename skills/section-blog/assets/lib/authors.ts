// src/lib/authors.ts — author photos for bylines and the author box.
import type { ImageMetadata } from "astro";
// import janeDoe from "@/assets/authors/jane-doe.jpg";

// Keyed by the `author` value in a post's frontmatter. Photos live in
// src/assets/authors/ and go through the image pipeline, so posts make no
// third-party request. An author without an entry gets no avatar.
const PHOTOS: Record<string, ImageMetadata> = {
  // "Jane Doe": janeDoe,
};

export const authorPhoto = (name: string): ImageMetadata | undefined => PHOTOS[name];

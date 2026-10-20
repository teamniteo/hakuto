// src/lib/rehype-content-images.ts
import type { Root } from "hast";

// Right-sizes pipeline-processed images inside Markdown posts. Without an
// explicit width the image service serves the intrinsic-resolution file into the
// 768px article column (`max-w-3xl` in src/pages/blog/[...slug].astro), and
// Astro's default `sizes` resolves to 100vw.
//
// These are NOT plain HTML attributes. @astrojs/markdown-remark runs user rehype
// plugins *before* its own `rehypeImages`, which folds the whole `node.properties`
// object into the `__ASTRO_IMAGE_` payload that `getImage()` later consumes. So
// everything set here is a real transform option — which is also why this must
// stay a user rehype plugin.
//
// `widths` is mandatory: Astro's `getSrcSet` returns [] unless `widths` or
// `densities` is present, which would leave every image with a single candidate
// and an inert `sizes`. Widths above a source's intrinsic width are clamped, never
// upscaled. If the article column is not 768px, change all three numbers together.
//
// Scoped to blog posts: `markdown.rehypePlugins` runs on every Markdown file in the
// site (docs, Markdown pages), and their columns are not 768px. Other collections
// need their own measured numbers.
const BLOG_DIR = /[\\/]src[\\/]content[\\/]blog[\\/]/;

export function rehypeContentImages() {
  return (tree: Root, file: { path?: string }) => {
    if (!BLOG_DIR.test(file.path ?? "")) return;
    visit(tree, (node) => {
      if (node.type !== "element" || node.tagName !== "img") return;
      node.properties = node.properties ?? {};
      if (node.properties.loading == null) node.properties.loading = "lazy";
      if (node.properties.decoding == null) node.properties.decoding = "async";
      if (node.properties.width == null && node.properties.height == null) {
        node.properties.width = 768;
      }
      if (node.properties.sizes == null) {
        node.properties.sizes = "(min-width: 768px) 768px, 100vw";
      }
      if (node.properties.widths == null && node.properties.densities == null) {
        node.properties.widths = [384, 768, 1536];
      }
    });
  };
}

type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: unknown[];
};

function visit(node: unknown, fn: (node: HastNode) => void) {
  if (!node) return;
  const n = node as HastNode;
  fn(n);
  if (Array.isArray(n.children)) {
    for (const child of n.children) visit(child, fn);
  }
}

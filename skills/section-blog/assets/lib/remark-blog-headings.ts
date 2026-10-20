// src/lib/remark-blog-headings.ts
import type { Root } from "mdast";

// The post template renders the title as the page's only <h1>. Authors (and
// imported posts) often start sections with `#`, which would add a second one,
// so demote every Markdown H1 to H2. Deeper levels are left alone.
export function remarkBlogHeadings() {
  return (tree: Root) => {
    const walk = (node: { type: string; depth?: number; children?: unknown[] }) => {
      if (node.type === "heading" && node.depth === 1) node.depth = 2;
      if (Array.isArray(node.children)) {
        for (const child of node.children) walk(child as typeof node);
      }
    };
    walk(tree as unknown as { type: string; children?: unknown[] });
  };
}

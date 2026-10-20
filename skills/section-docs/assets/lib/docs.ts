// src/lib/docs.ts — the one place that decides which docs pages exist and in
// what order. The sidebar, previous/next links, the docs home and the page
// routes all go through getDocs(), so a draft can never appear on one and be
// hidden on another.
import { getCollection, type CollectionEntry } from "astro:content";

export type Doc = CollectionEntry<"docs">;

/**
 * Sidebar order and display names for the category folders under
 * src/content/docs/. Folders not listed here sort after these, alphabetically,
 * labelled from the folder name ("how-to" → "How To").
 */
export const CATEGORIES: { slug: string; label: string }[] = [
  { slug: "getting-started", label: "Getting Started" },
  { slug: "guides", label: "Guides" },
  { slug: "api", label: "API Reference" },
  { slug: "faq", label: "FAQ" },
];

/** Pages at the top level of src/content/docs/ (no folder) land here. */
const UNCATEGORISED = "general";

export function categoryOf(doc: Doc): string {
  return doc.id.includes("/") ? doc.id.split("/")[0] : UNCATEGORISED;
}

export function categoryLabel(slug: string): string {
  const known = CATEGORIES.find((c) => c.slug === slug);
  if (known) return known.label;
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function categoryRank(slug: string): number {
  const i = CATEGORIES.findIndex((c) => c.slug === slug);
  return i === -1 ? CATEGORIES.length : i;
}

export const docHref = (doc: Doc) => `/docs/${doc.id}/`;

export const sidebarLabel = (doc: Doc) => doc.data.sidebarLabel ?? doc.data.title;

/** Published pages in reading order: category order, then `order`, then title. */
export async function getDocs(): Promise<Doc[]> {
  const docs = await getCollection("docs", ({ data }) => !data.draft);
  return docs.sort((a, b) => {
    const ca = categoryOf(a);
    const cb = categoryOf(b);
    if (ca !== cb) {
      return categoryRank(ca) - categoryRank(cb) || ca.localeCompare(cb);
    }
    const oa = a.data.order ?? Number.POSITIVE_INFINITY;
    const ob = b.data.order ?? Number.POSITIVE_INFINITY;
    if (oa !== ob) return oa - ob;
    return a.data.title.localeCompare(b.data.title);
  });
}

export interface DocGroup {
  slug: string;
  label: string;
  docs: Doc[];
}

/** Group already-sorted docs by category, keeping their order. */
export function groupDocs(docs: Doc[]): DocGroup[] {
  const groups: DocGroup[] = [];
  for (const doc of docs) {
    const slug = categoryOf(doc);
    let group = groups.find((g) => g.slug === slug);
    if (!group) {
      group = { slug, label: categoryLabel(slug), docs: [] };
      groups.push(group);
    }
    group.docs.push(doc);
  }
  return groups;
}

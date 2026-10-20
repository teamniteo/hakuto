// src/lib/blog.ts — the one place that decides which posts exist, in what
// order, and how they paginate. Every blog route and the RSS feed go through it,
// so a draft can never leak onto one route while being hidden on another.
import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

/** Cards per page after the featured (latest) post. A multiple of 2 and 3 fills the grid. */
export const PER_PAGE = 12;

/** Published posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Page 1 lives at /blog/ and shows the featured post plus PER_PAGE cards. */
export function totalPages(posts: Post[]): number {
  return Math.max(1, Math.ceil((posts.length - 1) / PER_PAGE));
}

/** Cards for a page, excluding the featured post. `page` is 1-based. */
export function pagePosts(posts: Post[], page: number): Post[] {
  const rest = posts.slice(1);
  return rest.slice((page - 1) * PER_PAGE, page * PER_PAGE);
}

export function pageHref(page: number): string {
  return page === 1 ? "/blog/" : `/blog/page/${page}/`;
}

// Lossy: case and punctuation are dropped, so "C++" and "C" both become "c", and
// "News" / "news" are two categories with one URL. getStaticPaths then emits
// duplicate params; the build only warns ("conflicts with higher priority route")
// and the other category's posts have no archive. Keep category names distinct
// after slugging (and consistently cased) across posts.
export function categorySlug(category: string): string {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function categoryHref(category: string): string {
  return `/blog/category/${categorySlug(category)}/`;
}

export function categories(posts: Post[]): string[] {
  return Array.from(new Set(posts.map((p) => p.data.category))).sort();
}

export const postHref = (post: Post) => `/blog/${post.data.slug}/`;

export const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

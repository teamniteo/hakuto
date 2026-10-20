// src/pages/blog/rss.xml.ts — needs `@astrojs/rss`.
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getPosts, postHref } from "@/lib/blog";
import { SITE_NAME } from "@/lib/site";

export async function GET(context: APIContext) {
  const posts = await getPosts();

  return rss({
    title: `${SITE_NAME} Blog`,
    // Keep in step with BLOG_DESCRIPTION in src/pages/blog/index.astro.
    description: "Notes, updates and lessons from the team.",
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postHref(post),
      author: post.data.author,
      categories: [post.data.category],
    })),
  });
}

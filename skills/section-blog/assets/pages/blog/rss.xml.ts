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
    description: "TODO: One sentence on what this blog covers.",
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postHref(post),
      // RSS 2.0 <author> must be an email address; "email (Name)" is the
      // accepted form. Without an email, omit it rather than emit an invalid value.
      ...(post.data.authorEmail && {
        author: `${post.data.authorEmail} (${post.data.author})`,
      }),
      categories: [post.data.category],
    })),
  });
}

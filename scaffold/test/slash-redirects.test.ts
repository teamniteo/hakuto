import { describe, expect, test } from "bun:test";
import { insertStaticRules, STATIC_RULE_LIMIT, slashRedirectRules } from "../src/lib/slash-redirects";

describe("slashRedirectRules", () => {
  test("301s the unslashed path and index.html to the slashed page", () => {
    const { rules, dropped } = slashRedirectRules(["index.html", "pricing/index.html", "404.html"]);
    expect(rules).toEqual([
      "/404 /404/ 301",
      "/pricing /pricing/ 301",
      "/404.html /404/ 301",
      "/index.html / 301",
      "/pricing/index.html /pricing/ 301",
    ]);
    expect(dropped).toBe(0);
  });

  test("skips sources the site's own _redirects already handles", () => {
    const existing = "# moved\n/pricing /plans/ 301\n/blog/* /posts/:splat 301\n";
    const { rules } = slashRedirectRules(["pricing/index.html"], existing);
    expect(rules).toEqual(["/pricing/index.html /pricing/ 301"]);
  });

  test("stops at the static rule limit, unslashed rules first", () => {
    const pages = Array.from({ length: STATIC_RULE_LIMIT }, (_, i) => `p${String(i).padStart(4, "0")}/index.html`);
    const { rules, dropped } = slashRedirectRules(pages, "/a /b 301\n");
    expect(rules).toHaveLength(STATIC_RULE_LIMIT - 1);
    expect(rules.every((rule) => !rule.includes("index.html"))).toBe(true);
    expect(dropped).toBe(STATIC_RULE_LIMIT + 1);
  });
});

describe("insertStaticRules", () => {
  test("appends when the file has no dynamic rule", () => {
    expect(insertStaticRules("/old /new/ 301\n", ["/a /a/ 301"])).toBe(
      "/old /new/ 301\n# Permanent trailing-slash redirects (src/lib/slash-redirects.ts)\n/a /a/ 301\n",
    );
  });

  test("goes before the first dynamic rule and the comments above it", () => {
    const existing = "/old /new/ 301\n\n# Wildcards\n/blog/* /posts/:splat 301\n/x /y/ 301\n";
    expect(insertStaticRules(existing, ["/a /a/ 301"])).toBe(
      "/old /new/ 301\n# Permanent trailing-slash redirects (src/lib/slash-redirects.ts)\n/a /a/ 301\n\n# Wildcards\n/blog/* /posts/:splat 301\n/x /y/ 301\n",
    );
  });

  test("leaves the file alone when there is nothing to add", () => {
    expect(insertStaticRules("/old /new/ 301\n", [])).toBe("/old /new/ 301\n");
  });
});

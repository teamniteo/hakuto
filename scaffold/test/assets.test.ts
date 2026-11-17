import { describe, expect, test } from "bun:test";
import { serveAsset } from "../worker/assets.js";

const assetsReturning = (status: number, location: string) => ({
  ASSETS: { fetch: async () => new Response(null, { status, headers: { Location: location } }) },
});

describe("serveAsset trailing-slash redirects", () => {
  test("upgrades the asset layer's 307 to the slashed URL into a 301", async () => {
    const r = await serveAsset(new Request("https://example.com/pricing"), assetsReturning(307, "/pricing/"));
    expect(r.status).toBe(301);
    expect(r.headers.get("location")).toBe("/pricing/");
  });

  test("keeps the query string", async () => {
    const r = await serveAsset(new Request("https://example.com/pricing?ref=x"), assetsReturning(307, "/pricing/?ref=x"));
    expect(r.status).toBe(301);
    expect(r.headers.get("location")).toBe("/pricing/?ref=x");
  });

  test("upgrades the index.html redirect into a 301", async () => {
    const root = await serveAsset(new Request("https://example.com/index.html"), assetsReturning(307, "/"));
    expect(root.status).toBe(301);
    const inner = await serveAsset(new Request("https://example.com/pricing/index.html"), assetsReturning(307, "/pricing/"));
    expect(inner.status).toBe(301);
  });

  test("leaves other redirects alone", async () => {
    const elsewhere = await serveAsset(new Request("https://example.com/pricing"), assetsReturning(307, "/contact/"));
    expect(elsewhere.status).toBe(307);
    const offOrigin = await serveAsset(new Request("https://example.com/pricing"), assetsReturning(307, "https://other.example/pricing/"));
    expect(offOrigin.status).toBe(307);
    const rule302 = await serveAsset(new Request("https://example.com/pricing"), assetsReturning(302, "/pricing/"));
    expect(rule302.status).toBe(302);
  });
});

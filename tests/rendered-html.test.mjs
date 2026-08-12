import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders Raahi Radio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Raahi Radio — The music between places/i);
  assert.match(html, /Every road/);
  assert.match(html, /has a story/);
  assert.match(html, /ADD YOUR FAVOURITE/);
  assert.match(html, /NO SKIPS/);
});

test("keeps the timed YouTube playlists and route videos configured", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /evening:"PLIPDf95_3JuY"/);
  assert.match(page, /night:"PLHd1XcVg5sFQ"/);
  assert.match(page, /midnight:"PLCwDI18At20k"/);
  assert.match(page, /if\(hour<5\)return"midnight"; if\(hour>=15&&hour<21\)return"evening"; if\(hour>=21\)return"night"; return"day"/);
  assert.match(page, /\$\{routeTerrain\}\.mp4/);
});

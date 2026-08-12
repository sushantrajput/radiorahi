/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/listeners" && request.method === "POST") {
      try {
        const body = await request.json() as { sessionId?: string };
        const sessionId = String(body.sessionId ?? "").slice(0, 80);
        if (!sessionId) return Response.json({ error: "Missing session" }, { status: 400 });
        const now = Date.now();
        const cutoff = now - 120_000;
        await env.DB.batch([
          env.DB.prepare("DELETE FROM listener_sessions WHERE last_seen < ?").bind(cutoff),
          env.DB.prepare("INSERT INTO listener_sessions (session_id, last_seen) VALUES (?, ?) ON CONFLICT(session_id) DO UPDATE SET last_seen = excluded.last_seen").bind(sessionId, now),
        ]);
        const row = await env.DB.prepare("SELECT COUNT(*) AS count FROM listener_sessions WHERE last_seen >= ?").bind(cutoff).first<{ count: number }>();
        return Response.json({ count: Number(row?.count ?? 1) }, { headers: { "cache-control": "no-store" } });
      } catch {
        return Response.json({ count: 1 }, { headers: { "cache-control": "no-store" } });
      }
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;

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

    if (url.pathname === "/api/rooms" && request.method === "GET") {
      const roomId = String(url.searchParams.get("room") ?? "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
      if (!roomId) return Response.json({ error: "Missing room" }, { status: 400 });
      const room = await env.DB.prepare("SELECT room_id AS roomId, route_from AS routeFrom, route_to AS routeTo, track_cursor AS trackCursor, playing, position_seconds AS positionSeconds, updated_at AS updatedAt FROM listening_rooms WHERE room_id = ?").bind(roomId).first();
      return room ? Response.json(room, { headers: { "cache-control": "no-store" } }) : Response.json({ error: "Room not found" }, { status: 404 });
    }

    if (url.pathname === "/api/rooms" && request.method === "POST") {
      try {
        const body = await request.json() as { action?: string; roomId?: string; ownerId?: string; routeFrom?: string; routeTo?: string; trackCursor?: number; playing?: boolean; positionSeconds?: number };
        const roomId = String(body.roomId ?? "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
        const ownerId = String(body.ownerId ?? "").slice(0, 80);
        const routeFrom = String(body.routeFrom ?? "").slice(0, 80);
        const routeTo = String(body.routeTo ?? "").slice(0, 80);
        if (!roomId || !ownerId || !routeFrom || !routeTo) return Response.json({ error: "Invalid room" }, { status: 400 });
        const now = Date.now();
        if (body.action === "create") {
          await env.DB.prepare("INSERT INTO listening_rooms (room_id, owner_id, route_from, route_to, track_cursor, playing, position_seconds, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(roomId, ownerId, routeFrom, routeTo, Math.max(0, Number(body.trackCursor) || 0), body.playing ? 1 : 0, Math.max(0, Math.round(Number(body.positionSeconds) || 0)), now).run();
        } else {
          const result = await env.DB.prepare("UPDATE listening_rooms SET route_from = ?, route_to = ?, track_cursor = ?, playing = ?, position_seconds = ?, updated_at = ? WHERE room_id = ? AND owner_id = ?").bind(routeFrom, routeTo, Math.max(0, Number(body.trackCursor) || 0), body.playing ? 1 : 0, Math.max(0, Math.round(Number(body.positionSeconds) || 0)), now, roomId, ownerId).run();
          if (!result.meta.changes) return Response.json({ error: "Room owner mismatch" }, { status: 403 });
        }
        ctx.waitUntil(env.DB.prepare("DELETE FROM listening_rooms WHERE updated_at < ?").bind(now - 86_400_000).run());
        return Response.json({ roomId, updatedAt: now }, { headers: { "cache-control": "no-store" } });
      } catch {
        return Response.json({ error: "Unable to update room" }, { status: 500 });
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

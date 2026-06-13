/* ============================================================
   华夏神话 — public API guard (key auth + KV rate limit)

   Both are opt-in via bindings, so the API is open until you configure them:
     - API key: enforced only when the `API_KEYS` var is a non-empty,
       comma-separated allowlist. Clients send `x-api-key: <key>`.
     - Rate limit: enforced only when the `RATE_LIMIT` KV namespace exists.
   This is the metering layer for the BRD "数据/API 订阅" path.
   ============================================================ */
import type { MiddlewareHandler } from "hono";

const WINDOW_SECONDS = 60;
const LIMIT_PER_WINDOW = 120;

export const apiGuard: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
	// ---- API key (only when an allowlist is configured) ----
	const allowlist = c.env.API_KEYS?.trim();
	if (allowlist) {
		const provided = c.req.header("x-api-key");
		const valid = allowlist
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
		if (!provided || !valid.includes(provided)) {
			return c.json(
				{ error: "missing or invalid API key", docs: "/about" },
				401,
			);
		}
	}

	// ---- rate limit (only when KV is bound) ----
	const kv = c.env.RATE_LIMIT;
	if (kv) {
		const id =
			c.req.header("x-api-key") ||
			c.req.header("cf-connecting-ip") ||
			"anon";
		const bucketStart = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);
		const key = `rl:${id}:${bucketStart}`;
		const current = Number.parseInt((await kv.get(key)) ?? "0", 10);
		if (current >= LIMIT_PER_WINDOW) {
			c.header("retry-after", String(WINDOW_SECONDS));
			return c.json(
				{ error: "rate limit exceeded", limit: LIMIT_PER_WINDOW, window: WINDOW_SECONDS },
				429,
			);
		}
		await kv.put(key, String(current + 1), { expirationTtl: WINDOW_SECONDS * 2 });
		c.header("x-ratelimit-limit", String(LIMIT_PER_WINDOW));
		c.header("x-ratelimit-remaining", String(Math.max(0, LIMIT_PER_WINDOW - current - 1)));
	}

	await next();
};

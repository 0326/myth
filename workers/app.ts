import { Hono } from "hono";
import { createRequestHandler } from "react-router";
import { getCreature, getGraph, listCreatures } from "~/data/repo";
import { apiGuard } from "~/lib/apiGuard";

// Make Cloudflare bindings available inside React Router loaders/actions via
// `context.cloudflare.env` (loaders read `env.DB` for D1).
declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
	}
}

// ---- Public data API (BRD "数据/API 订阅") ----
const api = new Hono<{ Bindings: Env }>();

api.get("/api/health", (c) => c.json({ ok: true, service: "huaxia-myth" }));

// API-key + rate-limit guard for the data endpoints (no key required while no
// API_KEYS / RATE_LIMIT binding is configured — see lib/apiGuard).
api.use("/api/creatures", apiGuard);
api.use("/api/creatures/*", apiGuard);
api.use("/api/graph", apiGuard);

api.get("/api/creatures", async (c) => {
	const data = await listCreatures(c.env.DB);
	return c.json({ count: data.length, creatures: data });
});

api.get("/api/creatures/:id", async (c) => {
	const found = await getCreature(c.req.param("id"), c.env.DB);
	if (!found) return c.json({ error: "not found" }, 404);
	return c.json(found);
});

api.get("/api/graph", async (c) => {
	const data = await getGraph(c.env.DB);
	return c.json(data);
});

const reactRouterHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	fetch(request, env, ctx) {
		const url = new URL(request.url);
		if (url.pathname.startsWith("/api/")) {
			return api.fetch(request, env, ctx);
		}
		return reactRouterHandler(request, { cloudflare: { env, ctx } });
	},
} satisfies ExportedHandler<Env>;

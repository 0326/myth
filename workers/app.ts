import { Hono } from "hono";
import { createRequestHandler } from "react-router";

// Make Cloudflare bindings available inside React Router loaders/actions via
// `context.cloudflare.env`. Phase 1 uses local TS data so this is unused yet;
// Phase 2 (D1 + /api) will read bindings here.
declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
	}
}

// Hono carries the data API. Phase 1 only exposes a health check; Phase 2 grows
// /api/creatures, /api/creatures/:id, /api/graph here (BRD "数据/API 订阅").
const api = new Hono<{ Bindings: Env }>();
api.get("/api/health", (c) => c.json({ ok: true, service: "huaxia-myth" }));

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

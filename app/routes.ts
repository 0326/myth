import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("bestiary", "routes/bestiary.tsx"),
	route("creature/:id", "routes/creature.tsx"),
	route("graph", "routes/graph.tsx"),
	route("atlas", "routes/atlas.tsx"),
	route("quiz", "routes/quiz.tsx"),
	route("about", "routes/about.tsx"),
	route("og/creature/:id", "routes/og-creature.tsx"),
	route("sitemap.xml", "routes/sitemap.tsx"),
	route("robots.txt", "routes/robots.tsx"),
] satisfies RouteConfig;

import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("bestiary", "routes/bestiary.tsx"),
	route("creature/:id", "routes/creature.tsx"),
	route("graph", "routes/graph.tsx"),
	route("sitemap.xml", "routes/sitemap.tsx"),
	route("robots.txt", "routes/robots.tsx"),
] satisfies RouteConfig;

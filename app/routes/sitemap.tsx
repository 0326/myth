import type { Route } from "./+types/sitemap";
import { listCreatures } from "~/data/repo";

const STATIC_PATHS = ["/", "/bestiary", "/graph"];

export async function loader({ request }: Route.LoaderArgs) {
	const origin = new URL(request.url).origin;
	const creatures = await listCreatures();
	const paths = [...STATIC_PATHS, ...creatures.map((c) => `/creature/${c.id}`)];

	const urls = paths
		.map((path) => {
			const loc = `${origin}${path}`;
			// emit zh / en / x-default alternates for each URL
			const alternates = [
				`<xhtml:link rel="alternate" hreflang="zh-CN" href="${loc}?lang=zh"/>`,
				`<xhtml:link rel="alternate" hreflang="en" href="${loc}?lang=en"/>`,
				`<xhtml:link rel="alternate" hreflang="x-default" href="${loc}"/>`,
			].join("");
			return `<url><loc>${loc}</loc>${alternates}</url>`;
		})
		.join("");

	const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`;

	return new Response(body, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
}

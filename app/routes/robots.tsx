import type { Route } from "./+types/robots";

export async function loader({ request }: Route.LoaderArgs) {
	const origin = new URL(request.url).origin;
	const body = [
		"User-agent: *",
		"Allow: /",
		"",
		`Sitemap: ${origin}/sitemap.xml`,
		"",
	].join("\n");
	return new Response(body, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}

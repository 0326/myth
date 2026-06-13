/* ============================================================
   华夏神话 — SEO helpers (meta tags, hreflang, canonical, OG, JSON-LD)

   Used by each route's meta() export. SSR renders these into the document
   <head> on the server, so crawlers and AI search see titles + structured
   data in the raw HTML — the core payoff of SSR-first (BRD §5).
   ============================================================ */
import type { MetaDescriptor } from "react-router";
import type { Lang } from "~/i18n/LangContext";

export const SITE_NAME_ZH = "华夏神话";
export const SITE_NAME_EN = "Huaxia Myth";

interface MetaInput {
	title: string;
	description: string;
	lang: Lang;
	/** absolute current request URL (from the loader: request.url) */
	url: string;
	/** optional schema.org object rendered as <script type="application/ld+json"> */
	jsonLd?: Record<string, unknown>;
	/** optional social share image (absolute or root-relative) */
	image?: string;
}

/** Build the full <head> descriptor list for a route. */
export function buildMeta({
	title,
	description,
	lang,
	url,
	jsonLd,
	image,
}: MetaInput): MetaDescriptor[] {
	const u = new URL(url);
	const origin = u.origin;
	const path = u.pathname;
	const withLang = (l: Lang) => `${origin}${path}?lang=${l}`;
	const canonical = withLang(lang);
	const fullTitle = `${title} · ${lang === "zh" ? SITE_NAME_ZH : SITE_NAME_EN}`;

	const tags: MetaDescriptor[] = [
		{ title: fullTitle },
		{ name: "description", content: description },
		// hreflang alternates — distinct per-language URLs for crawlers
		{ tagName: "link", rel: "canonical", href: canonical },
		{ tagName: "link", rel: "alternate", hrefLang: "zh-CN", href: withLang("zh") },
		{ tagName: "link", rel: "alternate", hrefLang: "en", href: withLang("en") },
		{ tagName: "link", rel: "alternate", hrefLang: "x-default", href: `${origin}${path}` },
		// Open Graph / Twitter
		{ property: "og:type", content: "website" },
		{ property: "og:site_name", content: lang === "zh" ? SITE_NAME_ZH : SITE_NAME_EN },
		{ property: "og:title", content: fullTitle },
		{ property: "og:description", content: description },
		{ property: "og:url", content: canonical },
		{ property: "og:locale", content: lang === "zh" ? "zh_CN" : "en_US" },
		{ name: "twitter:card", content: image ? "summary_large_image" : "summary" },
		{ name: "twitter:title", content: fullTitle },
		{ name: "twitter:description", content: description },
	];

	if (image) {
		const absImage = image.startsWith("http") ? image : `${origin}${image}`;
		tags.push(
			{ property: "og:image", content: absImage },
			{ name: "twitter:image", content: absImage },
		);
	}
	if (jsonLd) {
		tags.push({ "script:ld+json": jsonLd });
	}
	return tags;
}

/** schema.org FictionalCharacter node for a creature entry. */
export function creatureJsonLd(opts: {
	name: string;
	alternateName?: string;
	description: string;
	url: string;
	lang: Lang;
}): Record<string, unknown> {
	return {
		"@context": "https://schema.org",
		"@type": "FictionalCharacter",
		name: opts.name,
		alternateName: opts.alternateName,
		description: opts.description,
		url: opts.url,
		inLanguage: opts.lang === "zh" ? "zh-CN" : "en",
		isPartOf: {
			"@type": "CreativeWork",
			name: "Shan Hai Jing",
			alternateName: "《山海经》",
		},
	};
}

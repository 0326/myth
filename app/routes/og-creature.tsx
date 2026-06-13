/* ============================================================
   华夏神话 — 分享/OG 卡片图 (server-rendered SVG, 1200×630)

   Returns a self-contained SVG card per creature for og:image / social embeds.
   SVG renders crisply in browsers and many link-preview tools.

   NOTE (production follow-up): some platforms (Twitter/Facebook) only rasterize
   PNG/JPG for og:image. To serve PNG, pipe this SVG through Satori + resvg-wasm
   with a bundled Noto Sans/Serif SC subset — deferred to keep the Worker small.
   ============================================================ */
import type { Route } from "./+types/og-creature";
import { MYTH_CATS, MYTH_OMENS, MYTH_REGIONS } from "~/data/dict";
import { getCreature } from "~/data/repo";

const OMEN_COLORS: Record<string, string> = {
	ji: "#3a6b5f",
	xiong: "#c83f33",
	zhong: "#c9a24a",
};

function esc(s: string) {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

export async function loader({ params, context }: Route.LoaderArgs) {
	const d = await getCreature(params.id, context.cloudflare?.env?.DB);
	if (!d) throw new Response("Not found", { status: 404 });

	const cat = MYTH_CATS[d.cat];
	const reg = MYTH_REGIONS[d.region];
	const om = MYTH_OMENS[d.omen];
	const omColor = OMEN_COLORS[d.omen];

	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${d.color}"/>
      <stop offset="1" stop-color="#0e1311"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#0e1311"/>
  <rect width="470" height="630" fill="url(#g)"/>
  <text x="235" y="370" font-family="'Noto Serif SC','Songti SC',serif" font-size="300" font-weight="900"
        fill="rgba(255,255,255,.96)" text-anchor="middle">${esc(d.glyph)}</text>
  <rect x="40" y="40" width="92" height="92" rx="12" fill="#c83f33"/>
  <text x="86" y="104" font-family="'Noto Serif SC',serif" font-size="44" font-weight="900"
        fill="#efe7d8" text-anchor="middle">${esc(d.glyph)}</text>
  <rect x="${1200 - 200}" y="48" width="160" height="58" rx="29" fill="${omColor}"/>
  <text x="${1200 - 120}" y="86" font-family="'Noto Sans SC',sans-serif" font-size="30" font-weight="700"
        fill="#fff" text-anchor="middle">${esc(om.en)}</text>
  <text x="530" y="250" font-family="'Noto Sans SC',sans-serif" font-size="84" font-weight="900" fill="#f4efe4">${esc(d.en)}</text>
  <text x="532" y="318" font-family="'Archivo',sans-serif" font-size="40" font-weight="700" fill="#e3c477">${esc(d.zh)} · ${esc(d.py)}</text>
  <text x="532" y="378" font-family="'Noto Sans SC',sans-serif" font-size="30" fill="#8d8775">${esc(cat.en)} · ${esc(reg.en)}</text>
  <line x1="530" y1="420" x2="1140" y2="420" stroke="rgba(201,162,74,.4)" stroke-width="2"/>
  <text x="530" y="560" font-family="'Space Mono',monospace" font-size="26" font-weight="700" fill="#5f5b4f">华夏神话 · HUAXIA MYTH</text>
</svg>`;

	return new Response(svg, {
		headers: {
			"Content-Type": "image/svg+xml; charset=utf-8",
			"Cache-Control": "public, max-age=86400",
		},
	});
}

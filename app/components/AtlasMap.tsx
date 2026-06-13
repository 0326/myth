import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { creatureLngLat, REGION_ANCHORS } from "~/data/atlas";
import { MYTH_OMENS, MYTH_REGIONS } from "~/data/dict";
import type { Creature, CreatureRegion } from "~/data/types";
import { useLang } from "~/i18n/LangContext";

/**
 * 地理互动地图 — MapLibre GL on a flat, tile-less custom style (no external API
 * keys, no glyph server). Regions and creatures are rendered as HTML markers
 * (DOM overlays) so we avoid GL symbol glyphs entirely; click a creature to open
 * its page. Client-only: MapLibre is dynamically imported in an effect so the
 * route still SSRs (MapLibre touches `window`).
 */
export function AtlasMap({ creatures }: { creatures: Creature[] }) {
	const { lang } = useLang();
	const containerRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const navRef = useRef(navigate);
	navRef.current = navigate;

	useEffect(() => {
		let map: import("maplibre-gl").Map | null = null;
		let ro: ResizeObserver | null = null;
		let cancelled = false;

		(async () => {
			const maplibregl = (await import("maplibre-gl")).default;
			if (cancelled || !containerRef.current) return;

			map = new maplibregl.Map({
				container: containerRef.current,
				style: {
					version: 8,
					sources: {},
					layers: [
						{ id: "bg", type: "background", paint: { "background-color": "#0e1311" } },
					],
				},
				center: [0, 4],
				zoom: 2.1,
				minZoom: 1.4,
				maxZoom: 6,
				renderWorldCopies: false,
				attributionControl: false,
			});
			map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

			// region anchors (labels + halo)
			for (const [key, coord] of Object.entries(REGION_ANCHORS) as [
				CreatureRegion,
				[number, number],
			][]) {
				const el = document.createElement("div");
				el.className = "atlas-region";
				el.textContent = MYTH_REGIONS[key][lang];
				new maplibregl.Marker({ element: el }).setLngLat(coord).addTo(map);
			}

			// creature markers
			for (const c of creatures) {
				const el = document.createElement("button");
				el.className = "atlas-creature";
				el.type = "button";
				el.innerHTML = `<span class="ac-dot" style="background:${c.color}"></span><span class="ac-label">${
					lang === "zh" ? c.zh : c.en
				}</span>`;
				el.title = `${lang === "zh" ? c.zh : c.en} · ${MYTH_OMENS[c.omen][lang]}`;
				el.addEventListener("click", () => navRef.current(`/creature/${c.id}`));
				new maplibregl.Marker({ element: el, anchor: "top" })
					.setLngLat(creatureLngLat(c))
					.addTo(map);
			}

			// recover if the container was 0-sized at init (CSS timing)
			ro = new ResizeObserver(() => map?.resize());
			ro.observe(containerRef.current);
			map.once("load", () => map?.resize());
		})();

		return () => {
			cancelled = true;
			ro?.disconnect();
			map?.remove();
		};
	}, [creatures, lang]);

	return <div ref={containerRef} className="atlas-map" />;
}

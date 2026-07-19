import { creatures } from "~/data/creatures";
import { graphNodes } from "~/data/graph";
import { atlasRegions } from "~/data/atlas";

export type SearchResultType = "creature" | "figure" | "region";

export interface SearchResult {
	id: string;
	type: SearchResultType;
	zh: string;
	en: string;
	py?: string;
	tags_zh?: string[];
	tags_en?: string[];
	desc_zh?: string;
	desc_en?: string;
	score: number;
}

function getPinyinInitials(py: string): string {
	return py
		.toLowerCase()
		.replace(/[āáǎà]/g, "a")
		.replace(/[ēéěè]/g, "e")
		.replace(/[īíǐì]/g, "i")
		.replace(/[ōóǒò]/g, "o")
		.replace(/[ūúǔù]/g, "u")
		.replace(/[ǖǘǚǜü]/g, "v")
		.replace(/[^a-z]/g, "");
}

export function searchAll(query: string, limit = 20): SearchResult[] {
	const q = query.trim().toLowerCase();
	if (!q) return [];

	const results: SearchResult[] = [];

	for (const c of creatures) {
		let score = 0;
		const pyClean = getPinyinInitials(c.py);
		const pyInitials = c.py
			.split(" ")
			.map((s) => s[0] || "")
			.join("")
			.toLowerCase();

		if (c.zh.includes(query)) score += 100;
		if (c.zh.startsWith(query)) score += 50;
		if (c.en.toLowerCase().includes(q)) score += 60;
		if (pyClean.includes(q)) score += 40;
		if (pyInitials.startsWith(q)) score += 30;
		if (pyInitials.includes(q)) score += 20;
		for (const tag of c.tags_zh) {
			if (tag.includes(query)) score += 25;
		}
		for (const tag of c.tags_en) {
			if (tag.toLowerCase().includes(q)) score += 15;
		}
		if (c.bai.includes(query)) score += 10;

		if (score > 0) {
			results.push({
				id: c.id,
				type: "creature",
				zh: c.zh,
				en: c.en,
				py: c.py,
				tags_zh: c.tags_zh,
				tags_en: c.tags_en,
				desc_zh: c.bai.slice(0, 80) + "...",
				desc_en: c.en_sum.slice(0, 80) + "...",
				score,
			});
		}
	}

	for (const n of graphNodes) {
		let score = 0;
		if (n.zh.includes(query)) score += 100;
		if (n.zh.startsWith(query)) score += 50;
		if (n.en.toLowerCase().includes(q)) score += 60;
		if (n.desc_zh.includes(query)) score += 10;
		if (score > 0) {
			results.push({
				id: n.id,
				type: "figure",
				zh: n.zh,
				en: n.en,
				desc_zh: n.desc_zh.slice(0, 80) + "...",
				desc_en: n.desc_en.slice(0, 80) + "...",
				score,
			});
		}
	}

	for (const r of atlasRegions) {
		let score = 0;
		if (r.zh.includes(query)) score += 100;
		if (r.zh.startsWith(query)) score += 50;
		if (r.en.toLowerCase().includes(q)) score += 60;
		if (r.desc_zh.includes(query)) score += 10;
		if (score > 0) {
			results.push({
				id: r.id,
				type: "region",
				zh: r.zh,
				en: r.en,
				desc_zh: r.desc_zh.slice(0, 80) + "...",
				desc_en: r.desc_en.slice(0, 80) + "...",
				score,
			});
		}
	}

	results.sort((a, b) => b.score - a.score);
	return results.slice(0, limit);
}

export function getResultUrl(result: SearchResult): string {
	switch (result.type) {
		case "creature":
			return `/creature/${result.id}`;
		case "figure":
			return `/graph?focus=${result.id}`;
		case "region":
			return `/atlas?region=${result.id}`;
		default:
			return "/";
	}
}

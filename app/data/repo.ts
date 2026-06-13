/* ============================================================
   华夏神话 — 数据访问抽象层 (repository)

   ★ The Phase 1→2 seam. Every function takes an optional D1 binding:
     - with `db` (production / dev-with-D1): query Cloudflare D1.
     - without (fallback): read the local typed TS data.
   Route loaders pass `context.cloudflare.env.DB`; the Hono /api uses the same
   functions. Components/loaders never change as the source flips.
   ============================================================ */
import { CREATURES } from "./creatures";
import { GRAPH_LINKS, GRAPH_NODES } from "./graph";
import type {
	Creature,
	CreatureCat,
	CreatureRegion,
	GraphGroupKey,
	GraphLink,
	GraphNode,
	Omen,
	RelKey,
} from "./types";

export const FEATURED_IDS = [
	"jiuweihu",
	"fenghuang",
	"taotie",
	"zhulong",
	"yinglong",
	"jingwei",
	"baize",
	"qiongqi",
] as const;

// ---- D1 row → typed model mappers ----
interface CreatureRow {
	id: string;
	glyph: string;
	cat: string;
	region: string;
	omen: string;
	color: string;
	zh: string;
	en: string;
	py: string;
	tags_zh: string;
	tags_en: string;
	src: string;
	ref: string;
	bai: string;
	en_sum: string;
}

function rowToCreature(r: CreatureRow): Creature {
	return {
		id: r.id,
		glyph: r.glyph,
		cat: r.cat as CreatureCat,
		region: r.region as CreatureRegion,
		omen: r.omen as Omen,
		color: r.color,
		zh: r.zh,
		en: r.en,
		py: r.py,
		tags_zh: JSON.parse(r.tags_zh) as string[],
		tags_en: JSON.parse(r.tags_en) as string[],
		src: r.src,
		ref: r.ref,
		bai: r.bai,
		en_sum: r.en_sum,
	};
}

interface NodeRow {
	id: string;
	zh: string;
	en: string;
	g: string;
	r: number;
	desc_zh: string;
	desc_en: string;
}

function rowToNode(r: NodeRow): GraphNode {
	return {
		id: r.id,
		zh: r.zh,
		en: r.en,
		g: r.g as GraphGroupKey,
		r: r.r,
		desc_zh: r.desc_zh,
		desc_en: r.desc_en,
	};
}

/**
 * Run a D1-backed query, falling back to the local TS data if D1 is absent or
 * errors (e.g. an unprovisioned binding on a fresh deploy). Keeps the site up
 * regardless of D1 health; logs once so misconfig is visible.
 */
async function withD1<T>(
	db: D1Database | undefined,
	query: (db: D1Database) => Promise<T>,
	fallback: () => T,
): Promise<T> {
	if (!db) return fallback();
	try {
		return await query(db);
	} catch (err) {
		console.error("[repo] D1 query failed, falling back to local data:", err);
		return fallback();
	}
}

// ---- queries ----
export async function listCreatures(db?: D1Database): Promise<Creature[]> {
	return withD1(
		db,
		async (d) => {
			const { results } = await d
				.prepare("SELECT * FROM creatures ORDER BY ord")
				.all<CreatureRow>();
			return results.map(rowToCreature);
		},
		() => CREATURES,
	);
}

export async function getCreature(
	id: string,
	db?: D1Database,
): Promise<Creature | undefined> {
	return withD1(
		db,
		async (d) => {
			const row = await d
				.prepare("SELECT * FROM creatures WHERE id = ?")
				.bind(id)
				.first<CreatureRow>();
			return row ? rowToCreature(row) : undefined;
		},
		() => CREATURES.find((c) => c.id === id),
	);
}

export async function getCreatureWithNeighbours(
	id: string,
	db?: D1Database,
): Promise<{
	creature: Creature;
	prev: Creature;
	next: Creature;
	index: number;
	total: number;
} | null> {
	const all = await listCreatures(db);
	const idx = all.findIndex((c) => c.id === id);
	if (idx === -1) return null;
	const total = all.length;
	return {
		creature: all[idx],
		prev: all[(idx - 1 + total) % total],
		next: all[(idx + 1) % total],
		index: idx,
		total,
	};
}

/** Other creatures sharing this one's region (for cross-linking / SEO). */
export async function getRelatedCreatures(
	creature: Creature,
	limit = 4,
	db?: D1Database,
): Promise<Creature[]> {
	const all = await listCreatures(db);
	return all
		.filter((c) => c.id !== creature.id && c.region === creature.region)
		.slice(0, limit);
}

export async function getGraph(
	db?: D1Database,
): Promise<{ nodes: GraphNode[]; links: GraphLink[] }> {
	return withD1(
		db,
		async (d) => {
			const nodes = await d
				.prepare("SELECT * FROM graph_nodes ORDER BY ord")
				.all<NodeRow>();
			const links = await d
				.prepare("SELECT s, t, r FROM graph_links ORDER BY id")
				.all<{ s: string; t: string; r: string }>();
			return {
				nodes: nodes.results.map(rowToNode),
				links: links.results.map((l) => ({ s: l.s, t: l.t, r: l.r as RelKey })),
			};
		},
		() => ({ nodes: GRAPH_NODES, links: GRAPH_LINKS }),
	);
}

export async function listFeatured(db?: D1Database): Promise<Creature[]> {
	const all = await listCreatures(db);
	const byId = new Map(all.map((c) => [c.id, c]));
	return FEATURED_IDS.map((id) => byId.get(id)).filter(
		(c): c is Creature => Boolean(c),
	);
}

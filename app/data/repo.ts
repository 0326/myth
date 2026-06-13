/* ============================================================
   华夏神话 — 数据访问抽象层 (repository)

   ★ 一期 (现在): 直接读本地类型化 TS 数据。
   ★ 二期: 把函数体换成 fetch('/api/creatures') 等 (D1 + Hono),
     调用方 (各 route loader) 无需改动 —— 这正是本层存在的意义。

   所有函数返回 Promise，使得二期切到异步 fetch 时签名不变。
   ============================================================ */
import { CREATURES } from "./creatures";
import { GRAPH_LINKS, GRAPH_NODES } from "./graph";
import type { Creature, GraphLink, GraphNode } from "./types";

export async function listCreatures(): Promise<Creature[]> {
	return CREATURES;
}

export async function getCreature(id: string): Promise<Creature | undefined> {
	return CREATURES.find((c) => c.id === id);
}

/** Returns the creature plus its neighbours for prev/next navigation. */
export async function getCreatureWithNeighbours(id: string): Promise<{
	creature: Creature;
	prev: Creature;
	next: Creature;
	index: number;
	total: number;
} | null> {
	const idx = CREATURES.findIndex((c) => c.id === id);
	if (idx === -1) return null;
	const total = CREATURES.length;
	return {
		creature: CREATURES[idx],
		prev: CREATURES[(idx - 1 + total) % total],
		next: CREATURES[(idx + 1) % total],
		index: idx,
		total,
	};
}

export async function getGraph(): Promise<{
	nodes: GraphNode[];
	links: GraphLink[];
}> {
	return { nodes: GRAPH_NODES, links: GRAPH_LINKS };
}

/** A small curated set surfaced on the home page "今日神兽" rail. */
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

export async function listFeatured(): Promise<Creature[]> {
	return FEATURED_IDS.map((id) => CREATURES.find((c) => c.id === id)).filter(
		(c): c is Creature => Boolean(c),
	);
}

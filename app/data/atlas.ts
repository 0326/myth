/* ============================================================
   华夏神话 — 地理互动地图 anchors

   The Shan Hai Jing's geography is mythic, not cartographic. We place the 8
   classic regions at stylized coordinates (compass-rough) and scatter each
   creature near its region with a deterministic jitter (stable across renders).
   Phase 3 starter for the "山经山点 + 海经方国 + 异兽分布" atlas.
   ============================================================ */
import type { Creature, CreatureRegion } from "./types";

export const REGION_ANCHORS: Record<CreatureRegion, [number, number]> = {
	zhong: [0, 2], // 中山经 — center
	nan: [-8, -34], // 南 — south
	bei: [4, 40], // 北 — north
	xi: [-54, 6], // 西 — west
	dong: [56, 8], // 东 — east
	hainei: [-34, 24], // 海内 — inner
	haiwai: [-104, 32], // 海外 — beyond the seas
	dahuang: [104, -28], // 大荒 — great wilderness
};

/** Deterministic [-1,1) pseudo-jitter from a string + salt (no Math.random). */
function hashJitter(id: string, salt: number): number {
	let h = 2166136261 ^ salt;
	for (let i = 0; i < id.length; i++) {
		h = Math.imul(h ^ id.charCodeAt(i), 16777619);
	}
	// map to [-1, 1)
	return ((h >>> 0) % 2000) / 1000 - 1;
}

/** Place a creature near its region anchor with a stable spread. */
export function creatureLngLat(c: Creature): [number, number] {
	const [lng, lat] = REGION_ANCHORS[c.region];
	const spread = 14;
	return [lng + hashJitter(c.id, 1) * spread, lat + hashJitter(c.id, 7) * spread * 0.7];
}

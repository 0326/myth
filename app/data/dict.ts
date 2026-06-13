/* ============================================================
   华夏神话 — 字典 (分类 / 出没地 / 吉凶 / 阵营 / 关系)
   omen: ji 吉 / xiong 凶 / zhong 中
   cat:  xiang 祥瑞 / xiong_b 凶兽 / shen 神祇 / yi 异兽 / niao 神鸟 / lin 鳞介
   ============================================================ */
import type {
	BiLabel,
	CreatureCat,
	CreatureRegion,
	GraphGroupKey,
	GroupLabel,
	Omen,
	RelKey,
	RelLabel,
} from "./types";

export const MYTH_CATS: Record<CreatureCat, BiLabel> = {
	xiang: { zh: "祥瑞", en: "Auspicious" },
	xiong_b: { zh: "凶兽", en: "Man-eater" },
	shen: { zh: "神祇", en: "Deity" },
	yi: { zh: "异兽", en: "Strange Beast" },
	niao: { zh: "神鸟", en: "Divine Bird" },
	lin: { zh: "鳞介", en: "Aquatic" },
};

export const MYTH_REGIONS: Record<CreatureRegion, BiLabel> = {
	nan: { zh: "南山经", en: "Southern Mountains" },
	xi: { zh: "西山经", en: "Western Mountains" },
	bei: { zh: "北山经", en: "Northern Mountains" },
	dong: { zh: "东山经", en: "Eastern Mountains" },
	zhong: { zh: "中山经", en: "Central Mountains" },
	haiwai: { zh: "海外经", en: "Beyond the Seas" },
	hainei: { zh: "海内经", en: "Within the Seas" },
	dahuang: { zh: "大荒经", en: "Great Wilderness" },
};

export const MYTH_OMENS: Record<Omen, BiLabel> = {
	ji: { zh: "吉", en: "Boon" },
	xiong: { zh: "凶", en: "Ill omen" },
	zhong: { zh: "中", en: "Neutral" },
};

export const GRAPH_GROUPS: Record<GraphGroupKey, GroupLabel> = {
	chuangshi: { zh: "创世", en: "Primordial", color: "#c9a24a" },
	sanhuang: { zh: "三皇", en: "Three Sovereigns", color: "#e0584a" },
	wudi: { zh: "五帝", en: "Five Emperors", color: "#4f97a2" },
	yingxiong: { zh: "英雄", en: "Heroes", color: "#c9a24a" },
	shen: { zh: "神祇", en: "Deities", color: "#7a3b54" },
	xiongshen: { zh: "凶神", en: "Fiends", color: "#c83f33" },
};

export const GRAPH_RELS: Record<RelKey, RelLabel> = {
	parent: { zh: "亲族", en: "Kin", color: "#c9a24a", dash: false },
	spouse: { zh: "配偶", en: "Consort", color: "#e0584a", dash: false },
	ally: { zh: "盟友", en: "Ally", color: "#4f97a2", dash: true },
	enemy: { zh: "敌对", en: "Enemy", color: "#c83f33", dash: true },
	descend: { zh: "传承", en: "Lineage", color: "#8d8775", dash: false },
};

export const OMEN_ORDER: Record<Omen, number> = { ji: 0, zhong: 1, xiong: 2 };

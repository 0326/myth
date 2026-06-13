/* ============================================================
   华夏神话 — 数据模型 (typed; ported from design_handoff data/*.js)
   ============================================================ */

export type CreatureCat = "xiang" | "xiong_b" | "shen" | "yi" | "niao" | "lin";
export type CreatureRegion =
	| "nan"
	| "xi"
	| "bei"
	| "dong"
	| "zhong"
	| "haiwai"
	| "hainei"
	| "dahuang";
export type Omen = "ji" | "xiong" | "zhong";

export interface Creature {
	id: string;
	glyph: string;
	cat: CreatureCat;
	region: CreatureRegion;
	omen: Omen;
	color: string;
	zh: string;
	en: string;
	py: string;
	tags_zh: string[];
	tags_en: string[];
	src: string;
	ref: string;
	bai: string;
	en_sum: string;
}

export type GraphGroupKey =
	| "chuangshi"
	| "sanhuang"
	| "wudi"
	| "yingxiong"
	| "shen"
	| "xiongshen";
export type RelKey = "parent" | "spouse" | "ally" | "enemy" | "descend";

export interface GraphNode {
	id: string;
	zh: string;
	en: string;
	g: GraphGroupKey;
	r: number;
	desc_zh: string;
	desc_en: string;
}

export interface GraphLink {
	s: string;
	t: string;
	r: RelKey;
}

export interface BiLabel {
	zh: string;
	en: string;
}
export interface GroupLabel extends BiLabel {
	color: string;
}
export interface RelLabel extends BiLabel {
	color: string;
	dash: boolean;
}

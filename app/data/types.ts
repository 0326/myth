/* ============================================================
   华夏神话 — 数据模型
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

export interface CreatureSource {
	text: string;
	book: string;
	chapter?: string;
}

export interface CreatureVariant {
	era: string;
	description: string;
	source: string;
}

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
	sources: CreatureSource[];
	variants: CreatureVariant[];
	cultural_zh: string;
	cultural_en: string;
	related_figures: string[];
	related_places: string[];
	appearances: { title: string; type: string; note?: string }[];
}

export type GraphGroupKey =
	| "chuangshi"
	| "sanhuang"
	| "wudi"
	| "xia"
	| "fengshen"
	| "xiyou"
	| "yingxiong"
	| "shen"
	| "xiongshen"
	| "yaoguai";
export type RelKey = "parent" | "spouse" | "ally" | "enemy" | "descend" | "master" | "brother";

export interface GraphNode {
	id: string;
	zh: string;
	en: string;
	g: GraphGroupKey;
	r: number;
	desc_zh: string;
	desc_en: string;
	era_zh?: string;
	era_en?: string;
	related_creatures?: string[];
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

export type AtlasRegionKey =
	| "qingqiu"
	| "zhaoyao"
	| "changyang"
	| "gui"
	| "dengbizhi"
	| "kunlun"
	| "dhuang"
	| "liegu"
	| "yufa"
	| "jingwei"
	| "fuchang"
	| "diershan"
	| "zhongshan";

export interface AtlasRegion {
	id: AtlasRegionKey;
	zh: string;
	en: string;
	lng: number;
	lat: number;
	desc_zh: string;
	desc_en: string;
	creatures: string[];
	figures: string[];
}

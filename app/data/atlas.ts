import type { AtlasRegion, Creature, CreatureRegion } from "./types";

export const atlasRegions: AtlasRegion[] = [
	{
		id: "qingqiu",
		zh: "青丘",
		en: "Qingqiu",
		lng: 122,
		lat: 36,
		desc_zh: "青丘之国，其山有狐，九尾，是上古九尾狐的居所，位于东方。",
		desc_en: "Land of Qingqiu, home to the nine-tailed fox, located in the eastern reaches.",
		creatures: ["jiutianzhihu", "bifang", "fengxi"],
		figures: ["yandi"],
	},
	{
		id: "zhaoyao",
		zh: "招摇山",
		en: "Zhaoyao Mountain",
		lng: 108,
		lat: 28,
		desc_zh: "南山经之首，临于西海之上，多桂多金玉，有兽名狌狌。",
		desc_en: "First mountain of the South Classic, rising above the West Sea, rich in cinnamon and gold.",
		creatures: ["zhuyan"],
		figures: [],
	},
	{
		id: "changyang",
		zh: "长留山",
		en: "Changliu Mountain",
		lng: 105,
		lat: 32,
		desc_zh: "西方长留山，白帝少昊居之，其兽皆文尾，其鸟皆文首。",
		desc_en: "Western mountain of Changliu, home to the White Emperor Shaohao.",
		creatures: ["bifang"],
		figures: ["shaohao"],
	},
	{
		id: "gui",
		zh: "归墟",
		en: "Guisui — The Void",
		lng: 118,
		lat: 42,
		desc_zh: "渤海之东不知几亿万里，有大壑焉，实惟无底之谷，其下无底，名曰归墟。",
		desc_en: "Beyond the Eastern Sea lies a bottomless abyss where all waters flow — the great void of Guisui.",
		creatures: ["dijiang", "taotie", "qiuyu"],
		figures: ["gonggong", "zhuanxu"],
	},
	{
		id: "dengbizhi",
		zh: "登比氏",
		en: "Dengbi Clan",
		lng: 115,
		lat: 38,
		desc_zh: "又北，有登比氏之民，姓姚，姓任，其为帝俊之后。",
		desc_en: "Northern clan of Dengbi, descendants of Di Jun, surnamed Yao and Ren.",
		creatures: ["qiongqi", "taotie"],
		figures: ["dijun"],
	},
	{
		id: "kunlun",
		zh: "昆仑山",
		en: "Kunlun Mountain",
		lng: 95,
		lat: 37,
		desc_zh: "西海之南，流沙之滨，赤水之后，黑水之前，有大山，名曰昆仑之丘。",
		desc_en: "The great mountain Kunlun — pillar of heaven, home of the Queen Mother of the West, and source of all rivers.",
		creatures: ["yinglong", "bainiao", "qiuyu", "bifang", "dijiang"],
		figures: ["xiwangmu", "huangdi", "jiangziya"],
	},
	{
		id: "dhuang",
		zh: "大荒",
		en: "The Great Wilderness",
		lng: 125,
		lat: 45,
		desc_zh: "大荒之中，有山名不咸，有肃慎氏之国。",
		desc_en: "The Great Wilderness in the far north, where strange peoples and spirits dwell.",
		creatures: ["jiutouzhiji", "kunpeng"],
		figures: ["dijun"],
	},
	{
		id: "liegu",
		zh: "列姑射",
		en: "Lieguye Islands",
		lng: 128,
		lat: 32,
		desc_zh: "列姑射在海河洲中，有山，名姑射，有神人，肌肤若冰雪，绰约若处子。",
		desc_en: "Islands of Lieguye in the river sea, home to divine beings with skin like ice and snow.",
		creatures: ["zhujiuyin", "jingwei"],
		figures: ["xingtian"],
	},
	{
		id: "yufa",
		zh: "禹父冢",
		en: "Yu's Father's Tomb",
		lng: 112,
		lat: 33,
		desc_zh: "又东三百里，曰羽山，其下多水，其上多雨。鲧死三岁不腐。",
		desc_en: "Feather Mountain where Gun's body lay uncorrupted for three years, from which Yu was born.",
		creatures: ["jingwei"],
		figures: ["gun", "dayu"],
	},
	{
		id: "zhongshan",
		zh: "钟山",
		en: "Zhong Mountain",
		lng: 102,
		lat: 42,
		desc_zh: "钟山之神，名曰烛阴，视为昼，瞑为夜，吹为冬，呼为夏。",
		desc_en: "Mountain of Zhong, home of Zhuyin the Torch Dragon who creates day and night with his eyes.",
		creatures: ["zhujiuyin", "yinglong"],
		figures: ["zhuanxu"],
	},
	{
		id: "diershan",
		zh: "第二山系",
		en: "Second Mountain Range",
		lng: 110,
		lat: 30,
		desc_zh: "西次二经之首，曰钤山，其上多铜，其下多玉。",
		desc_en: "First of the Western Second Range, Mount Qian, rich in copper above and jade below.",
		creatures: ["fengxi"],
		figures: ["houyi"],
	},
	{
		id: "fuchang",
		zh: "符禺山",
		en: "Fuyu Mountain",
		lng: 106,
		lat: 34,
		desc_zh: "符禺之山，其阳多铜，其阴多铁。",
		desc_en: "Mount Fuyu, rich in copper on its sunny side and iron on its shady side.",
		creatures: ["bihu"],
		figures: [],
	},
];

export const regionCount = atlasRegions.length;

export function getRegion(id: string): AtlasRegion | undefined {
	return atlasRegions.find((r) => r.id === id);
}

export const REGION_ANCHORS: Record<CreatureRegion, [number, number]> = {
	nan: [113, 26],
	xi: [102, 34],
	bei: [112, 40],
	dong: [120, 35],
	zhong: [110, 33],
	haiwai: [128, 30],
	hainei: [115, 36],
	dahuang: [125, 45],
};

const regionCoordMap: Record<string, [number, number]> = {};
for (const r of atlasRegions) {
	regionCoordMap[r.id] = [r.lng, r.lat];
}

export function creatureLngLat(c: Creature): [number, number] {
	const anchor = REGION_ANCHORS[c.region as CreatureRegion];
	if (!anchor) return [110, 35];
	const hash = c.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
	const jitterX = ((hash % 100) - 50) / 100 * 4;
	const jitterY = (((hash * 7) % 100) - 50) / 100 * 3;
	return [anchor[0] + jitterX, anchor[1] + jitterY];
}

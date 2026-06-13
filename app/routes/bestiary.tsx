import { useMemo, useState } from "react";
import type { Route } from "./+types/bestiary";
import { CreatureCard } from "~/components/CreatureCard";
import { FilterChips } from "~/components/FilterChips";
import { Footer } from "~/components/Footer";
import { MYTH_CATS, MYTH_OMENS, MYTH_REGIONS, OMEN_ORDER } from "~/data/dict";
import { listCreatures } from "~/data/repo";
import type { Creature, CreatureCat, CreatureRegion, Omen } from "~/data/types";
import { langFromRequest } from "~/i18n/LangContext";
import { useLang } from "~/i18n/LangContext";
import { buildMeta, itemListJsonLd } from "~/lib/seo";

export async function loader({ request, context }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const p = url.searchParams;
	const valid = <T extends string>(vals: string[], dict: Record<string, unknown>) =>
		vals.filter((v) => v in dict) as T[];
	return {
		lang: langFromRequest(request),
		url: request.url,
		creatures: await listCreatures(context.cloudflare?.env?.DB),
		initial: {
			q: p.get("q") ?? "",
			cats: valid<CreatureCat>(p.getAll("cat"), MYTH_CATS),
			regs: valid<CreatureRegion>(p.getAll("reg"), MYTH_REGIONS),
			omens: valid<Omen>(p.getAll("omen"), MYTH_OMENS),
			sort: p.get("sort") ?? "default",
		},
	};
}

export function meta({ data }: Route.MetaArgs) {
	if (!data) return [];
	const origin = new URL(data.url).origin;
	return buildMeta({
		lang: data.lang,
		url: data.url,
		title: data.lang === "zh" ? "神兽图鉴" : "The Bestiary",
		description:
			data.lang === "zh"
				? `${data.creatures.length} 只山海异兽的可检索结构化图鉴：按分类、出没地、吉凶多维筛选，附《山海经》原文与白话双语。`
				: `A searchable, structured bestiary of ${data.creatures.length} Shan Hai Jing creatures — filter by class, habitat and omen, with original text and bilingual notes.`,
		jsonLd: itemListJsonLd(
			data.creatures.map((c) => ({
				name: data.lang === "zh" ? c.zh : c.en,
				url: `${origin}/creature/${c.id}`,
			})),
		),
	});
}

function toggle(set: Set<string>, key: string): Set<string> {
	const next = new Set(set);
	if (next.has(key)) next.delete(key);
	else next.add(key);
	return next;
}

function matches(d: Creature, q: string, cats: Set<string>, regs: Set<string>, omens: Set<string>) {
	if (cats.size && !cats.has(d.cat)) return false;
	if (regs.size && !regs.has(d.region)) return false;
	if (omens.size && !omens.has(d.omen)) return false;
	if (q) {
		const hay = [d.zh, d.en, d.py, ...d.tags_zh, ...d.tags_en, d.bai, d.en_sum]
			.join(" ")
			.toLowerCase();
		if (!hay.includes(q)) return false;
	}
	return true;
}

export default function Bestiary({ loaderData }: Route.ComponentProps) {
	const { t, lang } = useLang();
	const { creatures, initial } = loaderData;

	const [q, setQ] = useState(initial.q);
	const [cats, setCats] = useState<Set<string>>(new Set(initial.cats));
	const [regs, setRegs] = useState<Set<string>>(new Set(initial.regs));
	const [omens, setOmens] = useState<Set<string>>(new Set(initial.omens));
	const [sort, setSort] = useState(initial.sort);

	const list = useMemo(() => {
		const ql = q.trim().toLowerCase();
		let out = creatures.filter((d) => matches(d, ql, cats, regs, omens));
		if (sort === "az") out = [...out].sort((a, b) => a.py.localeCompare(b.py));
		else if (sort === "omen")
			out = [...out].sort((a, b) => OMEN_ORDER[a.omen] - OMEN_ORDER[b.omen]);
		return out;
	}, [creatures, q, cats, regs, omens, sort]);

	function clearAll() {
		setQ("");
		setCats(new Set());
		setRegs(new Set());
		setOmens(new Set());
		setSort("default");
	}

	return (
		<>
			<header className="page-head">
				<span className="ghost">鑑</span>
				<div className="wrap">
					<div className="eyebrow">{t("山海经 · 神兽图鉴", "Shan Hai Jing · Bestiary")}</div>
					<h1>{t("异兽图鉴", "The Bestiary")}</h1>
					<p className="sub">
						{t(
							"收录 32 只山海异兽，每一条均引《山海经》原文。按分类、出没地、吉凶多维检索，点击查看白话释义与分享卡片。",
							"32 creatures of the Shan Hai Jing, each grounded in the original text. Filter by class, habitat and omen; open any for vernacular notes and a share card.",
						)}
					</p>
				</div>
			</header>

			<div className="toolbar">
				<div className="wrap">
					<div className="search-row">
						<div className="search-box">
							<span className="serif" style={{ color: "var(--gold)", fontSize: 16 }}>
								搜
							</span>
							<input
								value={q}
								onChange={(e) => setQ(e.target.value)}
								aria-label={t("搜索神兽", "Search creatures")}
								placeholder={t(
									"搜索神兽名 / 拼音 / 英文 / 能力，如「九尾」「flood」",
									"Search name / pinyin / English / ability…",
								)}
							/>
						</div>
						<select
							className="sort-sel"
							value={sort}
							onChange={(e) => setSort(e.target.value)}
							aria-label={t("排序", "Sort")}
						>
							<option value="default">{t("默认排序", "Default order")}</option>
							<option value="az">{t("按拼音 A→Z", "Pinyin A→Z")}</option>
							<option value="omen">{t("按吉凶", "By omen")}</option>
						</select>
						<span className="result-count">
							{list.length} / {creatures.length}
						</span>
					</div>
					<FilterChips
						label={t("分类", "Class")}
						dict={MYTH_CATS}
						selected={cats}
						onToggle={(k) => setCats((s) => toggle(s, k))}
						lang={lang}
					/>
					<FilterChips
						label={t("出没地", "Region")}
						dict={MYTH_REGIONS}
						selected={regs}
						onToggle={(k) => setRegs((s) => toggle(s, k))}
						lang={lang}
					/>
					<FilterChips
						label={t("吉凶", "Omen")}
						dict={MYTH_OMENS}
						selected={omens}
						onToggle={(k) => setOmens((s) => toggle(s, k))}
						lang={lang}
						redKey="xiong"
					>
						<button type="button" className="clearbtn" onClick={clearAll}>
							{t("清除全部筛选", "Clear all filters")}
						</button>
					</FilterChips>
				</div>
			</div>

			<main className="grid-wrap">
				<div className="wrap">
					{list.length ? (
						<div className="bgrid">
							{list.map((d) => (
								<CreatureCard key={d.id} d={d} lang={lang} />
							))}
						</div>
					) : (
						<div className="empty">
							<b>{t("未寻得此兽", "No creatures found")}</b>
							<span>
								{t("试试更换关键词或清除筛选条件。", "Try a different keyword or clear the filters.")}
							</span>
						</div>
					)}
				</div>
			</main>

			<Footer />
		</>
	);
}

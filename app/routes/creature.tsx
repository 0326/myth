import type { ReactNode } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/creature";
import { CreatureCard } from "~/components/CreatureCard";
import { Footer } from "~/components/Footer";
import { SealStamp } from "~/components/SealStamp";
import { ShareCard } from "~/components/ShareCard";
import { MYTH_CATS, MYTH_OMENS, MYTH_REGIONS } from "~/data/dict";
import { getCreatureWithNeighbours, getRelatedCreatures } from "~/data/repo";
import { langFromRequest } from "~/i18n/LangContext";
import { useLang } from "~/i18n/LangContext";
import { breadcrumbJsonLd, buildMeta, creatureJsonLd } from "~/lib/seo";

export async function loader({ params, request, context }: Route.LoaderArgs) {
	const db = context.cloudflare?.env?.DB;
	const result = await getCreatureWithNeighbours(params.id, db);
	if (!result) {
		throw new Response("Creature not found", { status: 404 });
	}
	const related = await getRelatedCreatures(result.creature, 4, db);
	return { lang: langFromRequest(request), url: request.url, related, ...result };
}

export function meta({ data }: Route.MetaArgs) {
	if (!data) return [];
	const d = data.creature;
	const name = data.lang === "zh" ? d.zh : d.en;
	const description = data.lang === "zh" ? d.bai : d.en_sum;
	const u = new URL(data.url);
	const crumb = (label: string, path: string) => ({
		name: label,
		url: `${u.origin}${path}`,
	});
	return buildMeta({
		lang: data.lang,
		url: data.url,
		title: name,
		description,
		image: `/og/creature/${d.id}`,
		jsonLd: [
			creatureJsonLd({
				name,
				alternateName: data.lang === "zh" ? d.en : d.zh,
				description,
				url: u.href,
				lang: data.lang,
			}),
			breadcrumbJsonLd([
				crumb(data.lang === "zh" ? "首页" : "Home", "/"),
				crumb(data.lang === "zh" ? "神兽图鉴" : "Bestiary", "/bestiary"),
				crumb(name, `/creature/${d.id}`),
			]),
		],
	});
}

function esc(s: string) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Highlight the creature's name(s) inside the classical source text. */
function highlight(src: string, names: string[]): ReactNode[] {
	const uniq = [...new Set(names.filter(Boolean))];
	if (!uniq.length) return [src];
	const re = new RegExp(`(${uniq.map(esc).join("|")})`, "g");
	return src.split(re).map((part, i) =>
		uniq.includes(part) ? (
			<span className="em" key={`${i}-${part}`}>
				{part}
			</span>
		) : (
			part
		),
	);
}

export default function CreatureDetail({ loaderData }: Route.ComponentProps) {
	const { t, lang } = useLang();
	const { creature: d, prev, next, related } = loaderData;
	const cat = MYTH_CATS[d.cat];
	const reg = MYTH_REGIONS[d.region];
	const om = MYTH_OMENS[d.omen];
	const core = d.zh.split(/[ ·]/).pop() ?? d.zh;
	const tags = lang === "zh" ? d.tags_zh : d.tags_en;

	return (
		<>
			<div className="wrap">
				<div className="crumb">
					<Link to="/">{t("首页", "Home")}</Link>
					<span className="sep">/</span>
					<Link to="/bestiary">{t("神兽图鉴", "Bestiary")}</Link>
					<span className="sep">/</span>
					<span style={{ color: "var(--t-mid)" }}>{lang === "zh" ? d.zh : d.en}</span>
				</div>
			</div>

			<header className="chero">
				<div className="chero-grid">
					<div
						className="cart"
						style={{ background: `linear-gradient(150deg,${d.color},#0e1311 140%)` }}
					>
						<SealStamp className="cseal">{d.glyph}</SealStamp>
						<span className="cglyph">{d.glyph}</span>
						<span className="ph-note">古图占位 · DROP PUBLIC-DOMAIN ART HERE</span>
					</div>
					<div className="chero-info">
						<span className="ghost">{d.glyph}</span>
						<div className="eyebrow">{`${cat.zh} · ${cat.en}`}</div>
						<h1 className="cn-name">{lang === "zh" ? d.zh : d.en}</h1>
						<div className="en-name">{lang === "zh" ? d.en : d.zh}</div>
						<div className="py-name">{d.py}</div>
						<div className="chips-row">
							<span className="chip">
								<span className="dot" style={{ background: d.color }} />
								{cat[lang]}
							</span>
							<span className="chip">{reg[lang]}</span>
							<span className={`chip omen-${d.omen}`}>
								<span className="dot" />
								{lang === "zh" ? `吉凶 · ${om.zh}` : om.en}
							</span>
						</div>
					</div>
				</div>
			</header>

			<main className="cbody">
				<div className="wrap cbody-grid">
					<div>
						<div className="block">
							<div className="block-h">
								<span className="zh">{t("原文", "Original Text")}</span>
								<span className="en">Classical Source</span>
							</div>
							<div className="yuanwen">
								<p className="qt">{highlight(d.src, [d.zh, core])}</p>
								<div className="ref">— {d.ref}</div>
								<SealStamp className="corner-seal">{d.glyph}</SealStamp>
							</div>
						</div>
						<div className="block">
							<div className="block-h">
								<span className="zh">{t("白话释义", "In Plain Words")}</span>
								<span className="en">Vernacular</span>
							</div>
							<p className="baihua">{d.bai}</p>
							<p className="ensum">{d.en_sum}</p>
						</div>
						<div className="cnav">
							<Link className="prev" to={`/creature/${prev.id}`}>
								<span className="dir">← {t("上一只", "PREV")}</span>
								<span className="nm">{lang === "zh" ? prev.zh : prev.en}</span>
							</Link>
							<Link className="next" to={`/creature/${next.id}`}>
								<span className="dir">{t("下一只", "NEXT")} →</span>
								<span className="nm">{lang === "zh" ? next.zh : next.en}</span>
							</Link>
						</div>
					</div>

					<aside>
						<div className="panel">
							<div className="panel-h">{t("属性 · 结构化档案", "Attributes · structured")}</div>
							<div className="attr">
								<span className="k">{t("分类", "Class")}</span>
								<span className="v">{cat[lang]}</span>
							</div>
							<div className="attr">
								<span className="k">{t("出没地", "Region")}</span>
								<span className="v">{reg[lang]}</span>
							</div>
							<div className="attr">
								<span className="k">{t("吉凶", "Omen")}</span>
								<span className="v">
									<span className={`chip omen-${d.omen}`} style={{ padding: "3px 9px" }}>
										<span className="dot" />
										{om[lang]}
									</span>
								</span>
							</div>
							<div className="attr">
								<span className="k">{t("出处", "Source")}</span>
								<span className="v">{d.ref}</span>
							</div>
							<div className="attr-tags">
								{tags.map((tg) => (
									<span className="btag" key={tg}>
										{tg}
									</span>
								))}
							</div>
							<div className="panel-cta">
								<ShareCard d={d} />
								<Link
									className="btn btn-ghost"
									to="/graph"
									style={{ justifyContent: "center" }}
								>
									{t("在图谱中查看", "See in genealogy")}
								</Link>
							</div>
						</div>
					</aside>
				</div>
			</main>

			{related.length > 0 && (
				<section className="grid-wrap" style={{ paddingTop: 0 }}>
					<div className="wrap">
						<div className="block-h" style={{ marginBottom: "var(--s5)" }}>
							<span className="zh" style={{ fontSize: 18 }}>
								{t("同出没地", "From the same region")}
							</span>
							<span className="en">{MYTH_REGIONS[d.region][lang]}</span>
						</div>
						<div className="bgrid">
							{related.map((rc) => (
								<CreatureCard key={rc.id} d={rc} lang={lang} />
							))}
						</div>
					</div>
				</section>
			)}

			<Footer />
		</>
	);
}

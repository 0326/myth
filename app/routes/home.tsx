import { Form, Link } from "react-router";
import type { Route } from "./+types/home";
import { ConstellationCanvas } from "~/components/ConstellationCanvas";
import { Footer } from "~/components/Footer";
import { SealStamp } from "~/components/SealStamp";
import { MYTH_OMENS } from "~/data/dict";
import { listFeatured } from "~/data/repo";
import { langFromRequest } from "~/i18n/LangContext";
import { useLang } from "~/i18n/LangContext";
import { buildMeta, SITE_NAME_EN, SITE_NAME_ZH } from "~/lib/seo";

export async function loader({ request }: Route.LoaderArgs) {
	return {
		lang: langFromRequest(request),
		url: request.url,
		featured: await listFeatured(),
	};
}

export function meta({ data }: Route.MetaArgs) {
	if (!data) return [];
	return buildMeta({
		lang: data.lang,
		url: data.url,
		title: data.lang === "zh" ? "中国神话知识引擎" : "The Chinese Mythology Engine",
		description:
			data.lang === "zh"
				? "可交互、可检索、双语的中国神话知识引擎：山海经神兽图鉴、神话人物关系图谱、开放结构化数据。"
				: "An interactive, searchable, bilingual knowledge engine for Chinese mythology: a Shan Hai Jing bestiary, a force-directed genealogy graph, and open structured data.",
		jsonLd: {
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: data.lang === "zh" ? SITE_NAME_ZH : SITE_NAME_EN,
			url: new URL(data.url).origin,
			inLanguage: data.lang === "zh" ? "zh-CN" : "en",
			potentialAction: {
				"@type": "SearchAction",
				target: `${new URL(data.url).origin}/bestiary?q={query}`,
				"query-input": "required name=query",
			},
		},
	});
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const { t, lang } = useLang();
	const { featured } = loaderData;

	return (
		<>
			{/* ============ HERO — engine base + poster foreground ============ */}
			<header className="hero tex-grain">
				<ConstellationCanvas />
				<div className="hero-wrap wrap">
					<div className="poster-grid">
						<div className="pcell lead">
							<div className="inner">
								<div className="pkicker">THE CHINESE MYTHOLOGY KNOWLEDGE ENGINE</div>
								<div className="ptitle">
									华夏
									<br />
									神话
								</div>
								<p className="pdesc">
									{t(
										"把散落在古籍、影视与游戏中的中国神话，做成可检索、可视化、可分享的双语活地图。",
										"The myths scattered across classics, film and games — rebuilt as a searchable, visual, shareable bilingual atlas.",
									)}
								</p>
								<Form className="hero-search" method="get" action="/bestiary" role="search">
									<span className="serif" style={{ color: "var(--paper)", fontSize: 18 }}>
										搜
									</span>
									<input
										name="q"
										aria-label={t("搜索神兽、人物、山经", "Search creatures, figures, regions")}
										placeholder={t(
											"搜索神兽、人物、山经……如「九尾狐」「饕餮」",
											"Search creatures, figures, regions… e.g. nine-tailed fox",
										)}
									/>
									<button className="btn btn-gold" type="submit" style={{ padding: "11px 18px" }}>
										→
									</button>
								</Form>
								<div className="hero-cta">
									<Link className="btn btn-gold" to="/bestiary">
										{t("开启神兽图鉴", "Open the Bestiary")} →
									</Link>
									<Link
										className="btn"
										to="/graph"
										style={{ background: "rgba(255,255,255,.14)", color: "#fff" }}
									>
										{t("探索关系图谱", "Explore the genealogy")}
									</Link>
								</div>
							</div>
						</div>
						<div className="pcell gold">
							<span className="corner">鉴</span>
							<div className="pnum latin">32</div>
							<div className="plbl">{t("结构化神兽词条", "Structured creatures")}</div>
						</div>
						<div className="pcell azure">
							<span className="corner">谱</span>
							<div className="pnum latin">24</div>
							<div className="plbl">{t("人物 · 力导向关系图谱", "Figures · force graph")}</div>
						</div>
					</div>
				</div>
				<SealStamp className="big-seal">
					山海
					<br />
					有灵
				</SealStamp>
			</header>

			{/* ============ PILLARS ============ */}
			<section className="pillars">
				<div className="wrap">
					<div className="pillar-head">
						<div>
							<div className="eyebrow">{t("三大支柱", "Three Pillars")}</div>
							<h2 className="h-sec">
								{t("不是又一个图文百科，", "Not another illustrated wiki —")}
								<br />
								{t("而是可交互的知识引擎。", "an interactive knowledge engine.")}
							</h2>
						</div>
						<p
							style={{
								maxWidth: 320,
								color: "var(--t-mid)",
								fontSize: 14,
								lineHeight: 1.7,
							}}
						>
							{t(
								"每一条都基于公共领域《山海经》原文，附白话与双语，可检索、可视化、可分享。",
								"Every entry is grounded in public-domain Shan Hai Jing text, with vernacular and bilingual notes — searchable, visual, shareable.",
							)}
						</p>
					</div>
					<div className="pillar-grid">
						<Link className="pillar" to="/bestiary">
							<span className="pglyph">鉴</span>
							<span className="pidx">01 / {t("图鉴", "Bestiary")}</span>
							<h3>{t("神兽图鉴", "The Bestiary")}</h3>
							<div className="pen">INTERACTIVE BESTIARY</div>
							<p>
								{t(
									"32 只山海异兽，按分类、出没地、吉凶多维筛选；每只一页，原文＋白话＋古图，一键生成分享卡片。",
									"32 creatures filtered by class, habitat and omen. One page each — source text, vernacular, art — with one-tap share cards.",
								)}
							</p>
							<span className="go">{t("进入图鉴", "Browse")} →</span>
						</Link>
						<Link className="pillar" to="/graph">
							<span className="pglyph">谱</span>
							<span className="pidx">02 / {t("图谱", "Graph")}</span>
							<h3>{t("人物关系图谱", "Genealogy Graph")}</h3>
							<div className="pen">FORCE-DIRECTED NETWORK</div>
							<p>
								{t(
									"盘古、三皇五帝、英雄与凶神——力导向网络，可缩放、可点击高亮、可搜索。截图即传播。",
									"Pangu, sovereigns, heroes and fiends as a force-directed network — zoom, click to highlight, search. Screenshot-ready.",
								)}
							</p>
							<span className="go">{t("探索图谱", "Explore")} →</span>
						</Link>
						<Link className="pillar" to="/bestiary">
							<span className="pglyph">图</span>
							<span className="pidx">03 / {t("地图", "Atlas")}</span>
							<h3>{t("地理互动地图", "Interactive Atlas")}</h3>
							<div className="pen">COMING SOON</div>
							<p>
								{t(
									"山经五千余山、海经方国与异兽分布的可交互图层。规划中——先从图鉴与图谱跑通数据底座。",
									"Interactive layers for the 5,000+ mountains and the lands beyond the seas. In planning — built on the same data spine.",
								)}
							</p>
							<span className="go">{t("即将上线", "Soon")} →</span>
						</Link>
					</div>
				</div>
			</section>

			{/* ============ FEATURED ============ */}
			<section className="feat">
				<div className="wrap">
					<div className="pillar-head" style={{ marginBottom: "var(--s5)" }}>
						<div>
							<div className="eyebrow">{t("今日神兽", "Featured")}</div>
							<h2 className="h-sec" style={{ fontSize: "clamp(24px,3vw,34px)" }}>
								{t("从这几只开始", "Start with these")}
							</h2>
						</div>
						<Link className="btn btn-ghost" to="/bestiary" style={{ padding: "9px 16px" }}>
							{t("查看全部 32 只 →", "All 32 →")}
						</Link>
					</div>
					<div className="feat-rail scrollbar-thin">
						{featured.map((d) => {
							const om = MYTH_OMENS[d.omen];
							return (
								<Link className="fcard" key={d.id} to={`/creature/${d.id}`}>
									<div
										className="fart"
										style={{ background: `linear-gradient(150deg,${d.color},#0e1311 130%)` }}
									>
										<span className="fg">{d.glyph}</span>
										<span className="ph-note">古图占位 · ART SLOT</span>
									</div>
									<div className="fbody">
										<b>{lang === "zh" ? d.zh : d.en}</b>
										<span className="py">{lang === "zh" ? d.en : d.py}</span>
										<div style={{ marginTop: 10 }}>
											<span className={`chip omen-${d.omen}`}>
												<span className="dot" />
												{lang === "zh" ? om.zh : om.en}
											</span>
										</div>
									</div>
								</Link>
							);
						})}
					</div>
				</div>
			</section>

			{/* ============ POSITIONING ============ */}
			<section className="posn" id="about">
				<div className="wrap posn-grid">
					<div>
						<div className="eyebrow">{t("定位", "Positioning")}</div>
						<blockquote>
							{t(
								"中国神话的可交互知识引擎——可检索、可视化、可分享、双语、数据开放的活地图。",
								"An interactive knowledge engine for Chinese mythology — searchable, visual, shareable, bilingual, open.",
							)}
						</blockquote>
						<p className="qen">
							{t(
								"没有人占据「中国神话 × 工程级交互 × 双语 × 结构化数据」这个交叉点。原始文献是护城河，交互可视化是别人抄不走的差异化资产。",
								"No one yet owns the intersection of Chinese myth × engineered interaction × bilingual × structured data. Primary sources are the moat; interactive visualization is the asset no one can scrape.",
							)}
						</p>
					</div>
					<div className="posn-points">
						<div className="ppoint">
							<span className="pn latin">壹</span>
							<div>
								<b>{t("原始文献 · 公共领域", "Primary sources · public domain")}</b>
								<p>
									{t(
										"词条均引《山海经》原文（公元前 4 世纪起，全球公共领域），杜绝照搬受保护的近人著作。",
										"Entries quote the public-domain Shan Hai Jing directly — never modern copyrighted retellings.",
									)}
								</p>
							</div>
						</div>
						<div className="ppoint">
							<span className="pn latin">贰</span>
							<div>
								<b>{t("双语 · 面向全球检索", "Bilingual · global SEO")}</b>
								<p>
									{t(
										"中英双语词条，承接《黑神话：悟空》带起的全球神话搜索热度。",
										"Bilingual entries ride the global surge from Black Myth: Wukong and the Journey to the West canon.",
									)}
								</p>
							</div>
						</div>
						<div className="ppoint">
							<span className="pn latin">叁</span>
							<div>
								<b>{t("结构化 · 数据开放", "Structured · open data")}</b>
								<p>
									{t(
										"每个实体带结构化字段，未来开放 API / 数据集，作为影响力杠杆。",
										"Every entity carries structured fields, with an open API / dataset on the roadmap — an influence lever in the spirit of ctext.",
									)}
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			<Footer />
		</>
	);
}

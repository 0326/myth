import { Link } from "react-router";
import type { Route } from "./+types/about";
import { Footer } from "~/components/Footer";
import { langFromRequest, useLang } from "~/i18n/LangContext";
import { buildMeta } from "~/lib/seo";

export async function loader({ request }: Route.LoaderArgs) {
	return { lang: langFromRequest(request), url: request.url };
}

export function meta({ data }: Route.MetaArgs) {
	if (!data) return [];
	return buildMeta({
		lang: data.lang,
		url: data.url,
		title: data.lang === "zh" ? "关于 · 数据与版权" : "About · Data & Licensing",
		description:
			data.lang === "zh"
				? "华夏神话的数据来源、版权立场与开放 API 说明。原文仅用公共领域《山海经》。"
				: "Huaxia Myth's data sources, licensing stance, and open API. Original text is public-domain Shan Hai Jing only.",
	});
}

export default function About() {
	const { t } = useLang();
	return (
		<>
			<main className="prose-wrap wrap">
				<div className="eyebrow">{t("关于", "About")}</div>
				<h1 className="prose-h1">{t("数据、版权与开放 API", "Data, licensing & the open API")}</h1>

				<section className="prose-block">
					<h2>{t("定位", "What this is")}</h2>
					<p>
						{t(
							"华夏神话是中国神话的可交互知识引擎——可检索、可视化、可分享、双语、数据开放。每一条词条都基于公共领域的原始文献。",
							"Huaxia Myth is an interactive knowledge engine for Chinese mythology — searchable, visual, shareable, bilingual, open. Every entry is grounded in public-domain primary sources.",
						)}
					</p>
				</section>

				<section className="prose-block">
					<h2>{t("数据来源", "Sources")}</h2>
					<ul>
						<li>
							{t(
								"《山海经》原文：成书于公元前 4 世纪起，全球公共领域。",
								"Shan Hai Jing text: composed from the 4th century BCE, public domain worldwide.",
							)}
						</li>
						<li>
							{t(
								"古图：明清刻本与 Wikimedia Commons / Smithsonian (CC0) 的公共领域扫描，逐一核对 PD 标签。",
								"Ancient art: public-domain scans from Ming–Qing woodblock editions and Wikimedia Commons / Smithsonian (CC0), each verified for its PD tag.",
							)}
						</li>
						<li>
							{t(
								"实体底座：Wikidata（CC0）。",
								"Entity base: Wikidata (CC0).",
							)}
						</li>
					</ul>
				</section>

				<section className="prose-block">
					<h2>{t("版权红线", "Hard lines")}</h2>
					<p>
						{t(
							"我们只采用公共领域原文，不照搬受著作权保护的近人著作（如袁珂体系的复述、分类与词典条目），也不抓取 ctext.org 的增值/RDF 数据用于商用。神兽分类基于公共领域原文自建。",
							"We use public-domain text only. We do not copy modern copyrighted works (e.g. Yuan Ke's retellings, classifications or dictionary entries), nor scrape ctext.org's value-added/RDF data for commercial use. Our taxonomy is built from public-domain text.",
						)}
					</p>
				</section>

				<section className="prose-block">
					<h2>{t("开放 API", "Open API")}</h2>
					<p>{t("结构化数据通过只读 JSON 接口开放：", "Structured data is available over read-only JSON endpoints:")}</p>
					<ul className="prose-code">
						<li>
							<code>GET /api/creatures</code> — {t("全部神兽", "all creatures")}
						</li>
						<li>
							<code>GET /api/creatures/:id</code> — {t("单条神兽", "a single creature")}
						</li>
						<li>
							<code>GET /api/graph</code> — {t("人物关系图", "the genealogy graph")}
						</li>
					</ul>
					<p className="prose-note">
						{t(
							"接口默认开放；启用 API key 后请在请求头携带 x-api-key，并受速率限制（120 次 / 分钟）。商用授权与更高配额请联系我们。",
							"Endpoints are open by default; when API keys are enabled, send x-api-key and observe the rate limit (120 req/min). Contact us for commercial licensing and higher quotas.",
						)}
					</p>
				</section>

				<div className="prose-cta">
					<Link className="btn btn-gold" to="/bestiary">
						{t("进入图鉴", "Open the Bestiary")} →
					</Link>
					<Link className="btn btn-ghost" to="/">
						{t("返回首页", "Home")}
					</Link>
				</div>
			</main>
			<Footer />
		</>
	);
}

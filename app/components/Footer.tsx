import { Link } from "react-router";
import { useLang } from "~/i18n/LangContext";

export function Footer() {
	const { t } = useLang();
	return (
		<footer className="foot">
			<div className="wrap">
				<div>
					<Link className="brand" to="/" style={{ marginBottom: 16 }}>
						<span className="seal">华</span>
						<span style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
							<b>华夏神话</b>
							<span>HUAXIA MYTH</span>
						</span>
					</Link>
					<p
						style={{
							color: "var(--t-mid)",
							fontSize: 14,
							lineHeight: 1.7,
							maxWidth: 360,
						}}
					>
						{t(
							"中国神话的可交互知识引擎。基于公共领域古籍与开放数据构建。",
							"An interactive knowledge engine for Chinese mythology, built on public-domain classics and open data.",
						)}
					</p>
				</div>
				<div>
					<h4>Explore</h4>
					<Link to="/bestiary">{t("神兽图鉴", "Bestiary")}</Link>
					<Link to="/graph">{t("关系图谱", "Genealogy")}</Link>
					<Link to="/atlas">{t("地理互动地图", "Interactive Atlas")}</Link>
					<Link to="/quiz">{t("你是哪只神兽", "Which creature are you")}</Link>
				</div>
				<div>
					<h4>Sources</h4>
					<a href="https://zh.wikisource.org/wiki/山海經" target="_blank" rel="noreferrer">
						{t("《山海经》原文", "Shan Hai Jing")}
					</a>
					<a
						href="https://commons.wikimedia.org/wiki/Category:Shan_Hai_Jing"
						target="_blank"
						rel="noreferrer"
					>
						{t("公共领域古图", "Public-domain art")}
					</a>
					<Link to="/about">{t("数据与版权说明", "Data & licensing")}</Link>
				</div>
			</div>
			<div className="foot-legal">
				<div className="wrap">
					<span>
						{t(
							"© 2026 华夏神话 · HUAXIA MYTH　原文出自公共领域《山海经》",
							"© 2026 Huaxia Myth · Source text from the public-domain Shan Hai Jing",
						)}
					</span>
					<span className="mono">MADE FOR MYTH-LOVERS · 双语 · 数据开放</span>
				</div>
			</div>
		</footer>
	);
}

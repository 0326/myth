import { Link, NavLink } from "react-router";
import { useLang } from "~/i18n/LangContext";
import { LangToggle } from "./LangToggle";

export function Nav() {
	const { t } = useLang();
	const linkCls = ({ isActive }: { isActive: boolean }) =>
		isActive ? "active" : "";
	return (
		<nav className="nav">
			<div className="wrap">
				<Link className="brand" to="/">
					<span className="seal">华</span>
					<span style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
						<b>华夏神话</b>
						<span>HUAXIA MYTH</span>
					</span>
				</Link>
				<div className="nav-links">
					<NavLink to="/" end className={linkCls}>
						{t("首页", "Home")}
					</NavLink>
					<NavLink to="/bestiary" className={linkCls}>
						{t("神兽图鉴", "Bestiary")}
					</NavLink>
					<NavLink to="/graph" className={linkCls}>
						{t("关系图谱", "Genealogy")}
					</NavLink>
					<NavLink to="/atlas" className={linkCls}>
						{t("地图", "Atlas")}
					</NavLink>
					<NavLink to="/about" className={linkCls}>
						{t("关于", "About")}
					</NavLink>
				</div>
				<div className="nav-right">
					<Link className="btn btn-ghost" to="/bestiary" style={{ padding: "9px 16px" }}>
						{t("进入图鉴", "Explore")}
					</Link>
					<LangToggle />
				</div>
			</div>
		</nav>
	);
}

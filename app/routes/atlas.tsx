import maplibreCss from "maplibre-gl/dist/maplibre-gl.css?url";
import type { Route } from "./+types/atlas";
import { AtlasMap } from "~/components/AtlasMap";
import { listCreatures } from "~/data/repo";
import { langFromRequest } from "~/i18n/LangContext";
import { useLang } from "~/i18n/LangContext";
import { buildMeta } from "~/lib/seo";

export const links: Route.LinksFunction = () => [
	{ rel: "stylesheet", href: maplibreCss },
];

export async function loader({ request, context }: Route.LoaderArgs) {
	return {
		lang: langFromRequest(request),
		url: request.url,
		creatures: await listCreatures(context.cloudflare?.env?.DB),
	};
}

export function meta({ data }: Route.MetaArgs) {
	if (!data) return [];
	return buildMeta({
		lang: data.lang,
		url: data.url,
		title: data.lang === "zh" ? "地理互动地图" : "Interactive Atlas",
		description:
			data.lang === "zh"
				? "山海经八方异兽分布的可交互地图：按南/西/北/东/中山经与海外、海内、大荒分区，点击神兽查看词条。"
				: "An interactive map of where the Shan Hai Jing's creatures roam — the eight classic regions and their beasts. Click any creature to open its entry.",
	});
}

export default function Atlas({ loaderData }: Route.ComponentProps) {
	const { t } = useLang();
	const { creatures } = loaderData;
	return (
		<div className="atlas-stage">
			<div className="gpanel atlas-intro">
				<div className="eyebrow">{t("山海经 · 地理", "Shan Hai Jing · Geography")}</div>
				<h1>{t("地理互动地图", "Interactive Atlas")}</h1>
				<p>
					{t(
						"八方分区的异兽分布图。山海经的地理本属神话，此处以风格化坐标排布；点击神兽进入词条。",
						"A stylized distribution of creatures across the eight regions. The Shan Hai Jing's geography is mythic, not cartographic; click a creature to open its entry.",
					)}
				</p>
			</div>
			<AtlasMap creatures={creatures} />
		</div>
	);
}

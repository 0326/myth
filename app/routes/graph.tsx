import type { Route } from "./+types/graph";
import { ForceGraph } from "~/components/ForceGraph";
import { getGraph } from "~/data/repo";
import { langFromRequest } from "~/i18n/LangContext";
import { buildMeta } from "~/lib/seo";

export async function loader({ request }: Route.LoaderArgs) {
	const { nodes, links } = await getGraph();
	const focus = new URL(request.url).searchParams.get("focus");
	return { lang: langFromRequest(request), url: request.url, nodes, links, focus };
}

export function meta({ data }: Route.MetaArgs) {
	if (!data) return [];
	return buildMeta({
		lang: data.lang,
		url: data.url,
		title: data.lang === "zh" ? "神话人物关系图谱" : "Genealogy Graph",
		description:
			data.lang === "zh"
				? "盘古、三皇五帝、英雄与凶神的力导向交互关系图谱：可缩放、可拖拽、点击高亮、双语检索。"
				: "A force-directed interactive graph of Chinese mythological figures — Pangu, the sovereigns, heroes and fiends. Zoom, drag, click to highlight, search bilingually.",
	});
}

export default function Graph({ loaderData }: Route.ComponentProps) {
	const { nodes, links, focus } = loaderData;
	return <ForceGraph nodes={nodes} links={links} focusId={focus} />;
}

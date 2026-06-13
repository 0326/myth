import { useMemo, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/quiz";
import { CreatureCard } from "~/components/CreatureCard";
import { Footer } from "~/components/Footer";
import { listCreatures } from "~/data/repo";
import type {
	Creature,
	CreatureCat,
	CreatureRegion,
	Omen,
} from "~/data/types";
import { langFromRequest, useLang } from "~/i18n/LangContext";
import { buildMeta } from "~/lib/seo";

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
		title: data.lang === "zh" ? "你是哪只山海经神兽" : "Which Shan Hai Jing Creature Are You?",
		description:
			data.lang === "zh"
				? "五道题，测一测你属于山海经里的哪只异兽——附原文与分享卡片。"
				: "Five questions to find your Shan Hai Jing spirit-beast — with original text and a share card.",
	});
}

interface Choice {
	zh: string;
	en: string;
	cat?: CreatureCat;
	omen?: Omen;
	region?: CreatureRegion;
}
interface Question {
	zh: string;
	en: string;
	choices: Choice[];
}

const QUESTIONS: Question[] = [
	{
		zh: "你最接近哪种气质？",
		en: "Which temperament fits you best?",
		choices: [
			{ zh: "祥和带来好运", en: "Calm, brings good fortune", cat: "xiang", omen: "ji" },
			{ zh: "凶猛令人敬畏", en: "Fierce and feared", cat: "xiong_b", omen: "xiong" },
			{ zh: "神秘超然", en: "Mysterious and aloof", cat: "shen", omen: "zhong" },
			{ zh: "灵动飞扬", en: "Lithe and soaring", cat: "niao", omen: "ji" },
		],
	},
	{
		zh: "你出没在何方水土？",
		en: "Where do you roam?",
		choices: [
			{ zh: "南方山林", en: "Southern mountains", region: "nan" },
			{ zh: "西域昆仑", en: "Western Kunlun", region: "xi" },
			{ zh: "北地苦寒", en: "The cold north", region: "bei" },
			{ zh: "海外大荒", en: "Beyond the seas", region: "haiwai" },
		],
	},
	{
		zh: "面对冲突，你会？",
		en: "Facing conflict, you…",
		choices: [
			{ zh: "正面迎击", en: "Strike head-on", cat: "xiong_b", omen: "xiong" },
			{ zh: "以智化解", en: "Outwit it", cat: "shen" },
			{ zh: "守护身边人", en: "Protect your own", cat: "xiang", omen: "ji" },
			{ zh: "潜入水中", en: "Slip into the water", cat: "lin" },
		],
	},
	{
		zh: "别人记住你，因为？",
		en: "People remember you for…",
		choices: [
			{ zh: "罕见的形貌", en: "A rare, strange form", cat: "yi" },
			{ zh: "带来丰收与安宁", en: "Bringing harvest and peace", cat: "xiang", omen: "ji" },
			{ zh: "预示灾异之兆", en: "Foretelling omens", omen: "xiong" },
			{ zh: "翱翔与歌舞", en: "Flight and song", cat: "niao" },
		],
	},
	{
		zh: "你的力量来自？",
		en: "Your power comes from…",
		choices: [
			{ zh: "天地神性", en: "Divine nature", cat: "shen", omen: "zhong" },
			{ zh: "吞噬一切", en: "Devouring all", cat: "xiong_b", omen: "xiong" },
			{ zh: "庇佑生灵", en: "Blessing the living", cat: "xiang", omen: "ji" },
			{ zh: "水波鳞甲", en: "Scales and tides", cat: "lin" },
		],
	},
];

function pick(creatures: Creature[], answers: Choice[]): Creature {
	const catScore = new Map<string, number>();
	const omenScore = new Map<string, number>();
	const regionScore = new Map<string, number>();
	for (const a of answers) {
		if (a.cat) catScore.set(a.cat, (catScore.get(a.cat) ?? 0) + 1);
		if (a.omen) omenScore.set(a.omen, (omenScore.get(a.omen) ?? 0) + 1);
		if (a.region) regionScore.set(a.region, (regionScore.get(a.region) ?? 0) + 1);
	}
	const ranked = [...creatures]
		.map((c) => ({
			c,
			score:
				(catScore.get(c.cat) ?? 0) * 3 +
				(omenScore.get(c.omen) ?? 0) * 2 +
				(regionScore.get(c.region) ?? 0),
		}))
		.sort((a, b) => b.score - a.score);
	const top = ranked[0].score;
	const tied = ranked.filter((r) => r.score === top);
	// deterministic tiebreak from the answer signature → variety across runs
	const sig = answers.map((a) => a.zh).join("|");
	let h = 0;
	for (let i = 0; i < sig.length; i++) h = (h * 31 + sig.charCodeAt(i)) >>> 0;
	return tied[h % tied.length].c;
}

export default function Quiz({ loaderData }: Route.ComponentProps) {
	const { t, lang } = useLang();
	const { creatures } = loaderData;
	const [answers, setAnswers] = useState<Choice[]>([]);
	const step = answers.length;
	const done = step >= QUESTIONS.length;

	const result = useMemo(
		() => (done ? pick(creatures, answers) : null),
		[done, creatures, answers],
	);

	function choose(c: Choice) {
		setAnswers((a) => [...a, c]);
	}
	function restart() {
		setAnswers([]);
	}

	return (
		<>
			<main className="quiz-wrap wrap">
				<div className="eyebrow">{t("互动测验", "Interactive Quiz")}</div>
				<h1 className="quiz-title">
					{t("你是哪只山海经神兽？", "Which Shan Hai Jing creature are you?")}
				</h1>

				{!done && (
					<div className="quiz-card">
						<div className="quiz-progress">
							{t("第", "Question")} {step + 1} / {QUESTIONS.length}
						</div>
						<h2 className="quiz-q">{lang === "zh" ? QUESTIONS[step].zh : QUESTIONS[step].en}</h2>
						<div className="quiz-choices">
							{QUESTIONS[step].choices.map((ch) => (
								<button
									type="button"
									key={ch.en}
									className="quiz-choice"
									onClick={() => choose(ch)}
								>
									{lang === "zh" ? ch.zh : ch.en}
								</button>
							))}
						</div>
					</div>
				)}

				{done && result && (
					<div className="quiz-result">
						<div className="quiz-result-lead">{t("你是……", "You are…")}</div>
						<div className="quiz-result-card">
							<CreatureCard d={result} lang={lang} />
						</div>
						<div className="quiz-actions">
							<Link className="btn btn-gold" to={`/creature/${result.id}`}>
								{t("查看完整词条", "See the full entry")} →
							</Link>
							<button type="button" className="btn btn-ghost" onClick={restart}>
								{t("再测一次", "Try again")}
							</button>
						</div>
					</div>
				)}
			</main>
			<Footer />
		</>
	);
}

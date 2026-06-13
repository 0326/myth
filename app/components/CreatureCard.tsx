import { Link } from "react-router";
import { MYTH_CATS, MYTH_OMENS, MYTH_REGIONS } from "~/data/dict";
import type { Creature } from "~/data/types";
import type { Lang } from "~/i18n/LangContext";
import { SealStamp } from "./SealStamp";

export function CreatureCard({ d, lang }: { d: Creature; lang: Lang }) {
	const om = MYTH_OMENS[d.omen];
	const cat = MYTH_CATS[d.cat];
	const reg = MYTH_REGIONS[d.region];
	const tags = (lang === "zh" ? d.tags_zh : d.tags_en) ?? [];
	return (
		<Link className="bcard" to={`/creature/${d.id}`}>
			<div
				className="bart"
				style={{ background: `linear-gradient(150deg,${d.color},#0e1311 135%)` }}
			>
				<SealStamp className="bseal">{d.glyph}</SealStamp>
				<span className="bg">{d.glyph}</span>
				<span className="ph-note">古图占位 · ART SLOT</span>
			</div>
			<div className="bbody">
				<div className="bname">
					<b>{lang === "zh" ? d.zh : d.en}</b>
					<span className="py">{d.py}</span>
				</div>
				<div className="ben">{lang === "zh" ? d.en : cat[lang]}</div>
				<div className="bmeta">
					{tags.slice(0, 2).map((tg) => (
						<span className="btag" key={tg}>
							{tg}
						</span>
					))}
				</div>
				<div className="brow">
					<span className={`chip omen-${d.omen}`}>
						<span className="dot" />
						{om[lang]}
					</span>
					<span className="reg">{reg[lang]}</span>
				</div>
			</div>
		</Link>
	);
}

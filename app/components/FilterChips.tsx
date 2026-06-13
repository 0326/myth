import type { BiLabel } from "~/data/types";
import type { Lang } from "~/i18n/LangContext";

/**
 * One filter row of toggle chips for a dictionary (分类 / 出没地 / 吉凶).
 * Multi-select within a row (OR); selection lives in the parent. The "凶"
 * (ill-omen) chip turns cinnabar when active, per the design.
 */
export function FilterChips<K extends string>({
	label,
	dict,
	selected,
	onToggle,
	lang,
	redKey,
	children,
}: {
	label: string;
	dict: Record<K, BiLabel>;
	selected: Set<string>;
	onToggle: (key: K) => void;
	lang: Lang;
	redKey?: K;
	children?: React.ReactNode;
}) {
	return (
		<div className="filter-row">
			<span className="flabel">{label}</span>
			{(Object.entries(dict) as [K, BiLabel][]).map(([key, v]) => {
				const on = selected.has(key);
				const red = redKey && key === redKey && on;
				return (
					<button
						type="button"
						key={key}
						className={`fbtn${on ? " on" : ""}${red ? " red" : ""}`}
						aria-pressed={on}
						onClick={() => onToggle(key)}
					>
						{v[lang]}
					</button>
				);
			})}
			{children}
		</div>
	);
}

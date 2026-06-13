import { useLang } from "~/i18n/LangContext";

export function LangToggle() {
	const { lang, setLang } = useLang();
	return (
		<div className="lang-toggle">
			<button
				type="button"
				className={lang === "zh" ? "on" : ""}
				onClick={() => setLang("zh")}
				aria-pressed={lang === "zh"}
			>
				中
			</button>
			<button
				type="button"
				className={lang === "en" ? "on" : ""}
				onClick={() => setLang("en")}
				aria-pressed={lang === "en"}
			>
				EN
			</button>
		</div>
	);
}

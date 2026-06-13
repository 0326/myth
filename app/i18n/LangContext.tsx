/* ============================================================
   华夏神话 — bilingual context (zh | en)

   Replaces the design稿's data-zh/data-en DOM-swap mechanism. Components
   render with {t('神兽图鉴','Bestiary')} or read bilingual data fields by lang.

   SSR-safe: initial language comes from the `myth.lang` cookie (read in the
   root loader), so the server and the first client render agree — no hydration
   flash. Toggling writes both the cookie (server source of truth) and
   localStorage (kept for parity with the design稿), and updates <html lang>.
   ============================================================ */
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react";

export type Lang = "zh" | "en";
export const LANG_COOKIE = "myth.lang";

interface LangContextValue {
	lang: Lang;
	setLang: (lang: Lang) => void;
	/** pick the zh or en variant for the current language */
	t: (zh: string, en: string) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({
	initialLang,
	children,
}: {
	initialLang: Lang;
	children: ReactNode;
}) {
	const [lang, setLangState] = useState<Lang>(initialLang);

	const setLang = useCallback((next: Lang) => {
		setLangState(next);
		if (typeof document !== "undefined") {
			document.cookie = `${LANG_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
			document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
			try {
				localStorage.setItem(LANG_COOKIE, next);
			} catch {
				/* ignore quota / privacy-mode errors */
			}
		}
	}, []);

	const value = useMemo<LangContextValue>(
		() => ({
			lang,
			setLang,
			t: (zh: string, en: string) => (lang === "zh" ? zh : en),
		}),
		[lang, setLang],
	);

	return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
	const ctx = useContext(LangContext);
	if (!ctx) throw new Error("useLang must be used within <LangProvider>");
	return ctx;
}

/**
 * Resolve the language for a server request. A `?lang=` query param wins (it
 * gives crawlers distinct per-language URLs for hreflang); otherwise fall back
 * to the persisted cookie; default zh.
 */
export function langFromRequest(request: Request): Lang {
	const q = new URL(request.url).searchParams.get("lang");
	if (q === "en" || q === "zh") return q;
	const cookie = request.headers.get("Cookie") ?? "";
	const match = cookie.match(/(?:^|;\s*)myth\.lang=(zh|en)/);
	return match?.[1] === "en" ? "en" : "zh";
}

export function htmlLang(lang: Lang): string {
	return lang === "zh" ? "zh-CN" : "en";
}

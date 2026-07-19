import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useLang } from "~/i18n/LangContext";
import { searchAll, getResultUrl, type SearchResult } from "~/lib/search";

export function NavSearch() {
	const { t, lang } = useLang();
	const navigate = useNavigate();
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [open, setOpen] = useState(false);
	const [activeIdx, setActiveIdx] = useState(0);
	const wrapRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (query.trim().length >= 1) {
			const res = searchAll(query, 6);
			setResults(res);
			setActiveIdx(0);
			setOpen(true);
		} else {
			setResults([]);
			setOpen(false);
		}
	}, [query]);

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	function handleKeyDown(e: React.KeyboardEvent) {
		if (!open || results.length === 0) return;
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveIdx((i) => (i + 1) % results.length);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveIdx((i) => (i - 1 + results.length) % results.length);
		} else if (e.key === "Enter") {
			e.preventDefault();
			const r = results[activeIdx];
			if (r) {
				navigate(getResultUrl(r));
				setOpen(false);
				setQuery("");
			}
		} else if (e.key === "Escape") {
			setOpen(false);
		}
	}

	function handleResultClick(r: SearchResult) {
		navigate(getResultUrl(r));
		setOpen(false);
		setQuery("");
	}

	const typeLabels: Record<string, { zh: string; en: string }> = {
		creature: { zh: "神兽", en: "Creature" },
		figure: { zh: "人物", en: "Figure" },
		region: { zh: "地理", en: "Region" },
	};

	return (
		<div className="nav-search" ref={wrapRef}>
			<div className="nav-search-box">
				<span className="nav-search-icon" style={{ color: "var(--vermilion)" }}>
					搜
				</span>
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onFocus={() => query && setOpen(true)}
					onKeyDown={handleKeyDown}
					placeholder={t("搜索神兽、人物、山经…", "Search creatures, figures, regions…")}
					aria-label={t("全站搜索", "Site search")}
				/>
			</div>
			{open && results.length > 0 && (
				<div className="nav-search-dropdown">
					{results.map((r, i) => (
						<button
							type="button"
							key={`${r.type}-${r.id}`}
							className={`nav-search-item${i === activeIdx ? " active" : ""}`}
							onClick={() => handleResultClick(r)}
							onMouseEnter={() => setActiveIdx(i)}
						>
							<span className="ns-type">{typeLabels[r.type][lang]}</span>
							<span className="ns-main">{lang === "zh" ? r.zh : r.en}</span>
							{r.py && <span className="ns-py">{r.py}</span>}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

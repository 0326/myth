import { useEffect, useMemo, useRef, useState } from "react";
import { GRAPH_GROUPS, GRAPH_RELS } from "~/data/dict";
import type { GraphLink, GraphNode } from "~/data/types";
import { useLang } from "~/i18n/LangContext";

interface SimNode extends GraphNode {
	x: number;
	y: number;
	vx: number;
	vy: number;
}

/**
 * 力导向关系图谱 — self-contained force simulation on <canvas> (no external lib,
 * so it can later be swapped for d3-force). Ported from design_handoff
 * assets/graph-view.js. Synchronous 320-tick warm-up settles the layout before
 * first paint, so it looks right even when rAF is throttled (visibility
 * principle). Drag / wheel-zoom / pan / hover-highlight / search-center /
 * legend-toggle / detail card / ?focus= deep-link all preserved.
 */
export function ForceGraph({
	nodes: rawNodes,
	links: rawLinks,
	focusId,
}: {
	nodes: GraphNode[];
	links: GraphLink[];
	focusId?: string | null;
}) {
	const { t, lang } = useLang();
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const [selected, setSelected] = useState<GraphNode | null>(null);
	const [hidden, setHidden] = useState<Set<string>>(new Set());
	const [query, setQuery] = useState("");

	// stable maps
	const { byId, adj } = useMemo(() => {
		const byId: Record<string, GraphNode> = {};
		for (const n of rawNodes) byId[n.id] = n;
		const adj: Record<string, Set<string>> = {};
		for (const n of rawNodes) adj[n.id] = new Set();
		for (const l of rawLinks) {
			if (adj[l.s] && adj[l.t]) {
				adj[l.s].add(l.t);
				adj[l.t].add(l.s);
			}
		}
		return { byId, adj };
	}, [rawNodes, rawLinks]);

	// refs read by the rAF draw loop (avoid re-creating the loop on each render);
	// synced from state in an effect so we never write refs during render.
	const langRef = useRef(lang);
	const selectedRef = useRef<GraphNode | null>(selected);
	const hiddenRef = useRef(hidden);
	const viewRef = useRef({ s: 1, tx: 0, ty: 0 });
	const simRef = useRef<SimNode[]>([]);
	const hoveredRef = useRef<SimNode | null>(null);
	const fitViewRef = useRef<() => void>(() => {});

	useEffect(() => {
		langRef.current = lang;
		selectedRef.current = selected;
		hiddenRef.current = hidden;
	});

	// recenter helper used by search (mutates the view ref directly)
	function centerOn(node: GraphNode) {
		const sim = simRef.current.find((n) => n.id === node.id);
		const canvas = canvasRef.current;
		if (!sim || !canvas) return;
		const view = viewRef.current;
		view.tx = canvas.clientWidth / 2 - sim.x * view.s;
		view.ty = canvas.clientHeight / 2 - sim.y * view.s;
	}

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const sim: SimNode[] = rawNodes.map((n) => ({ ...n, x: 0, y: 0, vx: 0, vy: 0 }));
		simRef.current = sim;
		const simById: Record<string, SimNode> = {};
		for (const n of sim) simById[n.id] = n;
		const links = rawLinks
			.map((l) => ({ ...l, source: simById[l.s], target: simById[l.t] }))
			.filter((l) => l.source && l.target);

		let W = 0;
		let H = 0;
		function resize() {
			if (!canvas || !ctx) return;
			// fall back to nominal dims if the canvas hasn't been laid out yet
			// (linked CSS may apply after this effect first runs)
			W = canvas.clientWidth || 800;
			H = canvas.clientHeight || 600;
			canvas.width = W * dpr;
			canvas.height = H * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		}
		resize();

		// seed positions on a circle
		sim.forEach((n, i) => {
			const a = (i / sim.length) * Math.PI * 2;
			n.x = W / 2 + Math.cos(a) * Math.min(W, H) * 0.3;
			n.y = H / 2 + Math.sin(a) * Math.min(W, H) * 0.3;
		});

		let dragNode: SimNode | null = null;

		function tick(alpha: number) {
			for (let i = 0; i < sim.length; i++) {
				const a = sim[i];
				for (let j = i + 1; j < sim.length; j++) {
					const b = sim[j];
					const dx = a.x - b.x;
					const dy = a.y - b.y;
					const d2 = dx * dx + dy * dy || 1;
					const d = Math.sqrt(d2);
					const rep = ((a.r + b.r) * (a.r + b.r) * 4.2) / d2;
					const fx = (dx / d) * rep;
					const fy = (dy / d) * rep;
					a.vx += fx;
					a.vy += fy;
					b.vx -= fx;
					b.vy -= fy;
				}
			}
			links.forEach((l) => {
				const a = l.source;
				const b = l.target;
				const dx = b.x - a.x;
				const dy = b.y - a.y;
				const d = Math.hypot(dx, dy) || 1;
				const target = 110 + a.r + b.r;
				const f = (d - target) * 0.035;
				const fx = (dx / d) * f;
				const fy = (dy / d) * f;
				a.vx += fx;
				a.vy += fy;
				b.vx -= fx;
				b.vy -= fy;
			});
			sim.forEach((n) => {
				n.vx += (W / 2 - n.x) * 0.0016;
				n.vy += (H / 2 - n.y) * 0.0016;
				n.vx *= 0.86;
				n.vy *= 0.86;
				if (n !== dragNode) {
					n.x += n.vx * alpha;
					n.y += n.vy * alpha;
				}
			});
		}
		// synchronous warm-up so the layout is settled at first paint
		for (let i = 0; i < 320; i++) tick(1);

		function fitView() {
			let minX = 1e9;
			let minY = 1e9;
			let maxX = -1e9;
			let maxY = -1e9;
			sim.forEach((n) => {
				minX = Math.min(minX, n.x);
				minY = Math.min(minY, n.y);
				maxX = Math.max(maxX, n.x);
				maxY = Math.max(maxY, n.y);
			});
			const gw = maxX - minX + 120;
			const gh = maxY - minY + 120;
			const view = viewRef.current;
			view.s = Math.min(W / gw, H / gh, 1.4);
			view.tx = W / 2 - ((minX + maxX) / 2) * view.s;
			view.ty = H / 2 - ((minY + maxY) / 2) * view.s;
		}
		fitView();
		fitViewRef.current = fitView;

		// Re-measure / re-fit / redraw when the canvas reaches its real size
		// (CSS applies after mount) or the window resizes. Drawing here — not
		// only inside rAF — guarantees the settled layout is visible even when
		// rAF is throttled (background tab / reduced-motion).
		let fitted = W > 1 && canvas.clientWidth > 1;
		const ro = new ResizeObserver(() => {
			resize();
			if (!fitted && canvas.clientWidth > 1) {
				fitView();
				fitted = true;
			}
			draw();
		});
		ro.observe(canvas);

		const toScreen = (n: SimNode) => ({
			x: n.x * viewRef.current.s + viewRef.current.tx,
			y: n.y * viewRef.current.s + viewRef.current.ty,
		});

		function highlightSet(): Set<string> | null {
			const focus = selectedRef.current ?? hoveredRef.current;
			if (!focus) return null;
			const s = new Set<string>([focus.id]);
			adj[focus.id]?.forEach((id) => s.add(id));
			return s;
		}

		function draw() {
			if (!ctx) return;
			ctx.clearRect(0, 0, W, H);
			const hl = highlightSet();
			const hiddenG = hiddenRef.current;
			const curLang = langRef.current;
			// links
			links.forEach((l) => {
				if (hiddenG.has(l.source.g) || hiddenG.has(l.target.g)) return;
				const rel = GRAPH_RELS[l.r];
				const a = toScreen(l.source);
				const b = toScreen(l.target);
				const active = hl ? hl.has(l.source.id) && hl.has(l.target.id) : true;
				ctx.save();
				ctx.strokeStyle = rel.color;
				ctx.globalAlpha = active ? (hl ? 0.85 : 0.4) : 0.06;
				ctx.lineWidth = active && hl ? 2.2 : 1.2;
				if (rel.dash) ctx.setLineDash([5, 5]);
				ctx.beginPath();
				ctx.moveTo(a.x, a.y);
				ctx.lineTo(b.x, b.y);
				ctx.stroke();
				ctx.restore();
			});
			// nodes
			sim.forEach((n) => {
				if (hiddenG.has(n.g)) return;
				const p = toScreen(n);
				const r = n.r * viewRef.current.s;
				const grp = GRAPH_GROUPS[n.g];
				const active = hl ? hl.has(n.id) : true;
				ctx.save();
				ctx.globalAlpha = active ? 1 : 0.18;
				const focused =
					(selectedRef.current && selectedRef.current.id === n.id) ||
					(hoveredRef.current && hoveredRef.current.id === n.id);
				if (focused) {
					ctx.shadowColor = grp.color;
					ctx.shadowBlur = 22;
				}
				ctx.beginPath();
				ctx.arc(p.x, p.y, r, 0, 7);
				ctx.fillStyle = grp.color;
				ctx.fill();
				ctx.shadowBlur = 0;
				ctx.lineWidth = 2;
				ctx.strokeStyle = "rgba(255,255,255,.22)";
				ctx.stroke();
				ctx.fillStyle = active ? "#f4efe4" : "rgba(244,239,228,.5)";
				ctx.font = `700 ${Math.max(12, 12 * viewRef.current.s)}px "Noto Sans SC", sans-serif`;
				ctx.textAlign = "center";
				ctx.textBaseline = "top";
				ctx.fillText(curLang === "zh" ? n.zh : n.en, p.x, p.y + r + 5);
				ctx.restore();
			});
		}

		let alpha = 0.4;
		let raf = 0;
		function loop() {
			if (alpha > 0.005) {
				tick(alpha);
				alpha *= 0.992;
			}
			draw();
			raf = requestAnimationFrame(loop);
		}
		loop();
		draw();

		// ---- picking + interaction ----
		function pick(mx: number, my: number): SimNode | null {
			for (let i = sim.length - 1; i >= 0; i--) {
				const n = sim[i];
				if (hiddenRef.current.has(n.g)) continue;
				const p = toScreen(n);
				const r = n.r * viewRef.current.s;
				if ((mx - p.x) ** 2 + (my - p.y) ** 2 <= (r + 4) ** 2) return n;
			}
			return null;
		}

		let panning = false;
		let moved = false;
		let last = { x: 0, y: 0 };
		const evPos = (e: MouseEvent | Touch) => {
			const rc = canvas.getBoundingClientRect();
			return { x: e.clientX - rc.left, y: e.clientY - rc.top };
		};

		function down(pos: { x: number; y: number }) {
			last = pos;
			moved = false;
			const n = pick(pos.x, pos.y);
			if (n) dragNode = n;
			else {
				panning = true;
				canvas!.classList.add("grabbing");
			}
		}
		function move(pos: { x: number; y: number }) {
			const view = viewRef.current;
			if (dragNode) {
				dragNode.x = (pos.x - view.tx) / view.s;
				dragNode.y = (pos.y - view.ty) / view.s;
				dragNode.vx = dragNode.vy = 0;
				moved = true;
				alpha = Math.max(alpha, 0.2);
			} else if (panning) {
				view.tx += pos.x - last.x;
				view.ty += pos.y - last.y;
				last = pos;
				moved = true;
			} else {
				const n = pick(pos.x, pos.y);
				if (n !== hoveredRef.current) {
					hoveredRef.current = n;
					canvas!.style.cursor = n ? "pointer" : "grab";
				}
			}
		}
		function up() {
			if (dragNode && !moved) setSelected(dragNode);
			else if (panning && !moved) setSelected(null);
			dragNode = null;
			panning = false;
			canvas!.classList.remove("grabbing");
		}

		const onMouseDown = (e: MouseEvent) => down(evPos(e));
		const onMouseMove = (e: MouseEvent) => move(evPos(e));
		const onMouseUp = () => up();
		const onTouchStart = (e: TouchEvent) => down(evPos(e.touches[0]));
		const onTouchMove = (e: TouchEvent) => {
			move(evPos(e.touches[0]));
			e.preventDefault();
		};
		const onWheel = (e: WheelEvent) => {
			e.preventDefault();
			const pos = evPos(e);
			const view = viewRef.current;
			const f = e.deltaY < 0 ? 1.12 : 1 / 1.12;
			const ns = Math.max(0.4, Math.min(3, view.s * f));
			view.tx = pos.x - (pos.x - view.tx) * (ns / view.s);
			view.ty = pos.y - (pos.y - view.ty) * (ns / view.s);
			view.s = ns;
		};

		canvas.addEventListener("mousedown", onMouseDown);
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
		canvas.addEventListener("touchstart", onTouchStart, { passive: true });
		canvas.addEventListener("touchmove", onTouchMove, { passive: false });
		canvas.addEventListener("touchend", onMouseUp);
		canvas.addEventListener("wheel", onWheel, { passive: false });

		// deep-link ?focus= — defer the selection + recenter so we don't call
		// setState synchronously inside this setup effect
		let focusTimer = 0;
		if (focusId && byId[focusId]) {
			focusTimer = window.setTimeout(() => {
				setSelected(byId[focusId]);
				centerOn(byId[focusId]);
			}, 80);
		}

		return () => {
			cancelAnimationFrame(raf);
			clearTimeout(focusTimer);
			ro.disconnect();
			canvas.removeEventListener("mousedown", onMouseDown);
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
			canvas.removeEventListener("touchstart", onTouchStart);
			canvas.removeEventListener("touchmove", onTouchMove);
			canvas.removeEventListener("touchend", onMouseUp);
			canvas.removeEventListener("wheel", onWheel);
		};
	}, [rawNodes, rawLinks, adj, byId, focusId]);

	function zoomBtn(f: number) {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const view = viewRef.current;
		const W = canvas.clientWidth;
		const H = canvas.clientHeight;
		const ns = Math.max(0.4, Math.min(3, view.s * f));
		view.tx = W / 2 - (W / 2 - view.tx) * (ns / view.s);
		view.ty = H / 2 - (H / 2 - view.ty) * (ns / view.s);
		view.s = ns;
	}

	function onSearch(value: string) {
		setQuery(value);
		const q = value.trim().toLowerCase();
		if (!q) {
			setSelected(null);
			return;
		}
		const hit = rawNodes.find(
			(n) => n.zh.toLowerCase().includes(q) || n.en.toLowerCase().includes(q),
		);
		if (hit) {
			setSelected(hit);
			centerOn(hit);
		}
	}

	function toggleGroup(g: string) {
		setHidden((prev) => {
			const next = new Set(prev);
			if (next.has(g)) next.delete(g);
			else next.add(g);
			return next;
		});
	}

	// relations of the selected node, for the detail card
	const relations = selected
		? rawLinks
				.filter((l) => l.s === selected.id || l.t === selected.id)
				.map((l) => ({
					other: byId[l.s === selected.id ? l.t : l.s],
					rel: GRAPH_RELS[l.r],
				}))
				.filter((r) => r.other)
		: [];

	const selGroup = selected ? GRAPH_GROUPS[selected.g] : null;

	return (
		<div className="stage">
			<canvas id="graph" ref={canvasRef} />

			<div className="gpanel g-top">
				<div className="eyebrow">{t("神话谱系", "Mythic Lineage")}</div>
				<h1>{t("人物关系图谱", "Genealogy Graph")}</h1>
				<p>
					{t(
						"盘古至大禹，24 位神话人物的亲族、盟友与敌对网络。拖拽布点，点击高亮，滚轮缩放。",
						"From Pangu to Yu — 24 figures bound by kinship, alliance and enmity. Drag nodes, click to highlight, scroll to zoom.",
					)}
				</p>
				<div className="g-search">
					<span className="serif" style={{ color: "var(--gold)", fontSize: 14 }}>
						搜
					</span>
					<input
						value={query}
						onChange={(e) => onSearch(e.target.value)}
						aria-label={t("搜索人物", "Search figures")}
						placeholder={t("搜索人物，如「黄帝」「Yu」", "Search figures, e.g. Huangdi")}
					/>
				</div>
			</div>

			<div className="gpanel g-legend">
				<div className="lh">{t("阵营 · 点击可隐藏", "Groups · click to toggle")}</div>
				<div className="leg-groups">
					{(Object.entries(GRAPH_GROUPS) as [string, (typeof GRAPH_GROUPS)[keyof typeof GRAPH_GROUPS]][]).map(
						([k, v]) => (
							<button
								type="button"
								key={k}
								className={`leg-item${hidden.has(k) ? " off" : ""}`}
								onClick={() => toggleGroup(k)}
								style={{ background: "none", border: 0, textAlign: "left" }}
							>
								<span className="sw" style={{ background: v.color }} />
								{v[lang]}
							</button>
						),
					)}
				</div>
				<div className="leg-rels">
					{(Object.entries(GRAPH_RELS) as [string, (typeof GRAPH_RELS)[keyof typeof GRAPH_RELS]][]).map(
						([k, v]) => (
							<div className="leg-rel" key={k}>
								<span
									className="ln"
									style={{ borderColor: v.color, borderTopStyle: v.dash ? "dashed" : "solid" }}
								/>
								{v[lang]}
							</div>
						),
					)}
				</div>
			</div>

			<div className={`gpanel g-detail${selected ? " show" : ""}`}>
				{selected && selGroup && (
					<>
						<div
							className="gd-art"
							style={{ background: `linear-gradient(150deg,${selGroup.color},#0e1311 150%)` }}
						>
							<span className="gg">{(lang === "zh" ? selected.zh : selected.en).slice(0, 1)}</span>
							<button
								type="button"
								className="gclose"
								aria-label={t("关闭", "Close")}
								onClick={() => setSelected(null)}
							>
								×
							</button>
						</div>
						<div className="gd-body">
							<div className="gname">{lang === "zh" ? selected.zh : selected.en}</div>
							<div className="gen">{lang === "zh" ? selected.en : selected.zh}</div>
							<div className="ggrp">
								<span
									style={{
										width: 9,
										height: 9,
										borderRadius: "50%",
										background: selGroup.color,
										display: "inline-block",
									}}
								/>
								{selGroup[lang]}
							</div>
							<p className="gdesc">{lang === "zh" ? selected.desc_zh : selected.desc_en}</p>
							<div className="gd-rel-h">{t("关系", "Relations")}</div>
							<div className="gd-rels">
								{relations.map(({ other, rel }, i) => (
									<button
										type="button"
										key={`${other.id}-${i}`}
										className="gd-rel-item"
										onClick={() => setSelected(other)}
										style={{ background: "none", border: 0, textAlign: "left", width: "100%" }}
									>
										<span className="tag" style={{ background: rel.color }}>
											{rel[lang]}
										</span>
										<span>{lang === "zh" ? other.zh : other.en}</span>
									</button>
								))}
							</div>
						</div>
					</>
				)}
			</div>

			<div className="gpanel g-ctrl">
				<button type="button" onClick={() => zoomBtn(1.2)} aria-label="zoom in">
					+
				</button>
				<button type="button" onClick={() => zoomBtn(1 / 1.2)} aria-label="zoom out">
					−
				</button>
				<button
					type="button"
					title="reset"
					aria-label="reset"
					onClick={() => {
						fitViewRef.current();
						setSelected(null);
					}}
				>
					⊙
				</button>
			</div>

			{!selected && (
				<div className="hint-tip">
					{t("拖拽节点 · 滚轮缩放 · 点击查看详情", "Drag nodes · scroll to zoom · click for detail")}
				</div>
			)}
		</div>
	);
}

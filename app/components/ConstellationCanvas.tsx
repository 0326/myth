import { useEffect, useRef } from "react";

/**
 * "暗黑引擎" constellation network — a decorative drifting node graph behind the
 * home hero. Client-only: it renders an empty <canvas> on the server and only
 * animates after mount, so it never blocks SSR content (transform-only /
 * visibility principle). Respects prefers-reduced-motion.
 * Ported from design_handoff assets/home.js (startNet).
 */
export function ConstellationCanvas() {
	const ref = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const c = ref.current;
		if (!c) return;
		const ctx = c.getContext("2d");
		if (!ctx) return;

		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const N = 46;
		const pts = Array.from({ length: N }, () => ({
			x: Math.random(),
			y: Math.random(),
			vx: (Math.random() - 0.5) * 0.0008,
			vy: (Math.random() - 0.5) * 0.0008,
			r: Math.random() < 0.16 ? 2.4 : 1.2,
		}));

		let w = 0;
		let h = 0;
		function size() {
			if (!c || !ctx) return;
			w = c.clientWidth;
			h = c.clientHeight;
			c.width = w * dpr;
			c.height = h * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		}
		size();
		window.addEventListener("resize", size);

		let raf = 0;
		function frame() {
			if (!ctx) return;
			ctx.clearRect(0, 0, w, h);
			pts.forEach((p) => {
				p.x += p.vx;
				p.y += p.vy;
				if (p.x < 0 || p.x > 1) p.vx *= -1;
				if (p.y < 0 || p.y > 1) p.vy *= -1;
			});
			for (let i = 0; i < N; i++) {
				for (let j = i + 1; j < N; j++) {
					const a = pts[i];
					const b = pts[j];
					const dx = (a.x - b.x) * w;
					const dy = (a.y - b.y) * h;
					const d = Math.hypot(dx, dy);
					if (d < 150) {
						ctx.strokeStyle = `rgba(201,162,74,${(1 - d / 150) * 0.22})`;
						ctx.lineWidth = 1;
						ctx.beginPath();
						ctx.moveTo(a.x * w, a.y * h);
						ctx.lineTo(b.x * w, b.y * h);
						ctx.stroke();
					}
				}
			}
			pts.forEach((p) => {
				ctx.fillStyle = p.r > 2 ? "rgba(227,196,119,.9)" : "rgba(201,162,74,.5)";
				ctx.beginPath();
				ctx.arc(p.x * w, p.y * h, p.r, 0, 7);
				ctx.fill();
			});
			if (!reduce) raf = requestAnimationFrame(frame);
		}
		frame();

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", size);
		};
	}, []);

	return <canvas id="netCanvas" ref={ref} aria-hidden="true" />;
}

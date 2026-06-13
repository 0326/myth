/* ============================================================
   华夏神话 — 分享卡片 canvas 绘制 (国潮海报, 800×1000)
   Ported from design_handoff assets/creature.js drawCard().
   关键: 画中文前必须 await document.fonts.ready; CJK 换行自写 wrapCJK。
   ============================================================ */
import { MYTH_CATS, MYTH_OMENS, MYTH_REGIONS } from "~/data/dict";
import type { Creature } from "~/data/types";
import type { Lang } from "~/i18n/LangContext";

function roundRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
) {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}

/** Character-by-character wrapping for CJK text (cannot rely on spaces). */
function wrapCJK(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	maxW: number,
	lh: number,
	maxLines: number,
): number {
	let line = "";
	let lines = 0;
	const chars = [...text];
	for (let i = 0; i < chars.length; i++) {
		const ch = chars[i];
		if (ctx.measureText(line + ch).width > maxW) {
			ctx.fillText(line, x, y);
			y += lh;
			lines++;
			line = ch;
			if (maxLines && lines >= maxLines - 1) {
				let rest = chars.slice(i).join("");
				while (ctx.measureText(`${rest}…`).width > maxW && rest.length > 1)
					rest = rest.slice(0, -1);
				ctx.fillText(rest + (rest.length < text.length ? "…" : ""), x, y);
				return y + lh;
			}
		} else {
			line += ch;
		}
	}
	ctx.fillText(line, x, y);
	return y + lh;
}

export async function drawCard(canvas: HTMLCanvasElement, d: Creature, lang: Lang) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	const W = canvas.width;
	const H = canvas.height;
	const cat = MYTH_CATS[d.cat];
	const reg = MYTH_REGIONS[d.region];
	const om = MYTH_OMENS[d.omen];

	// fonts MUST be ready before drawing CJK or glyphs misalign
	try {
		await document.fonts.ready;
	} catch {
		/* ignore */
	}

	// ground
	ctx.fillStyle = "#0e1311";
	ctx.fillRect(0, 0, W, H);
	// top color panel
	const g = ctx.createLinearGradient(0, 0, W, 520);
	g.addColorStop(0, d.color);
	g.addColorStop(1, "#0e1311");
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, W, 520);
	// diagonal texture
	ctx.save();
	ctx.beginPath();
	ctx.rect(0, 0, W, 520);
	ctx.clip();
	ctx.strokeStyle = "rgba(0,0,0,.10)";
	ctx.lineWidth = 2;
	for (let i = -H; i < W; i += 18) {
		ctx.beginPath();
		ctx.moveTo(i, 0);
		ctx.lineTo(i + 520, 520);
		ctx.stroke();
	}
	ctx.restore();
	// glyph
	ctx.fillStyle = "rgba(255,255,255,.96)";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = '900 250px "Noto Serif SC", serif';
	ctx.shadowColor = "rgba(0,0,0,.4)";
	ctx.shadowBlur = 30;
	ctx.shadowOffsetY = 12;
	ctx.fillText(d.glyph, W / 2, 270);
	ctx.shadowBlur = 0;
	ctx.shadowOffsetY = 0;
	// seal
	ctx.fillStyle = "#c83f33";
	roundRect(ctx, 40, 40, 84, 84, 10);
	ctx.fill();
	ctx.fillStyle = "#efe7d8";
	ctx.font = '900 38px "Noto Serif SC", serif';
	ctx.fillText(d.glyph, 82, 84);
	// omen badge top-right
	const omColors: Record<string, string> = {
		ji: "#3a6b5f",
		xiong: "#c83f33",
		zhong: "#c9a24a",
	};
	ctx.fillStyle = omColors[d.omen];
	roundRect(ctx, W - 150, 52, 110, 52, 26);
	ctx.fill();
	ctx.fillStyle = "#fff";
	ctx.font = '700 26px "Noto Sans SC", sans-serif';
	ctx.fillText(lang === "zh" ? om.zh : om.en, W - 95, 80);
	// name
	ctx.textAlign = "left";
	ctx.fillStyle = "#f4efe4";
	ctx.font = '900 76px "Noto Sans SC", sans-serif';
	ctx.fillText(lang === "zh" ? d.zh : d.en, 56, 640);
	ctx.fillStyle = "#e3c477";
	ctx.font = '700 30px "Archivo", sans-serif';
	ctx.fillText((lang === "zh" ? d.en : d.py).toUpperCase(), 58, 692);
	// meta line
	ctx.fillStyle = "#8d8775";
	ctx.font = '400 24px "Noto Sans SC", sans-serif';
	// full-width spaces around the dot kept in a plain string (lint-safe)
	ctx.fillText(`${cat[lang]}${"　·　"}${reg[lang]}`, 58, 738);
	// divider
	ctx.strokeStyle = "rgba(201,162,74,.4)";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(56, 772);
	ctx.lineTo(W - 56, 772);
	ctx.stroke();
	// original text
	ctx.fillStyle = "#c8c0ae";
	ctx.font = '500 30px "Noto Serif SC", serif';
	const endY = wrapCJK(ctx, d.src, 56, 824, W - 112, 46, 4);
	// ref
	ctx.fillStyle = "#9c7a2f";
	ctx.font = '500 24px "Noto Serif SC", serif';
	ctx.fillText(`— ${d.ref}`, 56, Math.min(endY + 12, H - 90));
	// footer brand
	ctx.fillStyle = "#5f5b4f";
	ctx.font = '700 22px "Space Mono", monospace';
	ctx.fillText("华夏神话 · HUAXIA MYTH", 56, H - 44);
	ctx.textAlign = "right";
	ctx.fillText("huaxiamyth.com", W - 56, H - 44);
	ctx.textAlign = "left";
}

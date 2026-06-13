import { useEffect, useRef, useState } from "react";
import type { Creature } from "~/data/types";
import { useLang } from "~/i18n/LangContext";
import { drawCard } from "~/lib/drawCard";

/** "生成分享卡片" — opens a modal and renders an 800×1000 国潮 share card to a
 *  <canvas>, downloadable as PNG. Drawing happens client-side only. */
export function ShareCard({ d }: { d: Creature }) {
	const { t, lang } = useLang();
	const [open, setOpen] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (open && canvasRef.current) {
			void drawCard(canvasRef.current, d, lang);
		}
	}, [open, d, lang]);

	function download() {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const a = document.createElement("a");
		a.download = `华夏神话-${d.zh}.png`;
		a.href = canvas.toDataURL("image/png");
		a.click();
	}

	return (
		<>
			<button
				type="button"
				className="btn btn-gold"
				style={{ justifyContent: "center" }}
				onClick={() => setOpen(true)}
			>
				{t("生成分享卡片", "Make share card")}
			</button>

			<div
				className={`modal${open ? " open" : ""}`}
				onClick={(e) => {
					if (e.target === e.currentTarget) setOpen(false);
				}}
			>
				<button
					type="button"
					className="modal-close"
					aria-label={t("关闭", "Close")}
					onClick={() => setOpen(false)}
				>
					×
				</button>
				<div className="modal-inner">
					<canvas className="share-canvas" ref={canvasRef} width={800} height={1000} />
					<div className="modal-actions">
						<button type="button" className="btn btn-gold" onClick={download}>
							{t("下载卡片", "Download")}
						</button>
						<button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
							{t("关闭", "Close")}
						</button>
					</div>
				</div>
			</div>
		</>
	);
}

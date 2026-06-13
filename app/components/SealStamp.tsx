import type { CSSProperties, ReactNode } from "react";

/** Cinnabar seal stamp — the brand's primary "icon" (印章). */
export function SealStamp({
	children,
	className = "",
	style,
}: {
	children: ReactNode;
	className?: string;
	style?: CSSProperties;
}) {
	return (
		<span className={`stamp ${className}`} style={style}>
			{children}
		</span>
	);
}

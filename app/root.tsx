import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useRouteLoaderData,
} from "react-router";
import type { Route } from "./+types/root";
import { Nav } from "~/components/Nav";
import { htmlLang, LangProvider, langFromRequest, type Lang } from "~/i18n/LangContext";
import tokensHref from "~/styles/tokens.css?url";
import appHref from "~/styles/app.css?url";
import pagesHref from "~/styles/pages.css?url";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{ rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&family=Noto+Serif+SC:wght@500;700;900&family=Archivo:wght@500;700;900&family=Space+Mono:wght@400;700&display=swap",
	},
	{ rel: "stylesheet", href: tokensHref },
	{ rel: "stylesheet", href: appHref },
	{ rel: "stylesheet", href: pagesHref },
];

export async function loader({ request }: Route.LoaderArgs) {
	return { lang: langFromRequest(request) };
}

export function Layout({ children }: { children: React.ReactNode }) {
	const data = useRouteLoaderData<typeof loader>("root");
	const lang: Lang = data?.lang ?? "zh";
	return (
		<html lang={htmlLang(lang)}>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<LangProvider initialLang={lang}>{children}</LangProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return (
		<>
			<Nav />
			<Outlet />
		</>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	const is404 = isRouteErrorResponse(error) && error.status === 404;
	const title = is404 ? "未寻得此页 · Not found" : "出错了 · Something went wrong";
	const detail = is404
		? "你寻找的神兽或页面不存在。"
		: isRouteErrorResponse(error)
			? `${error.status} ${error.statusText}`
			: "An unexpected error occurred.";
	return (
		<main className="wrap" style={{ padding: "var(--s9) 0", textAlign: "center" }}>
			<div className="eyebrow" style={{ justifyContent: "center" }}>
				华夏神话 · HUAXIA MYTH
			</div>
			<h1 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900 }}>{title}</h1>
			<p style={{ color: "var(--t-mid)", marginTop: "var(--s4)" }}>{detail}</p>
			<a className="btn btn-gold" href="/" style={{ marginTop: "var(--s6)" }}>
				返回首页 · Home
			</a>
		</main>
	);
}

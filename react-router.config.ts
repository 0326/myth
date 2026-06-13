import type { Config } from "@react-router/dev/config";

export default {
	// SSR-first: every route is server-rendered, then hydrated. This is the
	// core SEO lever for the project (see doc/myth-brd.md §5).
	ssr: true,
	future: {
		// Required for the Cloudflare Vite plugin's Vite Environment API.
		v8_viteEnvironmentApi: true,
	},
} satisfies Config;

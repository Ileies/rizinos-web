import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Fully prerendered static frontend. Deployable to any CDN/static host.
		adapter: adapter({
			fallback: '200.html' // SPA fallback for client-side routed pages (e.g. /admin)
		}),
		prerender: {
			handleHttpError: 'warn',
			handleMissingId: 'warn',
			entries: [
				'*',
				// English at root (no locale prefix)
				'/',
				'/about/',
				'/blog/',
				'/careers/',
				'/contact/',
				'/docs/',
				'/enterprise/',
				'/features/',
				'/forgot-password/',
				'/legal/',
				'/login/',
				'/pricing/',
				'/privacy/',
				'/reset-password/',
				'/security/',
				'/signup/',
				'/status/',
				'/support/',
				'/terms/',
				'/confirm-email/',
				// Other locales with prefix
				...['de', 'cn', 'ru'].flatMap((l) => [
					`/${l}/`,
					`/${l}/about/`,
					`/${l}/blog/`,
					`/${l}/careers/`,
					`/${l}/contact/`,
					`/${l}/docs/`,
					`/${l}/enterprise/`,
					`/${l}/features/`,
					`/${l}/forgot-password/`,
					`/${l}/legal/`,
					`/${l}/login/`,
					`/${l}/pricing/`,
					`/${l}/privacy/`,
					`/${l}/reset-password/`,
					`/${l}/security/`,
					`/${l}/signup/`,
					`/${l}/status/`,
					`/${l}/support/`,
					`/${l}/terms/`,
					`/${l}/confirm-email/`
				])
			]
		},
		alias: {
			$ui: './src/lib/client/components',
			$shadcn: './src/lib/components/ui'
		}
	}
};

export default config;

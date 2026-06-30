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
				'/support/',
				'/contact/',
				'/security/',
				'/about/',
				'/blog/',
				'/careers/'
			]
		},
		alias: {
			$ui: './src/lib/client/components',
			$shadcn: './src/lib/components/ui'
		}
	}
};

export default config;

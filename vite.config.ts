import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { i18nPlugin } from './src/lib/i18n-plugin';
import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// In production a reverse proxy puts the static frontend and the Bun backend on
// one origin. In dev we emulate that by proxying /api and /ws to the backend so
// same-origin cookies/auth keep working.
const BACKEND = `http://localhost:${process.env.BACKEND_PORT ?? 3001}`;

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			preprocess: vitePreprocess(),
			// Fully prerendered static frontend. Deployable to any CDN/static host.
			adapter: adapter({
				fallback: '200.html' /* SPA fallback for client-side routed pages (e.g. /admin) */
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
					...['de', 'cn', 'ru'].flatMap(
						(l) =>
							[
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
							] satisfies `/${string}`[]
					)
				]
			}
		}),
		devtoolsJson(),
		i18nPlugin()
	],
	server: {
		proxy: {
			'/api': { target: BACKEND, changeOrigin: false },
			'/ws': { target: BACKEND, ws: true }
		}
	}
});

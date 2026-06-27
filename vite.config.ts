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
	plugins: [tailwindcss(), sveltekit(), devtoolsJson(), i18nPlugin()],
	server: {
		proxy: {
			'/api': { target: BACKEND, changeOrigin: false },
			'/ws': { target: BACKEND, ws: true }
		}
	}
});

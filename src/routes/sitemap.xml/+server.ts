import { PUBLIC_ORIGIN } from '$env/static/public';
import type { RequestHandler } from './$types';

export const prerender = true;

interface RouteEntry {
	path: string;
	priority: string;
	changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

const STATIC_ROUTES: RouteEntry[] = [
	{ path: '/', priority: '1.0', changefreq: 'weekly' },
	{ path: '/about/', priority: '0.8', changefreq: 'monthly' },
	{ path: '/features/', priority: '0.8', changefreq: 'monthly' },
	{ path: '/pricing/', priority: '0.7', changefreq: 'monthly' },
	{ path: '/blog/', priority: '0.7', changefreq: 'weekly' },
	{ path: '/docs/', priority: '0.7', changefreq: 'weekly' },
	{ path: '/enterprise/', priority: '0.6', changefreq: 'monthly' },
	{ path: '/contact/', priority: '0.5', changefreq: 'yearly' },
	{ path: '/careers/', priority: '0.5', changefreq: 'monthly' },
	{ path: '/security/', priority: '0.5', changefreq: 'monthly' },
	{ path: '/status/', priority: '0.4', changefreq: 'daily' },
	{ path: '/support/', priority: '0.4', changefreq: 'monthly' }
];

function buildSitemap(origin: string, routes: RouteEntry[]): string {
	const today = new Date().toISOString().split('T')[0];
	const base = `https://${origin}`;

	const urlEntries = routes
		.map(
			({ path, priority, changefreq }) => `  <url>
    <loc>${base}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
		)
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

export const GET: RequestHandler = () => {
	const xml = buildSitemap(PUBLIC_ORIGIN, STATIC_ROUTES);

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=86400'
		}
	});
};

import { PUBLIC_ORIGIN } from '$env/static/public';

export const load = () => ({
	seo: {
		title: 'RizinOS - The First Online Operating System',
		description:
			"A full desktop environment that runs entirely in your browser. No installation, no drivers, no hardware requirements. Just open a tab and you're in.",
		jsonLd: {
			'@context': 'https://schema.org',
			'@type': 'SoftwareApplication',
			name: 'RizinOS',
			applicationCategory: 'WebApplication',
			operatingSystem: 'Web Browser',
			url: `https://${PUBLIC_ORIGIN}/`,
			offers: {
				'@type': 'Offer',
				price: '0',
				priceCurrency: 'EUR',
				availability: 'https://schema.org/InStock'
			},
			publisher: { '@id': `https://${PUBLIC_ORIGIN}/#organization` }
		}
	}
});

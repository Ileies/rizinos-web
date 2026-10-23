import { PUBLIC_ORIGIN } from '$app/env/public';
import { MAILBOXES, mailboxAddress, type Mailbox } from '#lib/contact.js';

const CONTACT_TYPE: Record<Mailbox, string> = {
	support: 'customer support',
	security: 'security',
	press: 'press',
	privacy: 'privacy'
};

export const load = () => ({
	seo: {
		title: 'Contact - RizinOS',
		description:
			'Get in touch with the RizinOS team for support, bug reports, feedback, security disclosures, press and privacy requests.',
		jsonLd: {
			'@context': 'https://schema.org',
			'@type': 'ContactPage',
			name: 'Contact RizinOS',
			url: `https://${PUBLIC_ORIGIN}/contact/`,
			mainEntity: {
				'@type': 'Organization',
				name: 'RizinOS',
				url: `https://${PUBLIC_ORIGIN}`,
				contactPoint: MAILBOXES.map((mailbox) => ({
					'@type': 'ContactPoint',
					contactType: CONTACT_TYPE[mailbox],
					email: mailboxAddress(mailbox),
					availableLanguage: ['English', 'German', 'Chinese', 'Russian']
				}))
			}
		}
	}
});

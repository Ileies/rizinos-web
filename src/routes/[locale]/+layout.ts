import { error } from '@sveltejs/kit';
import { locales } from '$lib/messages.svelte';

export const load = ({ params }) => {
	if (!(locales as readonly string[]).includes(params.locale)) {
		error(404, 'Unknown locale');
	}
	return { locale: params.locale };
};

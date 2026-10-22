import { defineParams } from '@sveltejs/kit/params';

const matchLocale = (param: string) => ['de', 'en', 'cn', 'ru'].includes(param);

export const params = defineParams({
	locale: (param) => (matchLocale(param) ? param : undefined)
});

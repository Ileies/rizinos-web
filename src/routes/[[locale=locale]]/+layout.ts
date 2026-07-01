export const load = ({ params }) => {
	return { locale: params.locale ?? 'en', localeFromUrl: !!params.locale };
};

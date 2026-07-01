export const load = ({ params }) => {
	return { locale: params.locale ?? 'en' };
};

import { PUBLIC_APP_NAME } from '$env/static/public';

interface DefaultSeo {
	pageTitle: string;
	pageDescription: string;
	twitterCard: string;
	twitterSite: string;
	ogType: string;
	ogUrl: string;
	ogImage: string;
	keywords: string;
	robots: string;
}
type Seo = Partial<DefaultSeo>;

export const load = async () => {
	const seo: Seo = {
		pageTitle: `${PUBLIC_APP_NAME} | About`,
		pageDescription: `The privacy policy for ${PUBLIC_APP_NAME}`
	};
	return { seo };
};

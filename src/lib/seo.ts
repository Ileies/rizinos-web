export interface PageSeo {
	title: string;
	description: string;
	robots?: string;
	ogImage?: string;
	ogType?: string;
	jsonLd?: object | object[];
}

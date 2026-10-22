import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_GOOGLE_ANALYTICS_ID: { public: true, static: true },
	PUBLIC_ORIGIN: { public: true, static: true },
	PUBLIC_APP_NAME: { public: true, static: true }
});

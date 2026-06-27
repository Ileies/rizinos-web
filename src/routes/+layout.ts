// Static frontend: prerender every route to HTML at build time (needed for SEO
// on the marketing/legal pages). The /admin SPA can opt out locally with its own
// `prerender = false` + `ssr = false`.
export const prerender = true;

// Trailing slashes enabled site-wide. With adapter-static this prerenders each
// route to `<route>/index.html`.
export const trailingSlash = 'always';

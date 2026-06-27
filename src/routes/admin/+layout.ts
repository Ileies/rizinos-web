// The admin dashboard reads/writes runtime data via /api/admin/* and is
// permission-gated, so there is nothing to prerender.
export const prerender = false;
export const ssr = false;

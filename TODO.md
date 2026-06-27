# TODO

## Bugs / Broken

- **Homepage SignupFlow is non-functional** - `src/lib/client/components/homepage/SignupFlow.svelte` has a TODO comment and does not actually call `/api/auth/signup`. Wire it to the API the same way `/signup/+page.svelte` does.
- **Missing i18n keys referenced in Header** - `src/lib/client/components/homepage/Header.svelte` calls `m.pricing()`, `m.enterprise()`, `m.api_reference()`, `m.tutorials()` but these keys are not defined in any `messages/*.json` file. Either add the keys or remove the nav items.

## Incomplete Pages

- **About page** (`/about`) - `src/routes/about/+page.svelte` is a Lorem ipsum placeholder. Write actual content about the project/team.

## Auth & Account Flows

- **Password reset** - No forgot-password page or flow exists. Needs a `/forgot-password` route and backend endpoint.
- **Account settings page** - Users have no way to change their own email, password, username, or profile info after signup.
- **Logout** - No visible logout button in the header/nav for logged-in users. Session ends only by clearing cookies.
- **Session expiry handling** - If the session cookie expires mid-session, the admin UI just starts returning 401s with no redirect to `/login`.

## Admin Dashboard

- **No pagination** - The users table (`/admin`) loads all users at once. Needs pagination or virtual scrolling for large user counts.
- **No search/filter on users** - The users table has no search input. Filtering by username/email/role would help usability.
- **Log viewer is basic** - Logs are displayed as raw text with no filtering, date range, or severity level selection.
- **Apps tab** - The apps management tab exists but there is no documentation of what "apps" are or what fields are required. Clarify the data model and add inline help.
- **Confirmation dialogs for destructive actions** - Deleting users or apps should require an explicit confirmation step (the Modal component exists and is ready to use).
- **Error display** - Most admin API calls surface errors only as console errors or silently fail. Show inline error messages in the UI.

## Minecraft Admin

- **Warp editor** - `RestrictEditor` and `LocationEditor` are used, but there is no way to create a new warp from the UI (only edit existing ones if the API returns them).
- **Player action feedback** - Ban/mute/kick actions have no success or failure toast/notification. User is left guessing if the action worked.
- **Minechat webhook testing** - No "send test message" button to verify a Discord webhook URL is valid before saving.
- **Pagination for player/warp/ban lists** - Same issue as user list: no pagination for large datasets.

## Code Quality

- **Unhandled promise rejections** - Several `fetch()`/`adminPost()` calls in admin pages are not wrapped in try/catch and have no `.catch()`. Add error handling or use a shared error boundary.
- **Loose types in adminApi** - `adminGet` and `adminPost` in `src/lib/adminApi.ts` return `any`. Add generics so call sites get typed responses.
- **Client-only admin auth gate** - `/admin/+layout.svelte` checks `Role.Admin` on the client. This is fine only because the backend also enforces it. Add a comment explaining this to prevent confusion later.
- **`session.svelte.ts` has no error state** - If `/api/auth/session` returns a non-200, the session is silently left as null. Expose a loading/error state so components can distinguish "not loaded yet" from "not logged in".

## i18n

- **Missing translation strings** - Add keys for navigation items currently referenced but undefined: `pricing`, `enterprise`, `api_reference`, `tutorials` (or remove those nav items if they are not planned).
- **Admin UI is not translated** - The entire admin dashboard uses hardcoded English strings. Either declare it English-only by design or add i18n coverage.
- **Confirm-email page messages** - Check that all success/error variants in `/confirm-email` have translations in all four locales.

## SEO & Meta

- **No `<meta>` tags on inner pages** - Only the root layout sets a title. `/login`, `/signup`, `/about` etc. have no page-specific `<title>` or Open Graph tags.
- **No sitemap** - Static sitemap is easy to generate and helps indexing. Add a `sitemap.xml` to `/static` or generate it at build time.
- **No robots.txt** - Missing from `/static`. At minimum block `/admin` from crawlers.

## Performance

- **No image optimization** - The hero section and other marketing assets (if added) should use SvelteKit's `enhanced:img` or a similar pipeline rather than raw `<img>` tags.
- **Google Analytics loaded unconditionally** - Analytics fires even when `PUBLIC_GOOGLE_ANALYTICS_ID` is empty/unset. Guard the script tag to only inject when the ID is present.

## DevEx / Tooling

- **No `.env` in repo** - `.env.template` exists, but there is no check that `.env` is populated before `bun run dev`. A startup script or Vite plugin warning would help onboarding.
- **Deploy script has no dry-run flag** - `scripts/deploy.ts` always rsyncs to production. Add a `--dry-run` flag that passes `--dry-run` to rsync.
- **No CI** - No GitHub Actions or other CI pipeline is configured. At minimum: run `bun run check` and `bun run lint` on push.

## Future Features

- **User-facing dashboard** - Logged-in non-admin users see the same marketing homepage. A `/dashboard` route for regular users would be the natural next step.
- **PostHog analytics** - `PUBLIC_POSTHOG_KEY` is in `.env.template` but commented out. Decide if PostHog is being used and either remove it or wire it up.
- **WebSocket integration** - The Vite proxy forwards `/ws` to the backend but no client code consumes WebSocket events yet. Real-time features (live log streaming, online status) will need this.
- **OAuth login** - No third-party auth providers. Discord OAuth would pair naturally with the existing Discord integration.
- **Dark mode toggle** - Tailwind dark mode classes are present throughout but there is no UI toggle. The theme follows the OS setting only.
- **Pricing page** - The hero CTA and nav reference pricing but no `/pricing` route exists.

# TODO

## Auth & Account Flows

- **Password reset** - No forgot-password page or flow exists. Needs a `/forgot-password` route and backend endpoint.

## Admin Dashboard

- **No pagination** - The users table (`/admin`) loads all users at once. Needs pagination or virtual scrolling for large user counts.
- ~~**No search/filter on users** - The users table has no search input. Filtering by username/email/role would help usability.~~ Done: live search by username/email/name/role in toolbar.
- ~~**Log viewer is basic** - Logs are displayed as raw text with no filtering, date range, or severity level selection.~~ Done: severity level filter (all/info/warning/error/debug) added to toolbar.
- **Apps tab** - The apps management tab exists but there is no documentation of what "apps" are or what fields are required. Clarify the data model and add inline help.
- ~~**Error display** - Most admin API calls surface errors only as console errors or silently fail. Show inline error messages in the UI.~~ Done: all admin pages show `loadError` and `formError` inline.

## Minecraft Admin

- ~~**Warp editor** - `RestrictEditor` and `LocationEditor` are used, but there is no way to create a new warp from the UI (only edit existing ones if the API returns them).~~ Done: "New Warp" button and create modal added.
- **Player action feedback** - Ban/mute/kick actions have no success or failure toast/notification. User is left guessing if the action worked.
- ~~**Minechat webhook testing** - No "send test message" button to verify a Discord webhook URL is valid before saving.~~ Done: "Test" button in hook modal sends a message directly to the Discord webhook URL.
- **Pagination for player/warp/ban lists** - Same issue as user list: no pagination for large datasets.

## Code Quality

- **Unhandled promise rejections** - Several `fetch()`/`adminPost()` calls in admin pages are not wrapped in try/catch and have no `.catch()`. Add error handling or use a shared error boundary.

## i18n

- **Admin UI is not translated** - The entire admin dashboard uses hardcoded English strings. Declare it English-only by design.
- **Confirm-email page messages** - Check that all success/error variants in `/confirm-email` have translations in all four locales.

## Performance

- **No image optimization** - The hero section and other marketing assets (if added) should use SvelteKit's `enhanced:img` or a similar pipeline rather than raw `<img>` tags.

## DevEx / Tooling

- **No `.env` in repo** - `.env.template` exists, but there is no check that `.env` is populated before `bun run dev`. A startup script or Vite plugin warning would help onboarding.
- **Deploy script has no dry-run flag** - `scripts/deploy.ts` always rsyncs to production. Add a `--dry-run` flag that passes `--dry-run` to rsync.
- **No CI** - No GitHub Actions or other CI pipeline is configured. At minimum: run `bun run check` and `bun run lint` on push.

## Future Features

- **OAuth login** - No third-party auth providers. Discord OAuth would pair naturally with the existing Discord integration.
- **Pricing page** - The hero CTA and nav reference pricing but no `/pricing` route exists.

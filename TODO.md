## Pages to develop

Stub pages with translated placeholder text (4 locales in `messages/pages.json`):

- `/enterprise`
- `/features`
- `/docs`
- `/support`
- `/pricing`
- `/security`
- `/status`
- `/careers`
- `/blog`

## Follow-ups

- Sub-pages `/features/performance`, `/features/security`, `/features/integration` and docs anchors (`#getting-started`, `#api`, `#tutorials`) were removed from the nav. Add them back to the header once the pages exist (keys `overview`, `performance`, `integration`, `getting_started`, `api_reference`, `tutorials` are still in `messages/common.json`)
- `/about` content is hardcoded English, not yet in the i18n system
- Page SEO titles/descriptions in `+page.ts` are English only

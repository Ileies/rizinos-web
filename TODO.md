# TODO

## Auth & Account Flows

- **Password reset** - No forgot-password page or flow exists. Needs a `/forgot-password` route and backend endpoint.

## Admin Dashboard

- **No pagination** - The users table (`/admin`) loads all users at once. Needs pagination or virtual scrolling for large user counts.
- **Apps tab** - The apps management tab exists but there is no documentation of what "apps" are or what fields are required. Clarify the data model and add inline help.

## Minecraft Admin

- **Pagination for player/warp/ban lists** - Same issue as user list: no pagination for large datasets.

## i18n

- **Admin UI is not translated** - The entire admin dashboard uses hardcoded English strings. Declare it English-only by design.

## Performance

- **No image optimization** - The hero section and other marketing assets (if added) should use SvelteKit's `enhanced:img` or a similar pipeline rather than raw `<img>` tags.

## Future Features

- **OAuth login** - No third-party auth providers. Discord OAuth would pair naturally with the existing Discord integration.
- **Pricing page** - The hero CTA and nav reference pricing but no `/pricing` route exists.

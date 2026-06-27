# TODO

## Admin Dashboard

- **Apps tab** - The apps management tab exists but there is no documentation of what "apps" are or what fields are required. Clarify the data model and add inline help.

## Minecraft Admin


## i18n

- **Admin UI is not translated** - The entire admin dashboard uses hardcoded English strings. Declare it English-only by design.

## Performance

- **No image optimization** - The hero section and other marketing assets (if added) should use SvelteKit's `enhanced:img` or a similar pipeline rather than raw `<img>` tags.

## Future Features

- **OAuth login** - No third-party auth providers. Discord OAuth would pair naturally with the existing Discord integration.
- **Pricing page** - The hero CTA and nav reference pricing but no `/pricing` route exists.

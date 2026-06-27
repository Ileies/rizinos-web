# rizinos-web

The **static frontend** of [RizinOS](https://github.com/Ileies/rizinos) - the first operating system that runs in your browser.

This repo is the marketing site, authentication forms, and admin dashboard, built as a fully prerendered static SPA. It is served from a CDN/static host and communicates with the dynamic backend ([`rizinos`](../rizinos)) exclusively through `fetch` calls to `/api/*`, sharing one origin via a reverse proxy.

## Sibling project

> **Backend:** [`../rizinos`](../rizinos) - the Bun + SvelteKit server that powers `/app` (OS desktop shell), all `/api/*` endpoints, WebSocket `/ws`, and the PostgreSQL database. See its [CLAUDE.md](../rizinos/CLAUDE.md) and [FEATURES.md](../rizinos/FEATURES.md) for full details.

In production, nginx routes traffic on one origin:

| Path prefix                                               | Served by                       |
| --------------------------------------------------------- | ------------------------------- |
| `/`, `/about`, `/login`, `/signup`, `/admin`, legal pages | this static build (rizinos-web) |
| `/app`, `/api/*`, `/storage/*`, `/ws`                     | rizinos (Bun server, port 3001) |

Same origin means cookies work without CORS or `SameSite=None`.

---

## What lives here

| Route                          | Description                                                      |
| ------------------------------ | ---------------------------------------------------------------- |
| `/`                            | Marketing homepage with inline signup flow                       |
| `/login`                       | Login page (email + password, Google OAuth)                      |
| `/signup`                      | Multi-step signup form                                           |
| `/confirm-email`               | Email verification handler                                       |
| `/about`                       | About page                                                       |
| `/legal`, `/privacy`, `/terms` | Legal / privacy / terms pages                                    |
| `/admin`                       | Admin SPA (users, Minecraft server management, Discord/Minechat) |

---

## Tech stack

| Layer           | Technology                                           |
| --------------- | ---------------------------------------------------- |
| Framework       | SvelteKit 2 + Svelte 5 (runes only)                  |
| Adapter         | `adapter-static` - fully prerendered, CDN-deployable |
| Styling         | Tailwind CSS v4 + shadcn-svelte + bits-ui            |
| Icons           | `@lucide/svelte`                                     |
| Build / runtime | Bun                                                  |
| i18n            | Custom Vite plugin, 4 locales: de / en / cn / ru     |
| 3D / animation  | Three.js + Threlte (hero section)                    |
| Validation      | Zod                                                  |

---

## Getting started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- The `rizinos` backend running on port 3001 (for `/api/*` and `/ws` proxying in dev)

### Install

```sh
bun install
```

### Develop

```sh
bun run dev        # starts on port 3003; proxies /api + /ws → localhost:3001
```

Set `BACKEND_PORT` to override the backend port (default: `3001`).

### Build

```sh
bun run build      # outputs static files to build/
bun run preview    # preview the static build locally on port 3003
```

### Type check / lint

```sh
bun run check      # svelte-check
bun run lint       # prettier + eslint
bun run format     # prettier --write
```

---

## Project structure

```
src/
  routes/
    +page.svelte                 # Marketing homepage (/)
    login/                       # Login form
    signup/                      # Multi-step signup form
    about/                       # About page
    (prosed)/                    # Shared prose layout for legal/auth pages
      confirm-email/
      legal/
      privacy/
      terms/
    admin/                       # Admin dashboard SPA (single route)
      +layout.svelte             # Client-side role guard
      +page.svelte               # Area switcher: AdminNav + active *Section
  lib/
    adminApi.ts                  # Typed fetch wrappers for /api/admin/*
    adminConstants.ts            # Shared admin visuals (ROLE_CHIP)
    client/
      components/
        homepage/                # Hero, Header, Footer, SignupFlow, CopyText
    components/
      ui/                        # shadcn-svelte primitives (auto-managed)
      admin/                     # One *Section per area (Rizinos/Minecraft/Minechat/Discord)
      AdminNav.svelte            # Top-level area tabs
      AdminPanel.svelte          # Shared section shell (wrapper + sub-tabs + toolbar)
      AdminTabs.svelte           # Shared sub-tab bar (icon + count)
      RowActions.svelte          # Shared hover edit/delete buttons
      UserViewModal.svelte       # Shared read-only user modal
      InlineEdit.svelte
      LocationEditor.svelte
      LocationInput.svelte
      Modal.svelte
      RestrictEditor.svelte
    config.ts                    # Social links, operator info (legal pages)
    formValidation.ts            # Zod-based form validators
    i18n-plugin.ts               # Vite plugin: messages/*.json → messages.svelte.ts
    messages.svelte.ts           # Auto-generated i18n runtime (gitignored)
    session.svelte.ts            # Runes-based session state ($state)
    types.ts
    utils.ts
messages/                        # i18n source files (JSON per topic)
scripts/
  deploy.ts                      # rsync build/ to server
static/                          # robots.txt, favicon, public assets
```

### Path aliases

| Alias     | Points to                   |
| --------- | --------------------------- |
| `$lib`    | `src/lib`                   |
| `$ui`     | `src/lib/client/components` |
| `$shadcn` | `src/lib/components/ui`     |

---

## i18n

Translation strings live in `messages/*.json`. Each key maps to an array `[de, en, cn, ru]`:

```json
{
	"hero_title": [
		"Das Betriebssystem, das in Ihrem Browser läuft",
		"The operating system that runs in your browser",
		"在您的浏览器中运行的操作系统",
		"Операционная система, которая работает в вашем браузере"
	]
}
```

The Vite plugin compiles all topic files into `src/lib/messages.svelte.ts` at dev/build time. Import functions directly:

```ts
import { hero_title, login_sign_in_button } from '$lib/messages.svelte';
```

The static site uses **client-side** locale detection by reading the `LOCALE` cookie (default: `en`).

---

## Admin dashboard

The admin dashboard is a static SPA. All data and mutations go through the `rizinos` backend at `/api/admin/*`. Use the typed wrappers:

```ts
import { adminGet, adminPost } from '$lib/adminApi';

const users = await adminGet<User[]>('/');
await adminPost('/minecraft', { action: 'start', worldId: 1 });
```

Authorization is enforced server-side by `rizinos`; the static site reacts to 401/403 responses.

---

## Deployment

```sh
bun run build      # build static site to build/
bun run deploy     # rsync build/ → ros:/var/www/rizinos-web
```

`scripts/deploy.ts` SSHes into the server alias `ros` and rsyncs `build/` to `/var/www/rizinos-web`. nginx serves these files statically with a `200.html` fallback for client-routed paths such as `/admin`.

The backend (`rizinos`) is deployed independently with PM2 on port 3001. See [`../rizinos/CLAUDE.md`](../rizinos/CLAUDE.md) for backend deployment.

---

## Links

- GitHub: <https://github.com/Ileies/rizinos>
- Discord: <https://discord.gg/p4fMb3y2R5>
- Twitter/X: <https://x.com/rizinos>

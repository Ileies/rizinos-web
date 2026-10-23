# rizinos-web - Developer Guide

Static frontend for RizinOS. Built with SvelteKit + `adapter-static` + Bun. Fully prerendered; no server-side rendering at runtime. Talks to the backend at `https://api.rizinos.com` via cross-origin fetch with `credentials: 'include'`.

## Sibling project: `rizinos` (backend)

[`../rizinos`](../rizinos) is the dynamic backend. It owns:

- `/app` - the OS desktop shell (SSR, SvelteKit Node adapter)
- `/api/*` - all REST endpoints (auth, admin, Minecraft, OS-level)
- `/ws` - custom Bun WebSocket server
- PostgreSQL database via Drizzle ORM
- All server-side auth, session, and domain logic

See [`../rizinos/CLAUDE.md`](../rizinos/CLAUDE.md) for backend conventions, DB schema, API contracts, and deployment details.

In **production**, the two services run on separate origins:

- `https://rizinos.com` - this static build (rizinos-web), served by nginx
- `https://api.rizinos.com` - the `rizinos` backend (port 3001); must set `Access-Control-Allow-Origin: https://rizinos.com` and `Access-Control-Allow-Credentials: true`

In **dev**, `vite.config.ts` proxies `/api` and `/ws` to `localhost:${BACKEND_PORT}` (default 3001). The dev proxy rewrites `/api/...` so dev still works with relative paths - but production uses the absolute `API_BASE` from `config.ts`.

---

## Dev Commands

```sh
bun run dev          # Vite dev server on port 3003 (proxies /api + /ws to backend)
bun run build        # adapter-static output → build/
bun run preview      # serve static build locally on port 3003
bun run check        # svelte-check type check
bun run lint         # prettier --check + eslint
bun run format       # prettier --write
bun run deploy       # rsync build/ to server (scripts/deploy.ts)
```

---

## Project Structure

```
src/
  routes/
    +page.svelte              # Marketing homepage (/)
    login/                    # Login form (email + password, Google OAuth button)
    signup/                   # Multi-step signup form
    about/                    # About page (static, no server load)
    contact/                  # Contact form + channel hub (see docs/contact-page.md)
    status/                   # Live status page (see "Status page" below)
    (prosed)/                 # Shared prose layout for long-form pages
      confirm-email/          # Email verification handler
      legal/                  # Imprint (Impressum)
      privacy/                # Privacy policy (DSGVO)
      terms/                  # Terms of service
    admin/                    # Admin SPA (single route, fully client-side)
      +layout.svelte          # Client-side role guard (redirects to /login if not admin)
      +page.svelte            # Area switcher: AdminNav + the active *Section component
  lib/
    adminApi.ts               # adminGet<T> / adminPost wrappers for /api/admin/*
    adminConstants.ts         # Shared admin visuals (ROLE_CHIP, CHIP_FALLBACK)
    client/
      components/
        homepage/             # Hero, Header, Footer, SignupFlow, CopyText, Container
        status/               # Status page parts + SiteStatusBanner (mounted in the root layout)
    components/
      ui/                     # shadcn-svelte primitives (auto-managed via CLI, don't hand-edit)
      admin/                  # One section component per area, all using AdminPanel
        ContactSection.svelte # Contact inbox: list, detail, reply, status, delete
        RizinosSection.svelte # Users / Logs / Apps
        MinecraftSection.svelte # Players / Warps / Worlds / Groups
        MinechatSection.svelte  # Users / Hooks / Servers
        DiscordSection.svelte   # Users
        StatusSection.svelte    # Status monitoring (tabs in admin/status/); also embedded on /status for admins
      AdminNav.svelte         # Top-level area tabs (bind:active), used by /admin
      AdminPanel.svelte       # Shared section shell: wrapper + error + sub-tabs + toolbar
      AdminTabs.svelte        # Shared sub-tab bar (icon + count)
      RowActions.svelte       # Shared hover edit/delete row buttons
      UserViewModal.svelte    # Shared read-only user detail modal
      InlineEdit.svelte
      LocationEditor.svelte
      LocationInput.svelte
      Modal.svelte
      RestrictEditor.svelte
    contact.ts                # Contact topics/limits/validation (mirrors the backend, keep in sync)
    contactApi.ts             # Contact submit + time-trap challenge client
    config.ts                 # API_BASE (https://api.rizinos.com), social links + operator info for legal pages
    formValidation.ts         # Zod validators (username, email, password, birthdate)
    i18n-plugin.ts            # Vite plugin: messages/*.json → messages.svelte.ts
    messages.svelte.ts        # AUTO-GENERATED - never edit by hand
    session.svelte.ts         # $state session (fetches GET /auth/session via apiFetch on mount)
    status.ts                 # Status types (mirror the backend), formatters, state color maps
    status.svelte.ts          # Polling store for /status (30 s, pauses when hidden, localStorage fallback)
    statusLabels.ts           # Translated labels, component names looked up by slug
    types.ts                  # Shared TypeScript types
    utils.ts                  # cn() and other utilities
messages/                     # i18n source files (one JSON per topic)
scripts/
  deploy.ts                   # bun run deploy → rsync build/ to server
static/                       # robots.txt, favicon, public assets
```

### Path aliases

| Import    | Points to                   |
| --------- | --------------------------- |
| `#lib`    | `src/lib`                   |
| `#ui`     | `src/lib/client/components` |
| `#shadcn` | `src/lib/components/ui`     |

---

## Tech Stack

- **Runtime:** Bun
- **Framework:** SvelteKit (adapter-static - zero SSR in production, fully prerendered)
- **Svelte version:** Svelte 5, runes only (`$state`, `$derived`, `$effect`, `$props`)
- **Styling:** Tailwind CSS v4 + shadcn-svelte + bits-ui
- **Icons:** `@lucide/svelte` (not `lucide-svelte`)
- **i18n:** Custom Vite plugin, client-side locale via `LOCALE` cookie
- **Validation:** Zod
- **3D:** Three.js + Threlte (hero section only)

---

## Key Conventions

- **Svelte 5 runes throughout** - no legacy stores, no `$:` reactive declarations, no `on:` event directives
- **`#lib/` imports only** - never relative paths from `src/`
- **shadcn-svelte** imported as `#shadcn/<component>` (package.json subpath import)
- **Homepage components** imported as `#ui/<component>` (package.json subpath import)
- **No em dashes** - use a regular dash, colon, or newline instead
- **No server-only code** - this is a static site; never import anything from a `server` module or `#lib/server/` (that lives in `rizinos`)
- **All admin API calls via `adminApi.ts`** - never write raw fetch calls to admin endpoints inline in components
- **Auth enforcement is the backend's job** - the static site only reacts to 401/403 responses; never trust client-side role checks as the sole gate
- **Admin UI is English-only by design** - the admin dashboard uses hardcoded English strings and is not part of the i18n system

---

## i18n System

Source files live in `messages/*.json`. Each key maps to an array `[de, en, cn, ru]`:

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

The Vite plugin (`src/lib/i18n-plugin.ts`) compiles all topic files into `src/lib/messages.svelte.ts` (gitignored) at dev/build time. Import translation functions directly:

```ts
import { hero_title, login_sign_in_button } from '#lib/messages.svelte.js';

// In component:
<h1>{hero_title()}</h1>

// With interpolation:
<p>{signup_welcome({ username: 'ileies' })}</p>
```

**Rules:**

- Adding a key: add it to the correct topic JSON file, then restart dev (the file will be regenerated)
- `messages.svelte.ts` is a Svelte 5 runes module - locale switching is reactive (`$state`)
- Locale is read from the `LOCALE` cookie client-side; default is `en` in the static site
- 4 supported locales: `de`, `en`, `cn`, `ru`
- `common.json` (if present) is for keys used across multiple pages; page-specific strings belong in topic files

---

## Status page

`/status` is a client-rendered page fed by the backend (`GET /status`, `/status/banner`, admin: `/admin/status`). Probing and incident logic live in [`../rizinos-status`](../rizinos-status) and [`../rizinos/docs/status.md`](../rizinos/docs/status.md); read those for the data model and state rules.

- **Data**: `statusStore` in `status.svelte.ts` polls every 30 s, pauses while the tab is hidden, backs off after errors and keeps the last good payload in `localStorage`. If the API is down the page says so and shows the cached data with its age instead of going blank. `status.ts` types mirror the backend's `src/lib/server/status/types.ts`: keep them in sync.
- **Components** (`#ui/status/`): `OverallBanner`, `ComponentRow` + `UptimeBar` (90 day bar, one focusable group: pointer maps to a day, arrow keys step through days), `IncidentCard`, `MaintenanceCard`, `StatusTable` (accessible table view behind a toggle), `StatsStrip`, `SiteStatusBanner` (in the root layout; only major and critical incidents and nearby maintenance, hidden on `/status`).
- **Colors**: state colors are reserved tokens in `app.css` (`--status-good`, `-warning`, `-serious`, `-critical`, `-maintenance`, `-idle`, utilities like `bg-status-good`). They are only used for marks, dots and tints. A state is never conveyed by color alone: every state has its own icon and a text label.
- **i18n**: UI strings live in `messages/status.json`. Component names and descriptions come from `status_component_<slug>` and `status_component_<slug>_desc`, looked up by slug in `statusLabels.ts`, falling back to the English name from the API. **New component in the prober means new keys in all four locales.** Incident and maintenance text is English only (written by admins).
- **Admin**: `StatusSection.svelte` (English only, like all admin UI) has Components, Incidents, Maintenance and System tabs. It is used in `/admin` and is lazily imported below the public page when `session.isAdmin`, so visitors never download it. The backend sends admin-only data from a separate endpoint, so the page never relies on a client-side role check for access.
- **Public vs admin data**: the public payload has no latency, error text or player counts. Do not add them to public components.

---

## Admin API (`src/lib/adminApi.ts`)

The admin dashboard is a pure client-side SPA. Server logic lives entirely in the `rizinos` backend at `https://api.rizinos.com/admin/*`. Use the typed wrappers - never write raw fetch calls to admin endpoints:

```ts
import { adminGet, adminPost } from '#lib/adminApi.js';

// Typed GET request
const users = await adminGet<User[]>('/');

// POST with structured result
const result = await adminPost('/minecraft', { action: 'start', worldId: 1 });
if (!result.ok) {
	console.error(result.error); // string error message from backend
}
```

`adminGet` throws on non-ok responses. `adminPost` never throws - it returns `{ ok: boolean, error?: string }`.

---

## Session (`src/lib/session.svelte.ts`)

A `$state` object populated by `GET https://api.rizinos.com/auth/session` on mount. Use it to read the current user:

```ts
import { session } from '#lib/session.svelte.js';

// In a component:
if (session.user?.role === 'admin') { ... }
```

The admin layout checks role client-side for UX purposes. This is safe because `rizinos` enforces authorization on every `/admin/*` request server-side, independently of what the static site does.

---

## Deployment

```sh
bun run build      # static build to build/
bun run deploy     # rsync build/ → ros:/var/www/rizinos-web
```

`scripts/deploy.ts` SSHes into the server via the SSH alias `ros` and rsyncs `build/` to `/var/www/rizinos-web`. nginx serves these files with a `200.html` SPA fallback for client-routed paths (e.g. `/admin`).

The backend (`rizinos`) is deployed separately. See [`../rizinos/CLAUDE.md`](../rizinos/CLAUDE.md).

### Asset collision note

SvelteKit defaults to `/_app/` for chunk assets. `rizinos` overrides this to `/_backend/` so its assets don't collide. Do not change `appDir` in this repo - `/_app/` is intentionally left to `rizinos-web`.

---

## Open items

See [`TODO.md`](./TODO.md) for known bugs, incomplete pages, and code quality issues.

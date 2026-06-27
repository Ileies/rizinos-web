# rizinos-web - Developer Guide

Static frontend for RizinOS. Built with SvelteKit + `adapter-static` + Bun. Fully prerendered; no server-side rendering at runtime. Talks to the backend exclusively via `fetch('/api/...')` with same-origin cookies.

## Sibling project: `rizinos` (backend)

[`../rizinos`](../rizinos) is the dynamic backend. It owns:

- `/app` - the OS desktop shell (SSR, SvelteKit Node adapter)
- `/api/*` - all REST endpoints (auth, admin, Minecraft, OS-level)
- `/ws` - custom Bun WebSocket server
- PostgreSQL database via Drizzle ORM
- All server-side auth, session, and domain logic

See [`../rizinos/CLAUDE.md`](../rizinos/CLAUDE.md) for backend conventions, DB schema, API contracts, and deployment details.

In **production**, nginx routes traffic on one origin:

- Everything not under `/app|/api|/storage|/ws` → this static build (rizinos-web)
- `/app`, `/api`, `/storage`, `/ws` → `rizinos` on port 3001

In **dev**, `vite.config.ts` proxies `/api` and `/ws` to `localhost:${BACKEND_PORT}` (default 3001), emulating the same-origin setup.

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
    components/
      ui/                     # shadcn-svelte primitives (auto-managed via CLI, don't hand-edit)
      admin/                  # One section component per area, all using AdminPanel
        RizinosSection.svelte # Users / Logs / Apps
        MinecraftSection.svelte # Players / Warps / Worlds / Groups
        MinechatSection.svelte  # Users / Hooks / Servers
        DiscordSection.svelte   # Users
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
    config.ts                 # Social links + operator info for legal pages
    formValidation.ts         # Zod validators (username, email, password, birthdate)
    i18n-plugin.ts            # Vite plugin: messages/*.json → messages.svelte.ts
    messages.svelte.ts        # AUTO-GENERATED - never edit by hand
    session.svelte.ts         # $state session (fetches GET /api/auth/session on mount)
    types.ts                  # Shared TypeScript types
    utils.ts                  # cn() and other utilities
messages/                     # i18n source files (one JSON per topic)
scripts/
  deploy.ts                   # bun run deploy → rsync build/ to server
static/                       # robots.txt, favicon, public assets
```

### Path aliases

| Alias     | Points to                   |
| --------- | --------------------------- |
| `$lib`    | `src/lib`                   |
| `$ui`     | `src/lib/client/components` |
| `$shadcn` | `src/lib/components/ui`     |

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
- **`$lib/` imports only** - never relative paths from `src/`
- **shadcn-svelte** imported as `$shadcn/<component>` (tsconfig alias)
- **Homepage components** imported as `$ui/<component>` (tsconfig alias)
- **No em dashes** - use a regular dash, colon, or newline instead
- **No server-only code** - this is a static site; never import anything from a `server` module or `$lib/server/` (that lives in `rizinos`)
- **All admin API calls via `adminApi.ts`** - never write raw `fetch('/api/admin/...')` inline in components
- **Auth enforcement is the backend's job** - the static site only reacts to 401/403 responses; never trust client-side role checks as the sole gate

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
import { hero_title, login_sign_in_button } from '$lib/messages.svelte';

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

## Admin API (`src/lib/adminApi.ts`)

The admin dashboard is a pure client-side SPA. Server logic lives entirely in the `rizinos` backend at `/api/admin/*`. Use the typed wrappers - never write raw fetch calls to admin endpoints:

```ts
import { adminGet, adminPost } from '$lib/adminApi';

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

A `$state` object populated by `GET /api/auth/session` on mount. Use it to read the current user:

```ts
import { session } from '$lib/session.svelte';

// In a component:
if (session.user?.role === 'admin') { ... }
```

The admin layout checks role client-side for UX purposes. This is safe because `rizinos` enforces authorization on every `/api/admin/*` request server-side, independently of what the static site does.

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

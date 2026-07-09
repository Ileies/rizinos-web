# RizinOS-Monorepo: `rizinos-web` + `rizinos` + neuer Discord-Bot-Slot

## Kontext

Aktuell sind `rizinos-web` (statisches Frontend) und `rizinos` (Backend) zwei komplett getrennte GitHub-Repos mit eigenem `package.json`, eigenen Lockfiles und eigenem CLAUDE.md. Ein Blick in beide zeigt erhebliche Duplikation:

- Identische Komponenten in beiden Repos: `Modal.svelte`, `InlineEdit.svelte`, `LocationEditor.svelte`, `RestrictEditor.svelte`
- Identisches `i18n-plugin.ts` + gleiches JSON-Array-Format (`[de, en, cn, ru]`)
- Fast identische `devDependencies` (svelte, tailwind, shadcn-svelte, bits-ui, three, threlte, zod, eslint/prettier-Config) - zwei Lockfiles, die synchron gehalten werden müssen
- Backend hat bereits `schemaDiscord.ts` (`dcUsers`) und `schemaMinechat.ts` (`minechatUsers/-Servers/-Hooks`) - ein Discord-Bot ist also bereits im Datenmodell angelegt, nur noch nicht als eigener Prozess gebaut

Das Projekt wächst (analog zu drizzle: Core + Adapter + Kit als eigene Packages in einem Workspace). Ziel: eine Monorepo-Struktur, die Duplikation eliminiert, aber die getrennten Deploy-Pipelines (nginx-Subdomains `rizinos.com` / `app.rizinos.com` / `api.rizinos.com`) unangetastet lässt.

**Entscheidung:** Frischer Start ohne Git-History-Merge (Code wird kopiert, alte Repos bleiben als Archiv auf GitHub bestehen). Discord-Bot: discord.js + Bun, aber **nur als Platzhalter/Scaffold** - keine Bot-Logik jetzt bauen.

## Zielstruktur

Neues Repo `rizinos-platform`, Bun Workspaces:

```
rizinos-platform/
  package.json              # workspaces: ["apps/*", "packages/*"]
  CLAUDE.md                 # neue Monorepo-Übersicht, verlinkt auf apps/*/CLAUDE.md
  apps/
    web/                    # <- Inhalt von rizinos-web (adapter-static, unverändert deploybar)
    backend/                # <- Inhalt von rizinos (adapter-node, unverändert deploybar)
    discord-bot/            # NEU: Scaffold, discord.js + Bun, noch keine Commands
  packages/
    config/                 # geteilte eslint.config.js / prettier / tsconfig-base
    ui/                     # Modal, InlineEdit, LocationEditor, RestrictEditor (heute dupliziert)
    i18n/                   # i18n-plugin.ts (Vite-Plugin), von web + backend genutzt
    validation/             # formValidation.ts (Zod-Schemas: username/email/password/birthdate)
    types/                  # geteilte TS-Types (User, Session, etc.)
```

`packages/db` (Drizzle-Schema aus dem Backend) wird **nicht** in dieser ersten Iteration extrahiert - das Backend bleibt vorerst alleiniger DB-Owner, der Bot spricht (wie später jede weitere App) über die bestehende `/api/*` gegen `api.rizinos.com`, nicht direkt gegen Postgres. Grund: kleinerer erster Schnitt, DB-Zugriff aus mehreren Prozessen bringt eigene Locking-/Migration-Fragen mit, die eine eigene Entscheidung verdienen.

## Schritte

1. **Root anlegen**: `rizinos-platform/` mit `git init`, Root-`package.json` (workspaces, keine eigenen deps), `.gitignore` (node_modules, build, .svelte-kit pro App).
2. **Apps kopieren** (ohne `.git`, `node_modules`, `build`, `.svelte-kit`): `rizinos-web` → `apps/web`, `rizinos` → `apps/backend`. Deploy-Skripte (`scripts/deploy.ts`) bleiben pro App bestehen und funktional identisch (rsync-Zielpfade ändern sich nicht).
3. **`packages/config`**: `eslint.config.js`, `.prettierrc`, `tsconfig.base.json` aus einem der beiden Repos konsolidieren; beide Apps extenden davon statt eigener Kopien.
4. **`packages/ui`**: `Modal.svelte`, `InlineEdit.svelte`, `LocationEditor.svelte`, `LocationInput.svelte`, `RestrictEditor.svelte` verschieben, Re-Exports/Imports in `apps/web` und `apps/backend` auf `$ui-shared/...` (neuer Alias) umstellen.
5. **`packages/i18n`**: `i18n-plugin.ts` verschieben, Vite-Configs beider Apps importieren von dort statt lokaler Kopie. Message-JSONs (`messages/*.json`) bleiben **pro App**, da Inhalte unterschiedlich sind - nur das Compiler-Plugin ist geteilt.
6. **`packages/validation`**: `formValidation.ts` verschieben, beide Apps importieren daraus (Backend nutzt es serverseitig für Registrierung, Web clientseitig fürs Formular - identische Regeln müssen ohnehin synchron sein).
7. **`packages/types`**: gemeinsame Typen aus `src/lib/types.ts` (Web) zusammenführen mit äquivalenten Typen im Backend.
8. **`apps/discord-bot` scaffolden**: minimales `package.json` (discord.js, Bun-Target), `src/index.ts` mit Client-Login-Grundgerüst, `.env.template` (DISCORD_TOKEN, API_BASE), kurzes README das den Zweck festhält (Account-Linking über `dcUsers`, Minecraft-Chat-Bridge über `minechatHooks` - beides bereits im Backend-Schema vorhanden). Keine Slash-Commands, keine Event-Handler-Logik - nur damit der Workspace-Slot existiert und `bun install` in Root funktioniert.
9. **Root-`CLAUDE.md`** schreiben (Monorepo-Übersicht, Verweis auf `apps/*/CLAUDE.md`, die inhaltlich fast unverändert bleiben - nur Pfad-Referenzen zwischen den Apps anpassen von `../rizinos-web` auf `../web` etc.).
10. **Verifikation** (siehe unten), dann Commit. **Kein Push, kein Löschen der alten Repos** - das entscheidet der Nutzer separat, nachdem er das Ergebnis geprüft hat.

## Kritische Dateien

- `apps/web/vite.config.ts`, `apps/backend/vite.config.ts` - i18n-Plugin-Import umstellen
- `apps/web/src/lib/formValidation.ts`, `apps/backend/src/lib/formValidation.ts` (falls dort dupliziert) → `packages/validation`
- `apps/web/src/lib/components/{Modal,InlineEdit,LocationEditor,LocationInput,RestrictEditor}.svelte` + Backend-Pendants → `packages/ui`
- `apps/web/eslint.config.js`, `apps/backend/eslint.config.js` → extend `packages/config`
- Beide `tsconfig.json` → Pfad-Alias für neue Packages ergänzen (`$ui-shared`, `$validation`, etc.)

## Verifikation

- `bun install` im Root läuft ohne Fehler (ein gemeinsames Lockfile für beide Apps + Bot-Scaffold)
- `cd apps/web && bun run check && bun run build` - Build bleibt grün, Output weiterhin unter `apps/web/build`
- `cd apps/backend && bun run check && bun run build` - Build bleibt grün
- `cd apps/discord-bot && bun run src/index.ts` - Client versucht Login (schlägt ohne echten Token erwartungsgemäß fehl, aber Prozess startet ohne Syntax-/Importfehler)
- Stichprobe: eine Seite, die `Modal` oder `LocationEditor` nutzt, in `apps/web` per `bun run dev` öffnen und prüfen, dass die Komponente aus `packages/ui` sauber importiert wird

## Ideen für weitere Teilprojekte (Diskussion, nicht Teil dieser Umsetzung)

- **`packages/db`**: Drizzle-Schema + Client aus dem Backend extrahieren, sobald ein zweiter Prozess (z.B. der Discord-Bot) wirklich direkt auf Postgres zugreifen soll, statt über `/api/*` zu gehen.
- **`packages/sdk`**: öffentliches TypeScript-SDK für `api.rizinos.com` (Auth, Storage, Minecraft-Endpunkte) - nützlich, falls RizinOS irgendwann Drittanbieter-Apps/Plugins erlauben soll.
- **Minecraft-Plugin-Repo**: Das Backend hat bereits `/api/mc/*` für ein Minecraft-Plugin - falls dessen Java/Kotlin-Quellcode noch nicht versioniert ist, gehört das als eigenes `apps/minecraft-plugin` oder eigenes Repo in die Familie.
- **Status-Page**: In `notes/status-page.md` liegt bereits eine Planung für eine Status-Seite - passt gut als `apps/status` (eigene kleine SvelteKit-Static-App) oder externer Dienst, der die `/api/*`-Health-Endpunkte des Backends abfragt.
- **CLI (`rizinos-cli`)**: Admin-/Dev-Werkzeug für Nutzerverwaltung, Minecraft-Worlds, Deploys - nutzt `packages/sdk`, sobald vorhanden.
- **Mobile-Shell**: Capacitor- oder Tauri-Wrapper um die bestehende OS-Desktop-Shell (`app.rizinos.com`), falls eine native App gewünscht ist - würde ebenfalls von `packages/ui` und `packages/types` profitieren.
- **`packages/ui` als Storybook**: sobald die geteilte Komponentenbibliothek wächst, lohnt sich eine eigene Storybook-Instanz zur visuellen Dokumentation, bevor eine dritte App (Bot-Dashboard? Mobile?) sie mitbenutzt.

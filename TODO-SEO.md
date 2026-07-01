# SEO TODO

Items already done are NOT listed here. This is the remaining backlog.

---

## Kritisch / High Impact

- [x] **OG-Image erstellen** - `socialcard.jpeg` (1200x630px) fehlt im static-Verzeichnis; wird in og:image bereits referenziert aber nicht ausgeliefert
- [x] **Canonical-URL-Tags** - Im globalen `+layout.svelte` via `page.url.pathname` + `PUBLIC_ORIGIN`, deckt alle Seiten ab
- [x] **OG-Tags auf allen Seiten ergänzen** - `/about`, `/features`, `/pricing`, `/blog`, `/contact`, `/enterprise`, `/careers`, `/security`, `/status`, `/support` haben jetzt vollständige og:* und twitter:* Tags
- [x] **Zentrales SEO-System in rizinos-web** - `seo.ts` mit `PageSeo` + `makeSeo()`, globaler `+layout.ts` liefert Fallback-SEO, `+layout.svelte` rendert alle Tags zentral; jede Seite hat nur noch 5-Zeilen-`+page.ts`
- [x] **`<html lang>` dynamisch setzen** - `$effect` in `+layout.svelte` setzt `document.documentElement.lang` reaktiv via `getLocale()`; `og:locale` ebenfalls dynamisch ergänzt

---

## Internationale SEO

- [ ] **URL-basiertes i18n** - Cookie-basiertes Locale-Switching zu Pfad-Prefixen wechseln (`/en/`, `/de/`, `/cn/`, `/ru/`); Cookie-basiert ist für SEO blind, Suchmaschinen crawlen nur eine Version
- [ ] **hreflang-Tags** - `<link rel="alternate" hreflang="de" href="https://rizinos.com/de/">` etc. auf jeder Seite; braucht URL-basiertes i18n als Voraussetzung
- [ ] **`x-default` hreflang** - Fallback-Sprache definieren
- [ ] **og:locale dynamisch** - Aus aktiver Locale setzen statt hardcoded; og:locale:alternate für alle anderen Sprachen ergänzen
- [ ] **Sitemap mit Sprach-Alternates** - `xhtml:link`-Erweiterung in sitemap.xml sobald URL-basiertes i18n live ist
- [ ] **Baidu Webmaster Tools** - `baidu-site-verification` Meta-Tag ergänzen (für chinesischen Traffic)
- [ ] **Yandex Webmaster Tools** - `yandex-verification` Meta-Tag ergänzen (für russischen Traffic)

---

## Strukturierte Daten (JSON-LD)

- [x] **Organization** - JSON-LD im globalen `+layout.svelte` via `{@html}` eingebettet
- [x] **WebSite** - JSON-LD im globalen `+layout.svelte` gemeinsam mit Organization im `@graph`
- [ ] **SearchAction im WebSite-Schema** - `potentialAction` mit `SearchAction` ergänzen sobald eine interne Suche existiert (z.B. Docs- oder Blog-Suche); aktiviert die Sitelinks Searchbox in Google
- [x] **SoftwareApplication** - JSON-LD in Homepage `+page.ts` via `jsonLd`-Feld; WebApplication, kostenlos, Offers-Schema
- [x] **BreadcrumbList** - Im globalen `+layout.svelte` automatisch aus `page.url.pathname` abgeleitet; kein Code in den Seiten nötig
- [ ] **FAQPage** - FAQ-Sektionen auf Features- und Pricing-Seite mit strukturierten Daten auszeichnen
- [ ] **BlogPosting / Article** - Wenn Blog-Posts existieren: `datePublished`, `author`, `image` als JSON-LD
- [ ] **HowTo** - Für Onboarding/Dokumentationsseiten
- [ ] **JobPosting** - Wenn Careers-Seite mit echten Stellen gefüllt wird
- [ ] **Review / AggregateRating** - Wenn User-Bewertungen gesammelt werden

---

## Performance / Core Web Vitals

- [ ] **LCP-Element `fetchpriority="high"`** - Hero-Image oder größtes sichtbares Element mit `fetchpriority="high"` und `<link rel="preload">` versehen
- [ ] **Explizite `width`/`height` auf allen `<img>`** - Verhindert CLS (Cumulative Layout Shift)
- [ ] **WebP/AVIF für Bilder** - Alle Bilder im modernen Format ausliefern, `srcset` + `sizes` für responsive Images
- [x] **`<link rel="preconnect">`** - Für Google Tag Manager + `dns-prefetch` für Google Analytics in `app.html`
- [x] **Brotli-Kompression auf nginx aktivieren** - `recommendedBrotliSettings = true` in `/etc/nixos/hosts/pronix/default.nix`
- [x] **Immutable Cache-Header** - `Cache-Control: public, max-age=31536000, immutable` für `/_app/immutable/` in nginx
- [ ] **Schriften lokal hosten** - Falls Google Fonts genutzt werden: DSGVO + Performance; lokal ausliefern

---

## PWA & App-Store

- [x] **`manifest.webmanifest` für rizinos-web erstellen** - `static/manifest.webmanifest` mit Icons, Name, Theme-Color, Start-URL, Categories; in `app.html` verlinkt
- [ ] **Manifest `screenshots`-Array** - Für Play Store / App Store Listings (PWABuilder)
- [x] **Manifest `categories`-Array** - `["productivity", "utilities"]` bereits im `manifest.webmanifest`
- [ ] **Apple Splash Screens** - `apple-touch-startup-image` in verschiedenen iOS-Gerätegrößen
- [ ] **Weitere Apple-Icon-Größen** - 57, 72, 76, 114, 120, 144, 152, 180px Varianten in `app.html`
- [ ] **Microsoft `browserconfig.xml`** - `msapplication-TileColor`, `msapplication-config`
- [ ] **In Google Play Store listen** - Via TWA (Trusted Web Activity) wenn PWA vollständig
- [ ] **In Microsoft Store listen** - Via PWABuilder
- [ ] **`manifest.webmanifest` `start_url` prüfen** - Im rizinos-Backend zeigt `start_url` auf `/app` (authenticated); besser `/` oder nach Login-Status dynamisch
- [ ] **`manifest.webmanifest` `lang` dynamisch** - Aktuell hardcoded `"de"`

---

## Content SEO

- [ ] **Blog mit Inhalt füllen** - Changelog, Tutorials, OS-Vergleiche, Roadmap-Posts; Blog-Route existiert aber ist leer
- [ ] **Feature-Unterseiten anlegen** - `/features/filemanager`, `/features/terminal`, `/features/sync` etc. für Long-Tail-Keywords
- [ ] **Dokumentation (`/docs/`)** - Zieht Entwickler-Traffic; ist wichtig für Backlinkaufbau
- [ ] **Description-Texte verbessern** - `/features` ("Explore what RizinOS can do.") und `/pricing` ("RizinOS pricing plans.") sind zu kurz und generisch
- [ ] **FAQ-Sektionen hinzufügen** - Auf Features, Pricing und About-Seite; beantwortet Long-Tail-Suchanfragen
- [ ] **Heading-Hierarchie prüfen** - Jede Seite sollte genau ein `<h1>` haben, sinnvolle `<h2>`/`<h3>`-Struktur
- [ ] **Interne Verlinkung** - Features → Pricing → Signup; About → Features; systematisch aufbauen
- [ ] **Glossar-Seite** - "Was ist ein Web-OS?", "Browser-native Operating System" etc. für semantische Autorität
- [ ] **`/changelog`** - Update-History öffentlich sichtbar machen; gut für Long-Tail und Return-Visits

---

## RSS / Feeds

- [ ] **RSS 2.0 Feed** - `/feed.xml` für den Blog
- [ ] **`<link rel="alternate" type="application/rss+xml">`** - Im `<head>` der Blog-Seite ergänzen
- [ ] **JSON Feed** - `/feed.json` als modernes Alternativformat
- [ ] **Changelog-Feed** - Damit Nutzer und Bots neue Releases automatisch tracken können

---

## LLM / KI-Sichtbarkeit

- [ ] **`/.well-known/ai-plugin.json`** - ChatGPT-Plugin-Kompatibilität; OpenAPI-Manifest für die API
- [ ] **OpenAPI-Schema** - `/.well-known/openapi.yaml` für die API-Endpunkte; LLMs können die API direkt verstehen und empfehlen
- [ ] **Wikidata-Eintrag** - Organisation + Software-Entität anlegen; LLMs gewichten Wikidata stark
- [ ] **Crunchbase-Profil** - LLMs greifen oft auf Crunchbase für Produktinfos zurück
- [ ] **ProductHunt-Listing** - Wird oft in LLM-Trainingsdaten referenziert
- [ ] **GitHub-Organisation/Repo mit guter README** - LLMs indexieren GitHub stark; auch OSS-Teilprojekte erhöhen Sichtbarkeit
- [ ] **Vergleichstabellen mit Konkurrenten** - LLMs extrahieren diese für Empfehlungen; z.B. "RizinOS vs. CloudOS vs. hosted desktop"
- [ ] **`llms-full.txt`** - Ausführlichere Version von `llms.txt` mit technischen Details, API-Doku, Architektur

---

## Monitoring & Webmaster-Tools

- [ ] **Google Search Console** - `google-site-verification` Meta-Tag oder DNS-Eintrag; Sitemap einreichen
- [ ] **Bing Webmaster Tools** - `msvalidate.01` Meta-Tag
- [ ] **IndexNow-Integration** - Bei jedem Deploy neue/geänderte URLs per API an Bing/Yandex pushen statt auf Crawl warten; in `scripts/deploy.ts` einbauen
- [ ] **Core Web Vitals Dashboard** - In Google Search Console überwachen; Regressions frühzeitig erkennen
- [ ] **Pagespeed Insights in CI** - Performance-Regression als Deploy-Gate via Lighthouse CI

---

## Link Building & Autorität

- [ ] **Show HN / Hacker News** - Projektvorstellung wenn Feature-Set überzeugend genug
- [ ] **Reddit r/selfhosted, r/webdev** - Community-Posts
- [ ] **Dev.to / Hashnode** - Technische Blog-Posts mit Backlink
- [ ] **Schema.org `sameAs`** - Links zu allen Social-Profilen in Organization-Schema
- [ ] **HARO** (Help a Reporter Out) - Für Medien-Erwähnungen registrieren
- [ ] **Wikipedia** - Wenn Marke groß genug; LLMs und Google gewichten Wikipedia stark

---

## `.well-known/` Endpunkte

- [x] **`/.well-known/change-password`** - HTML-Meta-Redirect auf `/app` in `static/.well-known/change-password`
- [x] **`/.well-known/humans.txt`** - Developer-Info in `static/.well-known/humans.txt`; in `app.html` via `<link rel="author">` verlinkt
- [ ] **`/.well-known/webfinger`** - Falls Fediverse/ActivityPub-Integration geplant

---

## Sonstiges

- [ ] **SVG-Favicon** mit Dark-Mode Media-Query (`prefers-color-scheme`)
- [ ] **Breadcrumb-Navigation** im HTML sichtbar ergänzen (nicht nur JSON-LD)
- [ ] **`<link rel="prefetch">`** - Für wahrscheinlich nächste Seiten (Login → App-Shell)
- [ ] **E-E-A-T stärken** - Autoren-Bio auf Blog-Posts, Team-Seite, Press-Erwähnungen sichtbar machen; Google bewertet Trustworthiness zunehmend
- [ ] **`Speakable` Schema** - Für Voice-Search-Fragmentextraktion auf relevanten Seiten
- [ ] **`security.txt` jährlich aktualisieren** - `Expires`-Datum in `static/.well-known/security.txt` vor dem 2027-06-30 erneuern
- [x] **Sitemap dynamisch generieren** - `src/routes/sitemap.xml/+server.ts` statt statischer Datei, damit Blog-Posts und neue Seiten automatisch enthalten sind

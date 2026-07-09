# Human TODO - SEO

Dinge, die ich nicht ohne dich erledigen kann. Wenn du einen Punkt abgearbeitet hast, sag Bescheid - ich implementiere den Rest dann direkt.

---

## Externe Accounts / Verifikationscodes

Codes aus dem jeweiligen Account holen und mir geben - ich trage sie dann ein.

- [ ] **Baidu Webmaster Tools** - Verifikationscode (fur `baidu-site-verification` Meta-Tag)
- [ ] **Yandex Webmaster Tools** - Verifikationscode (fur `yandex-verification` Meta-Tag)
- [x] **Google Search Console** - Domain verifizieren (DNS-Eintrag oder HTML-Tag), Sitemap einreichen
- [ ] **Bing Webmaster Tools** - `msvalidate.01`-Code

---

## Externe Plattformen (selbst anlegen)

- [ ] **Wikidata** - Organisation + Software-Entitat anlegen
- [ ] **Crunchbase** - Firmenprofil anlegen
- [ ] **ProductHunt** - Launch anlegen/durchfuhren
- [ ] **GitHub** - Organisation + Repo anlegen (mit guter README)
- [ ] **Show HN / Reddit / Dev.to** - Posts verfassen und posten
- [ ] **HARO** - Registrieren unter helpareporter.com
- [ ] **Google Play Store** - Developer-Account eroffnen (fur TWA/PWA-Listing)
- [ ] **Microsoft Store** - Developer-Account eroffnen (fur PWA via PWABuilder)

---

## Fehlende Inhalte

Ich brauche den Text/die Entscheidungen, dann kann ich implementieren.

- [ ] **FAQ-Sektionen** - Welche Fragen + Antworten sollen auf Features- und Pricing-Seite stehen?
- [ ] **Blog-Posts** - Erste Inhalte (Changelog, Tutorial, Roadmap o.a.) - ich kann danach die ganze Blog-Infrastruktur + JSON-LD aufbauen
- [ ] **Feature-Unterseiten** - Welche Unterseiten (`/features/filemanager` etc.) mit welchem Inhalt?
- [ ] **Dokumentation `/docs/`** - Inhalt/Struktur liefern
- [ ] **/changelog** - Update-History als Liste (Datum + Was hat sich geandert)
- [ ] **Glossar** - Welche Begriffe sollen erklart werden? ("Was ist ein Web-OS?" etc.)
- [ ] **Konkurrenten-Vergleich** - Welche Konkurrenten, welche Vergleichsattribute? (fur Vergleichstabelle + LLM-Sichtbarkeit)
- [ ] **Social-Profile** - Welche Accounts existieren? (fur `schema.org sameAs` im Organization-Schema)

---

## Features, die noch nicht existieren

Erst relevant wenn das jeweilige Feature gebaut ist.

- [ ] **Interne Suche** - dann: SearchAction im WebSite-Schema
- [ ] **Blog-Posts vorhanden** - dann: BlogPosting/Article JSON-LD
- [ ] **Docs/Onboarding-Seiten** - dann: HowTo-Schema
- [ ] **Echte Job-Listings auf /careers** - dann: JobPosting JSON-LD
- [ ] **Nutzerbewertungen** - dann: Review/AggregateRating Schema
- [ ] **Fediverse/ActivityPub geplant** - dann: `/.well-known/webfinger`

---

## Design-Assets

Dateien liefern, ich binde sie ein.

- [ ] **SVG-Favicon** - Icon-Geometrie/Design als Referenz; ich erstelle dann ein SVG mit Dark-Mode Media-Query
- [ ] **Apple Splash Screens** - PNG-Dateien fur verschiedene iOS-Gerategröen (oder Designvorlage, damit ich sie generieren kann)
- [ ] **Apple-Icons in Zusatzgröen** - 57, 72, 76, 114, 120, 144, 152, 180 px (oder: ich referenziere einfach `icon-192.png` fur alle Größen als Quick-Fix)

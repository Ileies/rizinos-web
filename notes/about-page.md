# /about Seite - Inhaltsnotizen

Rohe Ideen und Materialien für die Überarbeitung der About-Seite.
Aktuelle Placeholder-Seite: `src/routes/about/+page.svelte`

---

## 1. Competitors / Marktüberblick

Alle bekannten Browser-OS / Web-Desktop Projekte, die RizinOS zeigen sollte (mit kurzem Kontext warum RizinOS anders ist):

| Projekt | Ansatz | Status | Abgrenzung RizinOS |
|---|---|---|---|
| **OS.js** | Web-Desktop-Framework, selbst hosten | Open Source, aktiv | Nur Shell/UI-Framework, kein echtes OS-Konzept |
| **Puter** | "Internet OS", Cloud-Dateisystem + Apps | Kommerziell, aktiv | Proprietär, App-Marktplatz-Fokus, kein WASM-Kernel |
| **CloudReady / ChromeOS Flex** | Chrome-basiertes Linux | Google, aktiv | Echter Download/Install nötig, kein reines Browser-OS |
| **deskOS** | Web-Desktop im Browser | Klein/inaktiv | Keine Architektur hinter der Oberfläche |
| **Webix / Webdesktop** | UI-Komponenten-Bibliothek als Desktop-Look | Niche | Nur Look, kein Konzept |
| **Windows 365 Cloud PC** | Windows per Stream im Browser | Microsoft, Enterprise | Kostenpflichtig, Remote-VM, kein nativer Browseransatz |
| **Shellngn / SSH Web-Terminals** | Browser-Terminal zu Remote-Server | Aktiv | Kein OS, nur Terminal-Proxy |
| **Whist (eingestellt)** | Browser-Streaming-App | Eingestellt 2022 | War VM-Streaming, kein Browser-Native |

**Kernbotschaft:** Keiner der Konkurrenten baut ein OS *in* dem Browser - sie streamen entweder VMs *durch* ihn oder bauen reine UI-Shells ohne echte OS-Architektur. RizinOS ist der einzige Versuch mit Rust/WASM-Kern + declarativem Config-System.

---

## 2. Geschichte des Projekts (seit 2019)

Grobe Timeline - muss noch mit genauen Daten/Details gefüllt werden:

### 2019 - Der erste Gedanke
- Frustriert über Betriebssysteme (Hardware-Kompatibilität, Neuinstallation etc.)
- Erste Idee: "Was wenn das alles im Browser laufen würde?"
- Erste Experimente noch ohne konkreten Namen, sehr proof-of-concept

### 2020-2021 - Frühes Scheitern und Neustart
- Erste Versionen mit reinem JavaScript / HTML Canvas
- Gemerkt dass der Ansatz nicht skaliert (Performance, Architektur)
- Projekt mehrfach auf Eis gelegt und neu begonnen
- Erste Berührung mit Rust als mögliche Lösung

### 2022 - WASM als Wendepunkt
- Entdeckung von WebAssembly als ernsthafter Plattform
- Entscheidung: Kern in Rust + WASM, Shell in SvelteKit
- Architekturprinzipien aus NixOS-Begeisterung übernommen (declarative config)
- Erster funktionierender Desktop-Prototyp

### 2023 - Infrastruktur & Backend
- Backend (rizinos) als separates Projekt aufgebaut
- Authentifizierung, Session-Management, App-System
- Erste "Early Access" Tests mit echten Nutzern
- Minecraft-Integration als erstes echtes "App"

### 2024-2025 - Stabilisierung
- Admin-Dashboard, Monitoring
- Neue Website (dieses Repo) als öffentliches Gesicht
- Google Analytics + Cookie Consent
- Bugfixes, Security-Arbeit

### 2026 - Jetzt
- Aktive Weiterentwicklung
- Ziel: öffentliche Early Access Phase

---

## 3. Meine Journey - Programmieren lernen durch RizinOS

Dieser Abschnitt soll persönlich und authentisch sein, kein PR-Text.

**Kernthema:** Das Projekt war nie nur ein Produkt - es war das Vehikel durch das ich Programmieren gelernt habe.

### Punkte die rein sollen:
- Alter beim Start (2019) - wie jung war ich? Welcher Hintergrund?
- Die Lernkurve die das Projekt erzwungen hat:
  - JavaScript als erstes "echtes" Werkzeug
  - Warum Rust? (Weil das Projekt es verlangt hat, nicht weil ichs wollte)
  - Datenbanken, Auth, DevOps - alles durch konkreten Bedarf gelernt
  - NixOS-Journey (wann, warum)
- Typische Momente des Scheiterns: etwas gebaut, wieder weggeworfen, neu angefangen
- Was das Projekt bedeutet: kein Startup-Pitch, kein "disrupt the industry" - es ist ein ehrliches Experiment von jemandem der Dinge bauen wollte
- Solo-Aspekt: keine Firma, kein Team, keine VC - bewusste Entscheidung

### Ton:
- Direkt, nicht selbstbeweihräuchernd
- Ehrlich über Grenzen und Rückschläge
- "Ich hab das gebaut weil ich es wollte, nicht weil ich musste"

### TODO - noch zu klären/ergänzen:
- [ ] Genaues Startjahr / Alter eintragen
- [ ] Konkrete Anekdoten aus der Frühphase sammeln
- [ ] Entscheidung für Rust genauer ausformulieren
- [ ] Competitors-Liste: gibt es weitere die ich vergessen habe?
- [ ] Screenshots / Archivmaterial aus alten Versionen?

---

## Design-Ideen für die Seite

- Timeline-Komponente für die Geschichte (horizontal oder vertikal scrollend)
- Competitor-Tabelle oder Karten mit klarer "RizinOS vs. X" Aussage
- Persönlicher Abschnitt ganz unten, ruhiger Ton, kein Marketing
- Kein Headerfoto von mir nötig - Text reicht

---

## Was die aktuelle Seite schon hat (nicht doppeln)

- "Why does this exist?" - OK, aber flach
- Technical vision (WASM, declarative config) - gut, behalten
- "Currently in development" Status-Badge - behalten
- "Who's building this?" - ersetzt durch die Journey-Sektion oben

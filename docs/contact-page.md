# TODO: Contact Page

Kontaktseite für rizinos-web. Nutzer wählen den Zweck ihrer Anfrage aus - die Mail geht dann an das zuständige Postfach.

## Kontaktformular-Kategorien

| Auswahlmöglichkeit            | Geht an                    | Warum                                           |
| ----------------------------- | -------------------------- | ----------------------------------------------- |
| Allgemeine Anfrage            | `info@rizinos.com`         | Auffangbecken für alles ohne klaren Zweck       |
| Support / Technisches Problem | `support@rizinos.com`      | Häufigster Fall, direkt ins Support-Team        |
| Vertrieb / Lizenzanfrage      | `sales@rizinos.com`        | Enterprise-Sales-Team, getrennt von Support     |
| Presseanfrage / Medien        | `press@rizinos.com`        | PR-Team, Journalisten brauchen schnelle Antwort |
| Partnerschaft / Integration   | `partnerships@rizinos.com` | Business Development                            |
| Datenschutz / DSGVO           | `datenschutz@rizinos.com`  | Gesetzlich vorgeschrieben erreichbar zu sein    |
| Sicherheitslücke melden       | `security@rizinos.com`     | Responsible Disclosure                          |
| Rechtliches                   | `legal@rizinos.com`        | Behörden, Anwälte, Abmahnungen                  |
| Rechnung / Zahlung            | `billing@rizinos.com`      | Rechnungsstreitigkeiten, Zahlungsprobleme       |

## UX-Hinweise

- `Datenschutz`, `Sicherheitslücke` und `Rechtliches` nicht gleichwertig mit den anderen im Dropdown anzeigen - selten genutzt, wirken erschlagend. Besser als Sekundärlinks unterhalb des Formulars ("Andere Anliegen").
- Standard-Auswahl: `Allgemeine Anfrage`
- Pflichtfelder: Name, E-Mail, Kategorie, Nachricht
- Nach Absenden: Bestätigungsmail über `support@` (Kategorie `transactional`)

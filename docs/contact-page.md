# Contact page

`/contact` (all four locales). A topic-aware contact form plus a channel hub. The backend half lives in `../rizinos` (see its `docs/contact.md`).

## What it does

- **Topic picker** (native radio inputs): general, account and login, bug report, feedback, security issue, press and partnerships, legal and privacy. Each topic routes to a mailbox and shows its own extra fields. "Ban appeal" is a link tile to `/unban-request` because bans need a ban ID.
- **Signed-in users**: name and email come from the account and are read-only (the server enforces this too, so a signed-in user cannot send as someone else).
- **Attachments**: up to 3 screenshots (png, jpg, webp, gif, 5 MB each) via file picker, drag and drop or clipboard paste.
- **Bug reports** can attach browser, OS, screen size and language (checked by default, visible to the user).
- **Abuse protection**: hidden honeypot field and a server-signed time-trap token (`/contact/challenge`). The client waits until the token is old enough, and transparently retries once or twice if the server restarted.
- **Drafts** survive an accidental reload via `sessionStorage` (never files, cleared on success).
- **Channel hub**: Discord with live counts (public invite endpoint), the four mailboxes with copy buttons, GitHub, X.
- **Live API chip**: calls `GET /os/version` (the backend checks its database on every request) and shows latency, or "unreachable" after 6 seconds.
- **Backdrop**: a faint CSS grid always, plus a slow wireframe (Three.js via Threlte) only on desktop widths without `prefers-reduced-motion` or data saver, loaded lazily so other pages never download Three.js.
- **Keyboard**: Ctrl+Enter or Cmd+Enter sends; errors move focus to the first invalid field; the success heading receives focus.

## Files

| File                                                             | Purpose                                                                                                                                            |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/routes/[[locale=locale]]/contact/+page.svelte` / `+page.ts` | Page layout, SEO and `ContactPage` JSON-LD                                                                                                         |
| `src/lib/contact.ts`                                             | Topics, fields, limits and client validation. **Mirrors** `rizinos/src/lib/server/contact/topics.ts` - change both together                        |
| `src/lib/contactApi.ts`                                          | Challenge handling and the multipart submit with error mapping                                                                                     |
| `src/lib/client/components/contact/`                             | `ContactForm`, `TopicPicker`, `AttachmentPicker`, `ContactSuccess`, `ChannelCards`, `StatusChip`, `CopyButton`, `ContactBackdrop`, `BackdropScene` |
| `src/lib/components/admin/ContactSection.svelte`                 | Admin inbox (Contact tab)                                                                                                                          |
| `messages/contact.json`                                          | All page strings (de, en, cn, ru). Admin UI is English only by design                                                                              |

## Adding a topic or field

1. Add it to `TOPICS` in `src/lib/contact.ts` and to `TOPIC_DETAILS` / `TOPIC_MAILBOX` / `TOPIC_LABEL` in the backend `topics.ts`.
2. Add `contact_topic_<id>`, `contact_topic_<id>_hint` and for fields `contact_f_<topic>_<field>` (plus `contact_o_<topic>_<field>_<option>` for selects, `contact_p_...` for placeholders) to `messages/contact.json`.
3. Add the auto-reply label in the backend `mailCopy.ts`.

## Admin inbox

Admin > Contact: tabs by status with counts, topic filter, search (reference, name, email, text), detail dialog with account link, extra fields, screenshots, reply by email (sent from `support@`), status changes (open, resolved, spam or abuse) and permanent delete. Messages are deleted automatically after 12 months.

## Known limits

- Replies the sender writes by email land in the `support@` mailbox, not in the dashboard. The reference in the subject lets you match them by hand.
- The privacy policy has to mention the contact form data and the 12 month retention.
- In `bun run dev`, `apiFetch` targets the absolute production `API_BASE`, so API calls only work against production unless you rewrite them.

# masareef-privacy

The published privacy policy and account-deletion page for **Masareef**, the spending
tracker (`com.mohamedgado.masareef`).

- **App on Google Play:** https://play.google.com/store/apps/details?id=com.mohamedgado.masareef
- **Privacy policy:** https://vette1123.github.io/masareef-privacy/
- **Account deletion:** https://vette1123.github.io/masareef-privacy/delete-account.html

Both URLs are referenced from the Google Play listing and from inside the app
(`Settings, Privacy policy`), so they must always resolve.

## What Masareef is

An Android spending tracker, global and multi-currency, that can read payment
notifications from your bank on the device and turn them into transactions, so there is
no daily typing. It has wallets, budgets, categories, recurring bills, planned one-off
items, travel mode, nearby ATMs, and a large set of insights (subscription radar,
duplicate and refund detection, price creep, cash flow, net worth, Wrapped) that are all
computed on the device.

It requires an account, and the records you keep are synced to our own backend. The
notification text auto-track reads, and everything derived from it before you confirm it,
never leaves the phone.

## What lives in this repo

| File | Purpose |
|---|---|
| `index.html` | The policy. Arabic and English, both in the DOM, one visible at a time |
| `delete-account.html` | Play's required account-deletion URL. Same design, both languages |
| `404.html` | Meta-refresh to the policy, so no old or mistyped link dead-ends |
| `robots.txt` | Allow all, points at the sitemap |
| `sitemap.xml` | The two real pages |

## Why a separate repo

The app repo is private. A privacy policy has to be publicly reachable, permanently, and
independently of app releases. Keeping it here means:

- it can be corrected in seconds without shipping an app build,
- GitHub Pages serves it for free with no server to maintain,
- the git history is the change log a policy is supposed to have.

## How the pages work

- **Self-contained.** No web fonts, no CDN, no scripts from other hosts, no cookies, no
  analytics. A privacy page should not be the thing that tracks you.
- **Bilingual, both in the DOM.** Arabic and English ship in the same document, so
  crawlers and reader modes see the full policy in both languages. The toggle only flips
  visibility plus `lang` and `dir`, and stores the choice in `localStorage`
  (`masareef-privacy-lang`), shared by both pages.
- **Language resolution order:** a `#en-*` or `#ar-*` section anchor wins, then the stored
  choice, then the browser language, then English.
- **Light and dark** via `prefers-color-scheme`, with the app's navy and teal tokens.
- **Print styles** so "save as PDF" produces a plain document with URLs spelled out.
- **JSON-LD** `PrivacyPolicy` block for search engines.

## What the policy covers

Sections 1 to 23: scope, the account, on-device data, what syncs, auto-track and
notification access, manual paste and share, location, ATMs and the map, profile photo,
notifications, exchange rates, analytics, exports and restore, updates and rating,
in-app privacy features, the Android permission table, security, retention and deletion,
rights, children, third parties, changes, contact.

### Outbound hosts disclosed (keep this in sync with the app)

| Host | Why |
|---|---|
| `masareef-server.vercel.app` | Our backend: auth, sync, avatar upload, ATM proxy |
| `eu.i.posthog.com` | Usage analytics and error tracking, EU region |
| `u.expo.dev` and EAS | Over-the-air updates, Insights, Observe |
| `tiles.openfreemap.org` | Vector map tiles for the ATM map |
| `overpass-api.de`, `overpass.kumi.systems`, `maps.mail.ru` | Keyless Overpass fallback when the backend is unreachable |
| `api.bigdatacloud.net` | Reverse geocoding coordinates into a country and city |
| `geocoding-api.open-meteo.com` | City search by typed name |
| `open.er-api.com` | Currency rates for travel mode |
| Google (Sign-In, Play, Maps links) | Optional sign-in, distribution and updates, directions |

Server side only, never contacted by the device: TomTom, Foursquare and Geoapify (ATM
data, queried with a coarse cell), Neon (database), Resend (account email), Vercel Blob
(avatar files).

### Permissions disclosed

The table in section 16 matches the merged release manifest: coarse and fine location,
notifications, notification-listener access, biometrics and fingerprint, detect screen
capture (API 34+), internet plus network and Wi-Fi state, vibrate, wake lock, foreground
service, receive boot completed, legacy read storage (max SDK 32), and the launcher badge
permissions. The policy also states what is deliberately absent: SMS, call logs,
contacts, camera, microphone, media library, installed-app list, background location, and
draw-over-other-apps.

## Maintaining it

There is no build step. Edit the HTML, commit, push. GitHub Pages serves `main`.

When the app changes, the policy changes in the same session as the feature, not later:

1. A new outbound host, SDK or third party goes into section 4, 8, 12 or 21 plus the
   table above.
2. A new permission goes into section 16, in both languages.
3. A new data class that syncs goes into the section 4 table; a new local-only store goes
   into section 3 and the section 4 note.
4. Bump the `Last updated` date and the covered app version in both language blocks, the
   `dateModified` in the JSON-LD, and `lastmod` in `sitemap.xml`.
5. Keep `store/privacy-policy.md` in the app repo aligned, since the Play Data Safety
   answers are written from it.

## Google Play

- Store listing: `https://play.google.com/store/apps/details?id=com.mohamedgado.masareef`
- Privacy policy URL: `https://vette1123.github.io/masareef-privacy/`
- Data deletion URL: `https://vette1123.github.io/masareef-privacy/delete-account.html`

Data Safety must declare, at minimum: financial info (in-app transactions and amounts)
collected and stored, personal info (name, email, optional photo) collected, app activity
and diagnostics collected for analytics and crash reporting, and approximate plus precise
location collected for app functionality without being stored on the server. Everything
travels over TLS, and account deletion is available on request.

## Contact

boogado@yahoo.com

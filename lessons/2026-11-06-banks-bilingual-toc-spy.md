# Bank pages in English, and the policy's Contents marks where you are

## What

The 30 bank pages and the bank index were Arabic only while the policy, terms and deletion
pages switched language. They now carry both copies behind the same switch. The switch itself
moved out of three inline copies into `partials/lang.css`, `lang-pick.js` and `lang.js`, which
the legal pages and masareef-app's `pnpm site:banks` both inline. The policy's sticky Contents
list now marks the section being read (`partials/toc.js`): a teal pill glides from row to row,
with a glowing bar on the reading-start edge and the row's number in teal.

## Mistakes

- The first active style drew its bar at the link's edge, right on top of the list's native
  `12.` marker. Numbers now live inside the row (`counter()` in `::before`), so pill, bar,
  number and text share one box and never collide.
- Pure scroll-spy marked the wrong row after a jump: a short section (20, Children's privacy)
  lets the next heading cross the reading line as soon as the jump lands. A clicked or
  deep-linked section now stays marked until the reader scrolls by hand.
- `build-pages --check` called every page stale on the Windows main checkout (CRLF from
  `core.autocrlf`) while a rebuild changed nothing git could see. It now compares LF, and a
  test runs the real `--check`; a probe edit to a partial still fails it.
- The English lede first read "in a Al Rajhi Bank wallet"; generated English copy needs reading
  on a real page, not just a passing test.

## What worked

- Hide rules keyed on `<html lang>` instead of a JS class: a bank page served in Arabic shows
  Arabic with scripts off, and the legal pages still show English.
- Crawlers keep the served language (`lang-pick.js`), so Googlebot's en-US doesn't hide the
  Arabic copy that earns the bank pages' impressions.

## Rules

- A two-language page takes the `lang.*` partials; never inline the picker again.
- The marked TOC row changes colour only: no weight change, so it never re-wraps.

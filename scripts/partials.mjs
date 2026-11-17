// One look for every page: the shared pieces in partials/ are inlined between markers,
//
//   <!--partial:theme.css--> ... <!--/partial:theme.css-->
//
// so a page stays one request (no stylesheet to fetch, which also keeps the pages working
// under every path mohamedgado.com proxies them at). `.css` lands in <style>, `.js` in
// <script>, anything else as is. Idempotent: running it twice changes nothing.
//
// Used by scripts/build-go.mjs, scripts/build-pages.mjs and masareef-app's `pnpm site:banks`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PARTIALS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'partials');
// What every page carries, install page and bank pages included: the look, the one header
// (both languages) and both switches, which share one stored language and one stored theme, so
// the site reads as one place. Pass it in `require` so a page that dropped a piece fails to build.
export const SITE = ['head.html', 'theme.css', 'header.html', 'header.js', 'lang-pick.js', 'lang.js', 'switch.js'];
const MARK = /<!--partial:([\w.-]+)-->[\s\S]*?<!--\/partial:\1-->/g;

export function partial(name, dir = PARTIALS) {
  const body = fs.readFileSync(path.join(dir, name), 'utf8').replace(/\r\n/g, '\n').trimEnd();
  if (name.endsWith('.css')) return `<style>\n${body}\n</style>`;
  if (name.endsWith('.js')) return `<script>\n${body}\n</script>`;
  return body;
}

// Fills every marker in `html`. Throws on a marker naming a missing partial, and when a
// page asked to carry the theme has none (a page that silently lost its look is the bug).
export function applyPartials(html, { dir = PARTIALS, require = [] } = {}) {
  const seen = new Set();
  const out = html.replace(MARK, (_, name) => {
    seen.add(name);
    return `<!--partial:${name}-->${partial(name, dir)}<!--/partial:${name}-->`;
  });
  const missing = require.filter((n) => !seen.has(n));
  if (missing.length) throw new Error(`page has no <!--partial:${missing[0]}--> marker (needs: ${missing.join(', ')})`);
  return markCurrent(out);
}

// The shared nav and footer mark the page they sit on, read from its canonical: "page" on
// the exact link, "true" on the top-nav section a page lives under (Banks, for a bank page).
// A plain noindex page (the 404) has a borrowed canonical and marks nothing. A "noindex, follow"
// page (a long-tail bank page, 17 Nov) is a real page with its own canonical and marks as usual.
export function markCurrent(html) {
  const canon = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canon || /name="robots" content="noindex(, nofollow)?"/.test(html)) return html;
  const mark = (a, href, section) => {
    if (href === canon) return `${a} aria-current="page"`;
    if (section && canon.startsWith(href + '/')) return `${a} aria-current="true"`;
    return a;
  };
  return html
    .replace(/<nav class="topnav"[\s\S]*?<\/nav>/g, (nav) => nav.replace(/<a href="([^"]+)"/g, (a, h) => mark(a, h, true)))
    .replace(/<footer class="sitefoot[\s\S]*?<\/footer>/g, (foot) => foot.replace(/<a href="([^"]+)"/g, (a, h) => mark(a, h, false)));
}

// Inline CSS ships minified: comments out, whitespace collapsed. Lighthouse flags it otherwise.
export const css = (c) => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}').trim();

// The markers a page carries, ready to paste into a template.
export const slot = (name) => `<!--partial:${name}--><!--/partial:${name}-->`;

// A phone shows a table as one card per row, each cell under its column's name. The name is the
// <th> above it, copied onto the cells at build time so a new table needs no extra markup.
export function labelCells(html) {
  return html.replace(/<table[\s\S]*?<\/table>/g, (table) => {
    const heads = [...table.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
    if (!heads.length) return table;
    return table.replace(/<tr>[\s\S]*?<\/tr>/g, (row) => {
      let i = 0;
      return row.replace(/<td((?:\s[^>]*)?)>/g, (td, attrs) => {
        const label = heads[i++];
        return /data-label/.test(attrs) || !label ? td : `<td${attrs} data-label="${label.replaceAll('"', '&quot;')}">`;
      });
    });
  });
}

// An English page (banks/en, features/en) links English bank and feature pages from its <body>,
// partials included: the same rewrite as masareef-app's enBody, so re-stamping a partial here
// leaves those pages exactly as `pnpm site:banks` wrote them. The <head> keeps its hreflang to
// the Arabic URL. `(?!/en[/"])` leaves an English link alone, so a second pass is a no-op.
const EN_LINK = /href="(https:\/\/www\.mohamedgado\.com\/projects\/masareef\/(?:banks|features))(?!\/en[/"])((?:\/[a-z0-9-]+)?)"(?: hreflang="ar")?/g;
export function enLinks(html) {
  const at = html.indexOf('<body');
  if (at < 0) throw new Error('enLinks: no <body>');
  return html.slice(0, at) + html.slice(at).replace(EN_LINK, 'href="$1/en$2"');
}

// Bank and feature pages are served twice: on www (proxied, canonical) and on github.io (old
// links, crawlers). With absolute www image URLs every crawl of a github.io copy was a billed
// Vercel CDN request: 47K of portfolio-v1's 75K in 12 hours on 17 Nov, against 749 page views on
// www, and the Hobby plan pauses at 1M a month. A relative URL loads from whichever host served
// the page. `file` is the page's path in this repo (banks/x.html, features/en/x.html). index.html
// keeps www: www serves it without the trailing slash (/projects/masareef/banks), so a relative
// path would resolve one level too high. Only src/srcset change; meta and JSON-LD stay absolute.
const WWW_IMG = 'https://www.mohamedgado.com/projects/masareef/go-img/';
export function localImages(html, file) {
  if (!/^(banks|features)\//.test(file) || file.endsWith('/index.html')) return html;
  const local = `${'../'.repeat(file.split('/').length - 1)}go-img/`;
  return html.replace(/\b(src|srcset)="([^"]*)"/g, (_, attr, v) => `${attr}="${v.replaceAll(WWW_IMG, local)}"`);
}

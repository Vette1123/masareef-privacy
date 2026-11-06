// node --test scripts/partials.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { markCurrent } from './partials.mjs';

const B = 'https://www.mohamedgado.com/projects/masareef';
const page = (canon, extra = '') => `<link rel="canonical" href="${canon}" />${extra}<nav class="topnav"><a href="${B}/go">Download</a><a href="${B}/banks">Banks</a></nav><footer class="sitefoot"><a href="${B}/banks">All</a><a href="${B}">Built</a><a href="${B}/banks/nbe">NBE</a></footer>`;

test('the top nav marks the page and the section a bank page lives under', () => {
  assert.match(markCurrent(page(`${B}/go`)), /href="[^"]+\/go" aria-current="page">Download/);
  const nbe = markCurrent(page(`${B}/banks/nbe`));
  assert.match(nbe, /<nav[^]*\/banks" aria-current="true">Banks/);
  assert.match(nbe, /\/banks\/nbe" aria-current="page">NBE/);
  // The footer's project link would prefix-match every page: the footer marks exact links only.
  assert.doesNotMatch(nbe, /masareef" aria-current/);
  assert.doesNotMatch(nbe, /<footer[^]*\/banks" aria-current/);
});

test('a noindex page with a borrowed canonical marks nothing', () => {
  assert.doesNotMatch(markCurrent(page(`${B}/banks`, '<meta name="robots" content="noindex" />')), /aria-current/);
});

// A section heading never touches the block under it (6 Nov: the bank facts panel sat on its
// heading at 0px, because each block brought its own margin and .panel brought none).
test('theme gives every block after a section heading its own air', async () => {
  const { readFileSync } = await import('node:fs');
  const theme = readFileSync(new URL('../partials/theme.css', import.meta.url), 'utf8');
  assert.match(theme, /\.sec > h2 \+ :not\(p\)\s*\{[^}]*margin-top:\s*28px/);
});

// 6 Nov: a panel's first heading kept `.sec h3 { margin-top: 32px }` on top of the panel's
// own padding, so the bank "how it works" cards opened on a band of empty space. And a
// <button> shows the arrow by default: every clickable thing gets the pointer from one rule.
test('theme: a panel opens on its content, and every action shows the pointer', async () => {
  const { readFileSync } = await import('node:fs');
  const theme = readFileSync(new URL('../partials/theme.css', import.meta.url), 'utf8');
  assert.match(theme, /\.panel > :first-child\s*\{[^}]*margin-top:\s*0/);
  const rule = theme.match(/([^{}]+)\{\s*cursor:\s*pointer;?\s*\}/)?.[1] ?? '';
  for (const sel of ['a[href]', 'button', 'summary', '[role="button"]', 'label[for]', 'select']) {
    assert.ok(rule.includes(sel), `pointer rule is missing ${sel}`);
  }
});

// 6 Nov: the current page's nav pill was a near-invisible shade of the bar. It now wears the
// brand colour, a ring and a dot, so "where am I" reads at a glance in both themes.
test('theme: the current nav item is clearly marked', async () => {
  const { readFileSync } = await import('node:fs');
  const theme = readFileSync(new URL('../partials/theme.css', import.meta.url), 'utf8');
  const on = theme.match(/\.topnav a\[aria-current\]\s*\{([^}]*)\}/)?.[1] ?? '';
  assert.match(on, /color:\s*var\(--teal\)/);
  assert.match(on, /inset 0 0 0 1px/);
  assert.match(theme, /\.topnav a\[aria-current\]::before\s*\{[^}]*border-radius:\s*50%/);
});

// 6 Nov: a data table was 560px wide inside a 348px phone frame, so its third column ("On
// deletion") sat off-screen behind a sideways scroll nobody sees. A phone gets each row as a
// labelled card; the labels come from the header cells at build time.
test('labelCells copies each header cell onto the cells under it', async () => {
  const { labelCells } = await import('./partials.mjs');
  const out = labelCells('<table><thead><tr><th scope="col">Data</th><th scope="col">Where</th></tr></thead><tbody><tr><td>A</td><td class="x">B</td></tr></tbody></table>');
  assert.match(out, /<td data-label="Data">A<\/td>/);
  assert.match(out, /<td class="x" data-label="Where">B<\/td>/);
  assert.equal(labelCells(out), out, 'idempotent');
});

test('doc: tables stack into labelled cards on a phone, and every built table carries its labels', async () => {
  const { readFileSync } = await import('node:fs');
  const doc = readFileSync(new URL('../partials/doc.css', import.meta.url), 'utf8');
  assert.match(doc, /@media \(max-width: 620px\)\s*\{[^@]*td::before\s*\{[^}]*attr\(data-label\)/);
  for (const f of ['index.html', 'delete-account.html']) {
    const html = readFileSync(new URL('../' + f, import.meta.url), 'utf8');
    const tds = [...html.matchAll(/<td(?![^>]*data-label)[^>]*>/g)];
    assert.equal(tds.length, 0, `${f}: ${tds.length} cells without data-label`);
  }
});

// 6 Nov: the Arabic bank names are read back out of the generated bank pages (already HTML
// escaped) and were escaped a second time, so the install page showed "e&amp; cash".
test('no built page shows a double-escaped entity', async () => {
  const { readFileSync, readdirSync } = await import('node:fs');
  const root = new URL('../', import.meta.url);
  const files = ['go.html', 'go-ar.html', 'index.html', 'terms.html', 'delete-account.html',
    ...readdirSync(new URL('banks/', root)).map((f) => 'banks/' + f)].filter((f) => f.endsWith('.html'));
  for (const f of files) assert.doesNotMatch(readFileSync(new URL(f, root), 'utf8'), /&amp;amp;|&amp;quot;|&amp;lt;/, f);
});

// 6 Nov: footer links, the top nav and the brand were 36-40px tall: under the 44px a thumb needs.
test('theme: on a phone every nav, footer and brand link is a 44px target', async () => {
  const { readFileSync } = await import('node:fs');
  const theme = readFileSync(new URL('../partials/theme.css', import.meta.url), 'utf8');
  const at = theme.indexOf('/* tap targets */');
  assert.ok(at > 0, 'tap-target block missing');
  const m = theme.slice(at, at + 700);
  for (const sel of [".sitefoot li a", ".topnav a", ".brand", ".switch button"]) assert.ok(m.includes(sel), `${sel} missing from the tap-target block`);
  assert.match(m, /min-height:\s*44px/);
});

// 6 Nov: at 390px the doc pages' brand ("Masareef مصاريف") pushed the language pills and theme
// button onto a second row. Under 420px the brand drops its second-script name to share one row.
test('lang: a 390px header keeps brand, language and theme on one row', async () => {
  const { readFileSync } = await import('node:fs');
  const theme = readFileSync(new URL('../partials/theme.css', import.meta.url), 'utf8');
  assert.match(theme, /@media \(max-width: 420px\)\s*\{[^@]*\.brand small\s*\{\s*display:\s*none/);
});

// 6 Nov: every page drew its own header. The install page had a lone "العربية" link and its own
// stored language (go-lang), the bank pages put Arabic first and named the brand in Arabic on the
// English page, and a language picked on one page never reached the next. One header now, inlined
// from partials/header.html, with the same switches on every page.
test('site: every page carries the one shared header and nothing else', async () => {
  const { readFileSync, readdirSync } = await import('node:fs');
  const root = new URL('../', import.meta.url);
  const pages = ['go.html', 'go-ar.html', 'index.html', 'terms.html', 'delete-account.html', '404.html',
    ...readdirSync(new URL('banks/', root)).filter((f) => f.endsWith('.html')).map((f) => 'banks/' + f)];
  for (const f of pages) {
    const html = readFileSync(new URL(f, root), 'utf8');
    for (const p of ['header.html', 'lang-pick.js', 'lang.js', 'switch.js']) assert.ok(html.includes(`<!--partial:${p}-->`), `${f}: no ${p}`);
    assert.equal(html.split('<header').length, 2, `${f}: a header besides the shared one`);
    assert.ok(!/go-lang'\s*,/.test(html.replace(/<!--partial:lang(-pick)?\.js-->[\s\S]*?<!--\/partial:lang(-pick)?\.js-->/g, '')), `${f}: writes its own language key`);
  }
});

// The head script: one stored language for the whole site; the install page (one URL per
// language, <html data-alt>) is swapped for its other URL instead of flipped in place.
function runPick({ served, alt, stored = {}, nav = 'en-US', hash = '' }) {
  return import('node:fs').then(async ({ readFileSync }) => {
    const vm = await import('node:vm');
    const attrs = { 'data-alt': alt ?? null };
    const root = { lang: served, dir: '', style: {}, classList: { add() {} }, getAttribute: (k) => attrs[k] ?? null };
    let replaced = null;
    const ctx = {
      document: { documentElement: root },
      location: { hash, search: '?s=ig', replace: (u) => (replaced = u) },
      navigator: { language: nav, userAgent: 'Mozilla/5.0' },
      localStorage: { getItem: (k) => stored[k] ?? null },
    };
    vm.runInNewContext(readFileSync(new URL('../partials/lang-pick.js', import.meta.url), 'utf8'), ctx);
    return { lang: root.lang, replaced };
  });
}

test('lang-pick: a language chosen on any page carries to the install page and back', async () => {
  assert.deepEqual(await runPick({ served: 'en', alt: 'go-ar', stored: { 'masareef-privacy-lang': 'ar' } }), { lang: 'en', replaced: 'go-ar?s=ig' });
  assert.deepEqual(await runPick({ served: 'ar', alt: 'go', stored: { 'masareef-privacy-lang': 'en' } }), { lang: 'ar', replaced: 'go?s=ig' });
  assert.equal((await runPick({ served: 'en', alt: 'go-ar', stored: { 'go-lang': 'ar' } })).replaced, 'go-ar?s=ig', 'the old install-page key still counts');
  assert.equal((await runPick({ served: 'en', stored: { 'go-lang': 'ar' } })).lang, 'ar', 'and reaches the two-language pages');
  assert.equal((await runPick({ served: 'en', alt: 'go-ar', nav: 'ar-EG' })).replaced, 'go-ar?s=ig', 'an Arabic browser goes to go-ar');
  assert.deepEqual(await runPick({ served: 'ar', alt: 'go', nav: 'en-US' }), { lang: 'ar', replaced: null }, 'the Arabic link stays Arabic');
  assert.deepEqual(await runPick({ served: 'en', stored: { 'masareef-privacy-lang': 'ar' } }), { lang: 'ar', replaced: null }, 'a two-language page flips in place');
  assert.equal((await runPick({ served: 'en', stored: { 'masareef-privacy-lang': 'ar' }, hash: '#en-4' })).lang, 'en', 'a section link wins');
});

// 6 Nov: on a phone the header wraps to two rows, and the hero glow and grid (which start 120-140px
// above the hero) began inside it as a hard band; the tabs' backdrop blur sat on top of it.
test('theme: hero layers fade in from their top edge, and nothing in the header is frosted', async () => {
  const { readFileSync } = await import('node:fs');
  const theme = readFileSync(new URL('../partials/theme.css', import.meta.url), 'utf8');
  assert.doesNotMatch(theme, /backdrop-filter/);
  assert.match(theme, /--rise:\s*linear-gradient\(transparent,/);
  assert.match(theme, /\.head::after, \.hero::after\s*\{[^}]*mask-image:[^;]*var\(--rise\)/);
  assert.match(theme, /\.head::before\s*\{[^}]*mask-image:\s*linear-gradient\(transparent,/);
  const go = readFileSync(new URL('../go.template.html', import.meta.url), 'utf8');
  assert.match(go, /\.hero::before\s*\{[^}]*mask-image:\s*var\(--rise\)/);
});

// 6 Nov: the language switch lived as three copies inside the legal pages; the bank pages
// (Arabic only until then) take the same partials. Hide rules key on <html lang>, so a page
// served in Arabic shows Arabic even with scripts off.
test('lang: one copy of the switch, keyed on <html lang>, in every two-language page', async () => {
  const { readFileSync, readdirSync } = await import('node:fs');
  const root = new URL('../', import.meta.url);
  const lang = readFileSync(new URL('partials/lang.css', root), 'utf8');
  assert.match(lang, /html\[lang="ar"\] #doc-en/);
  assert.doesNotMatch(lang, /\.lang-ar/);
  const pages = ['index.html', 'terms.html', 'delete-account.html',
    ...readdirSync(new URL('banks/', root)).map((f) => 'banks/' + f)].filter((f) => f.endsWith('.html'));
  for (const f of pages) {
    const html = readFileSync(new URL(f, root), 'utf8');
    for (const p of ['lang.css', 'lang-pick.js', 'lang.js']) assert.ok(html.includes(`<!--partial:${p}-->`), `${f}: no ${p}`);
    assert.equal(html.split('Resolve the language BEFORE first paint').length, 2, `${f}: picker inlined more than once`);
    assert.ok(html.includes('id="doc-en"') && html.includes('id="doc-ar"'), `${f}: not both languages`);
  }
});

// 6 Nov: the Contents sidebar never showed which section was being read.
test('toc: the marked row is the last heading past the reading line', async () => {
  const { readFileSync } = await import('node:fs');
  const vm = await import('node:vm');
  const ctx = { document: { querySelectorAll: () => [] }, matchMedia: () => ({ matches: true }) };
  vm.runInNewContext(readFileSync(new URL('../partials/toc.js', import.meta.url), 'utf8'), ctx);
  const pick = ctx.masareefTocPick;
  assert.equal(pick([], 200, false), -1);
  assert.equal(pick([400, 900], 200, false), -1, 'above the first section');
  assert.equal(pick([-500, 150, 900], 200, false), 1, 'the heading just past the line');
  assert.equal(pick([-900, -400, 50], 200, false), 2);
  assert.equal(pick([-900, 300, 500], 200, true), 2, 'the page bottom marks the last');
  const doc = readFileSync(new URL('../partials/doc.css', import.meta.url), 'utf8');
  assert.match(doc, /\.toc a\[aria-current\]\s*\{[^}]*color/);
  assert.match(doc, /\.toc-pill\s*\{[^}]*transition:\s*transform/, 'the pill glides between rows');
  const policy = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(policy.includes('<!--partial:toc.js-->'), 'the policy carries the scroll-spy');
});

// 6 Nov: on Windows (core.autocrlf) the checkout holds CRLF, so --check called every page
// stale while the rebuild changed nothing git could see. A gate that always fails gets skipped.
test('build-pages --check passes on a current checkout, whatever its line endings', async () => {
  const { spawnSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const r = spawnSync(process.execPath, [fileURLToPath(new URL('./build-pages.mjs', import.meta.url)), '--check'], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr || r.stdout);
});

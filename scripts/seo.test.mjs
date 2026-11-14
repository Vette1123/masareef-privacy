import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { audit } from './seo.mjs';

// One run over every built page: titles, descriptions, canonical, hreflang pairs, Open Graph,
// JSON-LD, image sizes, contact email. Any finding fails and is listed with its page.
test('seo: every indexable page passes the site-wide audit', () => {
  const { out, count } = audit();
  assert.ok(count > 2000, `only ${count} pages found`);
  const lines = Object.entries(out).map(([k, v]) => `${k} (${v.length}): ${v.slice(0, 3).join(' | ')}`);
  assert.deepEqual(lines, []);
});

// 14 Nov: a sibling app is linked at its own short domain root with a source tag, never the
// portfolio /go page and never github.io.
test('footers link Rafiq and Nafis at their own domains with ?s=masareef-site', () => {
  for (const l of ['en', 'ar']) {
    const f = readFileSync(new URL(`../partials/footer.${l}.html`, import.meta.url), 'utf8');
    for (const app of ['rafiq', 'nafis']) assert.ok(f.includes(`href="https://${app}.mohamedgado.com/?s=masareef-site"`), `${l} ${app}`);
    assert.doesNotMatch(f, /projects\/(rafiq|nafis)/);
  }
});

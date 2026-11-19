// node --test scripts/go-copy.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const copy = JSON.parse(readFileSync(new URL('../go.copy.json', import.meta.url), 'utf8'));

// The two install pages are alternates of each other (hreflang), so they ask
// the same questions in the same order.
test('go and go-ar carry the same FAQ, question for question', () => {
  assert.equal(copy.ar.faq.length, copy.en.faq.length, 'FAQ count differs between en and ar');
});

// Searchers type the how-to ("كيف أتتبع مصاريفي"), not the brand.
test('each FAQ answers how to track spending from bank alerts', () => {
  assert.ok(copy.en.faq.some(([q]) => /^How do I track/.test(q)), 'no how-to question in en');
  assert.ok(copy.ar.faq.some(([q]) => q.startsWith('كيف أتتبع')), 'no how-to question in ar');
});

// "مصاريف" ranks on /go-ar at ~9 with 0 clicks, and searchers type "تطبيق مصاريف". The title
// leads with that, and an adjective agrees with its noun: "متتبع مصروفات تلقائي", never
// "متتبع المصروفات تلقائي" (definite noun, indefinite adjective).
test('go-ar title leads with تطبيق مصاريف and its adjective agrees', () => {
  assert.ok(copy.ar.title.startsWith('تطبيق مصاريف'), copy.ar.title);
  for (const s of [copy.ar.title, copy.ar.kicker]) assert.ok(!s.includes('المصروفات تلقائي'), s);
  assert.ok(copy.ar.title.length <= 60, `${copy.ar.title.length} chars`);
});

// /go is English, so its bank chips open the English twins (banks/en/), with English names.
test('go links English bank pages, go-ar links Arabic ones', () => {
  const links = (f) => [...readFileSync(new URL(`../${f}`, import.meta.url), 'utf8').match(/<ul class="chips">.*?<\/ul>/s)[0].matchAll(/href="[^"]*\/projects\/masareef\/banks([^"]*)"/g)].map((m) => m[1]);
  const en = links('go.html');
  const ar = links('go-ar.html');
  assert.ok(en.length > 10 && en.every((h) => /^\/en(\/|$)/.test(h)), en.filter((h) => !/^\/en(\/|$)/.test(h)).slice(0, 3).join(' '));
  assert.ok(ar.length > 10 && ar.every((h) => !/^\/en(\/|$)/.test(h)));
  // Only the curated "most used" banks plus the "all banks" hub link, never every bank page.
  const max = Object.keys(copy.banks).length + 1;
  for (const [f, l] of [['go.html', en], ['go-ar.html', ar]]) assert.ok(l.length <= max, `${f}: ${l.length} bank links, max ${max}`);
  assert.ok(!/[؀-ۿ]/.test(readFileSync(new URL('../go.html', import.meta.url), 'utf8').match(/<ul class="chips">.*?<\/ul>/s)[0]), 'Arabic name in English chips');
});

// The invite-code card: both languages carry its copy, it is hidden by default, and the
// page's matcher takes only ref-<4-12 alphanumerics> (any case).
test('go pages carry the invite-code card and its matcher', () => {
  for (const l of ['en', 'ar']) for (const k of ['refH', 'refCopy', 'refDone', 'refP']) assert.ok(copy[l][k], `${l}.${k}`);
  const re = /[?&]s=ref-([a-z0-9]{4,12})(?:&|#|$)/i;
  for (const f of ['go.html', 'go-ar.html']) {
    const html = readFileSync(new URL('../' + f, import.meta.url), 'utf8');
    assert.ok(html.includes('id="refcode" hidden'), f + ': card must be hidden by default');
    assert.ok(html.includes(re.source), f + ': page matcher drifted from the tested one');
  }
  for (const f of ['go.html', 'go-ar.html']) {
    // The invited visitor came for the code: it is the hero's first block, above the headline
    // (on a 375x667 phone it used to start at 585px, below the fold), revealed by a script that
    // runs right after it so it is there at first paint instead of shoving the page down later.
    const html = readFileSync(new URL('../' + f, import.meta.url), 'utf8');
    const card = html.indexOf('id="refcode"');
    assert.ok(card > 0 && card < html.indexOf('<h1'), f + ': invite card must come before the h1');
    const after = html.slice(card, html.indexOf('<h1'));
    assert.ok(/<script>[\s\S]*refcode[\s\S]*<\/script>/.test(after), f + ': card must be revealed by a script placed before the h1');
    assert.match(html, /\.refcode code ?\{[^}]*white-space: ?nowrap/, f + ': a 12-character code must stay on one line');
    // The code and the install buttons are the invited visitor's whole job: the badges follow the
    // card (the card alone pushed them to 676px on a 667px-tall phone). Nobody else's hero changes.
    assert.ok(after.includes("classList.add('invited')"), f + ': the reveal must mark the hero copy as invited');
    assert.match(html, /\.invited \.badges ?\{[^}]*order: ?-1/, f + ': invited hero must lift the badges under the card');
    assert.match(html, /\.invited \.refcode ?\{[^}]*order: ?-2/, f + ': invited hero must keep the card first');
  }
  assert.equal(re.exec('?s=ref-dxwwgvkk')[1], 'dxwwgvkk');
  assert.equal(re.exec('?s=REF-AbC123&x=1')[1], 'AbC123');
  for (const bad of ['', '?s=ref-abc', '?s=ref-abcdefghijklm', '?s=ref-ab_cd', '?s=share', '?s=xref-abcd']) assert.equal(re.exec(bad), null, bad);
});

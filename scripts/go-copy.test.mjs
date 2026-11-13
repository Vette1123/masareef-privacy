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
  assert.ok(en.length > 10 && en.every((h) => h.startsWith('/en')), en.filter((h) => !h.startsWith('/en')).slice(0, 3).join(' '));
  assert.ok(ar.length > 10 && ar.every((h) => !h.startsWith('/en')));
  assert.ok(!/[؀-ۿ]/.test(readFileSync(new URL('../go.html', import.meta.url), 'utf8').match(/<ul class="chips">.*?<\/ul>/s)[0]), 'Arabic name in English chips');
});

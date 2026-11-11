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

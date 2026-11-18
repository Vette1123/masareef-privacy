// node --test scripts/indexnow-url.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pageUrl, probeUrl } from './indexnow-url.mjs';

// 17 Nov: 2,650 URLs in one JSON body passed as `curl -d "$body"` hit "Argument list too long"
// (exit 126), so every full-site push silently pinged nobody. The body must go through a file.
test('the workflow sends the IndexNow body from a file, never as a curl argument', () => {
  const yml = readFileSync(new URL('../.github/workflows/indexnow.yml', import.meta.url), 'utf8');
  assert.doesNotMatch(yml, /-d\s+"\$body"/);
  assert.match(yml, /--data-binary\s+@/);
});

const B = 'https://www.mohamedgado.com/projects/masareef';
test('each changed file maps to the URL the proxy serves it at', () => {
  assert.equal(pageUrl('index.html', B), `${B}/privacy`);
  assert.equal(pageUrl('go-ar.html', B), `${B}/go-ar`);
  assert.equal(pageUrl('banks/index.html', B), `${B}/banks`);
  assert.equal(pageUrl('banks/en/index.html', B), `${B}/banks/en`);
  assert.equal(pageUrl('features/index.html', B), `${B}/features`);
  assert.equal(pageUrl('banks/cib.html', B), `${B}/banks/cib`);
  assert.equal(pageUrl('banks/en/cib.html', B), `${B}/banks/en/cib`);
  assert.equal(pageUrl('features/en/debt-tracker.html', B), `${B}/features/en/debt-tracker`);
  assert.equal(pageUrl('delete-account.html', B), `${B}/delete-account`);
});

// 18 Nov: probing every bank page on www billed ~2,700 Vercel CDN requests per full-site run,
// against a Hobby cap of 1M a month. www maps banks/ and features/ 1:1 onto GitHub Pages
// (portfolio-v1 next.config.js), so those are probed at the origin; the rest still on www.
const O = 'https://vette1123.github.io/masareef-privacy';
test('bank and feature pages are probed on GitHub Pages, never on www', () => {
  assert.equal(probeUrl('banks/cib.html', B, O), `${O}/banks/cib`);
  assert.equal(probeUrl('banks/en/cib.html', B, O), `${O}/banks/en/cib`);
  assert.equal(probeUrl('banks/index.html', B, O), `${O}/banks/`);
  assert.equal(probeUrl('features/en/index.html', B, O), `${O}/features/en/`);
  assert.equal(probeUrl('features/debt-tracker.html', B, O), `${O}/features/debt-tracker`);
});

test('pages www maps by name are still probed on www', () => {
  assert.equal(probeUrl('index.html', B, O), `${B}/privacy`);
  assert.equal(probeUrl('go.html', B, O), `${B}/go`);
  assert.equal(probeUrl('delete-account.html', B, O), `${B}/delete-account`);
});

test('the workflow probes the third column and submits the second', () => {
  const yml = readFileSync(new URL('../.github/workflows/indexnow.yml', import.meta.url), 'utf8');
  assert.match(yml, /indexnow-url\.mjs "\$BASE" "\$ORIGIN"/);
  assert.match(yml, /-n 3/);
});

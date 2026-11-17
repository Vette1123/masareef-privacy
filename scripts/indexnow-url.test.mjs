// node --test scripts/indexnow-url.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pageUrl } from './indexnow-url.mjs';

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

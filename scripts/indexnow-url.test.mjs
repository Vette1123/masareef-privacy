// node --test scripts/indexnow-url.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { pageUrl } from './indexnow-url.mjs';

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

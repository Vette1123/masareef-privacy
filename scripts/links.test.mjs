import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLinks } from './links.mjs';

// Every internal link, image and #fragment across the built pages resolves to a file here.
test('links: no broken internal link, asset or fragment', () => {
  const { out, pages } = auditLinks();
  assert.ok(pages > 2000, `only ${pages} pages found`);
  const lines = Object.entries(out).map(([k, v]) => `${k} (${v.length}): ${v.slice(0, 3).join(' | ')}`);
  assert.deepEqual(lines, []);
});

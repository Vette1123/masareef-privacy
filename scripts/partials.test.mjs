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

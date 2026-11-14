// Site-wide SEO audit over every built page. Exported so seo.test.mjs can assert it; run it
// directly (`node scripts/seo.mjs`) to list every finding with counts.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repo = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = /^(google[0-9a-f]+\.html|go\.template\.html)$/;
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  if (['.git', 'node_modules', 'go-img', 'partials'].includes(e.name)) return [];
  return e.isDirectory() ? walk(p) : e.name.endsWith('.html') && !SKIP.test(e.name) ? [p] : [];
});
const attr = (tag, n) => new RegExp(`\\b${n}="([^"]*)"`).exec(tag)?.[1];
const tags = (html, re) => html.match(re) ?? [];
const decode = (s) => s.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');

export function audit() {
  const out = {};
  const bad = (k, f, m = '') => (out[k] ??= []).push(m ? `${f}: ${m}` : f);
  const pages = walk(repo).map((p) => ({ f: path.relative(repo, p).split(path.sep).join('/'), html: fs.readFileSync(p, 'utf8') }));
  const byCanon = new Map();
  const titles = new Map();
  const descs = new Map();
  const noindex = (h) => /<meta[^>]+name="robots"[^>]+noindex/i.test(h);
  for (const { f, html } of pages) {
    const ni = noindex(html);
    const canon = attr(tags(html, /<link[^>]+rel="canonical"[^>]*>/g)[0] ?? '', 'href');
    if (canon) byCanon.set(canon, { f, html });
    if (ni) continue;
    const t = decode(/<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '');
    if (!t) bad('no title', f);
    else {
      if ([...t].length > 60) bad('title over 60', f, `${[...t].length}`);
      (titles.get(t) ?? titles.set(t, []).get(t)).push(f);
    }
    const d = decode(attr(tags(html, /<meta[^>]+name="description"[^>]*>/g)[0] ?? '', 'content') ?? '');
    if (!d) bad('no description', f);
    else {
      if ([...d].length < 70 || [...d].length > 200) bad('description length', f, `${[...d].length}`);
      (descs.get(d) ?? descs.set(d, []).get(d)).push(f);
    }
    if (!canon) bad('no canonical', f);
    const lang = /<html[^>]*\blang="([^"]+)"/.exec(html)?.[1];
    const dir = /<html[^>]*\bdir="([^"]+)"/.exec(html)?.[1];
    if (!lang) bad('no html lang', f);
    else if (lang === 'ar' && dir !== 'rtl') bad('ar without rtl', f);
    for (const p of ['og:title', 'og:description', 'og:image', 'og:url', 'og:type']) if (!new RegExp(`property="${p}"`).test(html)) bad(`no ${p}`, f);
    if (!/name="twitter:card"/.test(html)) bad('no twitter:card', f);
    const img = attr(tags(html, /<meta[^>]+property="og:image"[^>]*>/g)[0] ?? '', 'content');
    if (img && !/^https:\/\//.test(img)) bad('og:image not absolute', f, img);
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try { JSON.parse(m[1]); } catch (e) { bad('invalid JSON-LD', f, e.message); }
    }
    if (!/application\/ld\+json/.test(html)) bad('no JSON-LD', f);
    for (const im of tags(html, /<img\b[^>]*>/g)) {
      if (attr(im, 'alt') === undefined) bad('img without alt', f, im.slice(0, 80));
      if (!attr(im, 'width') || !attr(im, 'height')) bad('img without width/height', f, im.slice(0, 80));
    }
    if (/boogado@yahoo/i.test(html)) bad('old contact email', f);
  }
  for (const [t, fs_] of titles) if (fs_.length > 1) bad('duplicate title', t, fs_.slice(0, 4).join(', ') + ` (${fs_.length})`);
  for (const [d, fs_] of descs) if (fs_.length > 1) bad('duplicate description', d.slice(0, 50), fs_.slice(0, 4).join(', ') + ` (${fs_.length})`);
  // hreflang: every alternate points at a page that points back, and carries x-default.
  for (const { f, html } of pages) {
    if (noindex(html)) continue;
    const canon = attr(tags(html, /<link[^>]+rel="canonical"[^>]*>/g)[0] ?? '', 'href');
    const alts = tags(html, /<link[^>]+rel="alternate"[^>]+hreflang[^>]*>/g).map((l) => [attr(l, 'hreflang'), attr(l, 'href')]);
    if (!alts.length) continue;
    if (!alts.some(([l]) => l === 'x-default')) bad('hreflang without x-default', f);
    if (!alts.some(([, h]) => h === canon)) bad('hreflang lacks self', f);
    for (const [l, h] of alts) {
      const other = byCanon.get(h);
      if (!other) { bad('hreflang target not a known page', f, `${l} ${h}`); continue; }
      const back = tags(other.html, /<link[^>]+rel="alternate"[^>]+hreflang[^>]*>/g).map((x) => attr(x, 'href'));
      if (!back.includes(canon)) bad('hreflang not reciprocal', f, `${l} ${h}`);
    }
  }
  return { out, count: pages.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { out, count } = audit();
  console.log(`${count} pages`);
  for (const [k, v] of Object.entries(out)) console.log(`\n${k}: ${v.length}\n  ` + v.slice(0, 4).join('\n  '));
  process.exit(Object.keys(out).length ? 1 : 0);
}

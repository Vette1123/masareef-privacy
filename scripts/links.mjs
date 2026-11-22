// Internal link and image audit over every built page. Links into this site (the canonical
// mohamedgado.com/projects/masareef prefix, the github.io mirror, or a relative path) must
// land on a file here; images must exist; #fragments must match an id on the target page.
// Run `node scripts/links.mjs` to list findings; links.test.mjs asserts none.
import fs from 'node:fs';
import path from 'node:path';
import { repo } from './seo.mjs';

const PREFIXES = ['https://www.mohamedgado.com/projects/masareef', 'https://vette1123.github.io/masareef-privacy'];
// Served by the portfolio, not this repo: the app's own landing page.
const PORTFOLIO = new Set(['', '/']);
// Rewrites the portfolio proxy applies: the policy lives at index.html here.
const ALIAS = { privacy: 'index.html' };
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  if (['.git', 'node_modules', 'partials'].includes(e.name)) return [];
  return e.isDirectory() ? walk(p) : [p];
});

export function auditLinks() {
  const files = new Set(walk(repo).map((p) => path.relative(repo, p).split(path.sep).join('/')));
  const ids = new Map();
  const idsOf = (f) => ids.get(f) ?? ids.set(f, new Set([...fs.readFileSync(path.join(repo, f), 'utf8').matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]))).get(f);
  const resolve = (rel) => ALIAS[rel] ?? [rel, `${rel}.html`, rel ? `${rel}/index.html` : 'index.html'].find((c) => c && files.has(c));
  const out = {};
  const bad = (k, f, m) => (out[k] ??= []).push(`${f}: ${m}`);
  let pages = 0;
  for (const f of files) {
    if (!f.endsWith('.html') || f === 'go.template.html') continue;
    pages++;
    const html = fs.readFileSync(path.join(repo, f), 'utf8').replace(/<script\b[\s\S]*?<\/script>/g, '');
    const dir = path.posix.dirname(f);
    for (const m of html.matchAll(/<(a|img|source|link)\b[^>]*?\s(href|src|srcset)="([^"]+)"/g)) {
      const [, tag, , raw] = m;
      // A store link with no source is an install nobody can credit: Play reports it as
      // "(not set)" (54 Android installs in 30 days, Nov 2026) and the App Store as no campaign.
      if (tag === 'a' && /play\.google\.com\/store\/apps\/details\?id=com\.mohamedgado\.masareef\b/.test(raw) && !/[?&](amp;)?referrer=/.test(raw)) bad('untagged store link', f, raw);
      if (tag === 'a' && /apps\.apple\.com\/app\/(\w+\/)?id6806735875/.test(raw) && !/[?&](amp;)?ct=/.test(raw)) bad('untagged store link', f, raw);
      if (tag === 'link' && !/\.(png|webp|avif|jpg|svg|ico|css)$/.test(raw.split('#')[0])) continue;
      for (const url of m[2] === 'srcset' ? raw.split(',').map((s) => s.trim().split(/\s+/)[0]) : [raw]) {
        let target;
        const pre = PREFIXES.find((p) => url === p || url.startsWith(`${p}/`) || url.startsWith(`${p}?`) || url.startsWith(`${p}#`));
        if (pre) target = url.slice(pre.length);
        else if (/^(https?:|mailto:|tel:|data:|javascript:|\/\/)/.test(url)) continue;
        else if (url.startsWith('#')) target = `/${f}${url}`.replace(/^\/(.*)#/, `/$1#`);
        else target = url.startsWith('/') ? url : `/${path.posix.normalize(`${dir}/${url}`)}`;
        const [pathPart, frag] = target.replace(/\?[^#]*/, '').split('#');
        const rel = path.posix.normalize(decodeURI(pathPart).replace(/^\//, '') || '.').replace(/\/$/, '').replace(/^\.$/, '');
        if (PORTFOLIO.has(rel) && pre) continue;
        const hit = url.startsWith('#') ? f : resolve(rel);
        if (!hit) { bad(tag === 'a' ? 'broken link' : 'missing asset', f, url); continue; }
        if (frag && hit.endsWith('.html') && !idsOf(hit).has(frag)) bad('missing fragment', f, url);
      }
    }
  }
  return { out, pages };
}

if (process.argv[1] === new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1') || process.argv[1]?.endsWith('links.mjs')) {
  const { out, pages } = auditLinks();
  console.log(`${pages} pages`);
  for (const [k, v] of Object.entries(out)) console.log(`${k} (${v.length}):\n  ${[...new Set(v)].slice(0, 12).join('\n  ')}`);
  process.exitCode = Object.keys(out).length ? 1 : 0;
}

// Which mohamedgado.com URL serves a changed file of this site, for the IndexNow workflow.
//   git diff --name-only A B -- '*.html' | node scripts/indexnow-url.mjs <base> <origin>
// prints "<file> <url> <probe>" per line: <url> is what IndexNow gets, <probe> is where the
// workflow checks it answers 200. The proxy maps a directory's index.html to the directory
// (banks/en/index.html → /banks/en): mapped as a file, the index pages 404'd and were never sent.
export function pageUrl(file, base) {
  const map = { 'index.html': 'privacy', 'go.html': 'go', 'go-ar.html': 'go-ar' };
  if (map[file]) return `${base}/${map[file]}`;
  if (file.endsWith('/index.html')) return `${base}/${file.slice(0, -'/index.html'.length)}`;
  return `${base}/${file.replace(/\.html$/, '')}`;
}

// Where the workflow checks a page answers 200. www rewrites banks/ and features/ by key onto
// GitHub Pages (portfolio-v1 next.config.js), so those are probed at that origin: probing ~2,700
// bank pages on www cost as many billed Vercel CDN requests per full-site run (18 Nov). Pages www
// maps by name (privacy, go) are still probed on www, where the mapping itself is what's checked.
export function probeUrl(file, base, origin) {
  if (!/^(banks|features)\//.test(file)) return pageUrl(file, base);
  // A directory's index is served with its trailing slash; without it GitHub Pages 301s.
  if (file.endsWith('/index.html')) return `${origin}/${file.slice(0, -'index.html'.length)}`;
  return `${origin}/${file.replace(/\.html$/, '')}`;
}

if (process.argv[1]?.endsWith('indexnow-url.mjs')) {
  const [base, origin] = process.argv.slice(2);
  if (!base || !origin) throw new Error('usage: node scripts/indexnow-url.mjs <base> <origin> < files');
  const files = (await new Promise((r) => { let s = ''; process.stdin.on('data', (d) => (s += d)).on('end', () => r(s)); })).split('\n').filter(Boolean);
  for (const f of files) console.log(`${f} ${pageUrl(f, base)} ${probeUrl(f, base, origin)}`);
}

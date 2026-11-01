// go.html (English) and go-ar.html (Arabic) are generated: edit go.template.html or
// go.copy.json, then run `node scripts/build-go.mjs` and commit all of it. Each language
// is its own URL so that hreflang and a search engine can tell them apart.
import fs from 'fs'
import path from 'path'
const repo = '.'
const c = JSON.parse(fs.readFileSync(path.join(repo, 'go.copy.json'), 'utf8'))
// Canonical on the domain Google crawls, which proxies these pages. The github.io URLs keep
// serving: printed QR codes open them, and they cannot be updated.
const base = `https://www.mohamedgado.com/projects/${c.slug}/`
const site = `https://vette1123.github.io/${c.slug}-privacy/`
const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
const tpl = fs.readFileSync(path.join(repo, 'go.template.html'), 'utf8')

// Arabic browsers land on the Arabic page, unless they chose English with the switch.
// A crawler's locale is English, so it reads both URLs as they are.
const ROUTE = `<script>
      (function () {
        var chose;
        try { chose = localStorage.getItem('go-lang'); } catch (e) {}
        if (chose !== 'en' && (navigator.language || '').toLowerCase().indexOf('ar') === 0) {
          location.replace('go-ar' + location.search);
        }
      })();
    </script>`

function ld(l) {
  const t = c[l]
  return JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'MobileApplication',
      name: t.ldName,
      alternateName: t.ldAlt,
      description: t.description,
      url: base + (l === 'ar' ? 'go-ar' : 'go'),
      inLanguage: l,
      applicationCategory: c.category,
      operatingSystem: 'Android, iOS',
      downloadUrl: [c.apple, c.play],
      installUrl: base + (l === 'ar' ? 'go-ar' : 'go'),
      sameAs: [c.apple, c.play],
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      author: { '@type': 'Person', name: 'Mohamed Gado', url: 'https://www.mohamedgado.com/' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: t.faq.map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ]).replaceAll('<', '\\u003c')
}

function page(l) {
  const t = c[l]
  const self = base + (l === 'ar' ? 'go-ar' : 'go')
  const head = [
    `<title>${esc(t.title)}</title>`,
    `<meta name="description" content="${esc(t.description)}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<link rel="canonical" href="${self}" />`,
    `<link rel="alternate" hreflang="en" href="${base}go" />`,
    `<link rel="alternate" hreflang="ar" href="${base}go-ar" />`,
    `<link rel="alternate" hreflang="x-default" href="${base}go" />`,
    `<meta property="og:title" content="${esc(t.title)}" />`,
    `<meta property="og:description" content="${esc(t.description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${self}" />`,
    `<meta property="og:site_name" content="${esc(t.ldName)}" />`,
    `<meta property="og:locale" content="${l === 'ar' ? 'ar_AR' : 'en_US'}" />`,
    `<meta property="og:locale:alternate" content="${l === 'ar' ? 'en_US' : 'ar_AR'}" />`,
    `<meta property="og:image" content="${site}${c.image}" />`,
    `<meta property="og:image:alt" content="${esc(t.ldName)}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${esc(t.title)}" />`,
    `<meta name="twitter:description" content="${esc(t.description)}" />`,
    `<meta name="twitter:image" content="${site}${c.image}" />`,
    `<meta name="apple-itunes-app" content="app-id=${c.appleId}" />`,
    `<link rel="preconnect" href="https://apps.apple.com" />`,
  ].join('\n    ')
  const features = t.features.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('\n          ')
  const faq = t.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n          ')
  const other = l === 'ar' ? ['en', 'go', 'English'] : ['ar', 'go-ar', 'العربية']
  const vals = {
    LANG: l,
    DIR: l === 'ar' ? 'rtl' : 'ltr',
    HEAD: head,
    JSONLD: ld(l),
    H1: esc(t.h1),
    SUB: esc(t.sub),
    SUBLANG: other[0],
    ROUTE: l === 'en' ? ROUTE : '',
    TAGLINE: esc(t.tagline),
    NAV_LABEL: esc(t.nav),
    OPEN: esc(t.open),
    APPLE_TOP: esc(t.appleTop),
    APPLE: esc(t.apple),
    PLAY_TOP: esc(t.playTop),
    PLAY: esc(t.play),
    SWITCH: `<a class="lang" lang="${other[0]}" hreflang="${other[0]}" href="${other[1]}" onclick="try{localStorage.setItem('go-lang','${other[0]}')}catch(e){}">${other[2]}</a>`,
    ABOUT_H: esc(t.aboutH),
    ABOUT: esc(t.about),
    FEATURES_H: esc(t.featuresH),
    FEATURES: features,
    FAQ_H: esc(t.faqH),
    FAQ: faq,
    FOOT: t.foot,
  }
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (!(k in vals)) throw Error('no value for ' + k)
    return vals[k]
  })
}

fs.writeFileSync(path.join(repo, 'go.html'), page('en'))
fs.writeFileSync(path.join(repo, 'go-ar.html'), page('ar'))
for (const f of ['go.html', 'go-ar.html']) {
  const h = fs.readFileSync(path.join(repo, f), 'utf8')
  if (/noindex/.test(h)) throw Error(f + ' still noindex')
  if (/\{\{/.test(h)) throw Error(f + ' has an unfilled slot')
  console.log(f, h.length, 'bytes, title', /<title>(.*)<\/title>/.exec(h)[1])
}

// Every place a reader can follow or message Masareef: the same channels Settings links in the
// app (masareef-app constants/links.ts, 2026-10-17). The footer icons and every page's JSON-LD
// `sameAs` are checked against this list (scripts/partials.test.mjs), so a new channel goes
// here first. Profile URLs, not the app's chat deep links: a web visitor wants the page, and
// search engines only tie an entity to a profile.
//
// `who`: 'app' is the Masareef brand account (MobileApplication sameAs), 'owner' is Mohamed
// Gado's own (Person sameAs), where the reels and launch threads went out.
export const SOCIAL = [
  { key: 'instagram', who: 'app', url: 'https://www.instagram.com/masareef.global/' },
  { key: 'facebook', who: 'app', url: 'https://www.facebook.com/masareef.eg' },
  { key: 'messenger', who: 'chat', url: 'https://m.me/masareef.eg' },
  { key: 'telegram', who: 'app', url: 'https://t.me/masareefapp' },
  { key: 'tiktok', who: 'owner', url: 'https://www.tiktok.com/@vetteop' },
  { key: 'x', who: 'owner', url: 'https://x.com/Sadge1996' },
  { key: 'linkedin', who: 'owner', url: 'https://www.linkedin.com/in/mgado' },
];

const STORES = ['https://apps.apple.com/app/id6806735875', 'https://play.google.com/store/apps/details?id=com.mohamedgado.masareef'];
export const APP_SAME_AS = [...STORES, ...SOCIAL.filter((s) => s.who === 'app').map((s) => s.url)];
export const PERSON_SAME_AS = SOCIAL.filter((s) => s.who === 'owner').map((s) => s.url);

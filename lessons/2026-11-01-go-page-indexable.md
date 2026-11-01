# The install page becomes indexable, in two languages

## What

go.html is generated from go.template.html and go.copy.json by scripts/build-go.mjs. /go is
English, /go-ar is Arabic, joined by hreflang, with store-listing copy, JSON-LD and sitemap
entries. Arabic browsers route to /go-ar unless they chose English with the switch.

## Mistakes

The page was noindex and mixed both languages on one URL, so no search engine could rank it
for either language.

## What worked

Keeping /go as the English URL: printed QR codes cannot be updated.

## Rules

Edit the template or the copy file, never go.html. Page copy comes from the store listing.

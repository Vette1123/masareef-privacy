# /go lists the most-used banks, not every bank

## What
`scripts/build-go.mjs` appended every bank page after the 16 curated ones, so /go and /go-ar
carried 1,315 chips (203 KB). Now only the banks `go.copy.json` names, plus "All supported banks".

## Mistakes
"Every bank page gets an inbound link" was solved in the wrong place: the install page took
the job the `banks/` hub already does. A crawl from `banks/index` reaches all 1,315 pages in
both languages, and the mohamedgado.com sitemap lists them, so the go links added no SEO.

## What worked
Checking hub reachability (BFS from `banks/index.html`) before cutting links, so the cut was
provably free.

## Rules
- Discovery links belong on hubs and in the sitemap. A landing page links its top items plus "all".
- `go-copy.test.mjs` caps go's bank chips at the copy's list + 1.

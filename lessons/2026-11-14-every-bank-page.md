# Every bank gets a page

## What

- `banks/` grew from ~200 curated pages to all 1,203 registry banks, plus 111 country hubs
  and `banks/search.json` (~2,650 files). The generator lives in the app repo
  (`pnpm site:banks`); see its lesson of the same date.
- `lastmod.yml` dated each page with one `git log -1` per file: ~2,650 process spawns per
  push. It now reads one `git log --name-only` pass, newest first, and a file takes the first
  date that names it. Checked against the old loop on all 401 pages then tracked: 0 differ.
- `indexnow.yml` checked each URL in turn (~15 min for 2,650) and sent one request. It now
  runs 16 checks at once through `xargs -P 16` and posts batches of 10,000, the IndexNow
  per-request cap, built with `jq` so no URL can break the JSON.

## Mistakes

- Both workflows were written for ~400 pages and nothing flagged them when the page count
  went up 6x. The per-file loops only showed when the count was read off the generator.

## Rules

- Any per-file loop in a workflow gets one pass or a parallel fan-out before the file count
  grows by an order of magnitude.
- A workflow that sends a list to an API respects that API's per-request cap in code.

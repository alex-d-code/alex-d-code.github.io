# alex.d.code — sources

The pages in the repository root are generated. Edit what is in `_src/`, then:

```
node _src/build.mjs
```

and commit the sources together with the regenerated pages. Node 18+, no
dependencies. GitHub Pages runs Jekyll over the repo; it copies the generated
pages as they are and does not publish `_src/`.

## Layout

| What | Where |
| --- | --- |
| Links, app list, work, reviews | `data.mjs` |
| Words, one file per language | `content/home.{en,ru,uk,ro}.mjs` |
| Notes (English, Markdown) | `notes/<slug>.md` → `notes/<slug>/` |
| Draft notes, never committed | `drafts/<slug>.md` |
| Page template, Markdown, SEO tags, JSON-LD, sitemap, robots.txt | `build.mjs` |
| Styles | `../assets/css/style.css` |
| Link previews (`og-*.png`), apple-touch-icon, favicon.png | `art.html` → `./render-images.sh` |

English is at the root and is the `x-default`; Russian is under `ru/`,
Ukrainian under `uk/`, Romanian under `ro/`. The bio has a Short/Long switch;
`/#long` (or `/ru/#long` …) opens the long one, handy for sending to a client.

## Notes

A note is a Markdown file with a header:

```
---
title: Where to start with a JetBrains plugin
date: 2026-10-28
description: One sentence for search results.
---
```

The build understands paragraphs, `##`/`###` headings, `- ` and `1. ` lists,
fenced code, `code`, **bold**, *italic* and links; nothing else.

Write a note in `drafts/`. That folder is in `.gitignore`, because the
repository is public and everything committed under `_src/` can be read on
GitHub. `node _src/build.mjs --drafts` builds the drafts too and lists them on
the home page, marked as drafts, with `noindex`; it is for reading them
locally. To publish a note, move it to `notes/` and run the plain build, which
leaves drafts out completely. Run the plain build before every commit. Notes are listed on every language version, marked as
English.

## Things to keep true

- **Facts live in `data.mjs`**, words in the content files under the same keys.
  The build stops if a language misses a key, so a new app or project needs a
  line in every content file.
- **Reviews are quoted verbatim** from Upwork and stay in English on every
  language version.
- **Photo:** a square image at `assets/img/photo.webp`.
- After changing the role or status line, update `art.html` and run
  `./render-images.sh`.

## Publishing

GitHub Pages serves the `main` branch from the repository root. Run the plain
build, commit the sources together with the regenerated pages, and push to
`main`; the site updates a minute later.

// Builds the whole site from _src/ into the repository root:
//
//   node _src/build.mjs
//
// No dependencies. GitHub Pages runs Jekyll over the repo, but the generated
// pages carry no front matter, so Jekyll copies them as they are, and it never
// publishes _src/ (folders starting with "_" are skipped).
//
// English lives at the root and is the x-default; Russian under ru/, Ukrainian
// under uk/, Romanian under ro/. The root page sends a first-time visitor whose
// browser asks for one of those languages to that version; a language picked in
// the switcher is remembered and wins over the browser.
//
// One page template (home() below) for all languages: facts come from
// data.mjs, words from content/home.<lang>.mjs. Notes are Markdown files in
// notes/ (English only), built to notes/<slug>/. Drafts wait in drafts/, which
// git ignores, and are built only for the local preview (--drafts).

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { APPS, EMAIL, HANDLE, REVIEWS, SERVICES, SITE, SOCIAL, WORK } from './data.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '..');

const BRAND = 'Alex D Code';
const LANGS = ['en', 'ru', 'uk', 'ro'];
const PREFIX = { en: '', ru: 'ru/', uk: 'uk/', ro: 'ro/' };
const LOCALE = { en: 'en-US', ru: 'ru-RU', uk: 'uk-UA', ro: 'ro-RO' };
const OG_LOCALE = { en: 'en_US', ru: 'ru_RU', uk: 'uk_UA', ro: 'ro_RO' };
const LANG_NAME = { en: 'English', ru: 'Русский', uk: 'Українська', ro: 'Română' };
const LANG_SHORT = { en: 'EN', ru: 'RU', uk: 'UK', ro: 'RO' };
const UI = {
  en: { langLabel: 'Language', draft: 'draft', notFound: 'Page not found', notFoundText: 'This page does not exist. Go to the home page.' },
  ru: { langLabel: 'Язык', draft: 'черновик', notFound: 'Страница не найдена', notFoundText: 'Такой страницы нет. Перейдите на главную.' },
  uk: { langLabel: 'Мова', draft: 'чернетка', notFound: 'Сторінку не знайдено', notFoundText: 'Такої сторінки немає. Перейдіть на головну.' },
  ro: { langLabel: 'Limbă', draft: 'ciornă', notFound: 'Pagina nu a fost găsită', notFoundText: 'Această pagină nu există. Mergeți la pagina principală.' },
};

// `node _src/build.mjs --drafts` is a local preview: notes from drafts/ are
// built and listed on the home page, marked as drafts. Build without it before
// publishing.
const SHOW_DRAFTS = process.argv.includes('--drafts');

// A square photo at assets/img/photo.webp shows next to the handle.
const PHOTO = existsSync(path.join(out, 'assets/img/photo.webp')) ? 'assets/img/photo.webp' : null;

export const esc = s => String(s)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const css = readFileSync(path.join(out, 'assets/css/style.css'));
const cssVersion = createHash('sha1').update(css).digest('hex').slice(0, 8);

// Output path → public URL ("ru/index.html" → ".../ru/").
const urlOf = p => SITE + p.replace(/(^|\/)index\.html$/, '$1');
const rootOf = p => '../'.repeat(p.split('/').length - 1);

const utc = date => new Date(`${date}T00:00:00Z`);
const monthYear = (date, lang) =>
  `${new Intl.DateTimeFormat(LOCALE[lang], { month: 'long', timeZone: 'UTC' }).format(utc(date))} ${utc(date).getUTCFullYear()}`;
const longDate = date => new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(utc(date));

// Runs in <head> of the root page only, before anything paints.
const LANG_REDIRECT = `<script>(function(){var L=['ru','uk','ro'],s;try{s=localStorage.getItem('adc-lang')}catch(e){}
if(s){if(L.indexOf(s)>=0)location.replace(s+'/');return}
var l=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||''];
for(var i=0;i<l.length;i++){var c=String(l[i]).toLowerCase().slice(0,2);
if(c==='en')return;if(L.indexOf(c)>=0){location.replace(c+'/');return}}})();</script>`;

const REMEMBER_LANG = `<script>document.querySelectorAll('[data-lang]').forEach(function(a){a.addEventListener('click',function(){try{localStorage.setItem('adc-lang',a.dataset.lang)}catch(e){}})});</script>`;

// The Short/Long switch over the bio. "#long" in the address opens the long one,
// so it can be sent as a link.
const TABS = `<script>(function(){var b=document.querySelectorAll('.tabs [role=tab]');if(!b.length)return;
function show(t,keep){b.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;
document.getElementById(x.getAttribute('aria-controls')).hidden=!on});
if(!keep)history.replaceState(null,'',t.id==='tab-long'?'#long':location.pathname+location.search)}
b.forEach(function(t){t.addEventListener('click',function(){show(t)})});
if(location.hash==='#long')show(document.getElementById('tab-long'),true)})();</script>`;

// ── Notes: a small Markdown subset ──────────────────────────────────────────
// Paragraphs, ## and ### headings, "- " and "1. " lists, fenced code,
// `code`, **bold**, *italic*, [links](https://…). Nothing else.
const inline = s => s.split(/(`[^`]+`)/).map((part, i) => i % 2
  ? `<code>${esc(part.slice(1, -1))}</code>`
  : esc(part)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>'),
).join('');

function markdown(src) {
  const html = [];
  let para = [];
  let list = null;
  const endPara = () => { if (para.length) html.push(`<p>${inline(para.join(' '))}</p>`); para = []; };
  const endList = () => { if (list) html.push(`<${list.tag}>\n${list.items.map(x => `  <li>${inline(x)}</li>`).join('\n')}\n</${list.tag}>`); list = null; };
  const lines = src.replaceAll('\r', '').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m;
    if ((m = line.match(/^```(\w*)\s*$/))) {
      endPara(); endList();
      const code = [];
      while (++i < lines.length && !/^```\s*$/.test(lines[i])) code.push(lines[i]);
      html.push(`<pre><code${m[1] ? ` class="language-${m[1]}"` : ''}>${esc(code.join('\n'))}</code></pre>`);
    } else if ((m = line.match(/^(#{2,3})\s+(.+)$/))) {
      endPara(); endList();
      html.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`);
    } else if ((m = line.match(/^(-|\d+\.)\s+(.+)$/))) {
      endPara();
      const tag = m[1] === '-' ? 'ul' : 'ol';
      if (list && list.tag !== tag) endList();
      list ??= { tag, items: [] };
      list.items.push(m[2]);
    } else if (!line.trim()) {
      endPara();
    } else if (list && !para.length && /^\s/.test(line)) {
      list.items[list.items.length - 1] += ` ${line.trim()}`;
    } else {
      endList();
      para.push(line.trim());
    }
  }
  endPara(); endList();
  return html.join('\n');
}

function readNotes(folder, draft) {
  const dir = path.join(here, folder);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith('.md')).map(f => {
    const src = readFileSync(path.join(dir, f), 'utf8');
    const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!m) throw new Error(`${folder}/${f}: no front matter`);
    const meta = Object.fromEntries(m[1].split('\n').filter(l => l.includes(':')).map(l => {
      const i = l.indexOf(':');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^(['"])(.*)\1$/, '$2')];
    }));
    for (const k of ['title', 'date', 'description']) if (!meta[k]) throw new Error(`${folder}/${f}: no ${k}`);
    return { slug: f.slice(0, -3), ...meta, draft, html: markdown(m[2]) };
  });
}

// ── Page frame ──────────────────────────────────────────────────────────────
function layout({ lang, file, title, description, top, body, alternates = {}, jsonld = [], redirect = false, noindex = false, absolute = false, ogType = 'profile', ogImage = `og-${lang}.png` }) {
  const root = absolute ? SITE : rootOf(file);
  const url = urlOf(file);
  const alts = Object.entries(alternates);
  const hreflang = alts.length > 1
    ? alts.map(([l, f]) => `<link rel="alternate" hreflang="${l}" href="${urlOf(f)}">`).join('\n') +
      (alternates.en ? `\n<link rel="alternate" hreflang="x-default" href="${urlOf(alternates.en)}">` : '')
    : '';
  const ld = jsonld.map(o => `<script type="application/ld+json">${JSON.stringify(o).replaceAll('</', '<\\/')}</script>`).join('\n');
  const ogAlt = LANGS.filter(l => l !== lang && alternates[l]).map(l => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}">`).join('\n');
  const langLinks = LANGS.map(l => `<a href="${root}${PREFIX[l]}" hreflang="${l}" lang="${l}" data-lang="${l}">${LANG_NAME[l]}</a>`).join(' · ');

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
${hreflang}
<meta name="theme-color" content="#fdfdfb" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#111213" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}assets/img/${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${OG_LOCALE[lang]}">
${ogAlt}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${root}favicon.svg" type="image/svg+xml">
<link rel="icon" href="${root}favicon.png" type="image/png" sizes="64x64">
<link rel="apple-touch-icon" href="${root}assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${root}assets/css/style.css?v=${cssVersion}">
${redirect ? LANG_REDIRECT : ''}
${ld}
</head>
<body>
<div class="page">

${top.trim()}

<main>
${body.trim()}
</main>

<footer class="foot">
  <span>&copy; 2026 ${BRAND}</span>
  <span>${langLinks}</span>
</footer>

</div>
${REMEMBER_LANG}
${TABS}
</body>
</html>
`;
}

const langNav = (lang, root) => `<nav class="top" aria-label="${UI[lang].langLabel}">${LANGS.map(l =>
  `<a href="${root}${PREFIX[l]}" hreflang="${l}" lang="${l}" data-lang="${l}" title="${LANG_NAME[l]}"${l === lang ? ' aria-current="page"' : ''}>${LANG_SHORT[l]}</a>`).join('')}</nav>`;

// ── Home page ───────────────────────────────────────────────────────────────
function home(lang, t, notes, root) {
  const mail = `<a href="mailto:${EMAIL}">${EMAIL}</a>`;
  const paras = list => list.map(p => `    <p>${p.replaceAll('{{email}}', mail)}</p>`).join('\n');
  const row = (name, href, desc, meta, lead = '', attrs = '') =>
    `    <li>${lead}<span class="row__main">${href ? `<a href="${href}"${attrs}>${name}</a>` : name}${desc ? ` <span class="row__desc">— ${desc}</span>` : ''}</span><span class="row__meta">${meta}</span></li>`;

  const me = `
<header class="me">
  ${PHOTO ? `<img src="${root}${PHOTO}" width="64" height="64" alt="">` : ''}
  <div>
    <h1>@${HANDLE}</h1>
    <p>${t.role}</p>
    <p class="status">${t.status} · <span class="nowrap">${t.zone}</span></p>
  </div>
</header>`;

  const bio = `
<section class="bio">
  <div class="bio__head">
    <h2>${t.bio.title}</h2>
    <div class="tabs" role="tablist">
      <button type="button" role="tab" id="tab-short" aria-controls="bio-short" aria-selected="true">${t.bio.short}</button>
      <button type="button" role="tab" id="tab-long" aria-controls="bio-long" aria-selected="false" tabindex="-1">${t.bio.long}</button>
    </div>
  </div>
  <div id="bio-short" role="tabpanel" aria-labelledby="tab-short">
${paras(t.short)}
  </div>
  <div id="bio-long" role="tabpanel" aria-labelledby="tab-long" hidden>
${paras(t.long)}
  </div>
</section>`;

  const services = `
<section id="services">
  <h2>${t.services.title}</h2>
  <ul class="cols">
${SERVICES.map(k => `    <li>${t.services.items[k]}</li>`).join('\n')}
  </ul>
</section>`;

  const work = `
<section id="work">
  <h2>${t.work.title}</h2>
  <ul class="rows">
${WORK.map(w => row(w.name, w.link, t.work.items[w.key], w.years, '', ' rel="noopener"')).join('\n')}
  </ul>
</section>`;

  const apps = `
<section id="apps">
  <h2>${t.apps.title}</h2>
  <ul class="rows">
${APPS.map(a => row(a.name, a.site, t.apps.items[a.key], a.soon ? t.apps.soon : a.platforms.join(' · '),
  `<img src="${root}assets/img/apps/${a.key}.webp" width="22" height="22" alt="">`)).join('\n')}
  </ul>
</section>`;

  const reviews = `
<section id="reviews">
  <h2>${t.reviews.title}</h2>
${REVIEWS.map(r => `  <figure class="quote">
    <blockquote lang="en">${esc(r.text)}</blockquote>
    <figcaption>${t.reviews.items[r.key]} · ${r.years} · ${t.reviews.source}</figcaption>
  </figure>`).join('\n')}
</section>`;

  const notesList = notes.length ? `
<section id="notes">
  <h2>${t.notes.title}${t.notes.lang ? ` <span class="h2__aside">${t.notes.lang}</span>` : ''}</h2>
  <ul class="rows">
${notes.map(n => row(esc(n.title), `${root}notes/${n.slug}/`, '', `${monthYear(n.date, lang)}${n.draft ? ` · ${UI[lang].draft}` : ''}`, '', ' lang="en"')).join('\n')}
  </ul>
</section>` : '';

  const contact = `
<section class="contact" id="contact">
  <h2>${t.contact.title}</h2>
  <p>${t.contact.text}</p>
  <p>${mail} · ${SOCIAL.map(s => `<a href="${s.url}" rel="me noopener">${s.name}</a>`).join(' · ')}</p>
  <p class="note">${t.contact.upwork}</p>
</section>`;

  return me + bio + services + work + apps + reviews + notesList + contact;
}

const person = t => ({
  '@type': 'Person', '@id': `${SITE}#person`,
  name: BRAND, givenName: t.name, alternateName: HANDLE,
  jobTitle: t.jobTitle, url: SITE, email: `mailto:${EMAIL}`,
  sameAs: SOCIAL.map(s => s.url),
  knowsLanguage: ['en', 'uk', 'ru'],
  knowsAbout: ['IDE plugins', 'JetBrains IntelliJ Platform', 'VS Code extensions', 'Flutter', 'Kotlin', 'Java', 'TypeScript', 'Spring Boot', 'Model Context Protocol', 'LLM integrations'],
  ...(PHOTO ? { image: SITE + PHOTO } : {}),
});

function jsonldFor(lang, t, file) {
  return [
    { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE}#website`, url: SITE, name: BRAND, inLanguage: LANGS },
    {
      '@context': 'https://schema.org', '@type': 'ProfilePage', url: urlOf(file), name: t.title, description: t.description,
      inLanguage: lang, dateModified: t.lastmod, isPartOf: { '@id': `${SITE}#website` }, mainEntity: person(t),
    },
    {
      '@context': 'https://schema.org', '@type': 'ItemList', name: t.apps.title,
      itemListElement: APPS.filter(a => !a.soon).map((a, i) => ({
        '@type': 'ListItem', position: i + 1,
        item: {
          '@type': 'MobileApplication', name: a.name, url: a.site, description: t.apps.items[a.key],
          operatingSystem: a.platforms.join(', '), image: `${SITE}assets/img/apps/${a.key}.webp`,
          ...(a.appStore ? { installUrl: a.appStore } : {}),
          author: { '@id': `${SITE}#person` },
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
      })),
    },
  ];
}

// ── Note page ───────────────────────────────────────────────────────────────
function notePage(n) {
  return `
<article class="article">
  ${n.draft ? '<p class="draft">Draft, local preview only. Move it from <code>_src/drafts/</code> to <code>_src/notes/</code> to publish it.</p>' : ''}
  <h1>${esc(n.title)}</h1>
  <p class="article__date"><time datetime="${n.date}">${longDate(n.date)}</time></p>
${n.html}
</article>
<p class="article__end">Need something like this built? Write to me at <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>`;
}

// ── Emit ────────────────────────────────────────────────────────────────────
const pages = [];
const sitemap = [];

function emit(file, html) {
  const dest = path.join(out, file);
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, html);
  pages.push(file);
}

function warnLengths(file, title, description) {
  if (title.length > 65) console.warn(`  ! ${file}: title ${title.length} chars`);
  if (description.length > 165) console.warn(`  ! ${file}: description ${description.length} chars`);
}

const load = async p => (await import(pathToFileURL(path.join(here, p)).href)).default;
const notes = [...readNotes('notes', false), ...(SHOW_DRAFTS ? readNotes('drafts', true) : [])]
  .sort((a, b) => b.date.localeCompare(a.date));
const english = await load('content/home.en.mjs');

{
  const alternates = Object.fromEntries(LANGS.map(l => [l, `${PREFIX[l]}index.html`]));
  for (const lang of LANGS) {
    const file = alternates[lang];
    const t = await load(`content/home.${lang}.mjs`);
    for (const [what, keys, have] of [
      ['services', SERVICES, t.services.items],
      ['work', WORK.map(w => w.key), t.work.items],
      ['apps', APPS.map(a => a.key), t.apps.items],
      ['reviews', REVIEWS.map(r => r.key), t.reviews.items],
    ]) for (const k of keys) if (!have[k]) throw new Error(`home.${lang}.mjs: no ${what}.items["${k}"]`);
    warnLengths(file, t.title, t.description);
    const root = rootOf(file);
    emit(file, layout({
      lang, file, title: t.title, description: t.description, top: langNav(lang, root),
      body: home(lang, t, notes, root), alternates, jsonld: jsonldFor(lang, t, file), redirect: file === 'index.html',
    }));
    sitemap.push({ file, alternates, lastmod: t.lastmod });
  }
}

// Notes are rebuilt from scratch, so a deleted or renamed note leaves nothing behind.
rmSync(path.join(out, 'notes'), { recursive: true, force: true });
for (const n of notes) {
  const file = `notes/${n.slug}/index.html`;
  const root = rootOf(file);
  warnLengths(file, n.title, n.description);
  emit(file, layout({
    lang: 'en', file, title: `${n.title} — ${BRAND}`, description: n.description, noindex: n.draft,
    top: `<nav class="top top--back"><a href="${root}">← @${HANDLE}</a></nav>`,
    body: notePage(n), ogType: 'article', ogImage: 'og-en.png',
    jsonld: [{
      '@context': 'https://schema.org', '@type': 'BlogPosting', headline: n.title, description: n.description,
      datePublished: n.date, inLanguage: 'en', url: urlOf(file), author: person(english),
    }],
  }));
  if (!n.draft) sitemap.push({ file, lastmod: n.date });
}

// 404 is served at any depth, so every link in it is absolute.
{
  const body = `
<section class="notfound">
  <h1>${LANGS.map(l => `<span lang="${l}">${UI[l].notFound}</span>`).join('<br>')}</h1>
  <p>${UI.en.notFoundText}</p>
  <p>${LANGS.map(l => `<a href="${SITE}${PREFIX[l]}" lang="${l}">${LANG_NAME[l]}</a>`).join(' · ')}</p>
</section>`;
  emit('404.html', layout({
    lang: 'en', file: '404.html', title: `${UI.en.notFound} — ${BRAND}`, description: UI.en.notFoundText,
    top: `<nav class="top top--back"><a href="${SITE}">← @${HANDLE}</a></nav>`, body, noindex: true, absolute: true,
  }));
}

{
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemap.map(s => `  <url>
    <loc>${urlOf(s.file)}</loc>
    <lastmod>${s.lastmod}</lastmod>
${s.alternates ? Object.entries(s.alternates).map(([l, f]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${urlOf(f)}"/>`).join('\n') + `
    <xhtml:link rel="alternate" hreflang="x-default" href="${urlOf(s.alternates.en)}"/>
` : ''}  </url>`).join('\n')}
</urlset>
`;
  writeFileSync(path.join(out, 'sitemap.xml'), xml);
  writeFileSync(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);
}

const drafts = notes.filter(n => n.draft).length;
console.log(`${pages.length} pages + sitemap.xml (${sitemap.length} URLs) + robots.txt${drafts ? ` — PREVIEW with ${drafts} draft note(s): build without --drafts before publishing` : ''}${PHOTO ? '' : ' — no photo yet'}`);

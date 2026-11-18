/* ==============================================
   FRONTIER TRAILS — build-pages.mjs
   Writes every content page as plain static HTML (no build step on
   Vercel — the output is committed). Copy lives in site-content.mjs.

     node tools/build-pages.mjs

   The homepage (index.html) is hand-written and not touched here.
   ============================================== */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SITE, LANDSCAPES, FRONTIER, FRONTIER_MAP, ABOUT, FAQ, JOURNAL_INTRO, STORIES,
  COMMUNITY, DREAM, NOT_FOUND,
} from './site-content.mjs';
import { FIELD_NOTES } from './field-notes.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* Journal images, true to the Instagram posts: a panorama that was cut
   into slides is one wide image here; separate photos stay separate. */
const JOURNAL_IMAGES = JSON.parse(readFileSync(join(ROOT, 'tools', 'journal-images.json'), 'utf8'));
const storyImages = s => JOURNAL_IMAGES[s.slug].map((img, k) => ({ ...img, alt: k === 0 ? s.alt : (s.alts || [])[k - 1] || s.alt }));
const isWide = s => { const imgs = JOURNAL_IMAGES[s.slug]; return imgs.length > 1 || imgs[0].w / imgs[0].h > 1.2; };
const imgTag = (img, lazy) => `<img src="${img.src}" alt="${esc(img.alt)}" width="${img.w}" height="${img.h}"${lazy ? ' loading="lazy"' : ''}>`;

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MENU = [
  ['/', 'Home'],
  ['/the-frontier/', 'The Frontier'],
  ['/journal/', 'Journal'],
  ['/community/', 'Community'],
  ['/about/', 'About'],
  ['/faq/', 'FAQ'],
];

/* ─────────────────────────────────────────────
   SHARED CHROME
───────────────────────────────────────────── */
function head({ title, description, path, jsonld = [], css = [], image = '/og-image.jpg', noindex = false }) {
  const url = SITE.origin + path;
  const ld = jsonld.length
    ? `\n  <script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@graph': jsonld }, null, 2)}\n  </script>`
    : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">

  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow'}">
  <meta name="theme-color" content="#000000">${noindex ? '' : `\n  <link rel="canonical" href="${url}">`}

  <meta property="og:type"        content="website">
  <meta property="og:site_name"   content="Frontier Trails">
  <meta property="og:title"       content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url"         content="${url}">
  <meta property="og:image"       content="${SITE.origin}${image}">
  <meta property="og:locale"      content="en_GB">
  <meta name="twitter:card"       content="summary_large_image">${ld}

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Literata:ital,wght@0,400;0,600;1,400&family=Syne:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css" />
  <link rel="stylesheet" href="/css/pages.css" />${css.map(c => `\n  <link rel="stylesheet" href="${c}" />`).join('')}

  <script defer src="/_vercel/insights/script.js"></script>
</head>`;
}

// The menu button: three thin lines that fold into an X when the touch
// menu opens (css/style.css). The compass that was here is saved in HQ/Ideas.
const MENU_ICON = '<span class="menu-lines" aria-hidden="true"><span></span><span></span><span></span></span>';

function chrome(path) {
  const links = MENU.map(([href, label], i) => {
    // Every path starts with "/", so Home only counts as current on itself.
    const cur = href === '/' ? path === '/' : path.startsWith(href);
    return `      <a href="${href}" class="mobile-nav-link"${cur ? ' aria-current="page"' : ''}><span class="nav-num">0${i + 1}</span><span class="nav-name">${label}</span></a>`;
  }).join('\n');
  return `<body>
  <div class="grain" aria-hidden="true"></div>
  <a class="skip-link" href="#main">Skip to content</a>

  <header class="site-header" id="site-header">
    <a href="/" class="nav-logo">FRONTIER TRAILS</a>
  </header>

  <!-- Menu: a three-line button, top right. Hover (desktop) or tap opens it. -->
  <button class="menu-btn" id="hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav">
      ${MENU_ICON}
  </button>
  <nav class="mobile-nav" id="mobile-nav" aria-hidden="true" aria-label="Site navigation">
    <a href="/" class="mobile-nav-home">FRONTIER TRAILS</a>
    <div class="mobile-nav-links">
${links}
    </div>
    <p class="mobile-nav-foot">Barcelona · Catalonia · Spain</p>
  </nav>
`;
}

function footer() {
  const lands = LANDSCAPES.map(l => `        <a href="/the-frontier/${l.slug}/" class="footer-link">${l.place}</a>`).join('\n');
  return `
  <footer class="site-footer" id="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <span class="footer-logo">FRONTIER TRAILS</span>
        <p class="footer-blurb">4x4 camper rental in Barcelona, Spain. A fully equipped retro 4x4 with a rooftop tent and a route into Spain’s backcountry. Soft-road adventures. You just drive.</p>
        <p class="footer-loc">Barcelona · Catalonia · Spain</p>
      </div>
      <nav class="footer-nav" aria-label="The six landscapes">
        <span class="footer-nav-title">The Frontier</span>
${lands}
      </nav>
      <nav class="footer-nav" aria-label="Footer">
        <span class="footer-nav-title">Explore</span>
        <a href="/journal/" class="footer-link">Journal</a>
        <a href="/community/" class="footer-link">Community</a>
        <a href="/about/" class="footer-link">About</a>
        <a href="/faq/" class="footer-link">FAQ</a>
        <a href="/dream-trip/" class="footer-link">Dream trip</a>
        <a href="mailto:${SITE.email}" class="footer-link">${SITE.email}</a>
      </nav>
    </div>
    <div class="footer-base">
      <span class="footer-copy">© 2026 Frontier Trails · First adventures on their way</span>
      <a href="${SITE.instagram}" class="footer-social" target="_blank" rel="noopener">Instagram</a>
    </div>
  </footer>
`;
}

function scripts(extra = []) {
  return `
  <script src="/js/nav.js"></script>
  <script src="/js/forms.js"></script>${extra.map(s => `\n  ${s}`).join('')}
</body>
</html>
`;
}

/* A Formspree form, wired up by js/forms.js. `fields` is the inner markup. */
function form({ id, subject, fields, button, success, successSub }) {
  return `<form class="ft-form" id="${id}" action="${SITE.formspree}" method="POST" data-ajax>
${fields}
          <input type="hidden" name="_subject" value="${esc(subject)}" />
          <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true" />
          <button type="submit" class="waitlist-submit">${button}</button>
        </form>
        <div class="waitlist-success" role="status" aria-live="polite">
          <p class="waitlist-success-heading">${success}</p>
          <p class="waitlist-success-sub">${successSub}</p>
        </div>
        <p class="waitlist-error" aria-live="assertive">Something went wrong. Please try again, or email <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>`;
}

const input = (id, name, label, type = 'text', extra = '') =>
  `          <label class="visually-hidden" for="${id}">${label}</label>
          <input type="${type}" id="${id}" name="${name}" class="waitlist-input" placeholder="${label}" ${extra}/>`;

function applyBand(id = 'apply', {
  heading = 'Be first in line <em>to explore</em>',
  sub = 'The keys to the wild. We handle the rest.',
  button = 'Apply for early access',
} = {}) {
  return `
  <section class="apply-band" id="${id}">
    <div class="apply-inner">
      <span class="eyebrow">First adventures on their way</span>
      <h2 class="apply-heading">${heading}</h2>
      <p class="apply-sub">${sub}</p>
      ${form({
        id: `${id}-form`,
        subject: 'New Waitlist Signup — Frontier Trails',
        fields: [
          input(`${id}-name`, 'name', 'Your name', 'text', 'autocomplete="name" required '),
          input(`${id}-email`, 'email', 'Your email address', 'email', 'autocomplete="email" required '),
          input(`${id}-phone`, 'phone', 'Phone number (optional)', 'tel', 'autocomplete="tel" '),
        ].join('\n'),
        button,
        success: 'You’re on the list.',
        successSub: 'We’ll be in touch before anyone else.',
      })}
    </div>
  </section>
`;
}

const ORG = { '@type': 'Organization', '@id': `${SITE.origin}/#organization`, name: 'Frontier Trails', url: `${SITE.origin}/` };

function crumbs(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({
      '@type': 'ListItem', position: i + 1, name, item: SITE.origin + path,
    })),
  };
}

function write(rel, html) {
  const file = join(ROOT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  console.log('wrote', rel);
}

/* ─────────────────────────────────────────────
   THE FRONTIER (hub) — two frames. First a short intro about Spain that
   makes you ask "where can I go?"; scrolling lands you on the map. The map
   shows the six landscapes by name only (the place is the reveal); click
   one and the camera flies in, its outline appears, and a small card with
   one photo invites you on to its page. js/frontier.js does the map.
───────────────────────────────────────────── */
const FRONTIER_PHOTOS = JSON.parse(readFileSync(join(ROOT, 'tools', 'frontier-photos.json'), 'utf8'));
const FRONTIER_AREAS = JSON.parse(readFileSync(join(ROOT, 'tools', 'frontier-areas.json'), 'utf8'));
const FRONTIER_LANDSCAPES = JSON.parse(readFileSync(join(ROOT, 'tools', 'frontier-landscapes.json'), 'utf8'));

/* The map itself is clean: no drawings, names or dots on it (Tom,
   2026-11-17). You pick a landscape from the list beside it.
   The list is the four landscapes by biome (FRONTIER.categories). Hover
   lights up a landscape's areas; a click flies to its main area and opens
   its page (once it has one). The six older landscapes (LANDSCAPES) keep
   their own pages and become deeper pages under the four. */
function frontierPage() {
  const path = '/the-frontier/';
  const cats = FRONTIER.categories;
  // A name with its page is a link (phones and no-JS go straight there);
  // without one yet it's a plain item that the map makes clickable.
  const legend = cats.map((c, i) => {
    const inner = `<span class="legend-num">0${i + 1}</span><span class="legend-name">${esc(c.name)}</span>`;
    return c.page
      ? `
          <li><a href="/the-frontier/${c.slug}/" data-slug="${c.slug}">${inner}</a></li>`
      : `
          <li><span class="legend-item" data-slug="${c.slug}">${inner}</span></li>`;
  }).join('');
  // Outlines (several areas per landscape) and where the camera flies.
  const data = JSON.stringify({
    lands: cats.map(c => ({
      slug: c.slug, name: c.name, page: c.page ? `/the-frontier/${c.slug}/` : null,
      focus: FRONTIER_LANDSCAPES[c.slug].focus, areas: FRONTIER_LANDSCAPES[c.slug].areas,
    })),
  });
  const credits = `
          <p>Area outlines: <a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener">Natural Earth</a> province boundaries (public domain); the mountain areas follow the elevation data. Both approximate.</p>`;

  return head({
    title: FRONTIER.title, description: FRONTIER.description, path,
    css: ['/css/frontier.css'],
    jsonld: [ORG, crumbs([['Home', '/'], ['The Frontier', path]]), {
      '@type': 'ItemList', name: 'Four adventure landscapes in Spain',
      itemListElement: cats.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, ...(c.page ? { url: `${SITE.origin}/the-frontier/${c.slug}/` } : {}) })),
    }],
  }) + '\n' + chrome(path).replace('<body>', '<body class="frontier-page">') + `
  <main id="main">
    <!-- 1. The intro: a few lines about Spain that make you ask "where?" -->
    <section class="hook-section frontier-hook" id="frontier-hook">
      <div class="hook-inner">
        <h1 class="eyebrow frontier-hook-label">The Frontier · ${esc(FRONTIER.label)}</h1>
        <p class="hook-heading">${esc(FRONTIER.intro.heading)}</p>
        <p class="hook-sub">${esc(FRONTIER.intro.sub)}</p>
        <p class="frontier-hook-ask">${esc(FRONTIER.intro.ask)}</p>
      </div>
      <a class="scroll-cue frontier-scroll-cue" href="#frontier-stage">
        <span class="scroll-cue-label">Scroll</span>
        <span class="scroll-cue-arrow" aria-hidden="true"></span>
      </a>
    </section>

    <!-- 2. The map, clean: nothing written or drawn on it, with the five
         landscapes listed beside it. Without WebGL (phones, reduced motion,
         no JS) the list sits over the baked relief image. -->
    <section class="frontier-stage" id="frontier-stage" aria-labelledby="frontier-pick">
      <div class="frontier-map" id="frontier-map"></div>
      <div class="frontier-static" id="frontier-static">
        <div class="static-map">
          <img src="/img/relief-spain.webp" alt="Relief map of Spain" width="2000" height="1632" loading="lazy">
        </div>
      </div>
      <div class="frontier-shade" aria-hidden="true"></div>

      <!-- Loader: only shown over the map while it warms up its tiles -->
      <div id="loader" class="hidden" role="progressbar" aria-label="Loading the map" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <div class="loader-inner">
          <span class="loader-brand">FRONTIER TRAILS</span>
          <div class="loader-track"><div id="loader-bar"></div></div>
          <span id="loader-percent">0%</span>
        </div>
      </div>

      <nav class="frontier-legend" aria-labelledby="frontier-pick">
        <h2 class="frontier-legend-title" id="frontier-pick">${esc(FRONTIER.pick)}</h2>
        <ol>${legend}
        </ol>
        <span class="frontier-hint">${esc(FRONTIER.hint)}</span>
      </nav>

      <!-- Shown after the zoom only while a landscape has no page yet. -->
      <article class="frontier-detail" id="frontier-detail" tabindex="-1" hidden>
        <span class="eyebrow frontier-detail-place"></span>
        <h2 class="frontier-detail-name"></h2>
        <div class="frontier-detail-actions">
          <button type="button" class="text-button frontier-back" id="frontier-back">← All of Spain</button>
        </div>
      </article>

      <details class="frontier-credits">
        <summary>Map credits</summary>
        <div class="frontier-credits-body">
          <p>Terrain: elevation data from the <a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noopener">Terrain Tiles</a> open dataset (Mapzen / Tilezen; SRTM, GMTED2010, ETOPO1 and others).</p>${credits}
        </div>
      </details>
    </section>
  </main>

  <script id="frontier-data" type="application/json">${data}</script>
  <script src="/js/nav.js"></script>
  <script type="module" src="/js/frontier.js"></script>
</body>
</html>
`;
}

/* ─────────────────────────────────────────────
   LANDSCAPE PAGES — kept simple: why go, what to do, best season
───────────────────────────────────────────── */
function landscapePage(l, i) {
  const path = `/the-frontier/${l.slug}/`;
  const others = LANDSCAPES.filter(o => o.slug !== l.slug).map(o => `
          <a class="other-land" href="/the-frontier/${o.slug}/">
            <img src="/img/stamps/${o.slug}.svg" alt="" width="48" height="48" loading="lazy">
            <span><span class="land-place">${esc(o.place)}</span><span class="other-name">${esc(o.landscape)}</span></span>
          </a>`).join('');
  const todo = l.todo.map(group => `
        <div class="todo-group">
          <h3 class="todo-activity">${esc(group.activity)}</h3>
          <ul class="poi-list">${group.items.map(p => `
            <li class="poi">
              <h4 class="poi-name">${esc(p.name)}</h4>
              <p class="poi-what">${esc(p.what)}</p>
              <p class="poi-practical">${esc(p.practical)}</p>
            </li>`).join('')}
          </ul>
        </div>`).join('');

  return head({
    title: l.title, description: l.description, path, image: `/img/landscapes/${l.slug}.webp`,
    jsonld: [ORG, crumbs([['Home', '/'], ['The Frontier', '/the-frontier/'], [l.place, path]]), {
      '@type': 'TouristDestination',
      name: l.place,
      description: l.line,
      url: SITE.origin + path,
      containedInPlace: { '@type': 'Place', name: `${l.region}, Spain` },
      geo: { '@type': 'GeoCoordinates', latitude: l.lonlat[1], longitude: l.lonlat[0] },
      touristType: l.acts,
    }],
  }) + '\n' + chrome(path) + `
  <main id="main">
    <section class="land-hero" style="--hero:url('/img/landscapes/${l.slug}.webp')">
      <div class="land-hero-inner">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="/the-frontier/">The Frontier</a> <span aria-hidden="true">/</span> ${esc(l.place)}</nav>
        <div class="land-hero-title">
          <img src="/img/stamps/${l.slug}.svg" alt="" width="88" height="88">
          <div>
            <span class="eyebrow">0${i + 1} · ${esc(l.landscape)}</span>
            <h1 class="page-title">${esc(l.place)}</h1>
          </div>
        </div>
        <p class="lede">${esc(l.line)}</p>
        <ul class="chips">${l.acts.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
      </div>
    </section>

    <section class="land-body">
      <div class="land-body-inner">
        <div class="land-why">
          <h2 class="section-title">Why go</h2>
          ${l.why.map(p => `<p>${esc(p)}</p>`).join('\n          ')}
        </div>

        <div class="land-todo">
          <h2 class="section-title">What to do</h2>${todo}
        </div>

        <div class="land-season">
          <h2 class="eyebrow">Best season</h2>
          <p>${esc(l.season)}</p>
        </div>
      </div>
    </section>

    <section class="other-lands">
      <div class="other-lands-inner">
        <h2 class="eyebrow">More of the Frontier</h2>
        <div class="other-grid">${others}
        </div>
        <a class="text-link" href="/the-frontier/">Back to the map →</a>
      </div>
    </section>
${applyBand()}
  </main>
${footer()}` + scripts();
}

/* ─────────────────────────────────────────────
   THE FOUR LANDSCAPE PAGES (/the-frontier/<slug>/) — Tom's specs in
   "Pages build/", imported into tools/landscape-pages.json by
   tools/import-landscape-pages.py. One template, same order on every page:
   hero, intro, highlights, what to do, routes, when to go, on the road,
   FAQ, the other landscapes, and the signup band.
   No photos: the hero is the relief map with the landscape lit up
   (tools/render-landscape-heroes.py). No drive times (Tom, 2026-11-17).
───────────────────────────────────────────── */
const LANDSCAPE_PAGES = JSON.parse(readFileSync(join(ROOT, 'tools', 'landscape-pages.json'), 'utf8'));

// Inline markdown from the specs: **bold** and *italic*, after escaping.
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');

// Line icons for the activity blocks (24×24, stroke = currentColor).
const ICONS = {
  boot: '<path d="M4 20h16M6 20l1-6 4-1 1-4h4l2 11"/><path d="M9 4l2 2-2 2"/>',
  peak: '<path d="M2 20l7-12 4 6 2-3 7 9z"/><path d="M9 8V3l4 2-4 2"/>',
  ladder: '<path d="M8 2v20M16 2v20M8 6h8M8 10h8M8 14h8M8 18h8"/>',
  gorge: '<path d="M3 3l3 6-1 6 3 6M21 3l-3 5 1 7-3 6"/><path d="M10 21c1-3 3-4 4-7"/>',
  road: '<path d="M9 3L4 21M15 3l5 18M12 5v2M12 10v3M12 16v4"/>',
  binoculars: '<circle cx="6.5" cy="15.5" r="3.5"/><circle cx="17.5" cy="15.5" r="3.5"/><path d="M10 15h4M5 12l2-7h3l1 7M19 12l-2-7h-3l-1 7"/>',
  tree: '<path d="M12 2l6 9h-3l4 6H5l4-6H6z"/><path d="M12 17v5"/>',
  wave: '<path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><circle cx="17" cy="6" r="2.5"/>',
  cave: '<path d="M2 20c1-8 5-14 10-14s9 6 10 14z"/><path d="M8 20c0-4 2-7 4-7s4 3 4 7"/>',
  fork: '<path d="M7 2v8a2 2 0 0 0 4 0V2M9 10v12M17 2c-2 1-3 4-3 8h3v12"/>',
  camera: '<rect x="2" y="7" width="20" height="13" rx="1"/><circle cx="12" cy="13.5" r="4"/><path d="M8 7l2-3h4l2 3"/>',
  star: '<path d="M12 3l2.6 5.6 6 .7-4.5 4 1.3 6L12 16.4 6.6 19.3l1.3-6-4.5-4 6-.7z"/>',
  climb: '<path d="M9 3a5 5 0 0 0 0 10h1M15 3a5 5 0 0 1 0 10h-1"/><path d="M12 13v8M9 21h6"/>',
  columns: '<path d="M3 21h18M4 8h16L12 3zM6 8v10M10 8v10M14 8v10M18 8v10M4 18h16"/>',
  volcano: '<path d="M2 21l6-10h8l6 10z"/><path d="M8 11l2-2h4l2 2M11 6c0-2 1-3 2-4M13 6c1-1 2-1 3-1"/>',
};
const ICON_FOR = [
  ['star', 'star'], ['photo', 'camera'], ['ferrata', 'ladder'], ['climb', 'climb'], ['boulder', 'climb'],
  ['summit', 'peak'], ['volcano', 'volcano'], ['wildlife', 'binoculars'], ['food', 'fork'], ['histor', 'columns'],
  ['cave', 'cave'], ['gorge', 'gorge'], ['canyon', 'gorge'], ['driv', 'road'], ['surf', 'wave'], ['swim', 'wave'],
  ['beach', 'wave'], ['coast', 'wave'], ['forest', 'tree'], ['hik', 'boot'],
];
const iconFor = label => {
  const hit = ICON_FOR.find(([k]) => label.toLowerCase().includes(k));
  return `<svg class="lp-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICONS[hit ? hit[1] : 'boot']}</svg>`;
};

const MONTHS = [['J', 'January'], ['F', 'February'], ['M', 'March'], ['A', 'April'], ['M', 'May'], ['J', 'June'],
  ['J', 'July'], ['A', 'August'], ['S', 'September'], ['O', 'October'], ['N', 'November'], ['D', 'December']];
const MONTH_WORD = { best: 'Best', good: 'Good', avoid: 'Avoid' };

function landscapeHubPage(p, all) {
  const path = `/the-frontier/${p.slug}/`;
  const [h1Main, h1Sub] = p.h1.includes(': ') ? p.h1.split(/: (.+)/) : [p.h1, ''];
  const heroImg = `/img/landscapes/${p.slug}-relief.webp`;

  // Highlights: text-first cards. `image` and `link` are ready for later.
  const cards = p.highlights.map(h => {
    const name = h.link ? `<a href="${h.link}">${esc(h.name)}</a>` : esc(h.name);
    const meta = [h.area, h.best && `Best: ${h.best}`].filter(Boolean).map(esc).join(' · ');
    return `
          <li class="lp-card" id="spot-${h.n}">${h.image ? `
            <img class="lp-card-img" src="${h.image}" alt="${esc(h.name)}" loading="lazy">` : ''}
            <span class="lp-card-num">${String(h.n).padStart(2, '0')}</span>
            <h3 class="lp-card-name">${name}</h3>
            <p class="lp-card-meta">${meta}</p>
            <p class="lp-card-text">${md(h.text)}</p>${h.best_for.length ? `
            <ul class="lp-card-tags">${h.best_for.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
          </li>`;
  }).join('');

  const acts = p.activities.map(a => `
          <div class="lp-act">
            ${iconFor(a.label || '')}
            <h3 class="lp-act-name">${esc(a.label || '')}</h3>
            <p>${md(a.text)}</p>
          </div>`).join('');

  const months = p.months.map((v, k) => `
            <li class="lp-month is-${v}"><span class="lp-month-l" aria-hidden="true">${MONTHS[k][0]}</span><span class="visually-hidden">${MONTHS[k][1]}: ${MONTH_WORD[v] || v}</span></li>`).join('');
  const notes = p.when_notes.map(n => `
            <li>${n.label ? `<strong>${esc(n.label)}:</strong> ` : ''}${md(n.text)}</li>`).join('');

  const road = p.road.map(r => `
            <li>${r.label ? `<strong>${esc(r.label)}</strong> ` : ''}${md(r.text)}${r.sub.length ? `
              <ul>${r.sub.map(s => `
                <li>${md(s)}</li>`).join('')}
              </ul>` : ''}
            </li>`).join('');

  const faq = p.faq.map((f, k) => `
          <details class="lp-qa"${k === 0 ? ' open' : ''}>
            <summary><h3 class="lp-q">${esc(f.q)}</h3></summary>
            <p>${md(f.a)}</p>
          </details>`).join('');

  const others = all.filter(o => o.slug !== p.slug).map(o => `
          <a class="other-land" href="/the-frontier/${o.slug}/">
            <span class="lp-other-num">${o.number}</span>
            <span><span class="land-place">The Frontier</span><span class="other-name">${esc(o.name)}</span></span>
          </a>`).join('');

  return head({
    title: p.title, description: p.description, path, image: heroImg, css: ['/css/landscape.css'],
    jsonld: [ORG, crumbs([['Home', '/'], ['The Frontier', '/the-frontier/'], [p.name, path]]), {
      '@type': 'FAQPage',
      mainEntity: p.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/\*/g, '') } })),
    }],
  }) + '\n' + chrome(path) + `
  <main id="main" class="lp">
    <header class="lp-head">
      <div class="prose lp-head-inner">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="/the-frontier/">The Frontier</a> <span aria-hidden="true">/</span> ${esc(p.name)}</nav>
        <span class="eyebrow lp-eyebrow">${p.number} · The Frontier</span>
        <h1 class="page-title">${esc(h1Main)}${h1Sub ? `<span class="visually-hidden">:</span> <span class="lp-h1-sub">${esc(h1Sub)}</span>` : ''}</h1>
        <p class="prose-lead">${esc(p.hook)}</p>
        <p><a class="btn" href="#apply">${esc(p.cta_primary)}</a></p>
      </div>
    </header>
    <figure class="lp-map">
      <img src="${heroImg}" alt="Relief map of Spain with ${esc(p.name)} lit up" width="2400" height="1350" fetchpriority="high">
    </figure>

    <section class="land-body lp-intro">
      <div class="land-body-inner land-why">
        ${p.intro.map(t => `<p>${md(t)}</p>`).join('\n        ')}
        <p class="lp-season"><span class="eyebrow">Best season</span> ${esc(p.best_season)}</p>
      </div>
    </section>

    <section class="lp-section" aria-labelledby="highlights">
      <div class="lp-inner">
        <h2 class="section-title" id="highlights">Highlights</h2>
        <ol class="lp-cards">${cards}
        </ol>
      </div>
    </section>

    <section class="lp-section" aria-labelledby="what-to-do">
      <div class="lp-inner">
        <h2 class="section-title" id="what-to-do">What to do</h2>
        <div class="lp-acts">${acts}
        </div>
      </div>
    </section>

    <section class="lp-section" aria-labelledby="when">
      <div class="lp-inner lp-narrow">
        <h2 class="section-title" id="when">When to go</h2>
        <ol class="lp-months">${months}
        </ol>
        <ul class="lp-legend" aria-hidden="true"><li class="is-best">Best</li><li class="is-good">Good</li><li class="is-avoid">Avoid</li></ul>
        <ul class="lp-notes">${notes}
        </ul>
      </div>
    </section>

    <section class="lp-section" aria-labelledby="road">
      <div class="lp-inner lp-narrow">
        <h2 class="section-title" id="road">On the road</h2>
        <ul class="lp-road">${road}
        </ul>
      </div>
    </section>

    <section class="lp-section" aria-labelledby="faq">
      <div class="lp-inner lp-narrow">
        <h2 class="section-title" id="faq">FAQ</h2>
        <div class="lp-faq">${faq}
        </div>
      </div>
    </section>

    <section class="other-lands">
      <div class="other-lands-inner">
        <h2 class="eyebrow">Explore other landscapes</h2>
        <div class="other-grid">${others}
        </div>
        <a class="text-link" href="/the-frontier/">Back to the map →</a>
      </div>
    </section>
${applyBand('apply', { heading: esc(p.cta.heading), sub: esc(p.cta.sub), button: 'Sign up for your dream trip' })}
    <details class="lp-credits">
      <summary>Map credits</summary>
      <p>Relief map: elevation data from the <a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noopener">Terrain Tiles</a> open dataset (Mapzen / Tilezen; SRTM, GMTED2010, ETOPO1 and others). The lit areas are approximate.</p>
    </details>
  </main>
${footer()}` + scripts();
}

/* ─────────────────────────────────────────────
   ABOUT
───────────────────────────────────────────── */
function aboutPage() {
  const path = '/about/';
  const sections = ABOUT.sections.map(s => `
        <h2>${esc(s.h)}</h2>
        ${s.p.map(p => `<p>${esc(p)}</p>`).join('\n        ')}${s.photo ? `
        <figure class="prose-figure">
          <img src="/img/journal/the-heart-of-the-namib.webp" alt="Apricot dunes and a camelthorn tree at Sossusvlei in the Namib" width="744" height="910" loading="lazy">
          <figcaption>The Namib. Shot on Olympus OM-1, 35mm Kodak Gold</figcaption>
        </figure>` : ''}${s.link ? `
        <p><a class="text-link" href="${s.link[0]}">${s.link[1]} →</a></p>` : ''}`).join('');

  return head({
    title: ABOUT.title, description: ABOUT.description, path,
    jsonld: [ORG, crumbs([['Home', '/'], ['About', path]]), {
      '@type': 'AboutPage', url: SITE.origin + path, name: ABOUT.title,
      mainEntity: { '@id': `${SITE.origin}/#organization` },
    }, {
      '@type': 'Person', name: 'Tom', jobTitle: 'Founder',
      worksFor: { '@id': `${SITE.origin}/#organization` },
    }],
  }) + '\n' + chrome(path) + `
  <main id="main" class="page">
    <article class="prose">
      <span class="eyebrow">About Frontier Trails</span>
      <h1 class="page-title">${esc(ABOUT.h1)}</h1>
      ${ABOUT.intro.map(p => `<p class="prose-lead">${esc(p)}</p>`).join('\n      ')}${sections}

        <h2>If you’re interested</h2>
        <p>${esc(ABOUT.outro)} <a href="mailto:${SITE.email}">${SITE.email}</a></p>
        <p><a class="btn" href="/#cta">Apply for early access</a></p>

        <p class="signoff">Tom</p>
    </article>
  </main>
${footer()}` + scripts();
}

/* ─────────────────────────────────────────────
   FAQ — the roadbook: one route from START to FINISH
───────────────────────────────────────────── */
const ROADS = [
  'M28 54V2M28 28L54 10', 'M28 54V2M28 28H2', 'M28 54V2M28 30L54 46',
  'M28 54V2M28 28L2 10', 'M28 54V2M28 28H54', 'M28 54V2M28 30L2 46M28 26L54 10',
];

function faqPage() {
  const path = '/faq/';
  let n = 0;
  const all = [];
  const stages = FAQ.stages.map(([title, items]) => `
        <div class="rb-row rb-marker"><span></span><span></span><h2 class="rb-stage">${esc(title)}</h2></div>${items.map(([q, a, link]) => {
          n += 1;
          all.push([q, a]);
          return `
        <details class="rb-qa"${n === 1 ? ' open' : ''}>
          <summary class="rb-row">
            <span class="rb-num">${String(n).padStart(2, '0')}</span>
            <span class="rb-tulip-cell">
              <svg class="rb-tulip" viewBox="0 0 56 56" aria-hidden="true">
                <path d="${ROADS[(n - 1) % ROADS.length]}" fill="none" stroke="#f0ebe0" stroke-opacity=".55" stroke-width="1.5"/>
                <path d="M28 50V28" fill="none" stroke="#e3c67a" stroke-width="4" stroke-linecap="round"/>
                <circle cx="28" cy="50" r="3.5" fill="#e3c67a"/>
                <g class="rb-arrow"><path d="M28 28V12" fill="none" stroke="#e3c67a" stroke-width="4"/><path d="M21 14l7-10 7 10z" fill="#e3c67a"/></g>
              </svg>
            </span>
            <h3 class="rb-q">${esc(q)}</h3>
          </summary>
          <div class="rb-row">
            <span></span><span></span>
            <div class="rb-a">
              <p>${esc(a)}</p>${link ? `
              <a class="text-link" href="${link[0]}">${link[1]} →</a>` : ''}
            </div>
          </div>
        </details>`;
        }).join('')}`).join('');

  return head({
    title: FAQ.title, description: FAQ.description, path,
    jsonld: [ORG, crumbs([['Home', '/'], ['FAQ', path]]), {
      '@type': 'FAQPage',
      mainEntity: all.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    }],
  }) + '\n' + chrome(path) + `
  <main id="main" class="page">
    <header class="page-head">
      <span class="eyebrow">FAQ · The roadbook</span>
      <h1 class="page-title">Questions, answered</h1>
      <p class="lede">${n} questions, on one route from booking to your first night out. Open one and the arrow turns to the answer.</p>
    </header>

    <div class="roadbook">
      <div class="rb-row rb-marker"><span></span><span class="rb-tulip-cell"><span class="rb-start" aria-hidden="true"></span></span><span class="rb-flag">Start</span></div>${stages}
      <div class="rb-row rb-marker rb-finish">
        <span></span>
        <span class="rb-tulip-cell"><span class="rb-chequer" aria-hidden="true"></span></span>
        <div class="rb-finish-body">
          <div>
            <span class="rb-flag">Finish</span>
            <p>Something we missed? Email us, or apply and you’ll hear first.</p>
          </div>
          <div class="rb-finish-actions">
            <a class="btn-outline" href="mailto:${SITE.email}">Email us</a>
            <a class="btn" href="/#cta">Apply for early access</a>
          </div>
        </div>
      </div>
    </div>
  </main>
${footer()}` + scripts();
}

const fmtDate = d => new Date(d + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/* ─────────────────────────────────────────────
   JOURNAL — one stream, like leafing through a travel journal on a desk:
   film prints taped in, strips of film for the panoramas, typed field
   notes, a few marks in the margins, laid out compactly so a lot is in view.
   Clicking a photo lifts it into a full-screen viewer (js/journal.js);
   every entry also keeps its own page for search and sharing.
───────────────────────────────────────────── */
// Posts that were one wide picture cut into Instagram slides: how many slides.
// (The Detour and Sandwich Harbour were collages, not panoramas: their photos lie loose.)
const PANORAMA_SLIDES = { 'the-edge-of-the-atlantic': 3, 'the-mountain-kingdom': 2, 'among-the-giants': 2 };

/* The desk, top to bottom. A block of three columns is placed by hand so
   the columns come out even; a 'strip' runs across the desk; 'strips'
   puts two strips side by side. How each story lies: gate = in the
   camera's viewfinder, print = a taped print, loose = its photos taped in
   separately, collage = a print with its Polaroids. */
const JOURNAL_STREAM = [
  ['cols', [
    [['gate', 'the-motherland'], ['note', 'wild-camping-in-spain']],
    [['note', 'overlanding-in-spain'], ['print', 'the-open-air']],
    [['collage', 'the-detour'], ['print', 'the-night-watch'], ['doodle', 0]],
  ]],
  ['strip', 'the-edge-of-the-atlantic'],
  ['cols', [
    [['loose', 'the-heart-of-the-namib'], ['note', 'best-time-for-a-road-trip-in-spain']],
    [['loose', 'sandwich-harbour'], ['note', 'rooftop-tent-vs-campervan'], ['doodle', 1]],
    [['print', 'in-silence'], ['print', 'the-sky-fortress']],
  ]],
  ['strips', 'the-mountain-kingdom', 'among-the-giants'],
];

const STORY_BY_SLUG = Object.fromEntries(STORIES.map(s => [s.slug, s]));
const NOTE_BY_SLUG = Object.fromEntries(FIELD_NOTES.map(n => [n.slug, n]));
const shortDate = d => new Date(d + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const excerpt = (t, n = 170) => (t.length <= n ? t : t.slice(0, t.lastIndexOf(' ', n)) + '…');
const filmStock = s => (s.specs ? s.specs.split(', ').pop().replace('35mm ', '').toUpperCase() : 'FRONTIER TRAILS');

const INK_TULIP = '<svg viewBox="0 0 56 56" aria-hidden="true"><path d="M28 54V2M28 28L54 12" fill="none" stroke="currentColor" stroke-opacity=".5" stroke-width="1.6"/><path d="M28 50V28" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><circle cx="28" cy="50" r="3" fill="currentColor"/><path d="M28 28V12" fill="none" stroke="currentColor" stroke-width="3.5"/><path d="M22 14l6-9 6 9z" fill="currentColor"/></svg>';

/* A strip of 35 mm film. A panorama is shown as its slides, one per frame,
   so scrolling (or dragging) the strip reveals the whole picture. */
function filmStrip(s, n0) {
  const imgs = storyImages(s);
  const slides = PANORAMA_SLIDES[s.slug];
  const frames = slides
    ? Array.from({ length: slides }, (_, k) => ({
        ar: (imgs[0].w / slides / imgs[0].h).toFixed(4),
        bg: `background-image:url('${imgs[0].src}');background-size:${slides * 100}% 100%;background-position:${(k / (slides - 1) * 100).toFixed(2)}% 0`,
      }))
    : imgs.map(img => ({ img }));
  const stock = filmStock(s);
  return `<div class="film" data-drag tabindex="0" role="group" aria-label="${esc(s.alt)}">
            <div class="film-track">
              <span class="film-leader" aria-hidden="true"></span>${frames.map((f, k) => `
              <button type="button" class="film-frame" data-open="${s.slug}" aria-label="Open ${esc(s.title)}" style="--ar:${f.img ? (f.img.w / f.img.h).toFixed(4) : f.ar}">
                <span class="film-edge" aria-hidden="true"><span>${stock}</span><span>▸ ${n0 + k}${k ? 'A' : ''}</span></span>
                ${f.img ? `<img src="${f.img.src}" alt="" width="${f.img.w}" height="${f.img.h}" loading="lazy">` : `<span class="film-pic" style="${f.bg}"></span>`}
              </button>`).join('')}
              <span class="film-end" aria-hidden="true"></span>
              <span class="film-dust" aria-hidden="true"></span>
            </div>
          </div>`;
}

const DOODLES = [
  `<div class="j-doodle" aria-hidden="true">${INK_TULIP}<span>Keep going</span></div>`,
  `<div class="j-doodle j-doodle-right" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-opacity=".6"/><path d="M32 8v48M8 32h48" stroke="currentColor" stroke-opacity=".35"/><path d="M32 12l5 20-5 20-5-20z" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="32" y="6" text-anchor="middle">N</text></svg><span>Shot on film</span></div>`,
];

function journalIndex() {
  const path = '/journal/';
  let frameNo = 1;
  const ROT = [-2.2, 1.6, -1.2, 2.4, -1.8, 1.1, -0.8];
  const tape = '<span class="tape" aria-hidden="true"></span>';
  const pic = (img, s, k, eager) => `<img src="${img.src}" alt="${esc(img.alt)}" width="${img.w}" height="${img.h}" loading="${eager ? 'eager' : 'lazy'}">`;
  const cap = s => `
          <div class="j-cap">
            <span class="j-meta">${s.place ? esc(s.place) + ' · ' : ''}${shortDate(s.date)}</span>
            <h2 class="j-title"><a href="/journal/${s.slug}/" data-open="${s.slug}">${esc(s.title)}</a></h2>
            <p class="j-excerpt">${esc(excerpt(s.body[0], 120))}</p>
          </div>`;
  const strip = s => {
    const html = filmStrip(s, frameNo);
    frameNo += PANORAMA_SLIDES[s.slug] || storyImages(s).length;
    return `<article class="j-entry j-strip" data-kind="story">
          ${html}${cap(s)}
        </article>`;
  };

  let n = 0;
  const piece = ([kind, slug, slug2]) => {
    const i = n++;
    const rot = `--rot:${ROT[i % ROT.length]}deg`;
    if (kind === 'doodle') return DOODLES[slug];
    if (kind === 'note') {
      const n = NOTE_BY_SLUG[slug];
      return `
        <a class="j-entry j-note" href="/journal/${n.slug}/" data-kind="note" style="--rot:${(ROT[i % ROT.length] * 0.5).toFixed(2)}deg">
          <span class="j-note-head"><span>Field note · No. ${n.no}</span>${INK_TULIP}</span>
          <span class="j-note-title">${esc(n.title)}</span>
          <span class="j-note-hook">${esc(n.hook)}</span>
          <span class="j-note-more">Read the field note →</span>
          <img class="j-note-stamp" src="/img/stamps/${n.lands[0]}.svg" alt="" width="64" height="64" loading="lazy">
        </a>`;
    }
    if (kind === 'strip') return `
        <div class="j-span j-span-one">${strip(STORY_BY_SLUG[slug])}</div>`;
    if (kind === 'strips') return `
        <div class="j-span j-span-two">${strip(STORY_BY_SLUG[slug])}${strip(STORY_BY_SLUG[slug2])}</div>`;

    const s = STORY_BY_SLUG[slug];
    const imgs = storyImages(s);
    const open = `data-open="${s.slug}" aria-label="Open ${esc(s.title)}"`;
    frameNo += imgs.length;
    if (kind === 'gate') return `
        <article class="j-entry j-gate" data-kind="story">
          <button type="button" class="j-gate-view" ${open}>
            <span class="j-gate-label" aria-hidden="true"><span>In the gate · frame ${String(frameNo - 1).padStart(2, '0')}</span><span>${filmStock(s)}</span></span>
            ${pic(imgs[0], s, 0, true)}
            <span class="j-gate-corners" aria-hidden="true"></span>
          </button>${cap(s)}
        </article>`;
    if (kind === 'loose') return `
        <article class="j-entry j-loose" data-kind="story">
          ${imgs.map((img, k) => `<button type="button" class="j-photo j-loose-${k + 1}" ${open} style="--rot:${k ? 2.6 : -2.4}deg">${tape}${pic(img, s, k)}</button>`).join('')}${cap(s)}
        </article>`;
    if (kind === 'collage') return `
        <article class="j-entry j-collage" data-kind="story">
          <div class="j-collage-set">
            <button type="button" class="j-photo" ${open} style="${rot}">${pic(imgs[0], s, 0)}</button>${imgs.slice(1).map((img, k) => `
            <button type="button" class="j-polaroid j-polaroid-${k + 1}" ${open}>${tape}${pic(img, s, k + 1)}</button>`).join('')}
          </div>${cap(s)}
        </article>`;
    return `
        <article class="j-entry j-print" data-kind="story">
          <button type="button" class="j-photo" ${open} style="${rot}">${tape}${pic(imgs[0], s, 0, i < 3)}</button>${cap(s)}
        </article>`;
  };
  const entries = JOURNAL_STREAM.map(item => item[0] === 'cols'
    ? `
      <div class="j-cols">${item[1].map((col, c) => `
        <div class="j-col">${col.map((it, r) => `<div class="j-cell" style="order:${r * 3 + c}">${piece(it)}</div>`).join('')}
        </div>`).join('')}
      </div>`
    : piece(item)).join('\n');

  const viewerData = JSON.stringify(STORIES.map(s => ({
    slug: s.slug, title: s.title, place: s.place, date: fmtDate(s.date), body: s.body, specs: s.specs, ig: s.ig,
    images: storyImages(s), wide: isWide(s),
  })));

  return head({
    title: JOURNAL_INTRO.title, description: JOURNAL_INTRO.description, path,
    css: ['/css/journal.css'],
    jsonld: [ORG, crumbs([['Home', '/'], ['Journal', path]]), {
      '@type': 'Blog', name: 'Frontier Trails Journal', url: SITE.origin + path,
      blogPost: [
        ...STORIES.map(s => ({ '@type': 'BlogPosting', headline: s.title, url: `${SITE.origin}/journal/${s.slug}/`, datePublished: s.date })),
        ...FIELD_NOTES.map(n => ({ '@type': 'Article', headline: n.title, url: `${SITE.origin}/journal/${n.slug}/` })),
      ],
    }],
  }) + '\n' + chrome(path) + `
  <main id="main" class="page journal">
    <header class="page-head">
      <span class="eyebrow">Shot on film</span>
      <h1 class="page-title">${esc(JOURNAL_INTRO.h1)}</h1>
      <p class="lede">${esc(JOURNAL_INTRO.lede)}</p>
    </header>

    <div class="j-stream">
${entries}
    </div>
  </main>

  <!-- The viewer: a photo lifts out of the journal to full screen. -->
  <div class="j-viewer" id="j-viewer" role="dialog" aria-modal="true" aria-label="Story" hidden>
    <div class="j-viewer-backdrop" data-close></div>
    <button type="button" class="j-viewer-close" data-close aria-label="Close">×</button>
    <div class="j-viewer-media"></div>
    <div class="j-viewer-text">
      <span class="eyebrow j-v-meta"></span>
      <h2 class="j-v-title"></h2>
      <div class="j-v-body"></div>
      <p class="specs j-v-specs"></p>
      <p class="j-v-links"><a class="text-link j-v-page" href="#">Open as a page →</a> <a class="text-link j-v-ig" href="#" target="_blank" rel="noopener">See it on Instagram →</a></p>
    </div>
    <button type="button" class="j-viewer-nav j-viewer-prev" aria-label="Previous story">←</button>
    <button type="button" class="j-viewer-nav j-viewer-next" aria-label="Next story">→</button>
  </div>
${footer()}
  <script id="journal-data" type="application/json">${viewerData}</script>` + scripts(['<script src="/js/journal.js"></script>']);
}

/* ─────────────────────────────────────────────
   FIELD NOTE — a typed page on the desk
───────────────────────────────────────────── */
function fieldNotePage(n, i) {
  const path = `/journal/${n.slug}/`;
  const others = FIELD_NOTES.filter(o => o.slug !== n.slug);
  const lands = n.lands.map(slug => LANDSCAPES.find(l => l.slug === slug));
  const section = s => `
        <h2>${esc(s.h)}</h2>${(s.p || []).map(p => `
        <p>${esc(p)}</p>`).join('')}${s.list ? `
        <ul>${s.list.map(li => `<li>${esc(li)}</li>`).join('')}</ul>` : ''}`;
  const table = n.table ? `
        <table class="fn-table">
          <thead><tr><th>When</th><th>Go to</th><th>Keep in mind</th></tr></thead>
          <tbody>${n.table.map(([m, go, mind]) => `<tr><th scope="row">${esc(m)}</th><td>${esc(go)}</td><td>${esc(mind)}</td></tr>`).join('')}</tbody>
        </table>` : '';
  const compare = n.compare ? `
        <table class="fn-table">
          <thead><tr><th></th><th>4x4 with a rooftop tent</th><th>Campervan</th></tr></thead>
          <tbody>${n.compare.map(([k, a, b]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('')}</tbody>
        </table>` : '';
  return head({
    title: n.seo, description: n.description, path,
    css: ['/css/journal.css'],
    jsonld: [ORG, crumbs([['Home', '/'], ['Journal', '/journal/'], [n.title, path]]), {
      '@type': 'Article', headline: n.title, description: n.description,
      author: { '@type': 'Person', name: 'Tom' },
      publisher: { '@id': `${SITE.origin}/#organization` },
      mainEntityOfPage: SITE.origin + path,
    }],
  }) + '\n' + chrome('/journal/') + `
  <main id="main" class="page field-note">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/journal/">Journal</a> <span aria-hidden="true">/</span> Field notes</nav>
    <article class="fn-sheet">
      <header class="fn-head">
        <span class="fn-label">Field note · No. ${n.no}</span>
        <span class="fn-tulip">${INK_TULIP}</span>
      </header>
      <h1 class="fn-title">${esc(n.title)}</h1>
      <p class="fn-lede">${esc(n.intro || n.hook)}</p>${table}${compare}${n.sections.map(section).join('')}${n.sources.length ? `
      <aside class="fn-sources">
        <h2>Sources</h2>
        <ol>${n.sources.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join('')}</ol>
        <p>Rules change. Check locally before you go.</p>
      </aside>` : ''}
    </article>

    <section class="fn-more">
      <h2 class="eyebrow">The landscapes in this note</h2>
      <div class="other-grid">${lands.map(o => `
        <a class="other-land" href="/the-frontier/${o.slug}/">
          <img src="/img/stamps/${o.slug}.svg" alt="" width="48" height="48" loading="lazy">
          <span><span class="land-place">${esc(o.place)}</span><span class="other-name">${esc(o.landscape)}</span></span>
        </a>`).join('')}
      </div>
      <h2 class="eyebrow">More field notes</h2>
      <ul class="fn-others">${others.map(o => `<li><a href="/journal/${o.slug}/">${esc(o.title)} →</a></li>`).join('')}</ul>
      <a class="text-link" href="/journal/">Back to the Journal →</a>
    </section>
  </main>
${footer()}` + scripts();
}

function storyPage(s, i) {
  const path = `/journal/${s.slug}/`;
  const prev = STORIES[i - 1], next = STORIES[i + 1];
  return head({
    title: `${s.title}${s.place ? ` · ${s.place}` : ''} | Frontier Trails Journal`,
    description: s.body[0].slice(0, 155),
    path, image: storyImages(s)[0].src,
    jsonld: [ORG, crumbs([['Home', '/'], ['Journal', '/journal/'], [s.title, path]]), {
      '@type': 'BlogPosting', headline: s.title, datePublished: s.date,
      image: storyImages(s).map(img => SITE.origin + img.src),
      author: { '@type': 'Person', name: 'Tom' },
      publisher: { '@id': `${SITE.origin}/#organization` },
      ...(s.place ? { contentLocation: { '@type': 'Place', name: s.place } } : {}),
    }],
  }) + '\n' + chrome('/journal/') + `
  <main id="main" class="page story${isWide(s) ? ' story-wide' : ''}">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/journal/">Journal</a> <span aria-hidden="true">/</span> ${esc(s.title)}</nav>
    <article class="story-body">
      <figure class="story-figure">${isWide(s) ? `
        <div class="strip-wrap">
          <div class="story-strip" role="region" aria-label="Photo, scroll sideways" tabindex="0">${storyImages(s).map(img => imgTag(img, false)).join('')}</div>
          <button type="button" class="strip-arrow strip-prev" aria-label="Show the left of the picture">←</button>
          <button type="button" class="strip-arrow strip-next" aria-label="Show more of the picture">→</button>
        </div>
        <figcaption class="strip-hint" aria-hidden="true">Scroll or swipe for the full picture →</figcaption>` : `
        ${imgTag(storyImages(s)[0], false)}`}
      </figure>
      <div class="story-text">
        <span class="eyebrow">${s.place ? esc(s.place) + ' · ' : ''}<time datetime="${s.date}">${fmtDate(s.date)}</time></span>
        <h1 class="page-title">${esc(s.title)}</h1>
        ${s.body.map(p => `<p>${esc(p)}</p>`).join('\n        ')}${s.specs ? `
        <p class="specs">SPECS: Shot on ${esc(s.specs)}</p>` : ''}
        <p><a class="text-link" href="https://www.instagram.com/p/${s.ig}/" target="_blank" rel="noopener">See it on Instagram →</a></p>
      </div>
    </article>
    <nav class="story-nav" aria-label="More stories">
      ${prev ? `<a href="/journal/${prev.slug}/"><span class="eyebrow">← Previous</span><span>${esc(prev.title)}</span></a>` : '<span></span>'}
      ${next ? `<a class="next" href="/journal/${next.slug}/"><span class="eyebrow">Next →</span><span>${esc(next.title)}</span></a>` : `<a class="next" href="/journal/"><span class="eyebrow">Back</span><span>The whole roll</span></a>`}
    </nav>
  </main>
${footer()}` + scripts(isWide(s) ? [`<script>
    // The arrows and the hint only show when the picture is wider than the
    // screen; each arrow slides it on by most of a screen, like Instagram.
    (function () {
      var strip = document.querySelector('.story-strip');
      var wrap = strip.parentNode;
      function check() {
        var fits = strip.scrollWidth <= strip.clientWidth + 2;
        strip.classList.toggle('fits', fits);
        wrap.classList.toggle('at-start', strip.scrollLeft < 4);
        wrap.classList.toggle('at-end', strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 4);
      }
      function slide(dir) { strip.scrollBy({ left: dir * strip.clientWidth * 0.8, behavior: 'smooth' }); }
      wrap.querySelector('.strip-prev').addEventListener('click', function () { slide(-1); });
      wrap.querySelector('.strip-next').addEventListener('click', function () { slide(1); });
      strip.addEventListener('scroll', check, { passive: true });
      addEventListener('load', check); addEventListener('resize', check);
    })();
  </script>`] : []);
}

/* ─────────────────────────────────────────────
   COMMUNITY, DREAM TRIP, 404
───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   COMMUNITY — one section in the site's usual container, like a Journal
   story: the words on the left (eyebrow, title, Tom's text, one button),
   and on the right one composed collage of Tom's photos, taped in like
   the Journal's prints. One call to action: the WhatsApp group
   (COMMUNITY.whatsapp).
───────────────────────────────────────────── */
function communityPage() {
  const path = '/community/';
  const C = COMMUNITY;
  const href = C.whatsapp || '#';
  const prints = C.photos.map((p, i) => `
          <figure class="com-print com-print-${p.slot}"><span class="com-tape" aria-hidden="true"></span><img src="${p.src}" alt="${esc(p.alt)}" width="${p.w}" height="${p.h}"${i < 3 ? '' : ' loading="lazy"'}></figure>`).join('');

  return head({
    title: C.title, description: C.description, path,
    css: ['/css/community.css'],
    jsonld: [ORG, crumbs([['Home', '/'], ['Community', path]])],
  }) + '\n' + chrome(path).replace('<body>', '<body class="community-page">') + `
  <main id="main" class="page">
    <section class="com">
      <div class="com-text">
        <span class="eyebrow">${esc(C.label)}</span>
        <h1 class="page-title">${esc(C.h1)}</h1>
        <p class="com-lead">${esc(C.lead)}</p>${C.text.map(p => `
        <p class="com-p">${esc(p)}</p>`).join('')}
        <p class="com-invite">${esc(C.invite)}</p>
        <div class="com-actions">
          <a class="btn" href="${href}"${C.whatsapp ? ' target="_blank" rel="noopener"' : ''}>${esc(C.cta)}</a>
          <span class="com-note">${esc(C.ctaNote)}</span>
        </div>
      </div>
      <div class="com-collage">${prints}
      </div>
    </section>
  </main>
${footer()}` + scripts();
}

function dreamPage() {
  const path = '/dream-trip/';
  const checks = (name, items) => items.map((a, i) => `
            <label class="check"><input type="checkbox" name="${name}" value="${esc(a)}"><span>${esc(a)}</span></label>`).join('');
  const select = (id, name, label, opts) => `
          <label class="field"><span class="field-label">${label}</span>
            <select id="${id}" name="${name}" class="waitlist-input">${opts.map(o => `<option>${esc(o)}</option>`).join('')}</select>
          </label>`;
  return head({
    title: DREAM.title, description: DREAM.description, path,
    jsonld: [ORG, crumbs([['Home', '/'], ['Dream trip', path]])],
  }) + '\n' + chrome(path) + `
  <main id="main" class="page">
    <header class="page-head">
      <span class="eyebrow">Dream trip</span>
      <h1 class="page-title">${esc(DREAM.h1)}</h1>
      <p class="lede">${esc(DREAM.lede)}</p>
    </header>
    <section class="dream-form">
      ${form({
        id: 'dream-form', subject: 'Dream trip request — Frontier Trails',
        fields: `
          <fieldset class="checks"><legend class="field-label">What moves you?</legend>${checks('activities', DREAM.activities)}
          </fieldset>
          <fieldset class="checks"><legend class="field-label">Which landscapes?</legend>${checks('landscapes', LANDSCAPES.map(l => l.place))}
            <label class="check"><input type="checkbox" name="landscapes" value="Surprise me"><span>Surprise me</span></label>
          </fieldset>
          <div class="field-row">${select('dream-days', 'days', 'How long?', ['A weekend', '3–5 days', 'About a week', 'Two weeks or more'])}${select('dream-who', 'travelling_with', 'Who’s coming?', ['Just me', 'Two of us', 'A small group', 'Family'])}
          </div>
          <label class="field"><span class="field-label">When?</span>
            <input type="text" id="dream-when" name="when" class="waitlist-input" placeholder="A month, a season, or exact dates" />
          </label>
          <label class="field"><span class="field-label">Anything else?</span>
            <textarea id="dream-note" name="note" class="waitlist-input" rows="4" placeholder="A place you’ve always wanted to see, a level, a must-have"></textarea>
          </label>
${input('dream-name', 'name', 'Your name', 'text', 'autocomplete="name" required ')}
${input('dream-email', 'email', 'Your email address', 'email', 'autocomplete="email" required ')}`,
        button: 'Send my dream trip', success: 'Got it.', successSub: DREAM.after,
      })}
      <p class="form-note">${esc(DREAM.after)}</p>
    </section>
  </main>
${footer()}` + scripts();
}

function notFoundPage() {
  return head({
    title: NOT_FOUND.title, description: NOT_FOUND.lede, path: '/404.html', noindex: true,
  }) + '\n' + chrome('/404') + `
  <main id="main" class="page off-route">
    <div class="compass" id="compass" aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(240,235,224,.25)"/>
        <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(227,198,122,.35)" stroke-dasharray="2 6"/>
        <text x="100" y="22" text-anchor="middle">N</text>
        <g class="compass-tulip" id="compass-tulip">
          <path d="M100 168V100" stroke="#e3c67a" stroke-width="9" stroke-linecap="round"/>
          <circle cx="100" cy="168" r="8" fill="#e3c67a"/>
          <path d="M100 100V52" stroke="#e3c67a" stroke-width="9"/>
          <path d="M84 58l16-26 16 26z" fill="#e3c67a"/>
        </g>
      </svg>
    </div>
    <h1 class="page-title">${esc(NOT_FOUND.h1)}</h1>
    <p class="lede">${esc(NOT_FOUND.lede)}</p>
    <p class="off-route-links"><a class="btn" href="/the-frontier/">See the Frontier</a> <a class="text-link" href="/">Back to the start →</a></p>
  </main>
${footer()}` + scripts([`<script>
    // The tulip turns to point at the pointer, like a compass needle.
    (function () {
      var t = document.getElementById('compass-tulip'), c = document.getElementById('compass');
      if (!t || !c || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        var a = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI + 90;
        t.style.transform = 'rotate(' + a.toFixed(1) + 'deg)';
      });
    })();
  </script>`]);
}

/* ─────────────────────────────────────────────
   SITEMAP + BUILD
───────────────────────────────────────────── */
function sitemap(paths) {
  const today = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map(p => `  <url><loc>${SITE.origin}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;
}

const paths = ['/'];
const page = (rel, path, html) => { write(rel, html); if (path) paths.push(path); };

page('the-frontier/index.html', '/the-frontier/', frontierPage());
LANDSCAPE_PAGES.forEach(p => page(`the-frontier/${p.slug}/index.html`, `/the-frontier/${p.slug}/`, landscapeHubPage(p, LANDSCAPE_PAGES)));
LANDSCAPES.forEach((l, i) => page(`the-frontier/${l.slug}/index.html`, `/the-frontier/${l.slug}/`, landscapePage(l, i)));
page('journal/index.html', '/journal/', journalIndex());
STORIES.forEach((s, i) => page(`journal/${s.slug}/index.html`, `/journal/${s.slug}/`, storyPage(s, i)));
FIELD_NOTES.forEach((n, i) => page(`journal/${n.slug}/index.html`, `/journal/${n.slug}/`, fieldNotePage(n, i)));
page('community/index.html', '/community/', communityPage());
page('about/index.html', '/about/', aboutPage());
page('faq/index.html', '/faq/', faqPage());
page('dream-trip/index.html', '/dream-trip/', dreamPage());
page('404.html', null, notFoundPage());
write('sitemap.xml', sitemap(paths));

const checks = [
  ...FIELD_NOTES.flatMap(n => [...(n.check ? [`Field note ${n.no}: ${n.check}`] : []), ...n.sections.filter(x => x.check).map(x => `Field note ${n.no} · ${x.h}: ${x.check}`)]),
  ...LANDSCAPES.flatMap(l => [
  ...(l.check || []).map(c => `${l.place}: ${c}`),
  ...l.todo.flatMap(g => g.items.filter(p => p.check).map(p => `${l.place} · ${p.name}: ${p.check}`)),
  ]),
  ...(COMMUNITY.check || []).map(c => `Community: ${c}`),
  ...(COMMUNITY.whatsapp ? [] : ['Community: the WhatsApp invite link is missing, so the join buttons go nowhere (COMMUNITY.whatsapp)']),
];
console.log(`\n[CHECK] before going live (${checks.length}):\n- ${checks.join('\n- ')}`);

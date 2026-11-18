/* ==============================================
   FRONTIER TRAILS — frontier.js
   /the-frontier/ · the four landscapes on the map of Spain

   Two frames. The intro above says a few lines about Spain; scrolling
   snaps down to this map. It shows the whole peninsula, clean: nothing
   written or drawn on it (Tom, 2026-11-17). You pick a landscape from the
   list beside it. Hover lights up all of its areas (it can sit in several
   parts of Spain). Click (its name, or an area on the map) and the camera
   flies to its most obvious general area, then its page opens: one click,
   the zoom is the transition. Until a landscape has its page, the zoom
   ends on a small card with its name and "All of Spain" to fly back.

   The relief is the Frontier Trails cartography from /journey
   (feature/route-journey): elevation keyed to the brand palette, with
   hillshade, 3D terrain and a black sea. No satellite layer — its colours
   weren't ours, and its licence doesn't allow commercial use. Without
   WebGL (phones, reduced motion) the page keeps the baked relief image,
   and the list links straight to each landscape's page.
   ============================================== */

/* The live map needs room: at least 900 x 560 and wider than tall
   (desktops, laptops, tablets on their side). Phones, upright tablets and
   phones on their side get the baked image with the list as links, which
   fits their screens better and loads nothing extra. */
const IS_MOBILE = !window.matchMedia('(min-width: 900px) and (min-height: 560px) and (min-aspect-ratio: 11/10)').matches;
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const MAPLIBRE_VERSION = '5.24.0'; // self-hosted copy in /js/vendor/ (2026-11-18)

const DATA = JSON.parse(document.getElementById('frontier-data').textContent);
const LANDS = DATA.lands;
const BY_SLUG = Object.fromEntries(LANDS.map(l => [l.slug, l]));

/* ─────────────────────────────────────────────
   1. THE MAP — brand cartography
───────────────────────────────────────────── */
const DEM_TILES = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';

/* Elevation → Frontier Trails palette, wide enough that the shading reads
   everywhere (Tom, 2026-11-17: show the height, almost 3D): olive
   lowlands, earth plateaus, --accent gold on the high massifs, --text
   cream on the highest crests. Same stops as tools/render-relief.py. */
const RELIEF_RAMP = [
  -9000, '#000000', 0, '#000000',
  1, '#23251a', 200, '#2d3020', 500, '#4a4630', 800, '#6e5f3e',
  1200, '#8f774b', 1700, '#b39558', 2300, '#e3c67a', 3000, '#f0ebe0',
];
const GOLD = '#e3c67a';

/* The overview wears a baked relief (tools/render-relief.py): a low sun,
   long cast shadows and colour by height, which a live hillshade can't
   do. It covers z10 tiles x 480–536, y 360–410 (keep in step with the
   script) and fades into the live relief as the camera flies in. */
const MAP_WINDOW = { x: 480 * 256, y: 360 * 256, w: 56 * 256, h: 50 * 256, world: 256 * 1024 };
function windowCorners({ x, y, w, h, world }) {
  const ll = (px, py) => [px / world * 360 - 180,
    Math.atan(Math.sinh(Math.PI * (1 - 2 * py / world))) * 180 / Math.PI];
  return [ll(x, y), ll(x + w, y), ll(x + w, y + h), ll(x, y + h)];
}

function mapStyle(areas) {
  return {
    version: 8,
    name: 'Frontier Trails relief',
    sources: {
      // Two sources over the same tiles: one raster-dem must not feed both
      // the visual layers and 3D terrain (journey.js explains why).
      dem: { type: 'raster-dem', tiles: [DEM_TILES], encoding: 'terrarium', tileSize: 256, minzoom: 0, maxzoom: 12 },
      'dem-terrain': { type: 'raster-dem', tiles: [DEM_TILES], encoding: 'terrarium', tileSize: 256, minzoom: 0, maxzoom: 12 },
      areas: { type: 'geojson', data: areas },
      baked: { type: 'image', url: '/img/frontier/relief-map.webp', coordinates: windowCorners(MAP_WINDOW) },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#000000' } },
      { id: 'relief', type: 'color-relief', source: 'dem',
        paint: { 'color-relief-color': ['interpolate', ['linear'], ['elevation'], ...RELIEF_RAMP] } },
      { id: 'shade', type: 'hillshade', source: 'dem',
        paint: {
          'hillshade-method': 'igor',
          'hillshade-exaggeration': 1,
          'hillshade-illumination-direction': 315,
          'hillshade-shadow-color': 'rgba(0, 0, 0, 0.75)',
          'hillshade-highlight-color': 'rgba(240, 235, 224, 0.3)',
          'hillshade-accent-color': 'rgba(0, 0, 0, 0)',
        } },
      { id: 'sea', type: 'color-relief', source: 'dem',
        paint: { 'color-relief-color': ['interpolate', ['linear'], ['elevation'],
          -12000, 'rgba(0, 0, 0, 1)', 0, 'rgba(0, 0, 0, 1)', 1, 'rgba(0, 0, 0, 0)'] } },
      { id: 'baked', type: 'raster', source: 'baked',
        paint: {
          'raster-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 8.3, 0],
          'raster-resampling': 'linear',
          'raster-fade-duration': 0,
        } },
      { id: 'areas-fill', type: 'fill', source: 'areas',
        paint: {
          'fill-color': GOLD,
          // Invisible until chosen (still clickable): the outline is the reveal.
          'fill-opacity': ['case',
            ['boolean', ['feature-state', 'active'], false], 0.12,
            ['boolean', ['feature-state', 'hover'], false], 0.06,
            0],
          'fill-opacity-transition': { duration: 400 },
        } },
      { id: 'areas-line', type: 'line', source: 'areas',
        paint: {
          'line-color': GOLD,
          'line-width': ['case', ['boolean', ['feature-state', 'active'], false], 2, 1.3],
          'line-opacity': ['case',
            ['boolean', ['feature-state', 'active'], false], 0.95,
            ['boolean', ['feature-state', 'hover'], false], 0.5,
            0],
          'line-opacity-transition': { duration: 400 },
          'line-dasharray': [2, 1.5],
        } },
    ],
    terrain: { source: 'dem-terrain', exaggeration: 1.5 },
    sky: {
      'sky-color': '#000000',
      'sky-horizon-blend': 0.5,
      'horizon-color': '#2a2318',
      'horizon-fog-blend': 0.5,
      'fog-color': '#000000',
      'fog-ground-blend': 0.72,
      'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 5, 0, 8, 1],
    },
  };
}

const PENINSULA = [[-9.5, 35.9], [3.4, 43.85]];

/* The outlines (tools/frontier-landscapes.json): one feature per
   landscape, each a MultiPolygon, since a landscape can sit in several
   parts of Spain. Feature ids are indices, so hover/active can use
   feature-state and light up all of a landscape's areas at once. */
function areasGeoJSON() {
  return {
    type: 'FeatureCollection',
    features: LANDS.map((l, i) => ({
      type: 'Feature', id: i, properties: { slug: l.slug },
      geometry: { type: 'MultiPolygon', coordinates: l.areas },
    })),
  };
}

/* ─────────────────────────────────────────────
   2. TILE WARM-UP (pattern from journey.js: fetch raw tiles, never move
   the camera while they land, so nothing gets cancelled)
───────────────────────────────────────────── */
function lonLatToTileXY(lon, lat, z) {
  const n = Math.pow(2, z);
  const x = Math.floor((lon + 180) / 360 * n);
  const rad = lat * Math.PI / 180;
  const y = Math.floor((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2 * n);
  return [Math.max(0, Math.min(n - 1, x)), Math.max(0, Math.min(n - 1, y))];
}

function bboxTileURLs([[lonMin, latMin], [lonMax, latMax]], z) {
  const [x0, y1] = lonLatToTileXY(lonMin, latMin, z);
  const [x1, y0] = lonLatToTileXY(lonMax, latMax, z);
  const urls = [];
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) {
    urls.push(DEM_TILES.replace('{z}', z).replace('{x}', x).replace('{y}', y));
  }
  return urls;
}

/* The whole peninsula at low zoom, and each landscape's main area at the
   zooms the camera flies through. */
function warmQueue() {
  const urls = [
    ...[5, 6].flatMap(z => bboxTileURLs(PENINSULA, z)),
    ...LANDS.flatMap(l => [7, 8, 9].flatMap(z => bboxTileURLs(l.focus, z))),
  ];
  return [...new Set(urls)];
}

async function warmTiles(urls, onProgress, { concurrency = 16, budgetMs = 8000 } = {}) {
  let i = 0, done = 0;
  async function worker() {
    while (i < urls.length) {
      const url = urls[i++];
      try { await fetch(url, { mode: 'cors' }); } catch {}
      done++;
      if (onProgress) onProgress(done / urls.length);
    }
  }
  await Promise.race([
    Promise.all(Array.from({ length: concurrency }, worker)),
    new Promise(res => setTimeout(res, budgetMs)),
  ]);
}

/* ─────────────────────────────────────────────
   3. BOOT
───────────────────────────────────────────── */
function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

function loadMapLibre() {
  return new Promise((res, rej) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = `/js/vendor/maplibre-gl.css`;
    document.head.appendChild(css);
    const s = document.createElement('script');
    s.src = `/js/vendor/maplibre-gl.js`;
    s.onload = res;
    s.onerror = () => rej(new Error('MapLibre failed to load'));
    document.head.appendChild(s);
  });
}

/* Two frames, one flick: a wheel scroll down in the intro glides onto the
   map, and a scroll up from the map glides back. (CSS scroll-snap covers
   touch and the keyboard; on its own it bounces small wheel steps back.) */
function glideBetweenFrames(stage) {
  let gliding = false;
  const glide = to => {
    if (gliding) return;
    gliding = true;
    window.scrollTo({ top: to, behavior: 'smooth' });
    setTimeout(() => { gliding = false; }, 900);
  };
  window.addEventListener('wheel', e => {
    if (e.ctrlKey || Math.abs(e.deltaY) < 2 || e.target.closest('.frontier-credits-body')) return;
    const top = stage.offsetTop, y = window.scrollY;
    if (e.deltaY > 0 && y < top - 2) { e.preventDefault(); glide(top); }
    else if (e.deltaY < 0 && y > 2 && y <= top + 2) { e.preventDefault(); glide(0); }
  }, { passive: false });
  document.querySelector('.frontier-scroll-cue').addEventListener('click', e => {
    e.preventDefault();
    glide(stage.offsetTop);
  });
}

async function boot() {
  // Static mode stays as the HTML ships it: relief image + the linked list.
  if (IS_MOBILE || REDUCED_MOTION || !hasWebGL()) return;

  const stage = document.getElementById('frontier-stage');
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderText = document.getElementById('loader-percent');
  const setProgress = f => {
    loaderBar.style.width = (f * 100).toFixed(0) + '%';
    loaderText.textContent = Math.round(f * 100) + '%';
    loader.setAttribute('aria-valuenow', Math.round(f * 100));
  };
  const hideLoader = () => {
    loader.classList.add('hidden');
    setTimeout(() => { loader.style.display = 'none'; }, 900);
  };
  const fallBack = e => {
    console.error(e);
    document.body.classList.remove('has-map');
    hideLoader();
  };

  // The loader sits over the map only, so the intro can be read while the
  // map warms up below it.
  loader.classList.remove('hidden');
  document.body.classList.add('has-map');
  setProgress(0.1);
  glideBetweenFrames(stage);

  try { await loadMapLibre(); } catch (e) { fallBack(e); return; }
  setProgress(0.3);

  const areas = areasGeoJSON();
  const map = new maplibregl.Map({
    container: 'frontier-map',
    style: mapStyle(areas),
    center: [-3.05, 40.0],
    zoom: 5.2,
    // Clicks on the areas need the map's events, but the visitor never
    // pans or zooms it (the mouse wheel scrolls the page, not the map):
    // the camera only moves when a landscape is chosen.
    interactive: true,
    dragPan: false, scrollZoom: false, boxZoom: false, dragRotate: false, keyboard: false,
    doubleClickZoom: false, touchZoomRotate: false, touchPitch: false,
    attributionControl: false,   // credits are in the page's "Map & photo credits"
    maxPitch: 70,
    antialias: true,
    fadeDuration: 0,
  });
  map.on('error', e => {
    const msg = (e && e.error && e.error.message) || String(e);
    if (/elevation-tiles-prod/.test(msg)) return;   // dropped tile fetches: noise
    console.error('[maplibre]', msg);
  });

  try {
    await new Promise((res, rej) => { map.on('load', res); setTimeout(() => rej(new Error('map load timeout')), 30000); });
  } catch (e) { fallBack(e); return; }

  // Land on all of Spain, leaving room for the list on the right (its
  // width grows with the screen, so measure it).
  const legend = document.querySelector('.frontier-legend');
  function overview() {
    const W = stage.clientWidth;
    const right = Math.min(legend.offsetWidth + 40, W * 0.34);
    const fit = map.cameraForBounds(PENINSULA, { padding: { top: 90, bottom: 40, left: W * 0.08, right } });
    // A touch closer on wide screens; none on narrow ones, so the coast
    // isn't clipped.
    const closer = Math.max(0, Math.min(0.25, (W - 1000) / 1200));
    return fit
      ? { center: [fit.center.lng, fit.center.lat - 0.5], zoom: fit.zoom + closer, pitch: 28, bearing: 0 }
      : { center: [-3.05, 40.0], zoom: 5.2, pitch: 28, bearing: 0 };
  }
  let OVERVIEW = overview();

  await warmTiles(warmQueue(), f => setProgress(0.35 + f * 0.6));
  map.jumpTo(OVERVIEW);
  if (!map.areTilesLoaded()) await new Promise(res => { map.once('idle', res); setTimeout(res, 2500); });
  setProgress(1);
  hideLoader();

  // The list: a name is a link once its page exists, a plain item before.
  const legendItems = Array.from(document.querySelectorAll('.frontier-legend [data-slug]'));
  legendItems.forEach(el => {
    if (el.tagName !== 'A') { el.tabIndex = 0; el.setAttribute('role', 'button'); }
  });
  const back = document.getElementById('frontier-back');
  const detail = document.getElementById('frontier-detail');
  const featureId = Object.fromEntries(areas.features.map(f => [f.properties.slug, f.id]));
  let selected = null;
  let hovered = null;

  /* Hover lights up all of a landscape's areas — it never moves the camera. */
  function hover(slug) {
    if (hovered === slug) return;
    if (hovered != null) map.setFeatureState({ source: 'areas', id: featureId[hovered] }, { hover: false });
    hovered = slug;
    if (slug != null) map.setFeatureState({ source: 'areas', id: featureId[slug] }, { hover: true });
    legendItems.forEach(a => a.classList.toggle('is-hover', a.dataset.slug === slug));
  }

  // Until a landscape has its page, the zoom ends on a small card: its
  // number and name, and the way back.
  function fillDetail(l) {
    detail.querySelector('.frontier-detail-place').textContent = `0${LANDS.indexOf(l) + 1}`;
    detail.querySelector('.frontier-detail-name').textContent = l.name;
  }

  // If the map isn't fully in view yet, bring it up before flying in.
  function bringIntoView() {
    if (Math.abs(stage.getBoundingClientRect().top) > 4) stage.scrollIntoView({ behavior: 'smooth' });
  }

  /* A click: the outline lights up and the camera flies to the
     landscape's most obvious general area — a short transition — and then
     its page opens (Tom, 2026-11-17: one click, no extra button). */
  function select(slug) {
    if (slug === selected) return;
    bringIntoView();
    hover(null);
    if (selected != null) map.setFeatureState({ source: 'areas', id: featureId[selected] }, { active: false });
    selected = slug;
    const l = BY_SLUG[slug];
    stage.classList.add('is-focused');
    map.setFeatureState({ source: 'areas', id: featureId[slug] }, { active: true });
    if (!l.page) {
      fillDetail(l);
      detail.hidden = false;
      detail.focus({ preventScroll: true });   // keyboard users land in the card
    }
    const w = stage.clientWidth;
    map.fitBounds(l.focus, {
      padding: { top: 110, bottom: 90, left: l.page ? 80 : Math.min(480, w * 0.34), right: 80 },
      pitch: 50, bearing: -8, duration: 1700, maxZoom: 9, essential: true,
    });
    if (l.page) map.once('moveend', () => { if (selected === slug) window.location.assign(l.page); });
  }

  function reset(instant) {
    if (selected == null) return;
    const was = selected;
    map.setFeatureState({ source: 'areas', id: featureId[selected] }, { active: false });
    selected = null;
    stage.classList.remove('is-focused');
    detail.hidden = true;
    const item = legendItems.find(a => a.dataset.slug === was);
    if (item && !instant) item.focus({ preventScroll: true });
    if (instant) map.jumpTo(OVERVIEW);
    else map.flyTo({ ...OVERVIEW, duration: 1600, essential: true });
  }

  // The list: hover highlights, click (or Enter) flies in.
  legendItems.forEach(el => {
    const slug = el.dataset.slug;
    el.addEventListener('mouseenter', () => hover(slug));
    el.addEventListener('mouseleave', () => hover(null));
    el.addEventListener('click', e => { e.preventDefault(); select(slug); });
    el.addEventListener('keydown', e => {
      if (el.tagName !== 'A' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(slug); }
    });
  });

  // The areas on the map work the same way.
  map.on('mousemove', 'areas-fill', e => {
    if (selected != null) return;
    map.getCanvas().style.cursor = 'pointer';
    hover(e.features[0].properties.slug);
  });
  map.on('mouseleave', 'areas-fill', () => {
    map.getCanvas().style.cursor = '';
    hover(null);
  });
  map.on('click', 'areas-fill', e => {
    if (selected == null) select(e.features[0].properties.slug);
  });

  // A resized window (or a tablet turned): fit all of Spain again.
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      OVERVIEW = overview();
      if (selected == null) map.jumpTo(OVERVIEW);
    }, 200);
  });

  back.addEventListener('click', () => reset());
  document.addEventListener('keydown', e => { if (e.key === 'Escape') reset(); });
  // Coming back with the browser's Back button: start from all of Spain.
  window.addEventListener('pageshow', e => { if (e.persisted) reset(true); });
}

boot();

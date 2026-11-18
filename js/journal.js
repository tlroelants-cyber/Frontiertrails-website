/* ==============================================
   FRONTIER TRAILS — journal.js
   The Journal stream: strips of film you can drag, and the viewer a photo
   lifts into when clicked. Without JS the page is a plain stream of links
   to each story and field note.
   ============================================== */
(function () {
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stream = document.querySelector('.j-stream');
  if (!stream) return;
  const STORIES = JSON.parse(document.getElementById('journal-data').textContent);
  const BY_SLUG = Object.fromEntries(STORIES.map(s => [s.slug, s]));

  /* ── Drag the film ──
     Mouse only (touch scrolls natively). It keeps a little momentum on
     release, like pulling film off a reel. A drag never counts as a click. */
  document.querySelectorAll('.film[data-drag]').forEach(film => {
    let startX = 0, startScroll = 0, lastX = 0, lastT = 0, velocity = 0, dragging = false, moved = false, raf = 0;
    film.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      cancelAnimationFrame(raf);
      dragging = true; moved = false;
      startX = lastX = e.clientX; startScroll = film.scrollLeft; lastT = performance.now(); velocity = 0;
    });
    window.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5 && !moved) { moved = true; film.classList.add('is-dragging'); }
      if (!moved) return;
      film.scrollLeft = startScroll - dx;
      const now = performance.now();
      velocity = (e.clientX - lastX) / Math.max(1, now - lastT);
      lastX = e.clientX; lastT = now;
    });
    window.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      film.classList.remove('is-dragging');
      if (!moved || REDUCED_MOTION) return;
      let v = velocity * 16;
      (function coast() {
        if (Math.abs(v) < 0.4) return;
        film.scrollLeft -= v;
        v *= 0.94;
        raf = requestAnimationFrame(coast);
      })();
    });
    film.addEventListener('click', e => {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
  });

  /* ── The viewer ──
     A photo lifts out of the journal into a full-screen view, with the
     whole picture (panoramas scroll sideways) and the full story. The
     address bar follows, so each story stays shareable. */
  const viewer = document.getElementById('j-viewer');
  const media = viewer.querySelector('.j-viewer-media');
  const order = STORIES.map(s => s.slug);
  let current = null;
  let pushed = false;
  let lastFocus = null;

  function render(s) {
    media.innerHTML = s.images.map((img, k) =>
      `<img src="${img.src}" alt="${k === 0 ? (s.place ? s.title + ', ' + s.place : s.title) : ''}" width="${img.w}" height="${img.h}">`).join('');
    viewer.querySelector('.j-v-meta').textContent = (s.place ? s.place + ' · ' : '') + s.date;
    viewer.querySelector('.j-v-title').textContent = s.title;
    viewer.querySelector('.j-v-body').innerHTML = s.body.map(p => `<p>${p.replace(/</g, '&lt;')}</p>`).join('');
    const specs = viewer.querySelector('.j-v-specs');
    specs.textContent = s.specs ? 'SPECS: Shot on ' + s.specs : '';
    specs.hidden = !s.specs;
    viewer.querySelector('.j-v-page').href = `/journal/${s.slug}/`;
    viewer.querySelector('.j-v-ig').href = `https://www.instagram.com/p/${s.ig}/`;
    media.querySelectorAll('img').forEach(img => { if (!img.complete) img.addEventListener('load', fit); });
  }

  /* Centre the photos when they fit, start at the first one when they don't.
     Measured once the viewer is showing (a hidden viewer has no width). */
  function fit() {
    media.classList.remove('fits');
    media.classList.toggle('fits', media.scrollWidth <= media.clientWidth + 2);
    media.scrollLeft = 0;
  }

  /* FLIP: start the media where the clicked photo was, then let it fly into place. */
  function lift(from) {
    if (!from || REDUCED_MOTION) return;
    const a = from.getBoundingClientRect();
    const b = media.getBoundingClientRect();
    const first = media.querySelector('img');
    const w = first ? Math.min(b.width, first.getBoundingClientRect().width || b.width) : b.width;
    const x = media.classList.contains('fits') ? b.left + (b.width - media.scrollWidth) / 2 : b.left;
    media.style.transition = 'none';
    media.style.transform = `translate(${a.left - x}px, ${a.top - b.top}px) scale(${a.width / w}, ${a.height / b.height})`;
    media.getBoundingClientRect();
    media.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.9, 0.25, 1)';
    media.style.transform = 'none';
  }

  function open(slug, from, push) {
    const s = BY_SLUG[slug];
    if (!s) return false;
    if (!current) lastFocus = document.activeElement;
    current = slug;
    render(s);
    viewer.hidden = false;
    fit();
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => { viewer.classList.add('is-open'); lift(from); });
    viewer.querySelector('.j-viewer-close').focus({ preventScroll: true });
    if (push) {
      history.pushState({ story: slug }, '', `/journal/${slug}/`);
      pushed = true;
    } else if (pushed) {
      history.replaceState({ story: slug }, '', `/journal/${slug}/`);
    }
    return true;
  }

  function close(fromPop) {
    if (!current) return;
    current = null;
    viewer.classList.remove('is-open');
    viewer.hidden = true;
    media.style.transform = '';
    document.body.style.overflow = '';
    if (!fromPop && pushed) history.back();
    pushed = false;
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  function step(dir) {
    const i = order.indexOf(current);
    open(order[(i + dir + order.length) % order.length], null, false);
  }

  stream.addEventListener('click', e => {
    const t = e.target.closest('[data-open]');
    if (!t || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const from = t.closest('.film-frame, .j-photo, .j-polaroid, .j-gate-view') ||
      t.closest('.j-entry').querySelector('.j-photo, .film-frame, .j-gate-view');
    if (open(t.dataset.open, from, true)) e.preventDefault();
  });
  viewer.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => close(false)));
  viewer.querySelector('.j-viewer-prev').addEventListener('click', () => step(-1));
  viewer.querySelector('.j-viewer-next').addEventListener('click', () => step(1));
  document.addEventListener('keydown', e => {
    if (!current) return;
    if (e.key === 'Escape') close(false);
    if (e.key === 'ArrowRight' && !e.target.closest('.j-viewer-media')) step(1);
    if (e.key === 'ArrowLeft' && !e.target.closest('.j-viewer-media')) step(-1);
  });
  window.addEventListener('popstate', e => {
    if (e.state && e.state.story) open(e.state.story, null, false);
    else close(true);
  });
})();

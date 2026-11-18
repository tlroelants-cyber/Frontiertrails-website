/* ==============================================
   FRONTIER TRAILS — app.js
   Scroll-driven dual-video · GSAP + Lenis
   ============================================== */

/* ── Constants ── */
const FRAME_COUNT  = 242;
const FRAME_SPEED  = 2.0;   // video completes at ~50% scroll
const IMAGE_SCALE  = 0.88;  // padded-cover: 0.82–0.90 sweet spot

// Serve a lighter 720px frame set to phones (half the bytes, drawn contained anyway)
const IS_MOBILE_VP = window.innerWidth < 768;
const FRAME_PATH   = IS_MOBILE_VP ? 'frames-mobile/frame_' : 'frames/frame_';

// Campfire idle loop — once the sequence completes, ping-pong these
// static-camera tail frames so the flame keeps flickering (nothing else moves).
const FIRE_START = 229;              // frame_0230 — camp fully set, camera locked
const FIRE_END   = FRAME_COUNT - 1;  // frame_0242
const FIRE_FPS   = 8;

// Respect the OS motion preference. Scroll-driven motion (frame scrub, circle
// wipe) stays — the user drives it. What goes: the smooth-scroll hijack, the
// section entrance transforms, and the campfire idle loop.
const PREFERS_REDUCED_MOTION =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── DOM refs ── */
const canvas        = document.getElementById('canvas');
const ctx           = canvas.getContext('2d');
const canvasWrap    = document.getElementById('canvas-wrap');
const scrollContainer = document.getElementById('scroll-container');
const heroSection   = document.getElementById('hero');
const loader        = document.getElementById('loader');
const loaderBar     = document.getElementById('loader-bar');
const loaderPercent = document.getElementById('loader-percent');
const darkOverlay   = document.getElementById('dark-overlay');

/* ── State ── */
const frames  = new Array(FRAME_COUNT).fill(null);
const sampled = {};          // bgColor cache by frame index
let currentFrame = 0;
let bgColor = '#000000';

/* ─────────────────────────────────────────────
   1. CANVAS — resize & DPR handling
───────────────────────────────────────────── */
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w   = window.innerWidth;
  const h   = window.innerHeight;
  canvas.width  = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
  // setTransform, not scale() — scale() multiplies into the existing matrix, so
  // every resize or device rotation would compound the DPR again.
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (frames[currentFrame]) drawFrame(currentFrame);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* ─────────────────────────────────────────────
   2. FRAME RENDERING — padded cover mode
───────────────────────────────────────────── */
function sampleBgColor(img) {
  // Draw to temp canvas, sample 4 corner pixels, darken to blend with black
  const tmp = document.createElement('canvas');
  const size = 4;
  tmp.width = img.naturalWidth;
  tmp.height = img.naturalHeight;
  const tc = tmp.getContext('2d');
  tc.drawImage(img, 0, 0);

  const corners = [
    tc.getImageData(0, 0, size, size).data,
    tc.getImageData(img.naturalWidth - size, 0, size, size).data,
    tc.getImageData(0, img.naturalHeight - size, size, size).data,
    tc.getImageData(img.naturalWidth - size, img.naturalHeight - size, size, size).data,
  ];

  let r = 0, g = 0, b = 0, n = 0;
  corners.forEach(d => {
    for (let i = 0; i < d.length; i += 4) {
      r += d[i]; g += d[i+1]; b += d[i+2]; n++;
    }
  });

  // Blend heavily toward black so edges melt into page bg
  const blend = 0.25;
  r = Math.round((r / n) * blend);
  g = Math.round((g / n) * blend);
  b = Math.round((b / n) * blend);
  return `rgb(${r},${g},${b})`;
}

function drawFrame(index) {
  const img = frames[index];
  if (!img || !img.complete || !img.naturalWidth) return;

  const cw = window.innerWidth;
  const ch = window.innerHeight;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  // Mobile portrait + landscape image: contain so the full car is visible.
  // Desktop: padded-cover (IMAGE_SCALE gives breathing room around edges).
  const isMobile = cw < 768;
  const scale = isMobile
    ? Math.min(cw / iw, ch / ih)
    : Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, dw, dh);
}

/* ─────────────────────────────────────────────
   3. PRELOADER — two-phase loading
───────────────────────────────────────────── */
function padNum(n) {
  return String(n).padStart(4, '0');
}

function loadFrame(index) {
  return new Promise(resolve => {
    const img = new Image();
    img.src = `${FRAME_PATH}${padNum(index + 1)}.webp`;
    img.onload = () => {
      frames[index] = img;
      if (index % 20 === 0) sampled[index] = sampleBgColor(img);
      resolve();
    };
    img.onerror = () => resolve();
  });
}

async function preloadFrames() {
  // Phase 1: first 10 frames — fast first paint
  await Promise.all(Array.from({ length: 10 }, (_, i) => loadFrame(i)));

  if (frames[0]) {
    bgColor = sampled[0] || '#000';
    drawFrame(0);
  }

  // Phase 2: load the rest, update progress bar
  let loaded = 10;
  await Promise.all(
    Array.from({ length: FRAME_COUNT - 10 }, (_, i) =>
      loadFrame(i + 10).then(() => {
        loaded++;
        const pct = Math.round((loaded / FRAME_COUNT) * 100);
        loaderBar.style.width = pct + '%';
        loaderPercent.textContent = pct + '%';
        loader.setAttribute('aria-valuenow', String(pct));
      })
    )
  );

  // All frames ready — dismiss loader
  await new Promise(r => setTimeout(r, 400));
  loader.classList.add('hidden');
  setTimeout(() => { loader.style.display = 'none'; }, 900);
}

/* ─────────────────────────────────────────────
   4. LENIS SMOOTH SCROLL
───────────────────────────────────────────── */
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

let lenis = null;

// Reduced motion gets native scroll — the smooth-scroll hijack is exactly the
// kind of motion the preference is asking us to drop.
if (!isTouchDevice && !PREFERS_REDUCED_MOTION) {
  lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
} else {
  // Native scroll on touch — ScrollTrigger fires on native scroll automatically
  gsap.ticker.lagSmoothing(0);
}

/* ─────────────────────────────────────────────
   4b. SMOOTH PROGRESS LERP
   Lenis smooths wheel scroll but can't intercept
   native scrollbar dragging. This RAF loop lerps
   toward the raw scroll progress so both inputs
   feel equally cinematic.
───────────────────────────────────────────── */
let _rawProgress    = 0;
let _smoothProgress = 0;
let _lastHeroOpacity = null;   // guards the per-frame style writes below
let _lastWipePct     = null;

function _runSmoothLoop() {
  _smoothProgress += (_rawProgress - _smoothProgress) * 0.18;

  // Canvas frame
  const acc = Math.min(_smoothProgress * FRAME_SPEED, 1);
  let index;
  if (acc >= 1) {
    if (PREFERS_REDUCED_MOTION) {
      // Hold on a single frame instead of flickering the fire indefinitely.
      index = FIRE_START;
    } else {
      // Sequence done — keep the fire alive by ping-ponging the tail frames.
      const span  = FIRE_END - FIRE_START;
      const cycle = (performance.now() / 1000) * FIRE_FPS % (span * 2);
      const tri   = cycle <= span ? cycle : span * 2 - cycle;
      index = FIRE_START + Math.round(tri);
    }
  } else {
    index = Math.min(Math.floor(acc * FRAME_COUNT), FRAME_COUNT - 1);
  }
  if (index !== currentFrame) {
    currentFrame = index;
    bgColor = sampled[Math.floor(index / 20) * 20] || '#000';
    drawFrame(currentFrame);
  }

  // Hero opacity + circle-wipe clip-path.
  // Both settle to a constant after ~7% scroll, so only write when the value
  // actually changes. Re-assigning clipPath every frame makes the compositor
  // re-parse and re-clip the fixed full-viewport canvas layer for the whole
  // remaining 1200vh of scrolling, which is pure waste.
  const p = _smoothProgress;

  const heroOpacity = Math.max(0, 1 - p * 20).toFixed(3);
  if (heroOpacity !== _lastHeroOpacity) {
    _lastHeroOpacity = heroOpacity;
    heroSection.style.opacity = heroOpacity;
    // Once invisible, take it out of the paint path entirely.
    heroSection.style.visibility = heroOpacity === '0.000' ? 'hidden' : '';
  }

  const wipe = Math.min(1, Math.max(0, (p - 0.004) / 0.065));
  const wipePct = (wipe * 82).toFixed(2);
  if (wipePct !== _lastWipePct) {
    _lastWipePct = wipePct;
    canvasWrap.style.clipPath = `circle(${wipePct}% at 50% 50%)`;
  }

  requestAnimationFrame(_runSmoothLoop);
}

/* ─────────────────────────────────────────────
   5. FRAME → SCROLL BINDING
───────────────────────────────────────────── */
function initFrameScroll() {
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate(self) { _rawProgress = self.progress; },
  });
}

/* ─────────────────────────────────────────────
   7. SECTION POSITIONING
───────────────────────────────────────────── */
function positionSections() {
  const totalH = scrollContainer.offsetHeight;
  document.querySelectorAll('.scroll-section').forEach(section => {
    const enter = parseFloat(section.dataset.enter) / 100;
    const leave = parseFloat(section.dataset.leave) / 100;
    const mid   = (enter + leave) / 2;
    section.style.top       = mid * totalH + 'px';
    section.style.transform = 'translateY(-50%)';
  });
}

/* ─────────────────────────────────────────────
   8. SECTION ANIMATION SYSTEM
───────────────────────────────────────────── */
function setupSectionAnimation(section) {
  const type    = section.dataset.animation;
  const persist = section.dataset.persist === 'true';
  const enter   = parseFloat(section.dataset.enter) / 100;
  const leave   = parseFloat(section.dataset.leave) / 100;

  const targets = section.querySelectorAll(
    '.section-label, .section-heading, .section-body, .section-list li, ' +
    '.cta-label, .cta-heading, .cta-body, .waitlist-form, .stat, ' +
    '.routes-heading, .route-card, .routes-footer, ' +
    '.mid-cta-text, .stats-frame'
  );

  // Hide section initially (autoAlpha = opacity + visibility:hidden,
  // so hidden sections are also removed from the tab/focus order)
  gsap.set(section, { autoAlpha: 0 });

  // Build entrance timeline
  const tl = gsap.timeline({ paused: true });

  const D = { stagger: 0.13, ease: 'power3.out' };

  // Reduced motion: keep the reveal (it signals "this section is now live")
  // but strip the travel — opacity only, no translation or rotation.
  if (PREFERS_REDUCED_MOTION) {
    tl.from(targets, { opacity: 0, duration: 0.4, stagger: 0.05 });
  } else {
    switch (type) {
      case 'fade-up':
        tl.from(targets, { y: 55,  opacity: 0, duration: 0.95, ...D });
        break;
      case 'slide-left':
        tl.from(targets, { x: -90, opacity: 0, duration: 0.95, ...D });
        break;
      case 'slide-right':
        tl.from(targets, { x: 90,  opacity: 0, duration: 0.95, ...D });
        break;
      case 'stagger-up':
        tl.from(targets, { y: 65,  opacity: 0, duration: 0.85,
                           stagger: 0.16, ease: 'power3.out' });
        break;
      case 'rotate-in':
        tl.from(targets, { y: 45, rotation: 2, opacity: 0, duration: 0.95, ...D });
        break;
      default:
        tl.fromTo(section, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    }
  }

  let visible = false;

  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate({ progress: p }) {
      const inRange = p >= enter && p <= leave;

      if (inRange && !visible) {
        visible = true;
        gsap.killTweensOf(section);
        gsap.set(section, { autoAlpha: 1 });
        section.classList.add('is-active');
        tl.restart();
      } else if (!inRange && visible && !persist) {
        visible = false;
        section.classList.remove('is-active');
        // Soft fade-out instead of a hard cut when scrolling back through
        gsap.to(section, {
          autoAlpha: 0, duration: 0.25, ease: 'power1.out',
          onComplete() { tl.pause(0); }, // reset for re-entry
        });
      } else if (persist && p > leave && visible) {
        // persisted CTA: stays visible forever after entry
        gsap.set(section, { autoAlpha: 1 });
      }
    },
  });
}

/* ─────────────────────────────────────────────
   9. COUNTER ANIMATIONS
───────────────────────────────────────────── */
function initCounters() {
  document.querySelectorAll('.stat-number').forEach(el => {
    if (el.dataset.static) return;
    const target   = parseFloat(el.dataset.value);
    const decimals = parseInt(el.dataset.decimals || '0');
    const section  = el.closest('.scroll-section');
    const enter    = parseFloat(section.dataset.enter) / 100;

    let animated = false;

    ScrollTrigger.create({
      trigger: scrollContainer,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate({ progress: p }) {
        if (p >= enter && !animated) {
          animated = true;
          gsap.to(el, {
            textContent: target,
            duration: 2.5,
            ease: 'power2.out',
            snap: { textContent: decimals === 0 ? 1 : 0.01 },
            onUpdate() {
              const v = parseFloat(el.textContent);
              el.textContent = decimals === 0
                ? Math.round(v)
                : v.toFixed(decimals);
            },
          });
        } else if (p < enter && animated) {
          animated = false;
          gsap.killTweensOf(el);
          el.textContent = '0';
        }
      },
    });
  });
}

/* ─────────────────────────────────────────────
   11. DARK OVERLAY (stats section)
───────────────────────────────────────────── */
function initDarkOverlay() {
  const stats = document.querySelector('.section-stats');
  if (!stats) return;

  const enter = parseFloat(stats.dataset.darkEnter || stats.dataset.enter) / 100;
  const leave = parseFloat(stats.dataset.darkLeave || stats.dataset.leave) / 100;
  const fade  = 0.04;

  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate({ progress: p }) {
      let o = 0;
      if      (p >= enter - fade && p < enter)  o = (p - (enter - fade)) / fade;
      else if (p >= enter && p <= leave)         o = 0.91;
      else if (p > leave && p <= leave + fade)   o = 0.91 * (1 - (p - leave) / fade);
      darkOverlay.style.opacity = o;
    },
  });
}

/* ─────────────────────────────────────────────
   12. CUSTOM CURSOR
───────────────────────────────────────────── */
function initCursor() {
  const wrap = document.getElementById('cursor');
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!wrap || !dot || !ring) return;

  // No JS cursor on touch, and none under reduced motion (the ring lerps).
  if (isTouchDevice || PREFERS_REDUCED_MOTION) return;

  // Only now hide the native pointer — if this function never runs because the
  // script is blocked or still loading, the real cursor stays put.
  document.documentElement.classList.add('has-custom-cursor');

  let mx = 0, my = 0;
  let rx = 0, ry = 0;

  let tracking = false;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    // Reveal on first move, and snap the ring there so it doesn't fly in
    // from the corner.
    if (!tracking) {
      tracking = true;
      rx = mx; ry = my;
      wrap.classList.add('is-tracking');
    }
  });

  (function animateRing() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  // The menu button and the menu itself are plain line work: no ring
  // drawn around them (it read as a circle around the three lines).
  const isMenu = el => !!el.closest('#hamburger, #mobile-nav');

  document.querySelectorAll('a, button, .cta-button').forEach(el => {
    if (isMenu(el)) return;
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });

  const menuBtn = document.getElementById('hamburger');
  if (menuBtn) {
    menuBtn.addEventListener('mouseenter', () => ring.classList.add('is-hidden'));
    menuBtn.addEventListener('mouseleave', () => ring.classList.remove('is-hidden'));
  }
}

/* ─────────────────────────────────────────────
   13. WAITLIST FORM
───────────────────────────────────────────── */
function initWaitlist() {
  const form    = document.getElementById('waitlist-form');
  const success = document.getElementById('waitlist-success');
  const error   = document.getElementById('waitlist-error');
  if (!form) return;

  const btn = form.querySelector('.waitlist-submit');
  // Read the label from the markup rather than repeating it here, so the button
  // can't silently rename itself when the copy in index.html changes.
  const btnLabel = btn ? btn.textContent.trim() : 'Apply for early access';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.textContent = 'Sending…';
    btn.disabled = true;
    error.style.display = 'none';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        gsap.to(form, {
          opacity: 0, y: -12, duration: 0.4, ease: 'power2.in',
          onComplete() {
            form.style.display = 'none';
            success.style.display = 'block';
            gsap.from(success, { opacity: 0, y: 16, duration: 0.7, ease: 'power3.out' });
          },
        });
      } else {
        throw new Error('non-ok response');
      }
    } catch {
      error.style.display = 'block';
      error.setAttribute('role', 'alert');
      gsap.from(error, { opacity: 0, duration: 0.4 });
      btn.textContent = btnLabel;
      btn.disabled = false;
    }
  });
}

/* ─────────────────────────────────────────────
   14. NAV — compact on scroll
───────────────────────────────────────────── */
function initNav() {
  const header = document.getElementById('site-header');

  ScrollTrigger.create({
    trigger: scrollContainer,
    start: '1px top',
    onEnter:     () => header.classList.add('scrolled'),
    onLeaveBack: () => header.classList.remove('scrolled'),
  });

  // Ghost-hamburger dim-on-scroll + the hamburger menu itself live in js/nav.js
  // (shared across every page, not just the homepage).
}

/* ─────────────────────────────────────────────
   15. JOIN NOW — scroll to the waitlist form

   The CTA section is absolutely positioned inside #scroll-container by
   positionSections(), centred on its own midpoint via translateY(-50%). So
   the scroll position that centres it in the viewport is its offset within
   the container, plus the container's offset in the page, minus half a
   viewport. Scrolling to the page bottom instead lands past the form.
───────────────────────────────────────────── */
function sectionScrollTarget(section) {
  const max = document.body.scrollHeight - window.innerHeight;
  if (!section) return max;

  const y = scrollContainer.offsetTop + section.offsetTop - window.innerHeight / 2;
  return Math.max(0, Math.min(y, max));
}

function scrollToY(y, duration) {
  if (lenis) {
    lenis.scrollTo(y, { duration });
  } else {
    window.scrollTo({
      top: y,
      behavior: PREFERS_REDUCED_MOTION ? 'auto' : 'smooth',
    });
  }
}

function initJoinNow() {
  const btns = [
    document.getElementById('join-now-btn'),
    document.getElementById('hero-cta-btn'),
    document.getElementById('mid-cta-btn'),
    document.getElementById('mobile-apply-btn'),
    document.getElementById('footer-apply-btn'),
  ].filter(Boolean);
  const cta = document.getElementById('cta');
  btns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      scrollToY(sectionScrollTarget(cta), 2);
    });
  });

  // Arriving from another page's "Apply" link (/#cta): the section only has
  // a real position once positionSections() has run, so the browser's own
  // anchor jump lands in the wrong place. Jump there ourselves.
  if (location.hash === '#cta') {
    requestAnimationFrame(() => window.scrollTo(0, sectionScrollTarget(cta)));
  }
}

/* ─────────────────────────────────────────────
   15b. CHAPTER PROGRESS INDICATOR (desktop)
───────────────────────────────────────────── */
function initChapterNav() {
  const nav = document.getElementById('chapter-nav');
  if (!nav || isTouchDevice || window.innerWidth < 900) return;

  const chapters = [...document.querySelectorAll('.scroll-section')]
    .filter(s => s.querySelector('.section-label'))
    .map(s => ({
      el: s,
      enter: parseFloat(s.dataset.enter) / 100,
      leave: parseFloat(s.dataset.leave) / 100,
      num: (s.querySelector('.section-label').textContent.match(/\d{3}/) || ['•'])[0],
    }));
  if (!chapters.length) return;

  chapters.forEach(ch => {
    const dot = document.createElement('button');
    dot.className = 'chapter-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Chapter ${ch.num}`);
    dot.innerHTML = `<span class="chapter-num">${ch.num}</span>`;
    // Section progress is a fraction of #scroll-container, not of the whole
    // page — the page also holds the hero, hook, FAQ and footer. Resolve
    // against the section's real position instead.
    dot.addEventListener('click', () => {
      scrollToY(sectionScrollTarget(ch.el), 1.4);
    });
    ch.dot = dot;
    nav.appendChild(dot);
  });

  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate({ progress: p }) {
      nav.classList.toggle('visible', p > 0.04 && p < 0.995);
      let active = -1;
      chapters.forEach((ch, i) => { if (p >= ch.enter - 0.02) active = i; });
      chapters.forEach((ch, i) => ch.dot.classList.toggle('active', i === active));
    },
  });
}

/* ─────────────────────────────────────────────
   16. HOOK SECTION ANIMATION
───────────────────────────────────────────── */
function initHookSection() {
  const hook    = document.getElementById('hook');
  if (!hook) return;

  const heading = hook.querySelector('.hook-heading');
  const sub     = hook.querySelector('.hook-sub');

  gsap.set([heading, sub], { opacity: 0, y: 50 });

  ScrollTrigger.create({
    trigger: hook,
    start: 'top 65%',
    onEnter() {
      gsap.to(heading, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' });
      gsap.to(sub,     { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', delay: 0.35 });
    },
  });
}

/* ─────────────────────────────────────────────
   17. MOBILE SECTION TIMING OVERRIDES
───────────────────────────────────────────── */
function applyMobileOverrides() {
  if (window.innerWidth >= 768) return;

  // Routes: wider window so all 3 cards have time to be read
  const routes = document.querySelector('.section-routes');
  if (routes) {
    routes.dataset.enter = '58';
    routes.dataset.leave = '82';
  }

  // Stats: appear clearly after routes, with room to breathe
  const stats = document.querySelector('.section-stats');
  if (stats) {
    stats.dataset.enter = '80';
    stats.dataset.leave = '94';
    stats.dataset.darkEnter = '62';
    stats.dataset.darkLeave = '96';
  }

  // CTA: start after stats has cleared
  const cta = document.querySelector('.section-cta');
  if (cta) {
    cta.dataset.enter = '92';
    cta.dataset.leave = '100';
  }
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
function init() {
  gsap.registerPlugin(ScrollTrigger);

  applyMobileOverrides();
  positionSections();
  initFrameScroll();
  _runSmoothLoop();
  initDarkOverlay();
  initCounters();
  initHookSection();
  initCursor();
  initWaitlist();
  initNav();
  initJoinNow();
  initChapterNav();

  document.querySelectorAll('.scroll-section').forEach(setupSectionAnimation);

  window.addEventListener('resize', positionSections);
}

preloadFrames().then(init);

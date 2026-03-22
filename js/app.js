/* ==============================================
   FRONTIER TRAILS — app.js
   Scroll-driven dual-video · GSAP + Lenis
   ============================================== */

/* ── Constants ── */
const FRAME_COUNT  = 242;
const FRAME_SPEED  = 2.0;   // video completes at ~50% scroll
const IMAGE_SCALE  = 0.88;  // padded-cover: 0.82–0.90 sweet spot
const FRAME_PATH   = 'frames/frame_';

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
  ctx.scale(dpr, dpr);
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

if (!isTouchDevice) {
  const lenis = new Lenis({
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
   5. FRAME → SCROLL BINDING
───────────────────────────────────────────── */
function initFrameScroll() {
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate(self) {
      const accelerated = Math.min(self.progress * FRAME_SPEED, 1);
      const index = Math.min(
        Math.floor(accelerated * FRAME_COUNT),
        FRAME_COUNT - 1
      );
      if (index !== currentFrame) {
        currentFrame = index;
        const nearestSample = Math.floor(index / 20) * 20;
        bgColor = sampled[nearestSample] || '#000';
        requestAnimationFrame(() => drawFrame(currentFrame));
      }
    },
  });
}

/* ─────────────────────────────────────────────
   6. HERO TRANSITION — circle-wipe reveal
───────────────────────────────────────────── */
function initHeroTransition() {
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate(self) {
      const p = self.progress;

      // Hero fades out fast as scroll begins
      heroSection.style.opacity = Math.max(0, 1 - p * 20).toString();

      // Canvas expands from a central circle
      const wipe = Math.min(1, Math.max(0, (p - 0.004) / 0.065));
      const r = wipe * 82;
      canvasWrap.style.clipPath = `circle(${r}% at 50% 50%)`;
    },
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
    '.cta-label, .cta-heading, .cta-body, .waitlist-form, .stat'
  );

  // Hide section initially
  gsap.set(section, { opacity: 0 });

  // Build entrance timeline
  const tl = gsap.timeline({ paused: true });

  const D = { stagger: 0.13, ease: 'power3.out' };

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
    case 'scale-up':
      tl.from(targets, { scale: 0.82, opacity: 0, duration: 1.05,
                         stagger: 0.12, ease: 'power2.out' });
      break;
    case 'stagger-up':
      tl.from(targets, { y: 65,  opacity: 0, duration: 0.85,
                         stagger: 0.16, ease: 'power3.out' });
      break;
    case 'clip-reveal':
      tl.from(targets, { clipPath: 'inset(100% 0 0 0)', opacity: 0, duration: 1.2,
                         stagger: 0.15, ease: 'power4.inOut' });
      break;
    case 'rotate-in':
      tl.from(targets, { y: 45, rotation: 2, opacity: 0, duration: 0.95, ...D });
      break;
    default:
      tl.fromTo(section, { opacity: 0 }, { opacity: 1, duration: 0.5 });
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
        gsap.set(section, { opacity: 1 });
        section.classList.add('is-active');
        tl.restart();
      } else if (!inRange && visible && !persist) {
        visible = false;
        gsap.set(section, { opacity: 0 });
        section.classList.remove('is-active');
        tl.pause(0); // reset for re-entry
      } else if (persist && p > leave && visible) {
        // persisted CTA: stays visible forever after entry
        gsap.set(section, { opacity: 1 });
      }
    },
  });
}

/* ─────────────────────────────────────────────
   9. COUNTER ANIMATIONS
───────────────────────────────────────────── */
function initCounters() {
  document.querySelectorAll('.stat-number').forEach(el => {
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
   10. HORIZONTAL MARQUEE
───────────────────────────────────────────── */
function initMarquee() {
  const wrap = document.getElementById('marquee-1');
  if (!wrap) return;

  const text  = wrap.querySelector('.marquee-text');
  const speed = parseFloat(wrap.dataset.scrollSpeed) || -20;

  // Marquee moves with scroll
  gsap.to(text, {
    xPercent: speed,
    ease: 'none',
    scrollTrigger: {
      trigger: scrollContainer,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
    },
  });

  // Marquee fades in between 25–85% progress
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate({ progress: p }) {
      let o = 0;
      if      (p >= 0.28 && p < 0.34)  o = (p - 0.28) / 0.06;
      else if (p >= 0.34 && p <= 0.83) o = 1;
      else if (p > 0.83  && p <= 0.88) o = 1 - (p - 0.83) / 0.05;
      wrap.style.opacity = o;
    },
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
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0;
  let rx = 0, ry = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function animateRing() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  document.querySelectorAll('a, button, .cta-button').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });
}

/* ─────────────────────────────────────────────
   13. WAITLIST FORM
───────────────────────────────────────────── */
function initWaitlist() {
  const form    = document.getElementById('waitlist-form');
  const success = document.getElementById('waitlist-success');
  const error   = document.getElementById('waitlist-error');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.waitlist-submit');
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
      gsap.from(error, { opacity: 0, duration: 0.4 });
      btn.textContent = 'Join the Waitlist';
      btn.disabled = false;
    }
  });
}

/* ─────────────────────────────────────────────
   14. NAV — compact on scroll
───────────────────────────────────────────── */
function initNav() {
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: '1px top',
    onEnter:     () => document.getElementById('site-header').classList.add('scrolled'),
    onLeaveBack: () => document.getElementById('site-header').classList.remove('scrolled'),
  });
}

/* ─────────────────────────────────────────────
   15. MOBILE NAV
───────────────────────────────────────────── */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const links     = mobileNav.querySelectorAll('.mobile-nav-link');
  if (!hamburger || !mobileNav) return;

  function openNav() {
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('is-open');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    gsap.fromTo(mobileNav, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power2.out' });
    gsap.fromTo(links, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.07, ease: 'power3.out', delay: 0.1 });
  }

  function closeNav() {
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    gsap.to(mobileNav, {
      opacity: 0, duration: 0.3, ease: 'power2.in',
      onComplete() { mobileNav.classList.remove('is-open'); }
    });
  }

  hamburger.addEventListener('click', () =>
    hamburger.classList.contains('is-open') ? closeNav() : openNav()
  );
  links.forEach(link => link.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && hamburger.classList.contains('is-open')) closeNav();
  });
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
function init() {
  gsap.registerPlugin(ScrollTrigger);

  positionSections();
  initFrameScroll();
  initHeroTransition();
  initDarkOverlay();
  initMarquee();
  initCounters();
  initCursor();
  initWaitlist();
  initNav();
  initMobileNav();

  document.querySelectorAll('.scroll-section').forEach(setupSectionAnimation);

  window.addEventListener('resize', positionSections);
}

preloadFrames().then(init);

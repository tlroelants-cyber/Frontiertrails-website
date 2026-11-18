/* ==============================================
   FRONTIER TRAILS — nav.js
   Shared menu: the three-line button, top right.
   - Desktop: hover (with a short pause) or click opens a small panel.
   - Touch / keyboard: opens a full-screen sheet (phones) and the lines
     fold into an X.
   - Scrolling: the button rests smaller and faint, and all but fades
     while you scroll, so it stays out of the way of the scroll film.
   Used on every page so the menu behaves identically everywhere.
   (The compass that used to be here is saved in HQ/Ideas.)
   ============================================== */
(function () {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;

  const links = Array.from(nav.querySelectorAll('a'));
  const first = nav.querySelector('.mobile-nav-link');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Below 769px the menu is a full-screen sheet (scroll locks, focus is kept
  // inside); at/above it's a small panel and the page scrolls on.
  const isFullScreen = () => window.innerWidth < 769;

  // The closed menu is hidden with visibility; `inert` also keeps its links
  // out of the tab order and the a11y tree.
  nav.inert = true;

  /* ── Open / close ── */
  let openedByHover = false, lastHoverOpen = 0;

  function openNav(byHover) {
    if (btn.classList.contains('is-open')) return;
    openedByHover = !!byHover;
    btn.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close menu');
    nav.classList.add('is-open');
    nav.setAttribute('aria-hidden', 'false');
    nav.inert = false;
    if (isFullScreen()) document.body.style.overflow = 'hidden';
    // No mouse hovering it (touch): show the X so it's clear how to close.
    if (!openedByHover && !canHover) btn.classList.add('is-x');
  }

  function closeNav() {
    if (!btn.classList.contains('is-open')) return;
    // Making an ancestor inert drops focus to the body, so hand it back to
    // the control that opened the menu.
    const focusWasInside = nav.contains(document.activeElement);
    btn.classList.remove('is-open', 'is-x');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
    nav.classList.remove('is-open');
    nav.setAttribute('aria-hidden', 'true');
    nav.inert = true;
    document.body.style.overflow = '';
    if (focusWasInside) btn.focus();
  }

  btn.addEventListener('click', e => {
    if (btn.classList.contains('is-open')) {
      // The click that usually follows a hover shouldn't snap the panel shut.
      if (openedByHover && Date.now() - lastHoverOpen < 400) return;
      closeNav();
      return;
    }
    openNav(false);
    if (e.detail === 0) {                                   // keyboard
      btn.classList.add('is-x');
      if (first) first.focus({ preventScroll: true });
    }
  });

  links.forEach(link => link.addEventListener('click', closeNav));

  document.addEventListener('keydown', e => {
    if (!btn.classList.contains('is-open')) return;
    if (e.key === 'Escape') { closeNav(); btn.focus(); return; }

    // Keep Tab inside the full-screen sheet (button + links).
    if (e.key === 'Tab' && isFullScreen()) {
      const items = [btn, ...links];
      const i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0)                       { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    }
  });

  // Click outside closes it.
  document.addEventListener('click', e => {
    if (!btn.classList.contains('is-open')) return;
    if (btn.contains(e.target) || nav.contains(e.target)) return;
    closeNav();
  });

  // Growing past the breakpoint with the sheet open: release the scroll lock.
  window.addEventListener('resize', () => {
    if (!isFullScreen()) document.body.style.overflow = '';
  });

  /* ── Desktop: hover intent ── */
  if (canHover) {
    let openTimer, closeTimer;
    const scheduleClose = () => {
      clearTimeout(openTimer);
      closeTimer = setTimeout(() => { if (openedByHover) closeNav(); }, 320);
    };

    btn.addEventListener('mouseenter', () => {
      clearTimeout(closeTimer);
      // A short pause, so sweeping past the corner doesn't pop the menu.
      openTimer = setTimeout(() => { openNav(true); lastHoverOpen = Date.now(); }, 90);
    });
    btn.addEventListener('mouseleave', scheduleClose);
    nav.addEventListener('mouseenter', () => clearTimeout(closeTimer));
    nav.addEventListener('mouseleave', scheduleClose);
  }

  /* ── Scroll: stay out of the way of the scroll film ──
     Past the first bit of the page the button rests smaller and faint
     (is-compact); while you scroll it all but disappears (is-scrolling)
     and comes back once you stop. Styles in css/style.css. */
  const COMPACT_AFTER = 80;
  const setCompact = () => btn.classList.toggle('is-compact', window.scrollY > COMPACT_AFTER);
  setCompact();

  let idle;
  window.addEventListener('scroll', () => {
    setCompact();
    if (btn.classList.contains('is-open')) return;
    btn.classList.add('is-scrolling');
    clearTimeout(idle);
    idle = setTimeout(() => btn.classList.remove('is-scrolling'), 600);
  }, { passive: true });
})();

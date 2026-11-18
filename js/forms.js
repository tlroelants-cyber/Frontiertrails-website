/* ==============================================
   FRONTIER TRAILS — forms.js
   Content-page forms (waitlist band, Dispatch, Community, Dream trip).
   Same Formspree flow as the homepage waitlist in app.js: post by
   fetch, then swap the form for its success message. Without JS the
   form still posts straight to Formspree.
   ============================================== */
(function () {
  document.querySelectorAll('form[data-ajax]').forEach(form => {
    const success = form.nextElementSibling;
    const error = success && success.nextElementSibling;
    const btn = form.querySelector('[type="submit"]');
    const label = btn ? btn.textContent.trim() : '';
    const subject = form.querySelector('[name="_subject"]');

    form.addEventListener('submit', async e => {
      e.preventDefault();
      btn.textContent = 'Sending…';
      btn.disabled = true;
      if (error) error.style.display = 'none';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('non-ok response');
        form.style.display = 'none';
        if (success) success.style.display = 'block';
      } catch {
        if (error) { error.style.display = 'block'; error.setAttribute('role', 'alert'); }
        btn.textContent = label;
        btn.disabled = false;
      }
    });
  });
})();

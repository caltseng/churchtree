/* Apply the saved preference before paint. This file is safe on any page using theme.css. */
(() => {
  const key = 'churchtree.theme';
  const palettes = [
    ['parchment', 'Parchment', 'Warm paper with garden greens.'],
    ['slate', 'Slate', 'Cool paper with blue-gray accents.'],
    ['ink', 'Ink', 'Deep blue with luminous text.']
  ];
  const valid = value => palettes.some(([id]) => id === value);
  let active = 'parchment';
  try { const saved = localStorage.getItem(key); if (valid(saved)) active = saved; } catch {}
  document.documentElement.dataset.theme = active;
  document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.home-header, .explorer-header, .site-header, .catechism-header');
    if (!header) return;

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'site-menu-trigger';
    trigger.setAttribute('aria-label', 'Site menu');
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', 'site-menu');
    trigger.innerHTML = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
    header.insertBefore(trigger, header.querySelector('.header-panel'));

    const dialog = document.createElement('dialog');
    dialog.id = 'site-menu';
    dialog.setAttribute('aria-labelledby', 'site-menu-title');
    dialog.innerHTML = `<div class="site-menu-heading">
      <h2 id="site-menu-title" tabindex="-1">Site menu</h2>
      <button type="button" data-menu-close>Close</button>
    </div>
    <div data-menu-home>
      <a href="#explore">All explorations</a>
      <button type="button" data-menu-settings>Settings <span aria-hidden="true">›</span></button>
    </div>
    <section data-menu-preferences aria-labelledby="appearance-title" hidden>
      <button type="button" data-menu-back>← Back to menu</button>
      <h3 id="appearance-title">Appearance</h3>
      <fieldset id="theme-options"><legend>Color palette</legend></fieldset>
      <div class="theme-footer"><button type="button" id="theme-reset">Reset to Parchment</button><span id="theme-status" role="status"></span></div>
    </section>`;
    document.body.append(dialog);
    const homeLink = dialog.querySelector('a');
    homeLink.href = new URL('./#explore', header.querySelector('.main-branch-brand').href);
    const title = dialog.querySelector('#site-menu-title');
    const menu = dialog.querySelector('[data-menu-home]');
    const settings = dialog.querySelector('[data-menu-settings]');
    const preferences = dialog.querySelector('[data-menu-preferences]');
    const options = dialog.querySelector('#theme-options');
    for (const [id, title, description] of palettes) {
      const label = document.createElement('label');
      label.className = 'theme-option';
      label.dataset.theme = id;
      // Palette cards define their own preview scope; the page uses the root scope.
      const input = document.createElement('input');
      input.type = 'radio'; input.name = 'theme'; input.value = id; input.checked = id === active;
      const copy = document.createElement('span');
      const heading = document.createElement('strong'); heading.textContent = title;
      const detail = document.createElement('small'); detail.textContent = description;
      copy.append(heading, detail);
      const swatches = document.createElement('span'); swatches.className = 'theme-swatches'; swatches.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < 4; i++) swatches.append(document.createElement('i'));
      label.append(input, copy, swatches); options.append(label);
      input.addEventListener('change', () => apply(id));
    }
    function apply(id) {
      active = id; document.documentElement.dataset.theme = id;
      for (const input of options.querySelectorAll('input')) input.checked = input.value === id;
      let saved = true;
      try { if (id === 'parchment') localStorage.removeItem(key); else localStorage.setItem(key, id); } catch { saved = false; }
      document.getElementById('theme-status').textContent = `${palettes.find(p => p[0] === id)[1]} applied${saved ? ' · saved on this browser' : ' · this visit only'}`;
    }
    function showSettings(open) {
      title.textContent = open ? 'Settings' : 'Site menu';
      menu.hidden = open;
      preferences.hidden = !open;
      dialog.scrollTop = 0;
    }
    trigger.addEventListener('click', () => {
      showSettings(false);
      dialog.showModal();
      title.focus();
    });
    settings.addEventListener('click', () => {
      showSettings(true);
      title.focus();
    });
    dialog.querySelector('[data-menu-back]').addEventListener('click', () => {
      showSettings(false);
      settings.focus();
    });
    dialog.querySelector('[data-menu-close]').addEventListener('click', () => dialog.close());
    homeLink.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => trigger.focus({preventScroll: true}));
    document.getElementById('theme-reset').addEventListener('click', () => apply('parchment'));
    dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  });
})();

/* Apply the saved preference before paint. This file is safe on any page using theme.css. */
(() => {
  const key = 'churchtree.theme';
  const palettes = [
    ['parchment', 'Parchment', 'Warm paper, garden greens, familiar blue and plum connections. Current default.'],
    ['slate', 'Slate', 'Cool paper and blue-gray structure for a quieter, archival feel.'],
    ['ink', 'Ink', 'Deep blue surfaces with luminous text and softened connections.']
  ];
  const valid = value => palettes.some(([id]) => id === value);
  let active = 'parchment';
  try { const saved = localStorage.getItem(key); if (valid(saved)) active = saved; } catch {}
  document.documentElement.dataset.theme = active;
  document.addEventListener('DOMContentLoaded', () => {
    const dialog = document.getElementById('theme-dialog');
    if (!dialog) return;
    const options = document.getElementById('theme-options');
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
    document.getElementById('theme-open').addEventListener('click', () => dialog.showModal());
    document.getElementById('theme-close').addEventListener('click', () => dialog.close());
    document.getElementById('theme-reset').addEventListener('click', () => apply('parchment'));
    dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  });
})();

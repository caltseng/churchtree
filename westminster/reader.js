(() => {
  'use strict';
  const chapters = [...document.querySelectorAll('main article')];
  const contents = document.querySelector('.contents details');
  const picker = document.getElementById('chapter-select');
  const narrow = matchMedia('(max-width: 800px)');
  if (narrow.matches) contents.open = false;
  document.body.classList.add('enhanced');
  function show(moveFocus) {
    const match = location.hash.match(/^#(?:chapter|section|study|note|pca|proofs)-(\d+)(?:-.*)?$/);
    const current = chapters.findIndex(chapter => !chapter.hidden) + 1;
    const number = match && +match[1] >= 1 && +match[1] <= 33 ? +match[1] : (current || 1);
    chapters.forEach((chapter, i) => {
      chapter.hidden = i + 1 !== number;
      if (chapter.hidden) chapter.querySelector('.study').open = false;
    });
    picker.value = String(number);
    document.querySelectorAll('.contents a').forEach((link, i) => {
      if (i + 1 === number) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.title = `${number}. ${chapters[number - 1].querySelector('h2').textContent} · Westminster · Main Branch`;
    if (narrow.matches) contents.open = false;
    const target = document.getElementById(location.hash.slice(1));
    if (target) {
      let disclosure = target.closest('details');
      while (disclosure) {
        disclosure.open = true;
        disclosure = disclosure.parentElement.closest('details');
      }
      requestAnimationFrame(() => {
        target.scrollIntoView({block: 'start'});
        if (moveFocus) {
          const focus = target.matches('article') ? target.querySelector('h2') : target.matches('details') ? target.querySelector('summary') : target;
          if (!focus.hasAttribute('tabindex') && !focus.matches('summary, a, button, input, select, textarea')) focus.setAttribute('tabindex', '-1');
          focus.focus({preventScroll: true});
        }
      });
    }
  }
  addEventListener('hashchange', () => show(true));
  picker.addEventListener('change', () => {
    const hash = '#chapter-' + picker.value;
    if (location.hash === hash) show(true);
    else location.hash = hash;
  });
  document.querySelector('.contents nav').addEventListener('click', event => {
    const link = event.target.closest('a');
    if (link && link.hash === location.hash) show(true);
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-study-return]');
    if (!link) return;
    link.closest('.study').open = false;
    if (link.hash === location.hash) show(true);
  });
  show(false);
})();

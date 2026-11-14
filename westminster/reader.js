(() => {
  'use strict';
  const chapters = [...document.querySelectorAll('main article')];
  const contents = document.querySelector('.contents details');
  const narrow = matchMedia('(max-width: 800px)');
  if (narrow.matches) contents.open = false;
  document.body.classList.add('enhanced');
  function show(moveFocus) {
    const match = location.hash.match(/^#(?:chapter|section)-(\d+)(?:-(\d+))?$/);
    const current = chapters.findIndex(chapter => !chapter.hidden) + 1;
    const number = match && +match[1] >= 1 && +match[1] <= 33 ? +match[1] : (current || 1);
    chapters.forEach((chapter, i) => { chapter.hidden = i + 1 !== number; });
    document.querySelectorAll('.contents a').forEach((link, i) => {
      if (i + 1 === number) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.title = `${number}. ${chapters[number - 1].querySelector('h2').textContent} · Westminster · ChurchTree`;
    if (narrow.matches) contents.open = false;
    const target = document.getElementById(location.hash.slice(1));
    if (target) requestAnimationFrame(() => {
      target.scrollIntoView({block: 'start'});
      if (moveFocus) {
        const focus = target.matches('article') ? target.querySelector('h2') : target;
        if (!focus.hasAttribute('tabindex')) focus.setAttribute('tabindex', '-1');
        focus.focus({preventScroll: true});
      }
    });
  }
  addEventListener('hashchange', () => show(true));
  // A same-chapter selection should also dismiss the mobile contents.
  document.querySelector('.contents nav').addEventListener('click', event => {
    const link = event.target.closest('a');
    if (link && link.hash === location.hash) show(true);
  });
  show(false);
})();

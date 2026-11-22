(() => {
  'use strict';
  const data = window.US_AFFILIATION_DATA;
  const view = window.USAffiliationView;
  if (!data || !view) throw new Error('U.S. affiliation assets failed to load.');
  const container = document.getElementById('interactive-view');
  const controls = document.getElementById('route-controls');
  const selector = document.getElementById('affiliation-view');
  const back = document.getElementById('back');
  const reset = document.getElementById('reset');
  const toggle = document.getElementById('list-toggle');
  const status = document.getElementById('route-status');
  const initial = view.readURL(data, location.search);
  let state = initial.state;
  let affiliationGroup = 'us-adults';

  function render(previous, focus) {
    container.innerHTML = view.renderView(data, state);
    selector.value = state.view;
    back.hidden = reset.hidden = state.view === 'attendance';
    back.disabled = state.group === 'us-adults';
    reset.disabled = state.group === 'us-adults';
    toggle.setAttribute('aria-pressed', String(state.format === 'list'));
    if (!focus) return;
    const path = previous && previous.view === state.view
      ? [...view.ancestors(data, previous.view, previous.group), previous.group] : [];
    const departing = path[path.indexOf(state.group) + 1];
    const target = departing && container.querySelector(`.row-target[data-group="${departing}"]`);
    (target || container.querySelector('#group-heading')).focus();
  }
  function navigate(input, focus = true) {
    const next = view.normalize(data, input);
    if (view.query(next) === view.query(state)) return;
    const previous = state;
    if (state.view !== 'attendance') affiliationGroup = state.group;
    state = next;
    history.pushState(null, '', view.query(state));
    status.textContent = '';
    render(previous, focus);
  }
  container.addEventListener('click', event => {
    const anchor = event.target.closest('a[data-group]');
    if (!anchor || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate({...state, group: anchor.dataset.group});
  });
  selector.addEventListener('change', () => navigate({
    ...state, group: state.view === 'attendance' ? affiliationGroup : state.group, view: selector.value
  }));
  back.addEventListener('click', () => {
    const ancestors = view.ancestors(data, state.view, state.group);
    navigate({...state, group: ancestors.at(-1) || 'us-adults'});
  });
  reset.addEventListener('click', () => navigate({...state, group: 'us-adults'}));
  toggle.addEventListener('click', () => {
    navigate({...state, format: state.format === 'list' ? 'chart' : 'list'}, false);
    toggle.focus();
  });
  window.addEventListener('popstate', () => {
    const previous = state;
    if (state.view !== 'attendance') affiliationGroup = state.group;
    const parsed = view.readURL(data, location.search);
    state = parsed.state;
    history.replaceState(null, '', view.query(state));
    status.textContent = parsed.corrected ? 'Invalid or incompatible link corrected to a supported view.' : '';
    render(previous, true);
  });
  render(null, false);
  history.replaceState(null, '', view.query(state));
  status.textContent = initial.corrected ? 'Invalid or incompatible link corrected to a supported view.' : '';
  container.hidden = false;
  controls.hidden = false;
  document.getElementById('static-view').hidden = true;
})();

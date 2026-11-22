(() => {
  'use strict';
  const data = window.US_AFFILIATION_DATA;
  const view = window.USAffiliationView;
  if (!data || !view) throw new Error('U.S. affiliation assets failed to load.');
  const container = document.getElementById('interactive-view');
  const controls = document.getElementById('route-controls');
  const selector = document.getElementById('affiliation-view');
  const dimension = document.getElementById('demographic-dimension');
  const population = document.getElementById('demographic-population');
  const demographicControls = document.getElementById('demographic-controls');
  const back = document.getElementById('back');
  const reset = document.getElementById('reset');
  const toggle = document.getElementById('list-toggle');
  const status = document.getElementById('route-status');
  const initial = view.readURL(data, location.search);
  let state = initial.state;
  let affiliationGroup = 'us-adults';
  let demographicState = {dimension: 'age', population: 'age-18-29'};
  const isAffiliation = value => value.view === 'families' || value.view === 'traditions';
  const chartViews = new Map();
  let saveChart = () => {};
  let chartResize;

  function enhanceChart() {
    const chart = container.querySelector('.chart');
    if (!chart) { saveChart = () => {}; return; }
    const key = view.query({...state, format: 'chart'});
    const saved = chartViews.get(key) || {scale: 1, left: 0, top: 0, sources: []};
    const shell = document.createElement('div');
    shell.className = 'chart-shell';
    shell.innerHTML = `<div class="chart-controls" role="group" aria-label="Chart zoom">
      <button type="button" data-zoom="out" aria-label="Zoom chart out">&minus;</button>
      <output aria-live="polite" aria-label="Chart zoom level"></output>
      <button type="button" data-zoom="in" aria-label="Zoom chart in">+</button>
      <button type="button" data-zoom="reset">Fit chart</button></div>
      <p id="chart-help" class="chart-help">Pinch to zoom; drag to pan. Select an affiliation label or bar to explore.
      Keyboard: focus the chart, use + or &minus; to zoom, 0 to fit, and arrow keys to pan. List keeps the same values and sources.</p>
      <div class="chart-viewport" tabindex="0" role="region" aria-label="Religious comparison chart" aria-describedby="chart-help"></div>`;
    chart.before(shell);
    const viewport = shell.querySelector('.chart-viewport');
    viewport.append(chart);
    const list = state.format === 'list';
    shell.classList.toggle('chart-list', list);
    shell.querySelector('.chart-controls').hidden = list;
    shell.querySelector('.chart-help').hidden = list;
    if (list) viewport.removeAttribute('tabindex');
    let scale = saved.scale;
    let suppressClickUntil = 0;
    const output = shell.querySelector('output');
    const buttons = shell.querySelectorAll('[data-zoom]');
    const sources = [...chart.querySelectorAll('.row-source')];
    sources.forEach((source, index) => source.open = saved.sources.includes(index));
    function paint() {
      chart.style.zoom = list ? '' : String(scale);
      chart.style.width = list ? '' : viewport.clientWidth + 'px';
      output.value = Math.round(scale * 100) + '%';
      buttons[0].disabled = scale <= 1;
      buttons[1].disabled = scale >= 4;
    }
    function zoom(next, x = viewport.clientWidth / 2, y = viewport.clientHeight / 2) {
      const bounded = Math.max(1, Math.min(4, next));
      const point = {x: (viewport.scrollLeft + x) / scale, y: (viewport.scrollTop + y) / scale};
      scale = bounded;
      paint();
      viewport.scrollLeft = point.x * scale - x;
      viewport.scrollTop = point.y * scale - y;
    }
    function fit() {
      scale = 1;
      paint();
      viewport.scrollTo(0, 0);
    }
    shell.querySelector('.chart-controls').addEventListener('click', event => {
      const button = event.target.closest('[data-zoom]');
      if (!button) return;
      if (button.dataset.zoom === 'reset') fit();
      else zoom(scale * (button.dataset.zoom === 'in' ? 1.25 : 0.8));
    });
    viewport.addEventListener('keydown', event => {
      if (event.target !== viewport || list) return;
      if (['+', '=', '-', '0'].includes(event.key)) {
        event.preventDefault();
        if (event.key === '0') fit();
        else zoom(scale * (event.key === '-' ? 0.8 : 1.25));
      } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        viewport.scrollBy(event.key === 'ArrowLeft' ? -60 : event.key === 'ArrowRight' ? 60 : 0,
          event.key === 'ArrowUp' ? -60 : event.key === 'ArrowDown' ? 60 : 0);
      }
    });
    viewport.addEventListener('wheel', event => {
      if (list || !(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      const rect = viewport.getBoundingClientRect();
      zoom(scale * Math.exp(-event.deltaY * .002), event.clientX - rect.left, event.clientY - rect.top);
    }, {passive: false});
    const pointers = new Map();
    let gesture = null;
    let moved = false;
    function measure() {
      const points = [...pointers.values()];
      return points.length > 1
        ? {x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2,
          distance: Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y)}
        : {...points[0], distance: 0};
    }
    viewport.addEventListener('pointerdown', event => {
      if (list || event.button !== 0 || (event.pointerType === 'mouse' && event.target.closest('.row-source'))) return;
      pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
      if (pointers.size === 1) moved = false;
      if (pointers.size > 1) moved = true;
      gesture = measure();
    });
    viewport.addEventListener('pointermove', event => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
      const next = measure();
      if (!moved && Math.hypot(next.x - gesture.x, next.y - gesture.y) < 6) return;
      moved = true;
      viewport.setPointerCapture(event.pointerId);
      event.preventDefault();
      if (next.distance && gesture.distance) {
        const rect = viewport.getBoundingClientRect();
        zoom(scale * next.distance / gesture.distance, gesture.x - rect.left, gesture.y - rect.top);
      }
      viewport.scrollLeft -= next.x - gesture.x;
      viewport.scrollTop -= next.y - gesture.y;
      gesture = next;
      suppressClickUntil = performance.now() + 400;
    });
    function release(event) {
      if (!pointers.delete(event.pointerId)) return;
      if (moved) suppressClickUntil = performance.now() + 400;
      gesture = pointers.size ? measure() : null;
    }
    viewport.addEventListener('pointerup', release);
    viewport.addEventListener('pointercancel', release);
    viewport.addEventListener('lostpointercapture', event => {
      if (event.target === viewport) release(event);
    });
    viewport.addEventListener('click', event => {
      if (performance.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);
    paint();
    if (!list) viewport.scrollTo(saved.left, saved.top);
    chartResize = new ResizeObserver(paint);
    chartResize.observe(viewport);
    saveChart = () => chartViews.set(key, {
      scale, left: list ? saved.left : viewport.scrollLeft, top: list ? saved.top : viewport.scrollTop,
      sources: sources.flatMap((source, index) => source.open ? [index] : [])
    });
  }

  function remember() {
    if (isAffiliation(state)) affiliationGroup = state.group;
    if (state.view === 'demographics') demographicState = {dimension: state.dimension, population: state.population};
  }

  function render(previous, focus) {
    chartResize?.disconnect();
    container.innerHTML = view.renderView(data, state);
    enhanceChart();
    selector.value = state.view;
    back.hidden = reset.hidden = !isAffiliation(state);
    demographicControls.hidden = state.view !== 'demographics';
    if (state.view === 'demographics') {
      dimension.value = state.dimension;
      population.innerHTML = data.demographics.populations.filter(row => row.dimension === state.dimension)
        .map(row => `<option value="${view.esc(row.id)}">${view.esc(row.label)}</option>`).join('');
      population.value = state.population;
    }
    back.disabled = state.group === 'us-adults';
    reset.disabled = state.group === 'us-adults';
    toggle.setAttribute('aria-pressed', String(state.format === 'list'));
    if (!focus) return;
    const path = previous && previous.view === state.view
      ? [...view.ancestors(data, previous.view, previous.group), previous.group] : [];
    const departing = path[path.indexOf(state.group) + 1];
    const target = departing && container.querySelector(`.row-target[data-group="${departing}"], .row-detail[data-group="${departing}"]`);
    (target || container.querySelector('#group-heading')).focus({preventScroll: Boolean(target)});
  }
  function navigate(input, focus = true) {
    const next = view.normalize(data, input);
    if (view.query(next) === view.query(state)) return;
    const previous = state;
    saveChart();
    remember();
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
    ...state, ...demographicState, group: isAffiliation(state) ? state.group : affiliationGroup, view: selector.value
  }));
  dimension.addEventListener('change', () => navigate({...state, dimension: dimension.value, population: null}));
  population.addEventListener('change', () => navigate({...state, population: population.value}));
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
    saveChart();
    remember();
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

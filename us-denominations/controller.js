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
  let animating = false;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  // One pie animation runs at a time; any newer animation or render settles it to its final geometry first.
  let motion = null;
  let pendingFill = null;
  const TOP = -Math.PI / 2, TURN = Math.PI * 2;
  const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  function settle() {
    if (!motion) return;
    const current = motion;
    motion = null;
    current.end(false);
  }
  function tween(ms, ease, step, end) {
    settle();
    const began = performance.now();
    const handle = {end(completed) { cancelAnimationFrame(handle.frame); step(1); end(completed); }};
    motion = handle;
    step(0);
    handle.frame = requestAnimationFrame(function frame(now) {
      if (motion !== handle) return;
      const t = Math.min(1, (now - began) / ms);
      if (t < 1) { step(ease(t)); handle.frame = requestAnimationFrame(frame); }
      else { motion = null; handle.end(true); }
    });
  }
  function geometry(pie) {
    return [...pie.querySelectorAll('.pie-slice')].map(el => ({
      el, path: el.querySelector('path'), d: el.querySelector('path').getAttribute('d'),
      start: Number(el.dataset.start), end: Number(el.dataset.end)
    }));
  }
  // Drilling in: the new children sweep clockwise over a ring in the chosen slice's colour.
  function sweep(pie, fill) {
    const slices = geometry(pie);
    let under = null;
    if (fill) {
      under = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      under.setAttribute('class', 'pie-underlay');
      under.setAttribute('aria-hidden', 'true');
      under.setAttribute('fill', fill);
      under.setAttribute('d', view.arcPath(TOP, TOP + TURN));
      pie.querySelector('.pie-slices').before(under);
    }
    pie.classList.add('pie-sweeping');
    tween(480, easeOut, p => {
      slices.forEach(s => s.path.setAttribute('d', p === 1 ? s.d : view.arcPath(TOP + (s.start - TOP) * p, TOP + (s.end - TOP) * p)));
      if (under) under.style.opacity = String(1 - p);
    }, () => {
      under?.remove();
      pie.classList.remove('pie-sweeping');
    });
  }
  // Zooming out: the slice we came from shrinks from a full ring back into place as its siblings return.
  function collapse(pie, id) {
    const slice = geometry(pie).find(s => s.el.dataset.group === id);
    if (!slice) return sweep(pie, null);
    const mid = (slice.start + slice.end) / 2;
    slice.el.classList.add('pie-chosen');
    pie.classList.add('pie-collapsing');
    tween(460, easeInOut, p => {
      slice.path.setAttribute('d', p === 1 ? slice.d : view.arcPath(mid - Math.PI + (slice.start - mid + Math.PI) * p, mid + Math.PI + (slice.end - mid - Math.PI) * p));
      if (p > .45) pie.classList.remove('pie-collapsing');
    }, () => {
      pie.classList.remove('pie-collapsing');
      slice.el.classList.remove('pie-chosen');
    });
  }

  function enhanceChart() {
    const chart = container.querySelector('.chart');
    if (!chart) { saveChart = () => {}; return; }
    const key = view.query({...state, format: 'chart'});
    const saved = chartViews.get(key) || {scale: 1, left: 0, top: 0, sources: []};
    if (chart.classList.contains('pie-chart')) {
      // The pie drills in by navigation, so it has no pan/zoom viewport; remember open source notes only.
      const sources = [...container.querySelectorAll('.info-detail'), ...chart.querySelectorAll('.row-source')];
      sources.forEach((source, index) => source.open = saved.sources.includes(index));
      saveChart = () => chartViews.set(key, {...saved, sources: sources.flatMap((source, index) => source.open ? [index] : [])});
      return;
    }
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
    settle();
    chartResize?.disconnect();
    container.innerHTML = view.renderView(data, state);
    enhanceChart();
    const fill = pendingFill;
    pendingFill = null;
    container.classList.remove('level-in', 'level-out');
    if (previous && previous.view === state.view && previous.group !== state.group && isAffiliation(state) && !reduceMotion.matches) {
      const up = view.ancestors(data, previous.view, previous.group).includes(state.group);
      void container.offsetWidth;
      container.classList.add(up ? 'level-out' : 'level-in');
      const pie = container.querySelector('.pie');
      if (pie && state.format === 'chart') {
        pie.classList.add(up ? 'pie-enter-out' : 'pie-enter-in');
        const path = [...view.ancestors(data, previous.view, previous.group), previous.group];
        if (up) collapse(pie, path[path.indexOf(state.group) + 1]);
        else sweep(pie, fill);
      }
    }
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
  function visible(element) {
    const rect = element.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < innerHeight;
  }
  // Grow the chosen slice to a full ring before showing its breakdown.
  function zoomInto(group, done) {
    const slice = [...container.querySelectorAll('.pie-slice')].find(el => el.dataset.group === group);
    if (!slice || reduceMotion.matches || state.format === 'list' || !visible(slice.ownerSVGElement)) return done();
    settle();
    animating = true;
    const pie = slice.ownerSVGElement, path = slice.querySelector('path');
    const start = Number(slice.dataset.start), end = Number(slice.dataset.end), mid = (start + end) / 2;
    pie.classList.add('pie-zooming', 'pie-busy');
    slice.classList.add('pie-chosen');
    tween(360, easeInOut, p => {
      path.setAttribute('d', view.arcPath(start + (mid - Math.PI - start) * p, end + (mid + Math.PI - end) * p));
    }, completed => {
      animating = false;
      pie.classList.remove('pie-busy');
      if (!completed) return;
      pendingFill = path.getAttribute('fill');
      done();
      pendingFill = null;
    });
  }
  container.addEventListener('click', event => {
    const anchor = event.target.closest('a[data-group]');
    if (!anchor || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (animating) return;
    const group = anchor.dataset.group, from = state;
    const go = () => { if (state === from) navigate({...state, group}); };
    if (anchor.classList.contains('pie-center')) go();
    else zoomInto(group, go);
  });
  container.addEventListener('keydown', event => {
    const slice = event.target.closest && event.target.closest('.pie-slice');
    if (!slice) return;
    const slices = [...container.querySelectorAll('.pie-slice')];
    let index = slices.indexOf(slice);
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      slice.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}));
      return;
    }
    if (['ArrowRight', 'ArrowDown'].includes(event.key)) index = (index + 1) % slices.length;
    else if (['ArrowLeft', 'ArrowUp'].includes(event.key)) index = (index - 1 + slices.length) % slices.length;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = slices.length - 1;
    else return;
    event.preventDefault();
    slices.forEach((el, i) => el.setAttribute('tabindex', i === index ? '0' : '-1'));
    slices[index].focus();
  });
  function highlight(event, on) {
    const source = event.target.closest && event.target.closest('.pie-slice, .estimate-row');
    if (!source || !container.querySelector('.pie')) return;
    const id = source.dataset.slice || source.dataset.record;
    container.querySelectorAll('.is-active').forEach(el => el.classList.remove('is-active'));
    if (!on) return;
    container.querySelectorAll('.pie-slice, .estimate-row').forEach(el => {
      if ((el.dataset.slice || el.dataset.record) === id) el.classList.add('is-active');
    });
  }
  container.addEventListener('pointerover', event => highlight(event, true));
  container.addEventListener('pointerout', event => highlight(event, false));
  container.addEventListener('focusin', event => highlight(event, true));
  container.addEventListener('focusout', event => highlight(event, false));
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

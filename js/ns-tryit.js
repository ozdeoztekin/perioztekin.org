/* NeuroSense try-it widgets. Each widget is a <div class="ns-widget" data-widget="TYPE"
 * data-config='{...}'> placed by the page builder. Types:
 *   rounds  : a stopwatch that times several labelled rounds, then compares them
 *   timer   : a countdown (seconds), with start, pause and reset
 *   pacer   : a breathing pacer that grows on the inhale and shrinks on the exhale
 *   stopwatch : a plain start/stop stopwatch
 *   spikes  : a one-neuron simulator: a stimulus slider, a threshold, same-size spikes
 *   recall  : study a word list for a set time (optional distraction), then type what you remember
 *   reaction: tap when the box changes color, five times, and get the middle time
 *   stroop  : read color words, then name their ink colors, timing both rounds
 *   tally   : a tap counter for noticing something (urges, checks, wandering thoughts)
 *   rating  : rate a feeling 0 to 10 before and after, and compare
 * No libraries, no storage, no network.
 */
(function () {
  'use strict';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function secs(ms) { return (ms / 1000).toFixed(1) + ' s'; }
  function clock(totalSeconds) {
    var s = Math.max(0, Math.ceil(totalSeconds));
    var m = Math.floor(s / 60), r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  /* ---------- rounds ---------- */
  function rounds(box, cfg) {
    var labels = cfg.rounds || [];
    var title = el('p', 'ns-w-title', cfg.title || 'Stopwatch');
    var disp = el('div', 'ns-w-time', '0.0 s');
    disp.setAttribute('role', 'timer');
    var go = el('button', 'ns-w-btn'); go.type = 'button';
    var reset = el('button', 'ns-w-reset', 'Reset'); reset.type = 'button';
    var list = el('ol', 'ns-w-rounds');
    var out = el('p', 'ns-w-result'); out.setAttribute('aria-live', 'polite');
    var times = [], idx = 0, t0 = 0, raf = 0, running = false;

    labels.forEach(function (lab) {
      var li = el('li');
      li.appendChild(el('span', '', lab));
      li.appendChild(el('span', 'val', ''));
      list.appendChild(li);
    });

    function paint() {
      if (idx >= labels.length) { go.textContent = 'All rounds done'; go.disabled = true; return; }
      go.disabled = false;
      go.textContent = (running ? 'Stop round ' : 'Start round ') + (idx + 1);
    }
    function tick() { disp.textContent = secs(performance.now() - t0); raf = requestAnimationFrame(tick); }
    function finish() {
      var r = cfg.result; if (!r) return;
      var base = 0; (r.base || []).forEach(function (i) { base += times[i] || 0; });
      var d = ((times[r.compare] || 0) - base) / 1000;
      if (d > 0.05) out.textContent = (r.positive || '').replace('{d}', d.toFixed(1));
      else out.textContent = r.negative || '';
    }
    go.addEventListener('click', function () {
      var li = list.children[idx];
      if (!running) {
        running = true; t0 = performance.now(); tick();
        if (li) li.className = 'is-on';
      } else {
        cancelAnimationFrame(raf); running = false;
        var t = performance.now() - t0; times[idx] = t; disp.textContent = secs(t);
        if (li) { li.className = 'is-done'; li.querySelector('.val').textContent = secs(t); }
        idx++;
        if (idx >= labels.length) finish();
      }
      paint();
    });
    reset.addEventListener('click', function () {
      cancelAnimationFrame(raf); running = false; times = []; idx = 0;
      disp.textContent = '0.0 s'; out.textContent = '';
      Array.prototype.forEach.call(list.children, function (li) { li.className = ''; li.querySelector('.val').textContent = ''; });
      paint();
    });
    paint();
    [title, disp, go, reset, list, out].forEach(function (n) { box.appendChild(n); });
  }

  /* ---------- timer (countdown) ---------- */
  function timer(box, cfg) {
    var total = Number(cfg.seconds) || 60;
    var title = el('p', 'ns-w-title', cfg.title || 'Timer');
    var disp = el('div', 'ns-w-time', clock(total)); disp.setAttribute('role', 'timer');
    var go = el('button', 'ns-w-btn', 'Start'); go.type = 'button';
    var reset = el('button', 'ns-w-reset', 'Reset'); reset.type = 'button';
    var out = el('p', 'ns-w-result'); out.setAttribute('aria-live', 'polite');
    var left = total, running = false, last = 0, raf = 0;
    function tick(now) {
      left -= (now - last) / 1000; last = now;
      if (left <= 0) { left = 0; running = false; disp.textContent = clock(0); go.textContent = 'Start'; out.textContent = cfg.done || 'Time.'; return; }
      disp.textContent = clock(left); raf = requestAnimationFrame(tick);
    }
    go.addEventListener('click', function () {
      if (running) { running = false; cancelAnimationFrame(raf); go.textContent = 'Resume'; return; }
      if (left <= 0) left = total;
      running = true; out.textContent = ''; go.textContent = 'Pause'; last = performance.now(); raf = requestAnimationFrame(tick);
    });
    reset.addEventListener('click', function () {
      running = false; cancelAnimationFrame(raf); left = total; disp.textContent = clock(total); go.textContent = 'Start'; out.textContent = '';
    });
    [title, disp, go, reset, out].forEach(function (n) { box.appendChild(n); });
  }

  /* ---------- stopwatch ---------- */
  function stopwatch(box, cfg) {
    var title = el('p', 'ns-w-title', cfg.title || 'Stopwatch');
    var disp = el('div', 'ns-w-time', '0.0 s'); disp.setAttribute('role', 'timer');
    var go = el('button', 'ns-w-btn', 'Start'); go.type = 'button';
    var reset = el('button', 'ns-w-reset', 'Reset'); reset.type = 'button';
    var t0 = 0, acc = 0, running = false, raf = 0;
    function tick() { disp.textContent = secs(acc + performance.now() - t0); raf = requestAnimationFrame(tick); }
    go.addEventListener('click', function () {
      if (running) { running = false; cancelAnimationFrame(raf); acc += performance.now() - t0; disp.textContent = secs(acc); go.textContent = 'Start'; }
      else { running = true; t0 = performance.now(); go.textContent = 'Stop'; tick(); }
    });
    reset.addEventListener('click', function () { running = false; cancelAnimationFrame(raf); acc = 0; disp.textContent = '0.0 s'; go.textContent = 'Start'; });
    [title, disp, go, reset].forEach(function (n) { box.appendChild(n); });
  }

  /* ---------- pacer (breathing) ---------- */
  function pacer(box, cfg) {
    var steps = cfg.steps || [{ say: 'Breathe in', secs: 4, scale: 1 }, { say: 'Breathe out, slowly', secs: 6, scale: 0.55 }];
    var cycles = Number(cfg.cycles) || 5;
    var title = el('p', 'ns-w-title', cfg.title || 'Breathing pacer');
    var wrap = el('div', 'ns-w-pacer');
    var orb = el('div', 'ns-w-orb'); orb.setAttribute('aria-hidden', 'true');
    var phase = el('div', 'ns-w-phase', 'Press start'); phase.setAttribute('aria-live', 'polite');
    var go = el('button', 'ns-w-btn', 'Start'); go.type = 'button';
    var stop = el('button', 'ns-w-reset', 'Stop'); stop.type = 'button';
    var timerId = 0, i = 0, n = 0, on = false;
    function step() {
      if (!on) return;
      if (n >= cycles) { on = false; phase.textContent = cfg.done || 'Done.'; orb.style.transitionDuration = '1s'; orb.style.transform = 'scale(.55)'; go.textContent = 'Start'; return; }
      var s = steps[i];
      phase.textContent = s.say;
      orb.style.transitionDuration = s.secs + 's';
      orb.style.transform = 'scale(' + (s.scale != null ? s.scale : 0.55) + ')';
      timerId = setTimeout(function () { i = (i + 1) % steps.length; if (i === 0) n++; step(); }, s.secs * 1000);
    }
    go.addEventListener('click', function () { if (on) return; on = true; i = 0; n = 0; go.textContent = 'Running'; step(); });
    stop.addEventListener('click', function () { on = false; clearTimeout(timerId); phase.textContent = 'Press start'; orb.style.transitionDuration = '0.6s'; orb.style.transform = 'scale(.55)'; go.textContent = 'Start'; });
    wrap.appendChild(orb); wrap.appendChild(phase);
    [title, wrap, go, stop].forEach(function (n2) { box.appendChild(n2); });
  }


  /* ---------- spikes (all-or-none simulator) ---------- */
  function spikes(box, cfg) {
    var title = el('p', 'ns-w-title', cfg.title || 'Turn up the stimulus');
    var cv = el('canvas', 'ns-w-canvas');
    cv.setAttribute('role', 'img');
    cv.setAttribute('aria-label', 'Simulated voltage of one neuron over time, with a dashed threshold line.');
    var range = el('input', 'ns-w-range');
    range.type = 'range'; range.min = 0; range.max = 100; range.value = 20;
    range.setAttribute('aria-label', 'Stimulus strength');
    var row = el('div', 'ns-w-row');
    row.appendChild(el('span', '', 'weak input')); row.appendChild(el('span', '', 'strong input'));
    var read = el('p', 'ns-w-readout'); read.setAttribute('aria-live', 'polite');
    var note = cfg.note ? el('p', 'ns-material-note', cfg.note) : null;
    [title, cv, range, row, read].forEach(function (n) { box.appendChild(n); });
    if (note) box.appendChild(note);

    var accent = getComputedStyle(box).getPropertyValue('--t').trim() || '#2a9d8f';
    var REST = -70, TH = -55, PEAK = 30, LOW = -80, TAU = 30, DT = 0.5, WIN = 1000, GUT = 92;
    var N = Math.round(WIN / DT), buf = new Float32Array(N), head = 0;
    for (var i = 0; i < N; i++) buf[i] = REST;
    var v = REST, phase = 0, pt = 0, spikesOn = [], tNow = 0, lastState = null, raf = 0, visible = true;

    function stepSim() {
      var ri = drive();
      if (phase === 0) {
        v += DT * (-(v - REST) + ri) / TAU;
        if (v >= TH) { phase = 1; pt = 0; spikesOn.push(tNow); }
      } else {
        pt += DT;
        if (phase === 1) { v = TH + (PEAK - TH) * Math.min(1, pt / 0.8); if (pt >= 0.8) { phase = 2; pt = 0; } }
        else if (phase === 2) { v = PEAK + (LOW - PEAK) * Math.min(1, pt / 1.2); if (pt >= 1.2) { phase = 3; pt = 0; } }
        else { v = REST + (LOW - REST) * Math.exp(-pt / 1.5); if (pt >= 4) { phase = 0; } }
      }
      buf[head] = v; head = (head + 1) % N; tNow += DT;
      while (spikesOn.length && spikesOn[0] < tNow - WIN) spikesOn.shift();
    }
    function drive() { var x = Number(range.value); return x <= 30 ? x / 30 * 14 : 15.2 + (x - 30) / 70 * 12; }
    function y(mv, h) { return 6 + (h - 12) * (1 - (mv + 88) / 124); }
    function draw() {
      var dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      var g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      g.font = '11px system-ui, sans-serif';
      [[PEAK, '+30 mV peak', 'rgba(255,255,255,.55)'], [TH, '-55 threshold', accent], [REST, '-70 rest', 'rgba(255,255,255,.55)']].forEach(function (L) {
        g.strokeStyle = L[2]; g.setLineDash(L[0] === TH ? [5, 4] : [2, 4]); g.lineWidth = 1;
        g.beginPath(); g.moveTo(GUT, y(L[0], h)); g.lineTo(w, y(L[0], h)); g.stroke();
        g.setLineDash([]); g.fillStyle = L[2]; g.fillText(L[1], 6, y(L[0], h) + 4);
      });
      g.strokeStyle = '#ffffff'; g.lineWidth = 1.5; g.beginPath();
      for (var k = 0; k < N; k++) {
        var val = buf[(head + k) % N], x = GUT + k / (N - 1) * (w - GUT);
        if (k === 0) g.moveTo(x, y(val, h)); else g.lineTo(x, y(val, h));
      }
      g.stroke();
    }
    function readout() {
      var above = drive() > (TH - REST);
      var state = above ? 'on' : 'off';
      if (state !== lastState) {
        read.textContent = above
          ? 'Above threshold. Every spike hits the same peak. A stronger input only packs them closer together.'
          : 'Below threshold. The voltage creeps up a little, and nothing is sent.';
        lastState = state;
      }
    }
    function frame() {
      for (var k = 0; k < 30; k++) stepSim();
      draw(); readout();
      if (visible) raf = requestAnimationFrame(frame);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var was = visible; visible = e.isIntersecting;
          if (visible && !was) raf = requestAnimationFrame(frame);
        });
      }).observe(cv);
    }
    range.addEventListener('input', readout);
    raf = requestAnimationFrame(frame);
  }


  /* ---------- recall (study a word list, then recall it) ---------- */
  function recall(box, cfg) {
    var words = (cfg.words || []).slice();
    var study = Number(cfg.study_seconds) || 30;
    var distract = Number(cfg.distract_seconds) || 0;
    var title = el('p', 'ns-w-title', cfg.title || 'Memory check');
    var stage = el('div', 'ns-w-stage');
    var disp = el('div', 'ns-w-time', '');
    var go = el('button', 'ns-w-btn', 'Show the words'); go.type = 'button';
    var reset = el('button', 'ns-w-reset', 'Start over'); reset.type = 'button';
    var out = el('p', 'ns-w-result'); out.setAttribute('aria-live', 'polite');
    var timerId = 0;
    function countdown(sec, label, done) {
      var left = sec;
      disp.textContent = label + ' ' + clock(left);
      clearInterval(timerId);
      timerId = setInterval(function () {
        left -= 1; disp.textContent = label + ' ' + clock(left);
        if (left <= 0) { clearInterval(timerId); done(); }
      }, 1000);
    }
    function showWords() {
      stage.textContent = '';
      var grid = el('div', 'ns-w-words');
      words.forEach(function (w) { grid.appendChild(el('span', '', w)); });
      stage.appendChild(grid);
      go.disabled = true;
      countdown(study, 'Study:', afterStudy);
    }
    function afterStudy() {
      stage.textContent = '';
      if (distract > 0) {
        stage.appendChild(el('p', 'ns-w-phase', cfg.distract_task || 'Count backward from 100 by sevens, out loud.'));
        countdown(distract, 'Keep going:', askRecall);
      } else { askRecall(); }
    }
    function askRecall() {
      disp.textContent = '';
      stage.textContent = '';
      stage.appendChild(el('p', 'ns-w-phase', cfg.prompt || 'Type every word you remember, in any order.'));
      var ta = el('textarea', 'ns-w-text'); ta.rows = 4; ta.setAttribute('aria-label', 'Words you remember');
      var check = el('button', 'ns-w-btn', 'Check my list'); check.type = 'button';
      stage.appendChild(ta); stage.appendChild(check);
      ta.focus();
      check.addEventListener('click', function () {
        var typed = ta.value.toLowerCase().split(/[^a-zÀ-ɏ'-]+/).filter(Boolean);
        var got = words.filter(function (w) { return typed.indexOf(w.toLowerCase()) >= 0; });
        var missed = words.filter(function (w) { return got.indexOf(w) < 0; });
        out.textContent = 'You got ' + got.length + ' of ' + words.length + '.' + (missed.length ? ' Missed: ' + missed.join(', ') + '.' : '');
        check.disabled = true;
      });
    }
    go.addEventListener('click', showWords);
    reset.addEventListener('click', function () {
      clearInterval(timerId); stage.textContent = ''; disp.textContent = ''; out.textContent = ''; go.disabled = false;
    });
    [title, disp, stage, go, reset, out].forEach(function (n) { box.appendChild(n); });
  }

  /* ---------- reaction (tap when the box changes color) ---------- */
  function reaction(box, cfg) {
    var trials = Number(cfg.trials) || 5;
    var title = el('p', 'ns-w-title', cfg.title || 'Reaction test');
    var pad = el('button', 'ns-w-pad', 'Tap to start'); pad.type = 'button';
    var out = el('p', 'ns-w-result'); out.setAttribute('aria-live', 'polite');
    var list = el('p', 'ns-material-note', '');
    var state = 'idle', t0 = 0, waitId = 0, times = [];
    function arm() {
      state = 'wait'; pad.className = 'ns-w-pad is-wait'; pad.textContent = 'Wait for it';
      waitId = setTimeout(function () { state = 'go'; pad.className = 'ns-w-pad is-go'; pad.textContent = 'Tap!'; t0 = performance.now(); }, 1200 + Math.random() * 2600);
    }
    function finish() {
      var sorted = times.slice().sort(function (a, b) { return a - b; });
      var mid = sorted[Math.floor(sorted.length / 2)];
      state = 'idle'; pad.className = 'ns-w-pad'; pad.textContent = 'Tap to go again';
      out.textContent = 'Your middle time: ' + Math.round(mid) + ' milliseconds.' + (cfg.after ? ' ' + cfg.after : '');
    }
    pad.addEventListener('click', function () {
      if (state === 'idle') { times = []; list.textContent = ''; out.textContent = ''; arm(); return; }
      if (state === 'wait') { clearTimeout(waitId); out.textContent = 'Too early. That one does not count.'; arm(); return; }
      if (state === 'go') {
        var t = performance.now() - t0; times.push(t);
        list.textContent = times.map(function (x) { return Math.round(x); }).join(', ') + ' milliseconds';
        if (times.length >= trials) finish(); else arm();
      }
    });
    [title, pad, out, list].forEach(function (n) { box.appendChild(n); });
  }

  /* ---------- stroop (read the words, then name the ink colors) ---------- */
  function stroop(box, cfg) {
    var n = Number(cfg.items) || 16;
    var COLORS = [['red', '#d64545'], ['blue', '#2f6fd6'], ['green', '#2e9e5b'], ['purple', '#8a4fc7']];
    function grid(conflict) {
      var g = el('div', 'ns-w-stroop'), last = -1;
      for (var i = 0; i < n; i++) {
        var w = Math.floor(Math.random() * 4), c = w;
        if (conflict) { do { c = Math.floor(Math.random() * 4); } while (c === w || c === last); }
        last = c;
        var sp = el('span', '', COLORS[w][0].toUpperCase());
        sp.style.color = conflict ? COLORS[c][1] : '#1b3a5c';
        g.appendChild(sp);
      }
      return g;
    }
    var title = el('p', 'ns-w-title', cfg.title || 'Color and word');
    var hint = el('p', 'ns-material-note', '');
    var holder = el('div');
    var sub = el('div');
    var phase = 0;
    var go = el('button', 'ns-w-btn', 'Show round 1'); go.type = 'button';
    [title, go, hint, holder, sub].forEach(function (x) { box.appendChild(x); });
    var cfgRounds = { title: 'Stopwatch', rounds: [cfg.round1 || 'Read the words', cfg.round2 || 'Say the ink colors'],
      result: { base: [0], compare: 1, positive: cfg.positive || 'Naming the colors took {d} seconds longer.', negative: cfg.negative || 'No difference this time. Try going faster on both rounds.' } };
    rounds(sub, cfgRounds);
    go.addEventListener('click', function () {
      holder.textContent = '';
      if (phase === 0) { holder.appendChild(grid(false)); hint.textContent = cfg.hint1 || 'Round 1: read each word out loud as fast as you can.'; go.textContent = 'Show round 2'; phase = 1; }
      else { holder.appendChild(grid(true)); hint.textContent = cfg.hint2 || 'Round 2: say the color of the ink, not the word.'; go.textContent = 'Shuffle round 2'; }
    });
  }

  /* ---------- tally (count something you notice) ---------- */
  function tally(box, cfg) {
    var title = el('p', 'ns-w-title', cfg.title || 'Counter');
    var disp = el('div', 'ns-w-time', '0');
    var lab = el('p', 'ns-material-note', cfg.label || 'Tap each time you notice it.');
    var plus = el('button', 'ns-w-btn', cfg.button || '+1'); plus.type = 'button';
    var minus = el('button', 'ns-w-reset', 'Undo'); minus.type = 'button';
    var reset = el('button', 'ns-w-reset', 'Reset'); reset.type = 'button';
    var since = el('p', 'ns-w-result'); since.setAttribute('aria-live', 'polite');
    var count = 0, start = 0, iv = 0;
    function show() {
      disp.textContent = String(count);
      if (start) { var m = Math.floor((Date.now() - start) / 60000); since.textContent = count + ' in ' + m + (m === 1 ? ' minute' : ' minutes'); }
    }
    plus.addEventListener('click', function () { if (!start) { start = Date.now(); iv = setInterval(show, 15000); } count++; show(); });
    minus.addEventListener('click', function () { if (count > 0) count--; show(); });
    reset.addEventListener('click', function () { count = 0; start = 0; clearInterval(iv); since.textContent = ''; show(); });
    [title, lab, disp, plus, minus, reset, since].forEach(function (n) { box.appendChild(n); });
  }

  /* ---------- rating (before and after, 0 to 10) ---------- */
  function rating(box, cfg) {
    var title = el('p', 'ns-w-title', cfg.title || 'Before and after');
    function slider(text) {
      var wrap = el('label', 'ns-w-rate');
      var t = el('span', 'ns-w-rate-q', text);
      var r = el('input', 'ns-w-range'); r.type = 'range'; r.min = 0; r.max = 10; r.value = 5;
      var v = el('span', 'ns-w-rate-v', '5');
      r.addEventListener('input', function () { v.textContent = r.value; });
      wrap.appendChild(t); wrap.appendChild(r); wrap.appendChild(v);
      return { wrap: wrap, r: r };
    }
    var a = slider(cfg.before || 'How strong is it right now? (0 to 10)');
    var b = slider(cfg.after || 'And now?');
    var lo = el('div', 'ns-w-row'); lo.appendChild(el('span', '', cfg.low || '0 = none')); lo.appendChild(el('span', '', cfg.high || '10 = as strong as it gets'));
    var go = el('button', 'ns-w-btn', 'Compare'); go.type = 'button';
    var out = el('p', 'ns-w-result'); out.setAttribute('aria-live', 'polite');
    go.addEventListener('click', function () {
      var d = Number(a.r.value) - Number(b.r.value);
      out.textContent = d > 0 ? (cfg.down || 'It dropped by {d}.').replace('{d}', d) : d < 0 ? (cfg.up || 'It went up by {d}. That happens. Try the steps once more, slower.').replace('{d}', -d) : (cfg.same || 'No change this time.');
    });
    [title, a.wrap, lo, b.wrap, go, out].forEach(function (n) { box.appendChild(n); });
  }

  var kinds = { rounds: rounds, timer: timer, stopwatch: stopwatch, pacer: pacer, spikes: spikes,
    recall: recall, reaction: reaction, stroop: stroop, tally: tally, rating: rating };
  function boot() {
    var boxes = document.querySelectorAll('.ns-widget[data-widget]');
    Array.prototype.forEach.call(boxes, function (box) {
      var kind = kinds[box.getAttribute('data-widget')];
      if (!kind || box.getAttribute('data-ready')) return;
      var cfg = {};
      try { cfg = JSON.parse(box.getAttribute('data-config') || '{}'); } catch (e) { cfg = {}; }
      box.textContent = '';
      kind(box, cfg);
      box.setAttribute('data-ready', '1');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

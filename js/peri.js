/* Peri Oztekin - personal site animations
 * - hero rotator (typing word cycle with blinking cursor)
 * - nav pill slider
 * - reveal-on-scroll for custom Peri classes (.proj, .skill-card, .cert, .road-step, .stat-card)
 * - EEG hero line draw-in (one-shot)
 */
(function () {
  'use strict';

  // === 1. Hero typing rotator ===
  (function rotator() {
    var el = document.getElementById('peri-rotator');
    if (!el) return;
    var words = (el.dataset.words || 'neuroscience,plasticity,recovery,curiosity,wonder').split(',').map(function (s) { return s.trim(); });
    var wi = 0, ci = 0, deleting = false;

    function tick() {
      var w = words[wi];
      if (!deleting) {
        el.textContent = w.slice(0, ++ci);
        if (ci === w.length) { deleting = true; setTimeout(tick, 1800); return; }
        setTimeout(tick, 80);
      } else {
        el.textContent = w.slice(0, --ci);
        if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; setTimeout(tick, 320); return; }
        setTimeout(tick, 45);
      }
    }
    if (window.matchMedia('(max-width: 760px)').matches) {
      el.textContent = words[0];
      return;
    }
    setTimeout(tick, 600);
  })();

  // === 2. Nav pill slider ===
  (function navPill() {
    if (window.matchMedia('(max-width: 760px)').matches) return;
    var nav = document.getElementById('nav-links');
    if (!nav) return;
    var items = Array.from(nav.querySelectorAll('a'));
    var active = items.find(function (a) { return a.classList.contains('active'); }) || items[0];
    if (!active) return;

    var pill = document.createElement('div');
    pill.id = 'nav-pill';
    nav.appendChild(pill);

    function getPos(el) {
      var nr = nav.getBoundingClientRect(), er = el.getBoundingClientRect();
      return { left: er.left - nr.left, width: er.width };
    }
    function moveTo(p, instant) {
      if (instant) {
        pill.classList.add('no-trans');
        pill.style.left = p.left + 'px';
        pill.style.width = p.width + 'px';
        pill.getBoundingClientRect();
        pill.classList.remove('no-trans');
        return;
      }
      pill.style.left = p.left + 'px';
      pill.style.width = p.width + 'px';
    }
    moveTo(getPos(active), true);
    items.forEach(function (a) {
      a.addEventListener('mouseenter', function () { moveTo(getPos(a)); });
    });
    nav.addEventListener('mouseleave', function () { moveTo(getPos(active)); });
  })();

  // === 3. Reveal on scroll for Peri-specific cards ===
  (function reveal() {
    var sels = '.proj, .skill-card, .cert, .road-step, .stat-card, .post-card, .timeline-row, .deep-section';
    var nodes = document.querySelectorAll(sels);
    if (!nodes.length || !('IntersectionObserver' in window)) return;
    nodes.forEach(function (n, i) {
      n.classList.add('peri-rev');
      n.style.setProperty('--ri', i % 8);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('peri-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    nodes.forEach(function (n) { io.observe(n); });
  })();

  // === 4. EEG line draw-in ===
  (function eegDraw() {
    var path = document.querySelector('.eeg path');
    if (!path) return;
    try {
      var len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.style.transition = 'stroke-dashoffset 2.4s cubic-bezier(.5,.05,.2,.95)';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { path.style.strokeDashoffset = 0; });
      });
    } catch (e) {}
  })();

  // === 5. Footer year ===
  (function () {
    var y = document.getElementById('cp-year');
    if (y) y.textContent = new Date().getFullYear();
  })();
})();

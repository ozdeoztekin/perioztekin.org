/* Peri Oztekin - personal site animations
 * - hero rotator (typing word cycle with blinking cursor)
 * - nav pill slider
 * - reveal-on-scroll for custom Peri classes (.proj, .skill-card, .cert, .road-step, .stat-card)
 * - EEG hero line draw-in (one-shot)
 */
(function () {
  'use strict';

  // === 1. Header brand line rotator ===
  (function headerBrandRotator() {
    var wordEl = document.getElementById('brand-choice-word');
    var lineEl = document.querySelector('.brand-choice-line');
    var brainEl = document.getElementById('brand-brain-image');
    if (!wordEl || !lineEl || !brainEl) return;
    var prefixEl = lineEl.querySelector('.brand-choice-prefix');
    var suffixEl = lineEl.querySelector('.brand-choice-suffix');
    var brainWrap = lineEl.querySelector('.brand-brain');
    [prefixEl, wordEl, suffixEl, brainWrap].forEach(function (node) {
      if (node) node.setAttribute('aria-hidden', 'true');
    });
    lineEl.setAttribute('role', 'img');

    var words = (wordEl.dataset.words || 'Mind,Thoughts,Feelings,Actions,Behavior')
      .split(',')
      .map(function (s) { return s.trim(); })
      .filter(Boolean);

    if (!words.length) return;

    var wi = 0;
    var ci = words[0].length;
    var deleting = true;

    function buildBrain(overlay) {
      return '' +
        '<circle cx="32" cy="32" r="28" fill="#18314f" opacity=".18" stroke="#7ee8de" stroke-width="1.3"/>' +
        '<path d="M31 18c-2.8-2.7-7.6-3.4-11.2-1.6c-3.4 1.7-5.5 5.2-5.4 8.8c-2.6 1.7-4.2 4.6-4.2 7.9c0 3.7 2.1 7 5.3 8.6c-.3 4.8 3.6 9.3 8.8 9.9c2.9.3 5.4-.5 7.7-2.4V18Z" fill="#f7fcff" stroke="#7ee8de" stroke-width="1.35" stroke-linejoin="round"/>' +
        '<path d="M33 18c2.8-2.7 7.6-3.4 11.2-1.6c3.4 1.7 5.5 5.2 5.4 8.8c2.6 1.7 4.2 4.6 4.2 7.9c0 3.7-2.1 7-5.3 8.6c.3 4.8-3.6 9.3-8.8 9.9c-2.9.3-5.4-.5-7.7-2.4V18Z" fill="#edf4ff" stroke="#7ee8de" stroke-width="1.35" stroke-linejoin="round"/>' +
        '<path d="M32 18v31" fill="none" stroke="#3f2870" stroke-width="1.5" stroke-linecap="round" opacity=".82"/>' +
        '<path d="M24 23c-2 1.2-3.2 3-3.4 5.3c-3.1 1.1-4.8 3.8-4.8 7.1M27 31c-2.3 1-3.7 3-3.9 5.6M40 23c2 1.2 3.2 3 3.4 5.3c3.1 1.1 4.8 3.8 4.8 7.1M37 31c2.3 1 3.7 3 3.9 5.6" fill="none" stroke="#3f2870" stroke-width="1.5" stroke-linecap="round" opacity=".82"/>' +
        overlay;
    }

    var imageMap = {
      mind: buildBrain(
        '<circle cx="50" cy="15" r="10" fill="#0f2540" stroke="#7ee8de" stroke-width="1.4"/>' +
        '<path d="M50 8.7l1.7 4.1l4.3.3l-3.3 2.8l1.1 4.4L50 18l-3.8 2.3l1.1-4.4l-3.3-2.8l4.3-.3z" fill="#7ee8de" stroke="#fff" stroke-width=".8" stroke-linejoin="round"/>'
      ),
      thoughts: buildBrain(
        '<path d="M43 15.5c0-3.6 2.9-6.5 6.7-6.5c2.2 0 4 .8 5.4 2.4c3 .2 5.4 2.5 5.4 5.4c0 3.3-2.8 5.9-6.3 5.9h-7.6l-3.4 2.7l.6-3.8c-1.7-1-2.8-2.8-2.8-4.9z" fill="#6c47b6" stroke="#fff" stroke-width="1"/>' +
        '<circle cx="48.7" cy="16.7" r="1.3" fill="#fff"/><circle cx="52.7" cy="16.7" r="1.3" fill="#fff"/><circle cx="56.7" cy="16.7" r="1.3" fill="#fff"/>'
      ),
      feelings: buildBrain(
        '<path d="M50 24.2l-4.4-4.1c-1.9-1.8-2.1-4.8-.4-6.7c1.6-1.5 4.1-1.5 5.5.1c1.5-1.6 4-1.6 5.5-.1c1.8 1.9 1.6 4.9-.4 6.7z" fill="#e76f51" stroke="#fff" stroke-width="1.1"/>'
      ),
      actions: buildBrain(
        '<circle cx="51" cy="14" r="8" fill="#2a9d8f" stroke="#fff" stroke-width="1.1"/>' +
        '<path d="M45.8 19.2l9.6-9.6m0 0h-5.1m5.1 0v5.1m-10.2 4.7h11.8" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
      ),
      behavior: buildBrain(
        '<circle cx="44" cy="12" r="3.2" fill="#e9c46a"/><circle cx="56" cy="18" r="3.2" fill="#6c47b6"/><circle cx="48.5" cy="29" r="3.2" fill="#2a9d8f"/>' +
        '<path d="M44 12l12 6l-7.5 11" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
      )
    };

    function applyState(word) {
      var key = word.toLowerCase();
      lineEl.classList.remove('mind', 'thoughts', 'feelings', 'actions', 'behavior');
      lineEl.classList.add(key);
      lineEl.setAttribute('aria-label', 'Your ' + word + ' Your Power');
      if (imageMap[key]) {
        brainEl.innerHTML = imageMap[key];
      }
    }

    function tick() {
      var w = words[wi];
      applyState(w);

      if (!deleting) {
        wordEl.textContent = w.slice(0, ++ci);
        if (ci === w.length) { deleting = true; setTimeout(tick, 1800); return; }
        setTimeout(tick, 85);
      } else {
        wordEl.textContent = w.slice(0, --ci);
        if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; setTimeout(tick, 260); return; }
        setTimeout(tick, 48);
      }
    }

    wordEl.textContent = words[0];
    applyState(words[0]);
    setTimeout(tick, 1200);
  })();

  // === 2. Mobile nav toggle ===
  (function mobileNav() {
    var nav = document.getElementById('nav-links');
    var button = document.querySelector('.hamburger');
    if (!nav || !button) return;

    function syncState(open) {
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    syncState(nav.classList.contains('open'));

    button.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      syncState(open);
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (!window.matchMedia('(max-width: 760px)').matches) return;
        nav.classList.remove('open');
        syncState(false);
      });
    });

    window.addEventListener('resize', function () {
      if (window.matchMedia('(max-width: 760px)').matches) return;
      nav.classList.remove('open');
      syncState(false);
    });
  })();

  // === 3. Hero typing rotator ===
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

  // === 4. Nav pill slider ===
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

  // === 5. Reveal on scroll for Peri-specific cards ===
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

  // === 6. EEG line draw-in ===
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

  // === 6. Footer year ===
  (function () {
    var y = document.getElementById('cp-year');
    if (y) y.textContent = new Date().getFullYear();
  })();
})();

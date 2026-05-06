/* impact.js — render quantifiable metrics from /data/metrics.json
 *
 * Data flow: metrics.json is the source of truth. To update any number,
 * edit the JSON, push, and the dashboard reflects it.
 */
(function () {
  'use strict';

  function fmt(n, format) {
    if (format === 'currency') {
      return '$' + Number(n).toLocaleString('en-US');
    }
    return Number(n).toLocaleString('en-US');
  }

  function escape(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function renderHeadline(data, host) {
    if (!host) return;
    host.innerHTML = data.headline.map(function (s) {
      return (
        '<div class="impact-headline-card peri-rev">' +
          '<span class="impact-num">' + escape(fmt(s.value, s.format)) + '</span>' +
          '<span class="impact-label">' + escape(s.label) + '</span>' +
          '<span class="impact-note">' + escape(s.note || '') + '</span>' +
          '<span class="impact-source">Source: ' + escape(s.verifiedBy) + '</span>' +
        '</div>'
      );
    }).join('');
  }

  function renderHomeMini(data, host) {
    if (!host) return;
    host.innerHTML = data.headline.slice(0, 4).map(function (s) {
      return (
        '<div class="mini-impact peri-rev">' +
          '<span class="mn">' + escape(fmt(s.value, s.format)) + '</span>' +
          '<span class="ml">' + escape(s.label) + '</span>' +
        '</div>'
      );
    }).join('');
  }

  function renderGoals(data, host) {
    if (!host) return;
    host.innerHTML = data.goals.map(function (g) {
      var pct = Math.max(0, Math.min(100, Number(g.progress || 0)));
      var status = pct >= 100 ? 'done' : (pct > 0 ? 'started' : 'pending');
      return (
        '<div class="goal peri-rev" data-status="' + status + '">' +
          '<div class="goal-head">' +
            '<h4>' + escape(g.title) + '</h4>' +
            '<span class="goal-pct">' + pct + '%</span>' +
          '</div>' +
          '<div class="goal-bar"><div class="goal-fill" style="width:' + pct + '%"></div></div>' +
          '<p class="goal-target">Target: ' + escape(g.target) + '</p>' +
          (g.due ? '<p class="goal-due">Due ' + escape(g.due) + '</p>' : '') +
          (g.notes ? '<p class="goal-notes">' + escape(g.notes) + '</p>' : '') +
        '</div>'
      );
    }).join('');
  }

  function renderCredentials(data, host) {
    if (!host) return;
    host.innerHTML = data.credentials.verified.map(function (c) {
      return (
        '<li class="cred-row peri-rev">' +
          '<span class="cred-name">' + escape(c.name) + '</span>' +
          '<span class="cred-issuer">' + escape(c.issuer) + '</span>' +
          '<span class="cred-meta">' + (c.score ? escape(c.score) + ' &middot; ' : '') + escape(c.year) + '</span>' +
        '</li>'
      );
    }).join('');
  }

  function renderProjects(data, host) {
    if (!host) return;
    host.innerHTML = data.projects.map(function (p) {
      return (
        '<div class="proj-row peri-rev">' +
          '<span class="proj-status proj-' + escape(p.status.replace(/\s+/g, '-')) + '">' + escape(p.status) + '</span>' +
          '<h4>' + escape(p.name) + '</h4>' +
          '<p class="proj-context">' + escape(p.context) + '</p>' +
          '<p class="proj-metric">' + escape(p.metric) + '</p>' +
        '</div>'
      );
    }).join('');
  }

  function renderHonors(data, host) {
    if (!host || !data.honors) return;
    host.innerHTML = data.honors.map(function (h) {
      return (
        '<li class="honor-row peri-rev">' +
          '<span class="honor-year">' + escape(h.year) + '</span>' +
          '<span class="honor-name">' + escape(h.name) + '</span>' +
          (h.context ? '<span class="honor-ctx">' + escape(h.context) + '</span>' : '') +
        '</li>'
      );
    }).join('');
  }

  function renderUpdated(data, host) {
    if (!host) return;
    host.textContent = 'Last updated ' + data.lastUpdated;
  }

  function init() {
    fetch('/data/metrics.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        renderHeadline(data, document.getElementById('impact-headline'));
        renderHomeMini(data, document.getElementById('home-mini-impact'));
        renderGoals(data, document.getElementById('impact-goals'));
        renderCredentials(data, document.getElementById('impact-credentials'));
        renderProjects(data, document.getElementById('impact-projects'));
        renderHonors(data, document.getElementById('impact-honors'));
        renderUpdated(data, document.getElementById('impact-updated'));
      })
      .catch(function (e) {
        console.warn('metrics load failed', e);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

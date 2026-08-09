/* ============================================
   PHP to Go — Mermaid Diagrams Renderer
   Loads Mermaid from CDN and renders <pre class="mermaid">
   blocks with book-matched theme (light/dark, Vazirmatn).
   Dispatches `diagrams:rendered` after each render pass so
   other scripts (e.g. diagram zoom) can re-bind.
   ============================================ */

(function () {
  'use strict';

  var MERMAID_CDN = 'https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js';

  // Book palette (kept in sync with main.css)
  var PALETTE = {
    light: {
      // surfaces
      bg:           '#ffffff',
      primaryColor: '#f8fafc',
      secondaryColor:'#eef2f7',
      tertiaryColor:'#f1f5f9',
      clusterBkg:   '#fafbfc',
      clusterBorder:'#dbe3ec',
      // lines & text
      lineColor:    '#64748b',
      primaryTextColor:   '#1f2937',
      secondaryTextColor: '#334155',
      edgeLabelBackground:'#ffffff',
      // accents (PHP purple, Go cyan, success green, warning amber)
      phpBkg:       '#f5f0fb',
      phpBorder:    '#777BB4',
      goBkg:        '#e6f9fc',
      goBorder:     '#00ADD8',
      successBkg:   '#ecfdf5',
      successBorder:'#10b981',
      warningBkg:   '#fffbeb',
      warningBorder:'#f59e0b',
      dangerBkg:    '#fef2f2',
      dangerBorder: '#ef4444'
    },
    dark: {
      bg:           '#0f172a',
      primaryColor: '#1e293b',
      secondaryColor:'#273449',
      tertiaryColor:'#172033',
      clusterBkg:   '#0f172a',
      clusterBorder:'#334155',
      lineColor:    '#94a3b8',
      primaryTextColor:   '#e2e8f0',
      secondaryTextColor: '#cbd5e1',
      edgeLabelBackground:'#1e293b',
      phpBkg:       '#241a36',
      phpBorder:    '#a78bfa',
      goBkg:        '#0c2a33',
      goBorder:     '#22d3ee',
      successBkg:   '#0a2a1f',
      successBorder:'#34d399',
      warningBkg:   '#2a1f0a',
      warningBorder:'#fbbf24',
      dangerBkg:    '#2a0f0f',
      dangerBorder: '#f87171'
    }
  };

  function currentThemeName() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function buildConfig() {
    var theme = currentThemeName();
    var p = PALETTE[theme];
    return {
      startOnLoad: false,
      // Use 'base' theme and override variables fully — gives the cleanest look
      theme: 'base',
      fontFamily: 'Vazirmatn, Inter, system-ui, sans-serif',
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        padding: 18,
        nodeSpacing: 45,
        rankSpacing: 55,
        useMaxWidth: true,
        wrappingWidth: 220
      },
      sequence: {
        actorMargin: 60,
        boxMargin: 12,
        noteMargin: 12,
        messageMargin: 40,
        mirrorActors: true,
        useMaxWidth: true
      },
      mindmap: { useMaxWidth: true, padding: 16 },
      state: { useMaxWidth: true },
      gantt: { useMaxWidth: true },
      themeVariables: {
        fontFamily: 'Vazirmatn, Inter, system-ui, sans-serif',
        fontSize: '14px',

        background: p.bg,
        primaryColor: p.primaryColor,
        primaryTextColor: p.primaryTextColor,
        primaryBorderColor: p.goBorder,
        secondaryColor: p.secondaryColor,
        secondaryTextColor: p.secondaryTextColor,
        secondaryBorderColor: p.clusterBorder,
        tertiaryColor: p.tertiaryColor,
        tertiaryTextColor: p.primaryTextColor,
        tertiaryBorderColor: p.clusterBorder,

        lineColor: p.lineColor,
        textColor: p.primaryTextColor,
        edgeLabelBackground: p.edgeLabelBackground,

        clusterBkg: p.clusterBkg,
        clusterBorder: p.clusterBorder,

        // class / state borders
        nodeBorder: p.goBorder,
        clusterBkg2: p.clusterBkg,

        // gantt
        gridColor: p.lineColor,
        doneTaskBkgColor: p.successBorder,
        doneTaskTextColor: p.bg,
        activeTaskBkgColor: p.goBorder,
        activeTaskTextColor: p.bg,
        taskBkgColor: p.phpBorder,
        taskTextColor: p.bg,
        taskTextDarkColor: p.bg,
        taskTextLightColor: p.bg,
        taskTextOutsideColor: p.bg,
        sectionBkgColor: p.tertiaryColor,
        sectionBkgColor2: p.secondaryColor,
        altSectionBkgColor: p.tertiaryColor,

        // sequence
        actorBkg: p.primaryColor,
        actorBorder: p.goBorder,
        actorTextColor: p.primaryTextColor,
        actorLineColor: p.lineColor,
        signalColor: p.lineColor,
        signalTextColor: p.primaryTextColor,
        labelBoxBkgColor: p.primaryColor,
        labelBoxBorderColor: p.phpBorder,
        labelTextColor: p.primaryTextColor,
        loopTextColor: p.primaryTextColor,
        noteBkgColor: p.warningBkg,
        noteTextColor: p.primaryTextColor,
        noteBorderColor: p.warningBorder,
        activationBkgColor: p.secondaryColor,
        activationBorderColor: p.clusterBorder
      }
    };
  }

  // ---- Load Mermaid from CDN once ----
  function loadMermaid(cb) {
    if (window.mermaid) { cb(); return; }
    var s = document.createElement('script');
    s.src = MERMAID_CDN;
    s.async = true;
    s.onload = function () { cb(); };
    s.onerror = function () {
      console.warn('[diagrams.js] Mermaid CDN failed; diagrams will not render.');
    };
    document.head.appendChild(s);
  }

  // ---- Render pass ----
  var renderGeneration = 0;
  function renderAll() {
    if (!window.mermaid) return;
    var cfg = buildConfig();
    try { mermaid.initialize(cfg); } catch (e) { console.warn(e); }

    var nodes = Array.prototype.slice.call(
      document.querySelectorAll('pre.mermaid:not([data-processed]), div.mermaid:not([data-processed])')
    );
    if (nodes.length === 0) {
      // Even when nothing to render, notify so zoom can re-bind on theme change
      document.dispatchEvent(new CustomEvent('diagrams:rendered', { detail: { count: 0 } }));
      return;
    }

    renderGeneration++;
    var gen = renderGeneration;
    var remaining = nodes.length;

    nodes.forEach(function (el) {
      // Mark processed up-front so we don't double-render
      el.setAttribute('data-processed', 'true');
      // Stash source so we can re-render on theme change
      if (!el.getAttribute('data-source')) {
        el.setAttribute('data-source', el.textContent);
      }
      try {
        mermaid.run({ nodes: [el] }).then(function () {
          if (--remaining === 0 && gen === renderGeneration) {
            document.dispatchEvent(new CustomEvent('diagrams:rendered', { detail: { count: nodes.length } }));
          }
        }).catch(function (err) {
          console.warn('[diagrams.js] mermaid.run error:', err, el);
          if (--remaining === 0 && gen === renderGeneration) {
            document.dispatchEvent(new CustomEvent('diagrams:rendered', { detail: { count: nodes.length } }));
          }
        });
      } catch (e) {
        console.warn('[diagrams.js] mermaid.run threw:', e, el);
        if (--remaining === 0 && gen === renderGeneration) {
          document.dispatchEvent(new CustomEvent('diagrams:rendered', { detail: { count: nodes.length } }));
        }
      }
    });
  }

  // ---- Re-render on theme change (debounced) ----
  function scheduleRerender() {
    clearTimeout(scheduleRerender._t);
    scheduleRerender._t = setTimeout(function () {
      // Reset processed flags so they render again
      document.querySelectorAll('pre.mermaid[data-processed], div.mermaid[data-processed]').forEach(function (el) {
        el.removeAttribute('data-processed');
        // Restore source text (Mermaid replaces innerHTML with SVG)
        var src = el.getAttribute('data-source');
        if (src != null) {
          el.textContent = src;
        }
      });
      renderAll();
    }, 150);
  }

  // ---- Bootstrap ----
  document.addEventListener('DOMContentLoaded', function () {
    loadMermaid(function () {
      // Slight delay so theme bootstrap script has run and CSS is applied
      setTimeout(renderAll, 30);
    });
  });

  // Observe data-theme on <html>
  if (typeof MutationObserver !== 'undefined') {
    var obs = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].attributeName === 'data-theme') {
          scheduleRerender();
          return;
        }
      }
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

})();

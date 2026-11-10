/*
  You don't need to edit this file.
  It does three things:
    1. Draws the hanging lamp and makes it switch the lighting (dark board <-> light case report).
    2. Draws the red strings and pin heads between the [data-pin] points on the board.
    3. When you point at something on the board, lights up the string that leads from it back to you.

  To connect two new things with a string, give each one a <span class="pin" data-pin="some-name">
  in index.html and add ["first-name", "second-name"] to STRINGS below.
*/
(function () {
  "use strict";

  var STRINGS = [
    ["subject-top", "resume-tag"],
    ["subject-top", "projects-tag"],
    ["subject-bottom", "contact"],
    ["subject-bottom", "timeline-tag"],
    ["tl-end", "skills-tag"],
    ["projects-tag", "p1"],
    ["projects-tag", "p2"],
    ["projects-tag", "p3"],
    ["projects-tag", "p4"],
    ["projects-tag", "p5"],
    ["resume-foot", "tl-start"],
    ["tl-start", "t1"],
    ["t1", "t2"],
    ["t2", "t3"],
    ["t3", "t4"],
    ["t4", "tl-end"]
  ];

  var root = document.documentElement;
  var BOARD_MQ = window.matchMedia("(min-width: 900px) and (min-height: 520px)");
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)");
  var isBoardPage = root.dataset.page === "board";
  var NS = "http://www.w3.org/2000/svg";

  document.querySelectorAll("[data-year]").forEach(function (n) {
    n.textContent = String(new Date().getFullYear());
  });

  // ---------------------------------------------------------------
  // 1. Lamp = theme toggle
  // ---------------------------------------------------------------
  var LAMP_SVG =
    '<svg viewBox="0 0 120 150" aria-hidden="true" focusable="false">' +
      '<defs>' +
        '<radialGradient id="lamp-glow" cx="50%" cy="50%" r="50%">' +
          '<stop offset="0" stop-color="#ffe2a8" stop-opacity=".9"/>' +
          '<stop offset=".35" stop-color="#ffc56e" stop-opacity=".35"/>' +
          '<stop offset="1" stop-color="#ffb04a" stop-opacity="0"/>' +
        '</radialGradient>' +
        '<linearGradient id="lamp-shade" x1="0" x2="1">' +
          '<stop offset="0" stop-color="#000" stop-opacity=".35"/>' +
          '<stop offset=".45" stop-color="#fff" stop-opacity=".08"/>' +
          '<stop offset="1" stop-color="#000" stop-opacity=".45"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<line class="cord" x1="60" y1="-400" x2="60" y2="64" stroke-width="2"/>' +
      '<rect class="rim" x="53" y="60" width="14" height="11" rx="2"/>' +
      '<circle class="glow" cx="60" cy="116" r="44" fill="url(#lamp-glow)"/>' +
      '<path class="shade" d="M16 113 C18 84 38 69 60 69 C82 69 102 84 104 113 Z"/>' +
      '<path d="M16 113 C18 84 38 69 60 69 C82 69 102 84 104 113 Z" fill="url(#lamp-shade)"/>' +
      '<ellipse class="rim" cx="60" cy="113" rx="44" ry="4.5"/>' +
      '<ellipse class="bulb" cx="60" cy="115" rx="14" ry="8"/>' +
      '<line class="chain" x1="90" y1="113" x2="90" y2="134" stroke-width="1.5" stroke-dasharray="2 1.5"/>' +
      '<circle class="bead" cx="90" cy="137" r="3"/>' +
    '</svg>';

  var lamp = document.querySelector(".lamp");

  function theme() {
    return root.dataset.theme === "light" ? "light" : "dark";
  }

  function syncMode() {
    root.classList.toggle("board-mode", isBoardPage && theme() === "dark" && BOARD_MQ.matches);
  }

  function applyTheme(next) {
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    if (lamp) lamp.setAttribute("aria-pressed", String(next === "dark"));
    syncMode();
    drawStrings(false);
  }

  if (lamp) {
    lamp.innerHTML = LAMP_SVG + '<span class="lamp-hint" aria-hidden="true"></span>';
    lamp.setAttribute("aria-pressed", String(theme() === "dark"));
    lamp.addEventListener("click", function () {
      var next = theme() === "dark" ? "light" : "dark";
      lamp.classList.add("is-pulled");
      window.setTimeout(function () { lamp.classList.remove("is-pulled"); }, 350);
      if (document.startViewTransition && !REDUCED.matches) {
        document.startViewTransition(function () { applyTheme(next); });
      } else {
        applyTheme(next);
      }
    });
  }

  // ---------------------------------------------------------------
  // 2. Strings and pin heads
  // ---------------------------------------------------------------
  var board = document.querySelector(".board");
  var svg = document.querySelector(".strings");
  var hasDrawnIn = false;

  function el(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function drawStrings(allowDrawIn) {
    if (!svg) return;
    if (!root.classList.contains("board-mode")) {
      svg.replaceChildren();
      return;
    }
    var box = svg.getBoundingClientRect();
    if (!box.width) return;
    var u = box.width / 100;                       // 1% of the board's width, in pixels
    svg.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);
    svg.style.setProperty("--sw", Math.max(1.4, u * 0.17) + "px");

    var pts = {};
    document.querySelectorAll("[data-pin]").forEach(function (p) {
      var r = p.getBoundingClientRect();
      pts[p.dataset.pin] = { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
    });

    var defs = el("defs", {});
    var grad = el("radialGradient", { id: "pin-head", cx: "35%", cy: "30%", r: "70%" });
    grad.append(
      el("stop", { offset: "0", "stop-color": "#f07a6b" }),
      el("stop", { offset: ".45", "stop-color": "#c3261c" }),
      el("stop", { offset: "1", "stop-color": "#5e0d08" })
    );
    var blur = el("filter", { id: "string-blur", x: "-5%", y: "-5%", width: "110%", height: "110%" });
    blur.append(el("feGaussianBlur", { stdDeviation: String(u * 0.12) }));
    defs.append(grad, blur);

    var shadows = el("g", { filter: "url(#string-blur)", transform: "translate(" + u * 0.18 + " " + u * 0.42 + ")" });
    var lines = el("g", {});
    var heads = el("g", {});

    var animate = allowDrawIn && !hasDrawnIn && !REDUCED.matches;

    STRINGS.forEach(function (pair, i) {
      var a = pts[pair[0]], b = pts[pair[1]];
      if (!a || !b) return;
      var dx = b.x - a.x, dy = b.y - a.y;
      var len = Math.hypot(dx, dy);
      var sag = Math.min(len * 0.07, u * 2.4) * (Math.abs(dx) / (len || 1));   // strings droop a little
      var d = "M" + a.x + " " + a.y + " Q" + (a.x + dx / 2) + " " + (a.y + dy / 2 + sag) + " " + b.x + " " + b.y;

      var shadow = el("path", { d: d, class: "string-shadow" });
      var line = el("path", { d: d, class: "string", "data-a": pair[0], "data-b": pair[1] });
      shadows.append(shadow);
      lines.append(line);
      if (animate) {
        var L = Math.ceil(len * 1.1) + 2;
        [shadow, line].forEach(function (p) {
          p.style.setProperty("--len", String(L));
          p.style.setProperty("--d", (0.55 + i * 0.07).toFixed(2) + "s");
        });
      }
    });

    var r = u * 0.55;
    Object.keys(pts).forEach(function (id) {
      var p = pts[id];
      heads.append(
        el("ellipse", { cx: p.x + r * 0.45, cy: p.y + r * 0.8, rx: r * 1.05, ry: r * 0.8, fill: "rgba(0,0,0,.45)", filter: "url(#string-blur)" }),
        el("circle", { cx: p.x, cy: p.y, r: r, fill: "url(#pin-head)" }),
        el("circle", { cx: p.x - r * 0.32, cy: p.y - r * 0.36, r: r * 0.26, fill: "rgba(255,255,255,.55)" })
      );
    });

    svg.replaceChildren(defs, shadows, lines, heads);

    if (animate) {
      hasDrawnIn = true;
      svg.classList.add("is-drawing");
      window.setTimeout(function () { svg.classList.remove("is-drawing"); }, 3200);
    }
  }

  // ---------------------------------------------------------------
  // 3. Trace the string from whatever you point at back to the subject
  // ---------------------------------------------------------------
  function nodeOfPin(pin) {
    var p = document.querySelector('[data-pin="' + pin + '"]');
    var n = p && p.closest("[data-node]");
    return n ? n.dataset.node : null;
  }

  var graph = {};
  STRINGS.forEach(function (pair) {
    var a = nodeOfPin(pair[0]), b = nodeOfPin(pair[1]);
    if (!a || !b) return;
    (graph[a] = graph[a] || []).push({ to: b, pair: pair });
    (graph[b] = graph[b] || []).push({ to: a, pair: pair });
  });

  function pathToSubject(start) {
    if (start === "subject") return (graph.subject || []).map(function (e) { return e.pair; });
    var prev = {}, queue = [start], seen = {};
    seen[start] = true;
    while (queue.length) {
      var n = queue.shift();
      if (n === "subject") break;
      (graph[n] || []).forEach(function (e) {
        if (seen[e.to]) return;
        seen[e.to] = true;
        prev[e.to] = { from: n, pair: e.pair };
        queue.push(e.to);
      });
    }
    var out = [], cur = "subject";
    while (prev[cur]) { out.push(prev[cur].pair); cur = prev[cur].from; }
    return out;
  }

  function trace(node) {
    if (!svg || !board) return;
    var pairs = node ? pathToSubject(node) : [];
    board.classList.toggle("is-tracing", pairs.length > 0);
    svg.querySelectorAll(".string").forEach(function (s) {
      var hit = pairs.some(function (p) { return p[0] === s.dataset.a && p[1] === s.dataset.b; });
      s.classList.toggle("is-traced", hit);
    });
  }

  if (board) {
    var onPoint = function (e) {
      if (!root.classList.contains("board-mode")) return;
      var n = e.target.closest && e.target.closest("[data-node]");
      trace(n ? n.dataset.node : null);
    };
    board.addEventListener("pointerover", onPoint);
    board.addEventListener("focusin", onPoint);
    board.addEventListener("pointerleave", function () { trace(null); });
    board.addEventListener("focusout", function () { trace(null); });
  }

  // ---------------------------------------------------------------
  // Keep everything in sync
  // ---------------------------------------------------------------
  var queued = false, started = false;
  function redraw() {
    if (queued || !started) return;
    queued = true;
    window.requestAnimationFrame(function () { queued = false; drawStrings(false); });
  }

  BOARD_MQ.addEventListener("change", function () { syncMode(); redraw(); });
  if (board && "ResizeObserver" in window) new ResizeObserver(redraw).observe(board);

  // Wait for the fonts so labels have their final size before the strings are measured.
  syncMode();
  function start() {
    if (started) return;
    started = true;
    drawStrings(true);
  }
  var loaded = new Promise(function (resolve) {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", resolve, { once: true });
  });
  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.all([loaded, fontsReady]).then(start);
  window.setTimeout(start, 3000);
})();

// Edits by Sampu - small, light motion. Everything is visible without this file; it only adds motion.
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // smooth scrolling (same library as the pranish-store site); skipped for reduced motion or if the CDN fails
  if (!reduce && window.Lenis) {
    try {
      var lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener("click", function (e) {
          var id = a.getAttribute("href");
          if (id.length > 1 && document.querySelector(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -10 }); }
        });
      });
    } catch (e) { /* plain scrolling */ }
  }

  // reveal sections that start below the fold; bars and numbers animate when their section appears
  function countUp(el) {
    var end = +el.getAttribute("data-count"), t0 = null, dur = 1100;
    if (reduce) { el.textContent = end.toLocaleString("en-US"); return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function fillBars(root) {
    root.querySelectorAll(".fill").forEach(function (f) {
      f.style.left = f.getAttribute("data-left") + "%";
      f.style.width = f.getAttribute("data-width") + "%";
    });
  }
  var secs = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var vh = window.innerHeight;
    secs.forEach(function (s) {
      if (s.getBoundingClientRect().top > vh * 0.9) {
        s.classList.add("armed");
        s.querySelectorAll(".fill").forEach(function (f) { f.style.width = "0%"; f.style.left = "0%"; });
        s.querySelectorAll("[data-count]").forEach(function (c) { c.textContent = "0"; });
      } else { fillBars(s); }
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var s = en.target;
        if (s.classList.contains("armed")) {
          s.classList.add("in"); s.classList.remove("armed");
          fillBars(s);
          s.querySelectorAll("[data-count]").forEach(countUp);
        }
        io.unobserve(s);
      });
    }, { threshold: 0.18 });
    secs.forEach(function (s) { io.observe(s); });
  } else {
    secs.forEach(fillBars);
  }

  // phone preview: captions play word by word while the playhead runs along the timeline
  var lines = [
    ["MOST", "PEOPLE", "SWIPE"], ["IN", "ONE", "SECOND."], ["SO", "THE", "HOOK"], ["GOES", "ON", "FRAME", "ONE."],
    ["THEN", "EVERY", "WORD"], ["LANDS", "ON", "SCREEN."]
  ];
  var caps = document.getElementById("caps"), bar = document.getElementById("pbar"),
      head = document.getElementById("head"), tc = document.getElementById("tc"), wave = document.getElementById("wave");
  if (wave) {
    var h = [6, 12, 18, 9, 20, 14, 7, 16, 22, 11, 8, 18, 13, 21, 10, 6, 15, 19, 9, 12, 17, 8, 14, 20, 11, 7, 16, 12];
    h.forEach(function (v) { var i = document.createElement("i"); i.style.height = v + "px"; wave.appendChild(i); });
  }
  if (caps) {
    var words = [], li, wi;
    lines.forEach(function (l, i) { l.forEach(function (w, j) { words.push({ line: i, idx: j }); }); });
    var total = words.length, k = 0, stepMs = reduce ? 1400 : 330;
    function show(n) {
      var w = words[n], l = lines[w.line];
      if (caps.getAttribute("data-line") !== String(w.line)) {
        caps.innerHTML = l.map(function (x) { return "<b>" + x + "</b>"; }).join(" ");
        caps.setAttribute("data-line", String(w.line));
      }
      var bs = caps.querySelectorAll("b");
      bs.forEach(function (b, i) { b.classList.toggle("on", i === w.idx); });
      var p = (n + 1) / total;
      bar.style.width = (p * 100) + "%";
      head.style.left = "calc(" + (p * 100) + "% - " + (p * 20) + "px + 10px)";
      var sec = Math.round(p * 24);
      tc.textContent = "00:00:" + (sec < 10 ? "0" : "") + sec;
    }
    show(0);
    setInterval(function () { k = (k + 1) % total; show(k); }, stepMs);
  }

  // copy email
  var btn = document.getElementById("copyBtn");
  if (btn) btn.addEventListener("click", function () {
    var text = document.getElementById("email").textContent;
    function selectIt() {
      var r = document.createRange(); r.selectNodeContents(document.getElementById("email"));
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      btn.textContent = "Selected, press Ctrl+C";
    }
    try { navigator.clipboard.writeText(text).then(function () { btn.textContent = "Copied"; }, selectIt); }
    catch (e) { selectIt(); }
  });
})();

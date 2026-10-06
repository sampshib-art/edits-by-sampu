// Edits by Sampu - light motion only. The page is complete without this file.
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // smooth scrolling (same library as the pranish-store site); skipped for reduced motion or if the CDN fails
  if (!reduce && window.Lenis) {
    try {
      var lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    } catch (e) { /* plain scrolling */ }
  }

  // clips play only while on screen (saves battery and data on phones)
  var vids = document.querySelectorAll(".reel video");
  if ("IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting && !reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else { v.pause(); }
      });
    }, { threshold: 0.35 });
    vids.forEach(function (v) { vio.observe(v); });
  }

  // sections below the fold fade up; numbers count to their real value; bars grow
  function countUp(el) {
    var end = +el.getAttribute("data-count"), t0 = null;
    if (reduce) { el.textContent = end.toLocaleString("en-US"); return; }
    (function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1100), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
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
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var s = e.target;
        if (s.classList.contains("armed")) {
          s.classList.add("in"); s.classList.remove("armed");
          fillBars(s);
          s.querySelectorAll("[data-count]").forEach(countUp);
        }
        io.unobserve(s);
      });
    }, { threshold: 0.2 });
    secs.forEach(function (s) { io.observe(s); });
  } else {
    secs.forEach(fillBars);
  }

  // copy email
  var btn = document.getElementById("copyBtn");
  if (btn) btn.addEventListener("click", function () {
    var el = document.getElementById("email"), text = el.textContent.trim();
    function selectIt() {
      var r = document.createRange(); r.selectNodeContents(el);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      btn.textContent = "Selected, press Ctrl+C";
    }
    try { navigator.clipboard.writeText(text).then(function () { btn.textContent = "Copied"; }, selectIt); }
    catch (e) { selectIt(); }
  });
})();

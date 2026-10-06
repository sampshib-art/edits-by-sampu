// Edits by Sampu - motion layer. The page is complete without this file.
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lenis = null;

  // smooth scrolling + in-page links glide (same library as the pranish-store site)
  if (!reduce && window.Lenis) {
    try {
      lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener("click", function (e) {
          var id = a.getAttribute("href");
          if (id.length > 1 && document.querySelector(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -70 }); }
        });
      });
    } catch (e) { lenis = null; }
  }

  // nav gets a solid background once you scroll
  var nav = document.getElementById("nav");
  function onScroll() {
    var y = window.scrollY || 0;
    if (nav) nav.classList.toggle("solid", y > 20);
    // hero phones drift at different speeds (parallax)
    if (!reduce && stack) {
      phones.forEach(function (p) {
        var d = parseFloat(p.getAttribute("data-depth") || "1");
        p.style.transform = "translateY(" + (-y * 0.12 * d).toFixed(1) + "px)";
      });
    }
  }
  var stack = document.getElementById("stack");
  var phones = stack ? Array.prototype.slice.call(stack.querySelectorAll(".phone")) : [];
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // videos play only while visible (saves battery/data on phones)
  if ("IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting && !reduce) {
          if (v.preload === "none") v.preload = "auto";
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else { v.pause(); }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll("video").forEach(function (v) { vio.observe(v); });
  }

  // sections below the fold rise in as you reach them
  var secs = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var vh = window.innerHeight;
    secs.forEach(function (s) { if (s.getBoundingClientRect().top > vh * 0.92) s.classList.add("armed"); });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in"); e.target.classList.remove("armed"); io.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    secs.forEach(function (s) { io.observe(s); });
  }

  // drag to scroll the work reel with a mouse
  var reel = document.querySelector(".reel");
  if (reel) {
    var down = false, sx = 0, sl = 0;
    reel.addEventListener("mousedown", function (e) { down = true; sx = e.pageX; sl = reel.scrollLeft; reel.style.scrollSnapType = "none"; });
    window.addEventListener("mouseup", function () { if (down) { down = false; reel.style.scrollSnapType = ""; } });
    reel.addEventListener("mousemove", function (e) { if (down) { e.preventDefault(); reel.scrollLeft = sl - (e.pageX - sx); } });
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

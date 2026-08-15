/* Seedling Kenya — site interactions */
(function () {
  "use strict";

  /* ── Intro: reveal the site after the growing-seedling animation ── */
  var intro = document.getElementById("intro");

  function hideIntro() {
    if (!intro) return;
    intro.classList.add("hidden");
    document.body.style.overflow = "";
    window.removeEventListener("keydown", skipIntro);
  }

  function skipIntro(e) {
    if (e.key === "Escape" || e.key === "Enter") {
      hideIntro();
      showReveals();
    }
  }

  // Auto-dismiss after the animation completes (stems ~3.4s, title ~2.5s)
  window.setTimeout(function () {
    if (intro) hideIntro();
  }, 4200);

  // Allow clicking anywhere to skip
  if (intro) {
    intro.addEventListener("click", hideIntro);
    document.body.style.overflow = "hidden"; // lock scroll during intro
    window.addEventListener("keydown", skipIntro);
  }

  /* ── Scroll reveal ── */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function showReveals() {
    revealEls.forEach(function (el) {
      if (!el.classList.contains("visible")) el.classList.add("visible");
    });
  }

  var revealObserver;
  if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    showReveals();
  }

  // If intro was skipped instantly, reveal everything
  window.setTimeout(function () {
    revealEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) el.classList.add("visible");
    });
  }, 500);

  /* ── Animated counters ── */
  var counters = Array.prototype.slice.call(document.querySelectorAll(".stat-num"));

  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var dur = 1400;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      // ease-out
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  var counterObserver;
  if ("IntersectionObserver" in window) {
    counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (c) { counterObserver.observe(c); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ── Header scroll state ── */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (window.scrollY > 10) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
    highlightNav();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── Active nav link on scroll ── */
  var sections = Array.prototype.slice
    .call(document.querySelectorAll("main section[id], main section"))
    .filter(function (s) { return s.id; });
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));

  function highlightNav() {
    var pos = window.scrollY + 120;
    var currentId = "";
    sections.forEach(function (s) {
      if (pos >= s.offsetTop) currentId = s.id;
    });
    navLinks.forEach(function (l) {
      var match = l.getAttribute("href") === "#" + currentId;
      l.classList.toggle("active", match);
    });
  }

  /* ── Mobile nav toggle ── */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("siteNav");

  function closeNav() {
    nav.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    // Close on link click
    navLinks.forEach(function (l) {
      l.addEventListener("click", closeNav);
    });
    // Close on outside click
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("open") && !nav.contains(e.target) && e.target !== toggle) {
        closeNav();
      }
    });
  }

  /* ── Footer year ── */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

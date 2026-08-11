/* ═════════════════════════════════════════════
   CREATIVE STUDIO — interactions
   모션 값(시간·이징·거리)은 DESIGN.md 규칙을 따른다:
   등장 0.9~1.1s ease-out / 이동 0.6s ease-inout / 스태거 0.07s
   ═════════════════════════════════════════════ */
(function () {
  "use strict";

  var docEl = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined";
  var lenis = null;

  /* ── smooth scrolling (Lenis) ────────────── */
  if (!reduced && typeof window.Lenis !== "undefined") {
    lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    docEl.classList.add("lenis-on");

    if (hasGsap && window.ScrollTrigger) {
      lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      var rafLoop = function (t) { lenis.raf(t); requestAnimationFrame(rafLoop); };
      requestAnimationFrame(rafLoop);
    }

    /* 앵커 이동도 부드럽게 */
    document.querySelectorAll('a[href*="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var href = a.getAttribute("href");
        var hashIdx = href.indexOf("#");
        var samePage = href.slice(0, hashIdx) === "" ||
          href.slice(0, hashIdx) === window.location.pathname ||
          href.slice(0, hashIdx) === window.location.pathname.replace(/index\.html$/, "");
        if (hashIdx === -1 || !samePage) return;
        var target = document.querySelector(href.slice(hashIdx));
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -70, duration: 1.1 });
      });
    });
  }

  /* ── header: 상태 + 방향 따라 숨김 ───────── */
  var head = document.querySelector(".site-head");
  var lastY = 0;
  var onScroll = function () {
    var y = window.scrollY;
    head.classList.toggle("is-scrolled", y > 24);
    if (y > 420 && y > lastY + 4) head.classList.add("is-hidden");
    else if (y < lastY - 4 || y <= 420) head.classList.remove("is-hidden");
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── mobile menu ─────────────────────────── */
  var menu = document.querySelector("[data-mobile-menu]");
  if (menu) {
    var openMenu = function (open) {
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      if (lenis) { open ? lenis.stop() : lenis.start(); }
      document.body.style.overflow = open ? "hidden" : "";
    };
    document.querySelectorAll("[data-menu-open]").forEach(function (b) {
      b.addEventListener("click", function () { openMenu(true); });
    });
    document.querySelectorAll("[data-menu-close]").forEach(function (b) {
      b.addEventListener("click", function () { openMenu(false); });
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { openMenu(false); });
    });
  }

  /* ── reveals ─────────────────────────────── */
  if (hasGsap && window.ScrollTrigger && !reduced) {
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    docEl.classList.add("gsap-on");

    gsap.set(".reveal", { opacity: 0, y: 34 });
    window.ScrollTrigger.batch(".reveal", {
      start: "top 88%",
      once: true,
      onEnter: function (els) {
        gsap.to(els, {
          opacity: 1, y: 0,
          duration: 1.0,
          ease: "power3.out",
          stagger: 0.07,
          overwrite: true,
          onComplete: function () { els.forEach(function (el) { el.classList.add("is-in"); }); }
        });
      }
    });

    /* 해시 직링크·늦은 로드 대비: 레이아웃 확정 후 트리거 재계산 + 화면 안 요소 즉시 표시 */
    var settleReveals = function () {
      window.ScrollTrigger.refresh();
      document.querySelectorAll(".reveal:not(.is-in)").forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", overwrite: true });
          el.classList.add("is-in");
        }
      });
    };
    window.addEventListener("load", function () { setTimeout(settleReveals, 250); });
    if (location.hash) {
      setTimeout(function () {
        var t = document.querySelector(location.hash);
        if (t && lenis) lenis.scrollTo(t, { offset: -70, duration: 0.9 });
        setTimeout(settleReveals, 1100);
      }, 400);
    }

    /* 히어로 인트로 */
    var heroRows = document.querySelectorAll("[data-hero-row]");
    if (heroRows.length) {
      var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(heroRows, { yPercent: 112, duration: 1.15, stagger: 0.12 }, 0.1)
        .from(".hero-kicker", { opacity: 0, y: 18, duration: 0.8 }, 0.5)
        .from(".hero-sub", { opacity: 0, y: 22, duration: 0.8 }, 0.7)
        .from(".marquee", { opacity: 0, duration: 0.8 }, 0.9);
    }

    /* 커버 이미지 패럴랙스 (호버 줌 있는 카드 썸네일은 제외) */
    gsap.utils.toArray(".project-cover img, .project-hero-cover img").forEach(function (img) {
      gsap.fromTo(img, { yPercent: -7 }, {
        yPercent: 7,
        ease: "none",
        scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: 0.6 }
      });
      img.style.scale = "1.16";
    });

    /* 숫자 카운트업 */
    gsap.utils.toArray(".stat .num").forEach(function (el) {
      var raw = (el.textContent || "").trim();
      if (!/^\d+$/.test(raw)) return;
      var end = parseInt(raw, 10);
      var pad = raw.length;
      var obj = { v: Math.max(0, end - Math.min(end, 40)) };
      gsap.to(obj, {
        v: end,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: function () {
          el.textContent = String(Math.round(obj.v)).padStart(pad, "0");
        }
      });
    });

    /* 아코디언 본문 부드럽게 */
    document.querySelectorAll(".acc details").forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (d.open) {
          var body = d.querySelector(".acc-body");
          if (body) gsap.from(body, { opacity: 0, y: 12, duration: 0.5, ease: "power3.out" });
        }
      });
    });
  } else {
    /* fallback: IntersectionObserver 리빌 */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  }

  /* ── cohort filter ───────────────────────── */
  document.querySelectorAll("[data-cohort-tabs]").forEach(function (tabs) {
    var scope = document.querySelector(tabs.getAttribute("data-target"));
    if (!scope) return;
    tabs.addEventListener("click", function (ev) {
      var btn = ev.target.closest(".cohort-tab");
      if (!btn || !btn.hasAttribute("data-filter")) return;
      var val = btn.getAttribute("data-filter");
      tabs.querySelectorAll(".cohort-tab").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      var rows = scope.querySelectorAll("[data-cohort]");
      rows.forEach(function (row) {
        var show = val === "all" || row.getAttribute("data-cohort") === val;
        row.classList.toggle("is-hidden", !show);
      });
      scope.querySelectorAll("[data-cohort-group]").forEach(function (g) {
        var visible = g.querySelector("[data-cohort]:not(.is-hidden)");
        g.style.display = visible ? "" : "none";
      });
      if (hasGsap && !reduced) {
        var shown = Array.prototype.filter.call(rows, function (r) { return !r.classList.contains("is-hidden"); });
        window.gsap.fromTo(shown, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.04, overwrite: true });
      }
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  });

  /* ── floating image on artist rows ───────── */
  var float = document.createElement("div");
  float.className = "cursor-img";
  var floatImg = document.createElement("img");
  floatImg.alt = "";
  float.appendChild(floatImg);
  document.body.appendChild(float);

  if (hasGsap && !reduced && window.matchMedia("(pointer: fine)").matches) {
    var qx = window.gsap.quickTo(float, "x", { duration: 0.45, ease: "power3.out" });
    var qy = window.gsap.quickTo(float, "y", { duration: 0.45, ease: "power3.out" });
    window.gsap.set(float, { scale: 0.9, opacity: 0 });
    window.addEventListener("mousemove", function (e) { qx(e.clientX + 26); qy(e.clientY - 150); });
    document.querySelectorAll(".artist-row[data-img]").forEach(function (row) {
      row.addEventListener("mouseenter", function () {
        floatImg.src = row.getAttribute("data-img");
        window.gsap.to(float, { opacity: 1, scale: 1, duration: 0.35, ease: "power3.out", overwrite: true });
      });
      row.addEventListener("mouseleave", function () {
        window.gsap.to(float, { opacity: 0, scale: 0.9, duration: 0.3, ease: "power3.out", overwrite: true });
      });
    });
  }

  /* ── carousels ───────────────────────────── */
  document.querySelectorAll(".carousel").forEach(function (c) {
    var track = c.querySelector(".carousel-track");
    var step = function () {
      var f = track.querySelector("figure");
      return f ? f.getBoundingClientRect().width + 16 : 400;
    };
    c.querySelectorAll("[data-dir]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        track.scrollBy({ left: step() * (btn.getAttribute("data-dir") === "next" ? 1 : -1), behavior: "smooth" });
      });
    });
  });
})();

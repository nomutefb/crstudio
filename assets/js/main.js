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

  /* ── book(잡지) 모드: 휠 제스처 1회 = 1페이지 플립 ──
     페이지 내부 부분 스크롤 없음. "힘줘야 넘어가는" 느낌 방지를 위해
     제스처 판정은 이벤트 간격(90ms 갭)으로만 한다 — 애니메이션이 끝나면
     새 플릭은 즉시 반응하고, 관성 꼬리 이벤트는 무시된다. */
  var bookMode = document.body.classList.contains("book") && window.matchMedia("(min-width: 901px)").matches;
  if (bookMode && hasGsap && !reduced) {
    docEl.classList.add("snap-on");
    var pages = Array.prototype.slice.call(document.querySelectorAll(".book-page, .site-foot"));
    var current = 0;
    var flipping = false;
    var lastWheelT = -1000;
    var dotEls = [];

    var pageTop = function (i) { return pages[i].getBoundingClientRect().top + window.scrollY; };
    var setDot = function (i) { dotEls.forEach(function (d, j) { d.classList.toggle("is-active", j === i); }); };

    var flipTo = function (i) {
      i = Math.max(0, Math.min(pages.length - 1, i));
      if (flipping || i === current && Math.abs(window.scrollY - pageTop(i)) < 4) return;
      flipping = true;
      current = i;
      setDot(i);
      var state = { y: window.scrollY };
      window.gsap.to(state, {
        y: pageTop(i),
        duration: 0.9,
        ease: "power2.inOut",
        overwrite: true,
        onUpdate: function () { window.scrollTo(0, state.y); },
        onComplete: function () { flipping = false; }
      });
    };

    if (pages.length > 1) {
      var dots = document.createElement("nav");
      dots.className = "book-dots";
      dots.setAttribute("aria-label", "페이지 이동");
      pages.forEach(function (pg, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "페이지 " + (i + 1));
        b.addEventListener("click", function () { flipTo(i); });
        dots.appendChild(b);
      });
      document.body.appendChild(dots);
      dotEls = Array.prototype.slice.call(dots.querySelectorAll("button"));
      setDot(0);
    }

    window.addEventListener("wheel", function (e) {
      e.preventDefault();
      var fresh = (e.timeStamp - lastWheelT) > 90; /* 새 제스처 판정 */
      lastWheelT = e.timeStamp;
      if (flipping || !fresh) return;
      if (Math.abs(e.deltaY) < 4) return;
      flipTo(current + (e.deltaY > 0 ? 1 : -1));
    }, { passive: false });

    window.addEventListener("keydown", function (e) {
      var tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); flipTo(current + 1); }
      else if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); flipTo(current - 1); }
      else if (e.key === "Home") { e.preventDefault(); flipTo(0); }
      else if (e.key === "End") { e.preventDefault(); flipTo(pages.length - 1); }
    });

    /* 스크롤바 직접 조작 시 현재 페이지 동기화 */
    var syncT = null;
    window.addEventListener("scroll", function () {
      if (flipping) return;
      clearTimeout(syncT);
      syncT = setTimeout(function () {
        var y = window.scrollY + window.innerHeight * 0.5;
        for (var i = pages.length - 1; i >= 0; i--) {
          if (pageTop(i) <= y) { current = i; setDot(i); break; }
        }
      }, 140);
    }, { passive: true });

    if (location.hash) {
      var ht = document.querySelector(location.hash);
      if (ht) {
        var hp = ht.closest(".book-page, .site-foot");
        var hi = pages.indexOf(hp);
        if (hi > -1) setTimeout(function () { flipTo(hi); }, 350);
      }
    }
  } else if (bookMode) {
    /* GSAP 없거나 모션 최소화: 네이티브 스크롤 유지 */
    docEl.classList.add("snap-on");
  }

  /* ── poster belt: 첫 노출 2초 후 우→좌로 도는 컨베이어 ── */
  document.querySelectorAll("[data-belt]").forEach(function (belt) {
    var track = belt.querySelector("[data-belt-track]");
    if (!track || track.children.length === 0) return;
    /* 무한 루프용 복제 */
    var originals = Array.prototype.slice.call(track.children);
    originals.forEach(function (c) { track.appendChild(c.cloneNode(true)); });
    if (track.scrollWidth < belt.clientWidth * 2) {
      originals.forEach(function (c) { track.appendChild(c.cloneNode(true)); });
    }
    if (reduced) { belt.style.overflowX = "auto"; return; }

    var pos = 0;
    var speed = 38; /* px per second */
    var running = false;
    var paused = false;
    var last = null;
    var half = function () { return track.scrollWidth / 2; };

    var tick = function (t) {
      if (!running) return;
      if (last === null) last = t;
      var dt = (t - last) / 1000;
      last = t;
      if (!paused) {
        pos -= speed * dt;
        var h = half();
        if (-pos >= h) pos += h;
        track.style.transform = "translate3d(" + pos + "px,0,0)";
      }
      requestAnimationFrame(tick);
    };

    belt.addEventListener("mouseenter", function () { paused = true; });
    belt.addEventListener("mouseleave", function () { paused = false; });
    belt.addEventListener("touchstart", function () { paused = true; }, { passive: true });
    belt.addEventListener("touchend", function () { setTimeout(function () { paused = false; }, 1200); }, { passive: true });

    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !running) {
          setTimeout(function () { running = true; last = null; requestAnimationFrame(tick); }, 2000);
          io2.unobserve(belt);
        }
      });
    }, { threshold: 0.3 });
    io2.observe(belt);
  });

  /* ── smooth scrolling (Lenis) — 스냅 모드에서는 비활성 ── */
  if (!bookMode && !reduced && typeof window.Lenis !== "undefined") {
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

    function apply(val, animate) {
      tabs.querySelectorAll(".cohort-tab").forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-filter") === val);
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
      if (animate && hasGsap && !reduced) {
        var shown = Array.prototype.filter.call(rows, function (r) { return !r.classList.contains("is-hidden"); });
        window.gsap.fromTo(shown, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.04, overwrite: true });
      }
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }

    tabs.addEventListener("click", function (ev) {
      var btn = ev.target.closest(".cohort-tab");
      if (!btn || !btn.hasAttribute("data-filter")) return;
      var val = btn.getAttribute("data-filter");
      apply(val, true);
    });

    /* 작가 상세에서 "#cohort-3" 으로 들어오면 전체를 펼쳐 둔 채 그 기수로 내려간다.
       거기서부터 아래 기수까지 쭉 훑어볼 수 있어야 하므로 감추지 않는다.
       탭을 직접 누른 경우에만 필터가 걸린다. */
    function fromHash() {
      apply("all", false);
      var m = (location.hash || "").match(/^#cohort-(\d+)$/);
      if (!m) return;
      var group = document.getElementById("cohort-" + m[1]);
      if (!group) return;
      var go = function () {
        var y = group.getBoundingClientRect().top + window.scrollY - 96;
        window.scrollTo(0, Math.max(0, y));
      };
      requestAnimationFrame(go);
      window.addEventListener("load", go, { once: true });
    }
    fromHash();
    window.addEventListener("hashchange", fromHash);
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

  /* ── back to top ─────────────────────────── */
  /* 문서 끝에 닿았을 때만 올라온다. 홈 북모드는 페이지 플립이 스크롤을
     직접 몰기 때문에 대상에서 뺀다. */
  (function () {
    var btn = document.querySelector("[data-to-top]");
    if (!btn || bookMode) return;

    var NEAR_END = 160;
    var shown = false;

    var sync = function () {
      var atEnd = window.scrollY + window.innerHeight >=
                  document.documentElement.scrollHeight - NEAR_END;
      if (atEnd === shown) return;
      shown = atEnd;
      btn.hidden = !atEnd;
      if (atEnd) { btn.classList.remove("is-in"); void btn.offsetWidth; btn.classList.add("is-in"); }
    };

    btn.addEventListener("click", function () {
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });

    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
  })();

  /* ── tide nav ────────────────────────────── */
  /* 패널을 열 때 2분 넘게 묵은 시간표는 다시 받아온다(서버 캐시 max-age=120s).
     이미지를 못 받으면 예울마루 링크 안내로 대체한다. JS 없이도 패널 자체는 동작한다. */
  (function () {
    var tide = document.querySelector("[data-tide]");
    if (!tide) return;

    var imgs = Array.prototype.slice.call(tide.querySelectorAll("[data-tide-img]"));
    var fallback = tide.querySelector("[data-tide-fallback]");
    var TTL = 120000;
    var loadedAt = Date.now();

    imgs.forEach(function (img) {
      img.addEventListener("error", function () {
        img.closest(".tide-fig").hidden = true;
        if (fallback) fallback.hidden = false;
      });
    });

    tide.addEventListener("toggle", function () {
      /* 패널이 열리면 그 자리를 덮으므로 맨 위로 버튼은 잠시 숨긴다 */
      document.body.classList.toggle("tide-open", tide.open);
      if (!tide.open || Date.now() - loadedAt < TTL) return;
      loadedAt = Date.now();
      var bust = "t=" + Math.floor(loadedAt / TTL);
      imgs.forEach(function (img) {
        var src = img.getAttribute("data-tide-src");
        img.src = src + (src.indexOf("?") === -1 ? "?" : "&") + bust;
      });
    });

    /* 패널 밖을 누르면 닫기 */
    document.addEventListener("click", function (e) {
      if (tide.open && !tide.contains(e.target)) tide.open = false;
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && tide.open) tide.open = false;
    });
  })();

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

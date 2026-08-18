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

  /* ── 기수 플립 — 휠 한 번에 한 기수 ──────────
     홈의 페이지 넘김과 같은 방식(제스처 1회 = 1면, 0.9s power2.inOut).
     화면보다 긴 기수는 첫 휠이 그 아래끝까지 데려다 놓고, 다음 휠에 넘어간다. */
  var cohortFlip = document.body.classList.contains("has-flip") &&
                   window.matchMedia("(min-width: 901px)").matches;

  if (cohortFlip && hasGsap && !reduced) {
    /* 스크롤을 JS가 직접 모므로 브라우저 스무스 스크롤은 꺼야 한다.
       켜 두면 매 프레임 scrollTo 가 브라우저 보간과 싸워 목표에 못 닿고
       화면이 덜컥거린다. */
    docEl.classList.add("snap-on");

    var cs = getComputedStyle(docEl);
    var stickyH = function () {
      return parseFloat(cs.getPropertyValue("--head-h-sm")) +
             parseFloat(cs.getPropertyValue("--cohort-nav-h"));
    };

    var fPages = Array.prototype.slice.call(
      document.querySelectorAll(".flip-page, .site-foot")
    );

    /* data-flip-sticky 가 붙은 면은 헤더 + 스티키 줄 아래에 걸린다 */
    var fTop = function (el) {
      if (el.classList.contains("page-hero")) return 0;
      var y = el.getBoundingClientRect().top + window.scrollY;
      return Math.max(0, y - (el.hasAttribute("data-flip-sticky") ? stickyH() : 0));
    };

    var maxY = function () {
      return document.documentElement.scrollHeight - window.innerHeight;
    };

    var fBusy = false;
    var fLastT = -1000;

    var glideTo = function (y) {
      y = Math.max(0, Math.min(maxY(), y));
      if (Math.abs(window.scrollY - y) < 4) return;
      fBusy = true;
      var st = { y: window.scrollY };
      window.gsap.to(st, {
        y: y,
        duration: 0.9,
        ease: "power2.inOut",
        overwrite: true,
        onUpdate: function () { window.scrollTo(0, st.y); },
        onComplete: function () { fBusy = false; }
      });
    };

    /* 목표는 늘 지금 스크롤 위치에서 다시 계산한다 — 인덱스를 들고 있으면
       스크롤바·앵커로 움직였을 때 어긋난다. */
    var flipCohort = function (dir) {
      var y = window.scrollY;
      var tops = fPages.map(fTop).sort(function (a, b) { return a - b; });
      var target = null;
      var i;
      if (dir > 0) {
        for (i = 0; i < tops.length; i++) { if (tops[i] > y + 8) { target = tops[i]; break; } }
      } else {
        for (i = tops.length - 1; i >= 0; i--) { if (tops[i] < y - 8) { target = tops[i]; break; } }
      }
      if (target === null) return;
      /* 다음 면이 한 화면보다 멀면(= 지금 면이 화면보다 길면) 한 화면씩 간다 */
      if (Math.abs(target - y) > window.innerHeight) {
        target = y + (dir > 0 ? 1 : -1) * window.innerHeight * 0.85;
      }
      glideTo(target);
    };

    window.addEventListener("wheel", function (e) {
      e.preventDefault();
      var fresh = (e.timeStamp - fLastT) > 90;
      fLastT = e.timeStamp;
      if (fBusy || !fresh || Math.abs(e.deltaY) < 4) return;
      flipCohort(e.deltaY > 0 ? 1 : -1);
    }, { passive: false });

    window.addEventListener("keydown", function (e) {
      var tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); flipCohort(1); }
      else if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); flipCohort(-1); }
      else if (e.key === "Home") { e.preventDefault(); glideTo(0); }
    });
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
  if (!bookMode && !cohortFlip && !reduced && typeof window.Lenis !== "undefined") {
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

  /* ── header: 항상 떠 있고, 스크롤 상태만 반영 ─ */
  var head = document.querySelector(".site-head");
  var onScroll = function () {
    head.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── mobile menu ─────────────────────────── */
  var menu = document.querySelector("[data-mobile-menu]");
  if (menu) {
    var openMenu = function (open) {
      menu.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
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

    /* 아카이브 타이틀이 있는 화면은 선과 한 몸으로 위에서 아래로 펼쳐진다.
       y 이동 없이 불투명도만 바꿔 위쪽 순서대로 흘려보낸다 — 아래에서
       밀려 올라오는 느낌도 없고, 여러 요소를 동시에 옮기며 생기던
       버벅임도 사라진다. */
    var unfold = !!document.querySelector(".archive-title");
    var firstHold = unfold ? 0.5 : 0;

    gsap.set(".reveal", unfold ? { opacity: 0 } : { opacity: 0, y: 34 });

    window.ScrollTrigger.batch(".reveal", {
      start: "top 88%",
      once: true,
      onEnter: function (els) {
        els.sort(function (a, b) {
          return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
        });
        gsap.to(els, {
          opacity: 1,
          y: 0,
          duration: unfold ? 0.55 : 1.0,
          delay: firstHold,
          ease: unfold ? "power2.out" : "power3.out",
          stagger: unfold ? 0.05 : 0.07,
          overwrite: true,
          onComplete: function () { els.forEach(function (el) { el.classList.add("is-in"); }); }
        });
        firstHold = 0;
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
      tabs.querySelectorAll("[data-filter]").forEach(function (b) {
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
      var btn = ev.target.closest("[data-filter]");
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

    /* 지금 보고 있는 기수의 번호를 볼드로 — 필터를 직접 건 상태에서는
       그 번호를 그대로 둔다 */
    var groups = Array.prototype.slice.call(scope.querySelectorAll("[data-cohort-group]"));
    if (groups.length) {
      var filtered = false;
      tabs.addEventListener("click", function (ev) {
        var b = ev.target.closest("[data-filter]");
        if (b) filtered = b.getAttribute("data-filter") !== "all";
      });

      var spy = function () {
        if (filtered) return;
        var line = window.scrollY + window.innerHeight * 0.35;
        var cur = null;
        groups.forEach(function (g) {
          if (g.style.display === "none") return;
          if (g.getBoundingClientRect().top + window.scrollY <= line) cur = g;
        });
        var val = cur ? cur.id.replace("cohort-", "") : "all";
        tabs.querySelectorAll("[data-filter]").forEach(function (b) {
          b.classList.toggle("is-active", b.getAttribute("data-filter") === val);
        });
      };
      window.addEventListener("scroll", spy, { passive: true });
      window.addEventListener("resize", spy);
      spy();
    }
    window.addEventListener("hashchange", fromHash);
  });

  /* ── archive title ───────────────────────── */
  /* 이름이 서고 → 선이 그어지고 → 그 끝에서 누적 인원이 올라간다.
     JS가 없거나 모션을 끈 경우엔 완성된 상태 그대로 보인다. */
  (function () {
    var title = document.querySelector(".archive-title");
    if (!title || !hasGsap || reduced) return;

    var rule = title.querySelector(".at-rule");
    var count = title.querySelector(".at-count");
    if (!rule || !count) return;

    var end = parseInt((count.textContent || "").trim(), 10);
    if (!isFinite(end)) return;

    /* 자릿수를 고정해 두면 세는 동안 폭이 흔들리지 않아 선 길이도 그대로다 */
    var pad = String(end).length;
    var n = { v: 0 };

    window.gsap.set(rule, { scaleX: 0 });
    window.gsap.set(count, { "--at-wipe": "100%" });   /* 처음엔 완전히 가려 둔다 */

    window.gsap.timeline({ delay: 0.15 })
      .to(rule, { scaleX: 1, duration: 0.9, ease: "power3.out" })
      .to(count, { "--at-wipe": "0%", duration: 0.75, ease: "power2.out" }, "-=0.4")
      .to(n, {
        v: end,
        duration: 1.1,
        ease: "power2.out",
        onUpdate: function () {
          count.textContent = String(Math.round(n.v)).padStart(pad, "0");
        }
      }, "<");
  })();

  /* ── back to top ─────────────────────────── */
  /* 문서 끝에 닿았을 때만 올라온다. 홈 북모드는 페이지 플립이 스크롤을
     직접 몰기 때문에 대상에서 뺀다. */
  (function () {
    var btn = document.querySelector("[data-to-top]");
    if (!btn) return;

    var shown = false;

    var sync = function () {
      /* 두 화면을 지나 셋째 구간에 들어서면 올라온다 */
      var deep = window.scrollY >= window.innerHeight * 2;
      if (deep === shown) return;
      shown = deep;
      btn.hidden = !deep;
      if (deep) { btn.classList.remove("is-in"); void btn.offsetWidth; btn.classList.add("is-in"); }
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

/* CREATIVE STUDIO — interactions */
(function () {
  "use strict";

  /* header state */
  var head = document.querySelector(".site-head");
  var onScroll = function () {
    if (window.scrollY > 24) head.classList.add("is-scrolled");
    else head.classList.remove("is-scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* reveal on scroll */
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* cohort filter */
  document.querySelectorAll("[data-cohort-tabs]").forEach(function (tabs) {
    var scope = document.querySelector(tabs.getAttribute("data-target"));
    if (!scope) return;
    tabs.addEventListener("click", function (ev) {
      var btn = ev.target.closest(".cohort-tab");
      if (!btn) return;
      var val = btn.getAttribute("data-filter");
      tabs.querySelectorAll(".cohort-tab").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      scope.querySelectorAll("[data-cohort]").forEach(function (row) {
        var show = val === "all" || row.getAttribute("data-cohort") === val;
        row.classList.toggle("is-hidden", !show);
      });
      scope.querySelectorAll("[data-cohort-group]").forEach(function (g) {
        var visible = g.querySelector("[data-cohort]:not(.is-hidden)");
        g.style.display = visible ? "" : "none";
      });
    });
  });

  /* floating image on artist rows */
  var float = document.createElement("div");
  float.className = "cursor-img";
  var floatImg = document.createElement("img");
  floatImg.alt = "";
  float.appendChild(floatImg);
  document.body.appendChild(float);

  var fx = 0, fy = 0, tx = 0, ty = 0, rafOn = false;

  function loop() {
    fx += (tx - fx) * 0.12;
    fy += (ty - fy) * 0.12;
    float.style.transform = "translate(" + (fx + 24) + "px," + (fy - 150) + "px)" + (float.classList.contains("is-on") ? " scale(1)" : " scale(.92)");
    if (rafOn) requestAnimationFrame(loop);
  }

  document.querySelectorAll(".artist-row[data-img]").forEach(function (row) {
    row.addEventListener("mouseenter", function () {
      floatImg.src = row.getAttribute("data-img");
      float.classList.add("is-on");
      rafOn = true;
      loop();
    });
    row.addEventListener("mouseleave", function () {
      float.classList.remove("is-on");
      rafOn = false;
    });
    row.addEventListener("mousemove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
    });
  });

  /* carousels */
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

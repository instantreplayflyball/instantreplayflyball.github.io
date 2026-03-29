/**
 * Home hero carousel — team dog photos (from roster) plus optional slides from
 * src/_data/homeCarousel.json (merged and shuffled at runtime).
 */
(function () {
  var root = document.getElementById("hero-carousel-root");
  if (!root) return;

  var AUTO_MS = 5500;
  var MAX_SLIDES = 28;

  var slides = [];
  var index = 0;
  var timer = null;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function stopAuto() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function startAuto() {
    stopAuto();
    if (reduceMotion || slides.length < 2 || document.hidden) return;
    timer = setInterval(function () {
      go(1);
    }, AUTO_MS);
  }

  function go(delta) {
    if (!slides.length) return;
    var next = (index + delta + slides.length) % slides.length;
    setActive(next);
  }

  function setActive(i) {
    index = i;
    var list = root.querySelectorAll(".hero-carousel__slide");
    var nameEl = root.querySelector(".hero-carousel__name");
    var idxEl = root.querySelector(".hero-carousel__idx");
    var live = root.querySelector(".hero-carousel__live");

    for (var k = 0; k < list.length; k++) {
      list[k].classList.toggle("is-active", k === index);
      list[k].setAttribute("aria-hidden", k === index ? "false" : "true");
    }

    var s = slides[index];
    if (nameEl) nameEl.textContent = s.dog;
    if (idxEl) idxEl.textContent = index + 1 + " / " + slides.length;
    if (live) live.textContent = "Showing " + s.dog;
  }

  function normalizeSrc(path) {
    var p = String(path || "").trim();
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return p;
    return p.charAt(0) === "/" ? p : "/" + p.replace(/^\/+/, "");
  }

  function slideFromHome(s) {
    var src = normalizeSrc(s.src);
    if (!src) return null;
    var label = String(s.label || "").trim() || "Photo";
    var alt = String(s.alt || "").trim() || label + " — Instant Replay Flyball";
    return { dog: label, photo: src, alt: alt };
  }

  function slideFromMember(m) {
    var path = String(m.photo || "").trim();
    if (!path) return null;
    return {
      dog: String(m.dog || "").trim() || "Dog",
      photo: normalizeSrc(path),
      alt:
        (m.photoAlt && String(m.photoAlt).trim()) ||
        String(m.dog || "").trim() + " — Instant Replay Flyball",
    };
  }

  function build(members, homeSlides) {
    members = Array.isArray(members) ? members : [];
    homeSlides = Array.isArray(homeSlides) ? homeSlides : [];

    var combined = [];

    homeSlides.forEach(function (s) {
      var slide = slideFromHome(s);
      if (slide) combined.push(slide);
    });

    members.forEach(function (m) {
      var slide = slideFromMember(m);
      if (slide) combined.push(slide);
    });

    combined = shuffle(combined).slice(0, MAX_SLIDES);

    if (!combined.length) {
      root.innerHTML =
        '<div class="hero-carousel__empty"><p>No photos yet.</p><a class="btn btn--ghost hero-carousel__empty-btn" href="/athletes.html">Athletes</a></div>';
      return;
    }

    slides = combined;

    var ul = document.createElement("ul");
    ul.className = "hero-carousel__slides";
    ul.setAttribute("role", "list");

    for (var i = 0; i < slides.length; i++) {
      var s = slides[i];
      var li = document.createElement("li");
      li.className = "hero-carousel__slide" + (i === 0 ? " is-active" : "");
      li.setAttribute("role", "listitem");
      li.setAttribute("aria-hidden", i === 0 ? "false" : "true");
      var img = document.createElement("img");
      img.src = s.photo;
      img.alt = s.alt || s.dog + " — Instant Replay Flyball";
      img.loading = i === 0 ? "eager" : "lazy";
      img.decoding = "async";
      li.appendChild(img);
      ul.appendChild(li);
    }

    root.setAttribute("tabindex", "0");

    root.innerHTML =
      '<span class="hero-carousel__live visually-hidden" aria-live="polite"></span>' +
      '<div class="hero-carousel__viewport">' +
      ul.outerHTML +
      "</div>" +
      '<div class="hero-carousel__meta">' +
      '<span class="hero-carousel__name"></span>' +
      '<span class="hero-carousel__idx"></span>' +
      "</div>" +
      '<div class="hero-carousel__toolbar">' +
      '<button type="button" class="hero-carousel__btn" data-dir="-1" aria-label="Previous photo">‹</button>' +
      '<button type="button" class="hero-carousel__btn" data-dir="1" aria-label="Next photo">›</button>' +
      "</div>" +
      '<a class="hero-carousel__cta" href="/athletes.html">Meet the full roster</a>';

    setActive(0);

    root.querySelectorAll(".hero-carousel__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        go(parseInt(btn.getAttribute("data-dir"), 10));
        startAuto();
      });
    });

    root.addEventListener("mouseenter", stopAuto);
    root.addEventListener("mouseleave", startAuto);
    root.addEventListener("focusin", stopAuto);
    root.addEventListener("focusout", function (e) {
      if (!root.contains(e.relatedTarget)) startAuto();
    });

    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
        startAuto();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
        startAuto();
      }
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopAuto();
      else startAuto();
    });

    startAuto();
  }

  root.innerHTML =
    '<div class="hero-carousel__loading" aria-busy="true">Loading photos…</div>';

  var dataEl = document.getElementById("hero-carousel-data");
  if (!dataEl || !dataEl.textContent.trim()) {
    root.innerHTML =
      '<div class="hero-carousel__empty"><p>No carousel data on this page.</p><a class="btn btn--ghost hero-carousel__empty-btn" href="/athletes.html">Athletes</a></div>';
    return;
  }

  try {
    var raw = JSON.parse(dataEl.textContent);
    var members;
    var homeSlides;

    if (Array.isArray(raw)) {
      members = raw;
      homeSlides = [];
    } else if (raw && typeof raw === "object") {
      members = raw.members || [];
      homeSlides = raw.homeSlides || [];
    } else {
      throw new Error("invalid payload");
    }

    build(members, homeSlides);
  } catch (e) {
    root.innerHTML =
      '<div class="hero-carousel__empty"><p>Could not load carousel photos.</p><a class="btn btn--ghost hero-carousel__empty-btn" href="/athletes.html">Athletes</a></div>';
  }
})();

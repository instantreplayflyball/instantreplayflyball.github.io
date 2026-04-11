/**
 * Home hero carousel — team dog photos (from roster) plus optional slides from
 * src/_data/homeCarousel.json (merged and shuffled at runtime).
 * Payload: window.__HERO_CAROUSEL_PAYLOAD__ (set in layout), then legacy #hero-carousel-data,
 * then fetch carousel-data.json next to this page.
 */
(function () {
  var root = document.getElementById("hero-carousel-root");
  if (!root) return;

  var AUTO_MS = 5500;
  var MAX_SLIDES = 100;

  var slides = [];
  var index = 0;
  var timer = null;

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
    if (slides.length < 2 || document.hidden) return;
    timer = setInterval(function () {
      go(1);
    }, AUTO_MS);
  }

  function go(delta) {
    if (!slides.length) return;
    var d = Number(delta);
    if (!isFinite(d)) return;
    var next = (index + d + slides.length) % slides.length;
    setActive(next);
  }

  function setActive(i) {
    if (!slides.length) return;
    var idx =
      typeof i === "number" && isFinite(i)
        ? ((Math.floor(i) % slides.length) + slides.length) % slides.length
        : 0;
    index = idx;
    var list = root.querySelectorAll(".hero-carousel__slide");
    var nameEl = root.querySelector(".hero-carousel__name");
    var idxEl = root.querySelector(".hero-carousel__idx");
    var live = root.querySelector(".hero-carousel__live");

    for (var k = 0; k < list.length; k++) {
      list[k].classList.toggle("is-active", k === index);
      list[k].setAttribute("aria-hidden", k === index ? "false" : "true");
    }

    var s = slides[index];
    if (!s) return;
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

  function normalizePayload(raw) {
    if (Array.isArray(raw)) return { members: raw, homeSlides: [] };
    if (raw && typeof raw === "object") {
      return {
        members: Array.isArray(raw.members) ? raw.members : [],
        homeSlides: Array.isArray(raw.homeSlides) ? raw.homeSlides : [],
      };
    }
    return null;
  }

  function build(members, homeSlides) {
    members = Array.isArray(members) ? members : [];
    homeSlides = Array.isArray(homeSlides) ? homeSlides : [];

    var combined = [];

    for (var hi = 0; hi < homeSlides.length; hi++) {
      var slide = slideFromHome(homeSlides[hi]);
      if (slide) combined.push(slide);
    }

    for (var mi = 0; mi < members.length; mi++) {
      var mslide = slideFromMember(members[mi]);
      if (mslide) combined.push(mslide);
    }

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

    var btns = root.querySelectorAll(".hero-carousel__btn");
    for (var bi = 0; bi < btns.length; bi++) {
      (function (btn) {
        btn.addEventListener("click", function () {
          var dir = parseInt(btn.getAttribute("data-dir"), 10);
          go(dir);
          startAuto();
        });
      })(btns[bi]);
    }

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

  function parseInlinePayload() {
    var raw = null;
    if (
      typeof window.__HERO_CAROUSEL_PAYLOAD__ !== "undefined" &&
      window.__HERO_CAROUSEL_PAYLOAD__ !== null
    ) {
      raw = window.__HERO_CAROUSEL_PAYLOAD__;
    } else {
      var dataEl = document.getElementById("hero-carousel-data");
      if (!dataEl || !dataEl.textContent.trim()) return null;
      raw = JSON.parse(dataEl.textContent.trim());
    }
    return normalizePayload(raw);
  }

  function loadPayload(callback) {
    function tryInline() {
      try {
        return parseInlinePayload();
      } catch (e) {
        return null;
      }
    }

    var first = tryInline();
    if (first) {
      callback(null, first);
      return;
    }

    if (typeof fetch !== "function") {
      callback(new Error("no data"), null);
      return;
    }

    var dataUrl = new URL("carousel-data.json", window.location.href).href;
    fetch(dataUrl, { credentials: "same-origin", cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("fetch " + r.status);
        return r.json();
      })
      .then(function (raw) {
        var n = normalizePayload(raw);
        if (!n) throw new Error("invalid payload");
        callback(null, n);
      })
      .catch(function () {
        callback(new Error("no data"), null);
      });
  }

  function showError() {
    root.innerHTML =
      '<div class="hero-carousel__empty"><p>Could not load team photos for the carousel.</p><a class="btn btn--ghost hero-carousel__empty-btn" href="/athletes.html">Athletes</a></div>';
  }

  root.innerHTML =
    '<div class="hero-carousel__loading" aria-busy="true">Loading photos…</div>';

  loadPayload(function (err, payload) {
    if (err || !payload) {
      showError();
      return;
    }
    try {
      build(payload.members, payload.homeSlides);
    } catch (e2) {
      showError();
    }
  });
})();

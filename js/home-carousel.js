/**
 * Hero dog carousel on the home page — photos from build-inlined team roster JSON.
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

  function build(members) {
    var raw = members.filter(function (m) {
      return m.photo && String(m.photo).trim();
    });
    raw = shuffle(raw).slice(0, MAX_SLIDES);

    if (!raw.length) {
      root.innerHTML =
        '<div class="hero-carousel__empty"><p>No team photos yet.</p><a class="btn btn--ghost hero-carousel__empty-btn" href="/athletes.html">Athletes</a></div>';
      return;
    }

    slides = raw.map(function (m) {
      var path = String(m.photo || "").trim();
      var src = path.charAt(0) === "/" ? path : "/" + path.replace(/^\/+/, "");
      return {
        dog: String(m.dog || "").trim() || "Dog",
        photo: src,
        alt: (m.photoAlt && String(m.photoAlt).trim()) || "",
      };
    });

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
    '<div class="hero-carousel__loading" aria-busy="true">Loading team photos…</div>';

  var dataEl = document.getElementById("hero-carousel-data");
  if (!dataEl || !dataEl.textContent.trim()) {
    root.innerHTML =
      '<div class="hero-carousel__empty"><p>No carousel data on this page.</p><a class="btn btn--ghost hero-carousel__empty-btn" href="/athletes.html">Athletes</a></div>';
    return;
  }

  try {
    var members = JSON.parse(dataEl.textContent);
    if (!Array.isArray(members)) throw new Error("not an array");
    build(members);
  } catch (e) {
    root.innerHTML =
      '<div class="hero-carousel__empty"><p>Could not load team photos for the carousel.</p><a class="btn btn--ghost hero-carousel__empty-btn" href="/athletes.html">Athletes</a></div>';
  }
})();

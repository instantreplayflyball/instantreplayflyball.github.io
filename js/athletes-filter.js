/**
 * Search, breed filter, and sort for the Athletes roster (static cards in the DOM).
 */
(function () {
  var grid = document.getElementById("team-roster-grid");
  if (!grid) return;

  var searchEl = document.getElementById("team-roster-search");
  var breedEl = document.getElementById("team-roster-breed");
  var sortEl = document.getElementById("team-roster-sort");
  var statusEl = document.getElementById("team-roster-status");
  var emptyEl = document.getElementById("team-roster-filter-empty");

  var cards = Array.prototype.slice.call(grid.querySelectorAll(".team-card"));
  var total = cards.length;
  if (total === 0) return;

  function sortKeyDogName(dog) {
    var s = String(dog || "").toUpperCase();
    var cut = s.indexOf("(");
    s = cut >= 0 ? s.slice(0, cut) : s;
    s = s.replace(/['"]/g, "").trim();
    return s || "\uFFFF";
  }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function cardSearchText(card) {
    return norm(
      [
        card.getAttribute("data-dog") || "",
        card.getAttribute("data-handler") || "",
        card.getAttribute("data-breed") || "",
      ].join(" ")
    );
  }

  function compareSort(a, b, mode) {
    var da = a.getAttribute("data-dog") || "";
    var db = b.getAttribute("data-dog") || "";
    var ha = a.getAttribute("data-handler") || "";
    var hb = b.getAttribute("data-handler") || "";
    var bra = (a.getAttribute("data-breed") || "").trim();
    var brb = (b.getAttribute("data-breed") || "").trim();

    if (mode === "handler") {
      var ch = ha.localeCompare(hb, undefined, { sensitivity: "base" });
      if (ch !== 0) return ch;
      return sortKeyDogName(da).localeCompare(sortKeyDogName(db));
    }
    if (mode === "breed") {
      var ea = bra || "\uFFFF";
      var eb = brb || "\uFFFF";
      var cb = ea.localeCompare(eb, undefined, { sensitivity: "base" });
      if (cb !== 0) return cb;
      return sortKeyDogName(da).localeCompare(sortKeyDogName(db));
    }
    if (mode === "order") {
      var oa = parseInt(a.getAttribute("data-order") || "999", 10);
      var ob = parseInt(b.getAttribute("data-order") || "999", 10);
      if (oa !== ob) return oa - ob;
      return sortKeyDogName(da).localeCompare(sortKeyDogName(db));
    }
    return sortKeyDogName(da).localeCompare(sortKeyDogName(db));
  }

  function applySort(mode) {
    var sorted = cards.slice().sort(function (a, b) {
      return compareSort(a, b, mode);
    });
    sorted.forEach(function (card) {
      grid.appendChild(card);
    });
  }

  function update() {
    var q = norm(searchEl ? searchEl.value : "");
    var breed = breedEl ? breedEl.value.trim() : "";
    var mode = sortEl && sortEl.value ? sortEl.value : "dog";

    applySort(mode);

    var visible = 0;
    cards.forEach(function (card) {
      var matchQ = !q || cardSearchText(card).indexOf(q) !== -1;
      var b = (card.getAttribute("data-breed") || "").trim();
      var matchBreed = !breed || b === breed;
      var show = matchQ && matchBreed;
      card.hidden = !show;
      if (show) visible++;
    });

    if (statusEl) {
      if (visible === total) {
        statusEl.textContent = "Showing all " + total + " dog" + (total === 1 ? "" : "s") + ".";
      } else {
        statusEl.textContent =
          "Showing " + visible + " of " + total + " dog" + (total === 1 ? "" : "s") + ".";
      }
    }

    if (emptyEl) {
      emptyEl.hidden = visible !== 0;
    }
  }

  if (searchEl) {
    searchEl.addEventListener("input", update);
    searchEl.addEventListener("search", update);
  }
  if (breedEl) breedEl.addEventListener("change", update);
  if (sortEl) sortEl.addEventListener("change", update);

  update();
})();

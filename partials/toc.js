// The Contents list: open beside the text on a wide screen, folded on a phone, and the section
// being read is marked (aria-current="location"), so the sticky sidebar says where you are.

// Which section is being read: the last heading whose top has passed the reading line, the
// last one once the page cannot scroll further, -1 above the first. `tops` ascend.
// Pure, so scripts/partials.test.mjs runs it.
function masareefTocPick(tops, line, atEnd) {
  if (!tops.length) return -1;
  if (atEnd) return tops.length - 1;
  var at = -1;
  for (var i = 0; i < tops.length; i++) {
    if (tops[i] <= line) at = i;
    else break;
  }
  return at;
}

(function () {
  var tocs = [].slice.call(document.querySelectorAll(".toc"));
  if (!tocs.length) return;
  var wide = matchMedia("(min-width: 961px)").matches;
  tocs.forEach(function (t) {
    var d = t.querySelector("details");
    if (d) d.open = wide;
  });

  var lists = tocs.map(function (t) {
    var links = [].slice.call(t.querySelectorAll('a[href^="#"]'));
    return {
      toc: t,
      links: links,
      heads: links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); }),
    };
  });
  var current = [];

  // One pill per list that glides to the marked row, so the eye follows the move instead of
  // catching a flash two rows away. Placed without motion the first time.
  lists.forEach(function (list) {
    var ol = list.toc.querySelector("ol");
    if (!ol) return;
    list.pill = document.createElement("span");
    list.pill.className = "toc-pill";
    list.pill.setAttribute("aria-hidden", "true");
    ol.prepend(list.pill);
  });
  function place(list, a) {
    var p = list.pill;
    if (!p) return;
    if (!a) { p.style.opacity = "0"; return; }
    var first = p.style.opacity !== "1";
    if (first) p.style.transition = "none";
    p.style.width = a.offsetWidth + "px";
    p.style.height = a.offsetHeight + "px";
    p.style.transform = "translate(" + a.offsetLeft + "px," + a.offsetTop + "px)";
    p.style.opacity = "1";
    if (first) { p.getBoundingClientRect(); p.style.transition = ""; }
  }

  function mark(list, i) {
    list.links.forEach(function (a, n) {
      if (n === i) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
    place(list, list.links[i]);
    // Keep the marked row inside the sticky list without moving the page itself.
    var a = list.links[i];
    var box = list.toc;
    if (!a || box.scrollHeight <= box.clientHeight) return;
    var top = a.offsetTop - box.offsetTop;
    if (top < box.scrollTop + 48) box.scrollTop = top - 48;
    else if (top + a.offsetHeight > box.scrollTop + box.clientHeight - 48) box.scrollTop = top + a.offsetHeight - box.clientHeight + 48;
  }

  // A section the reader picked (a click in the list, or a deep link) stays marked until they
  // scroll by hand: a short section, or one near the page end, would otherwise hand the mark
  // to its neighbour the moment the jump lands.
  var pinned = false;
  function pin(href) {
    lists.forEach(function (list, n) {
      var i = list.links.findIndex(function (a) { return a.getAttribute("href") === href; });
      if (i === -1) return;
      pinned = true;
      current[n] = i;
      mark(list, i);
    });
  }
  lists.forEach(function (list) {
    list.links.forEach(function (a) { a.addEventListener("click", function () { pin(a.getAttribute("href")); }); });
  });
  ["wheel", "touchmove", "keydown"].forEach(function (e) {
    addEventListener(e, function () { if (pinned) { pinned = false; queue(); } }, { passive: true });
  });

  var queued = false;
  function update() {
    queued = false;
    if (pinned) return;
    var line = Math.min(innerHeight * 0.25, 180);
    var atEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
    lists.forEach(function (list, n) {
      // The hidden language's headings report 0; skip that list.
      if (!list.toc.offsetParent) return;
      var tops = list.heads.map(function (h) { return h ? h.getBoundingClientRect().top : Infinity; });
      var i = masareefTocPick(tops, line, atEnd);
      if (i !== current[n]) {
        current[n] = i;
        mark(list, i);
      }
    });
  }
  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }
  addEventListener("scroll", queue, { passive: true });
  // A new width or an opened fold moves the rows; the pill follows them there.
  function replace() {
    lists.forEach(function (list, n) { if (current[n] > -1) place(list, list.links[current[n]]); });
  }
  addEventListener("resize", function () { replace(); queue(); });
  tocs.forEach(function (t) { var d = t.querySelector("details"); if (d) d.addEventListener("toggle", replace); });
  document.addEventListener("langchange", function () { current = []; pinned = false; queue(); });
  if (location.hash) pin(location.hash);
  update();
})();

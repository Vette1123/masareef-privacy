// Both languages ship in the DOM so crawlers and reader modes see the whole page. The head
// script (lang-pick.js) has already picked one and stamped the root element; this only wires
// the toggle and keeps the buttons' announced state in step.
(function () {
  var root = document.documentElement;
  var en = document.getElementById("btn-en");
  var ar = document.getElementById("btn-ar");
  if (!en || !ar) return;

  function apply(lang, remember) {
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    root.classList.toggle("lang-ar", lang === "ar");
    root.classList.toggle("lang-en", lang === "en");
    en.setAttribute("aria-pressed", String(lang === "en"));
    ar.setAttribute("aria-pressed", String(lang === "ar"));
    // A page served under one title (the bank pages: Arabic) names its other one here.
    var title = root.getAttribute("data-title-" + lang);
    if (title) document.title = title;
    if (remember) {
      try {
        localStorage.setItem("masareef-privacy-lang", lang);
      } catch (e) {
        // Private browsing can block storage. The toggle still works for this visit.
      }
      document.dispatchEvent(new Event("langchange"));
    }
  }

  // The markup ships aria-pressed for the served language; catch it up to the head's pick.
  apply(root.lang === "ar" ? "ar" : "en", false);

  en.addEventListener("click", function () {
    apply("en", true);
  });
  ar.addEventListener("click", function () {
    apply("ar", true);
  });
})();

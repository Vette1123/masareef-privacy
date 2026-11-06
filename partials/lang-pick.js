// Resolve the language BEFORE first paint. The whole document flips direction, so deciding
// after paint moved the header across the viewport: a visible LTR to RTL flash and a layout
// shift on every Arabic visit. One storage key for the whole site, so a choice made on the
// policy holds on the bank pages too.
(function () {
  var root = document.documentElement;
  var served = root.lang === "ar" ? "ar" : "en";
  function stored() {
    try {
      return localStorage.getItem("masareef-privacy-lang");
    } catch (e) {
      return null; // private browsing can block storage
    }
  }
  // A deep link to a section anchor wins over the stored choice, so a shared section link
  // always lands on the section it names.
  function pick() {
    if (/^#ar-/.test(location.hash)) return "ar";
    if (/^#en-/.test(location.hash)) return "en";
    var saved = stored();
    if (saved === "ar" || saved === "en") return saved;
    // A crawler reads the page in the language it is served in: the bank pages earn their
    // impressions in Arabic, and Googlebot's en-US would otherwise hide that copy.
    if (/bot|crawl|spider|slurp/i.test(navigator.userAgent || "")) return served;
    return (navigator.language || "en").toLowerCase().indexOf("ar") === 0 ? "ar" : "en";
  }
  var lang = pick();
  root.lang = lang;
  root.dir = lang === "ar" ? "rtl" : "ltr";
  root.classList.add("lang-" + lang);
})();

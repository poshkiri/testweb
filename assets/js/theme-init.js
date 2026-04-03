(function () {
  try {
    var q = new URLSearchParams(window.location.search).get("theme");
    var stored = localStorage.getItem("siteTheme");
    var theme = stored || "kitchen";
    if (q === "garden" || q === "kitchen") {
      theme = q;
      localStorage.setItem("siteTheme", theme);
    }
    document.documentElement.dataset.theme = theme;
  } catch (_e) {
    document.documentElement.dataset.theme = "kitchen";
  }
})();

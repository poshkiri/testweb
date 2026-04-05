(function () {
  try {
    document.documentElement.dataset.theme = "kitchen";
    localStorage.setItem("siteTheme", "kitchen");
  } catch (_e) {
    document.documentElement.dataset.theme = "kitchen";
  }
})();

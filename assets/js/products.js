window.PRODUCTS = [];

/** @type {string} */
window.__catalogLoadHint = "";

window.escapeHtml = function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

function parseCatalogPayload(data) {
  if (!data) return [];
  return Array.isArray(data) ? data : data.products || [];
}

window.ensureProductsLoaded = function ensureProductsLoaded() {
  if (window.__productsPromise) {
    return window.__productsPromise;
  }
  window.__catalogLoadHint = "";

  window.__productsPromise = fetch("/api/catalog")
    .then(function (res) {
      if (res.ok) return res.json();
      return Promise.reject(new Error("api-not-ok"));
    })
    .catch(function () {
      return fetch("/data/catalog.json").then(function (res) {
        if (!res.ok) return Promise.reject(new Error("static-not-ok"));
        return res.json();
      });
    })
    .then(function (data) {
      var list = parseCatalogPayload(data);
      window.PRODUCTS = list;
      window.__catalogLoadHint = list.length ? "" : "empty";
      window.dispatchEvent(new CustomEvent("products:loaded", { detail: list }));
      return list;
    })
    .catch(function (err) {
      console.error(err);
      window.PRODUCTS = [];
      window.__catalogLoadHint = "failed";
      window.dispatchEvent(new CustomEvent("products:loaded", { detail: [] }));
      return [];
    });

  return window.__productsPromise;
};

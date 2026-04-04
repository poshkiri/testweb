function applyThemeFromUrl() {
  const q = new URLSearchParams(window.location.search).get("theme");
  if (q === "garden" || q === "kitchen") {
    localStorage.setItem("siteTheme", q);
    document.documentElement.dataset.theme = q;
  }
}

function bindThemeSwitcher() {
  const buttons = document.querySelectorAll("[data-theme-set]");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = btn.getAttribute("data-theme-set");
      if (t !== "garden" && t !== "kitchen") return;
      localStorage.setItem("siteTheme", t);
      document.documentElement.dataset.theme = t;
      buttons.forEach((b) => {
        b.classList.toggle("is-active", b.getAttribute("data-theme-set") === t);
      });
    });
  });
  const current = document.documentElement.dataset.theme || "kitchen";
  buttons.forEach((b) => {
    b.classList.toggle("is-active", b.getAttribute("data-theme-set") === current);
  });
}

function renderLayout() {
  applyThemeFromUrl();

  const headerMount = document.getElementById("header-root");
  const footerMount = document.getElementById("footer-root");
  if (!headerMount || !footerMount) return;

  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  const lastSeg = pathname === "/" ? "index" : pathname.split("/").filter(Boolean).pop() || "index";
  const pageKey = String(lastSeg).replace(/\.html$/i, "") || "index";

  headerMount.innerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <a class="brand" href="/">Наконец-то вкусно</a>
        <nav class="site-nav">
          <a href="/" class="${pageKey === "index" ? "active" : ""}">Главная</a>
          <a href="/catalog" class="${pageKey === "catalog" ? "active" : ""}">Каталог</a>
          <a href="/cart" class="${pageKey === "cart" ? "active" : ""}">Корзина <span id="cart-badge">0</span></a>
          <a href="/contacts" class="${pageKey === "contacts" ? "active" : ""}">Контакты</a>
        </nav>
      </div>
    </header>
  `;

  footerMount.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-inner">
        <p>© ${new Date().getFullYear()} Наконец-то вкусно</p>
        <div class="theme-switch" aria-label="Варианты оформления сайта">
          <span class="theme-switch__label">Оформление:</span>
          <button type="button" class="theme-btn" data-theme-set="kitchen">Уютная кухня</button>
          <button type="button" class="theme-btn" data-theme-set="garden">Свежий сад</button>
        </div>
        <a href="/privacy">Политика конфиденциальности</a>
      </div>
    </footer>
  `;

  bindThemeSwitcher();
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  if (!badge || !window.CartStore) return;
  const { count } = window.CartStore.getCartTotals();
  badge.textContent = String(count);
}

window.addEventListener("cart:changed", updateCartBadge);
window.addEventListener("DOMContentLoaded", renderLayout);

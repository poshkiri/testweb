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

  const cartNavActive = pageKey === "cart" ? " cart-nav-wrap--active" : "";

  headerMount.innerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <a class="brand" href="/">Наконец-то вкусно</a>
        <nav class="site-nav">
          <a href="/" class="${pageKey === "index" ? "active" : ""}">Главная</a>
          <a href="/catalog" class="${pageKey === "catalog" ? "active" : ""}">Каталог</a>
          <div class="cart-nav-wrap${cartNavActive}">
            <button type="button" class="cart-nav-trigger" id="cart-nav-trigger" aria-label="Корзина" aria-expanded="false" aria-haspopup="true" aria-controls="cart-dropdown">
              <svg class="cart-nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span id="cart-badge">0</span>
            </button>
            <div class="cart-dropdown" id="cart-dropdown" role="region" aria-label="Мини-корзина">
              <div id="cart-dropdown-body"></div>
            </div>
          </div>
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
  updateCartNav();
  bindCartDropdown();
}

function escLayout(s) {
  if (typeof window.escapeHtml === "function") return window.escapeHtml(s);
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderCartDropdownHtml() {
  if (!window.CartStore) {
    return '<p class="muted cart-dropdown__empty">Корзина пуста</p>';
  }
  const detailed = window.CartStore.getCartDetailedItems();
  const totals = window.CartStore.getCartTotals();
  if (!detailed.length) {
    return '<p class="muted cart-dropdown__empty">Корзина пуста</p>';
  }
  const preview = detailed.slice(0, 3);
  const lines = preview
    .map(function (item) {
      return (
        '<li class="cart-dropdown__line">' +
        '<span class="cart-dropdown__name">' +
        escLayout(item.name) +
        "</span>" +
        '<span class="cart-dropdown__qty">× ' +
        String(item.quantity) +
        "</span>" +
        '<span class="cart-dropdown__price">' +
        window.CartStore.formatRub(item.lineTotal) +
        "</span>" +
        "</li>"
      );
    })
    .join("");
  return (
    '<ul class="cart-dropdown__list">' +
    lines +
    "</ul>" +
    '<p class="cart-dropdown__total"><strong>Итого: ' +
    window.CartStore.formatRub(totals.total) +
    "</strong></p>" +
    '<div class="cart-dropdown__foot actions">' +
    '<a href="/checkout" class="btn primary">Оформить заказ</a>' +
    '<a href="/cart" class="btn">Вся корзина</a>' +
    "</div>"
  );
}

function updateCartNav() {
  const badge = document.getElementById("cart-badge");
  const body = document.getElementById("cart-dropdown-body");
  if (!window.CartStore) return;
  const { count } = window.CartStore.getCartTotals();
  if (badge) badge.textContent = String(count);
  if (body) body.innerHTML = renderCartDropdownHtml();
}

function bindCartDropdown() {
  const wrap = document.querySelector(".cart-nav-wrap");
  const trigger = document.getElementById("cart-nav-trigger");
  const dropdown = document.getElementById("cart-dropdown");
  if (!wrap || !trigger || !dropdown) return;

  const mqMobile = window.matchMedia("(max-width: 700px)");
  const mqHover = window.matchMedia("(hover: hover)");

  function setOpen(open) {
    wrap.classList.toggle("is-open", open);
    trigger.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function onDocClick(e) {
    if (!wrap.contains(e.target)) setOpen(false);
  }

  if (mqMobile.matches) {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "/cart";
    });
    return;
  }

  if (mqHover.matches) {
    wrap.addEventListener("mouseenter", function () {
      setOpen(true);
    });
    wrap.addEventListener("mouseleave", function () {
      setOpen(false);
    });
  } else {
    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!wrap.classList.contains("is-open"));
    });
    document.addEventListener("click", onDocClick);
  }
}

window.addEventListener("cart:changed", updateCartNav);
window.addEventListener("DOMContentLoaded", renderLayout);

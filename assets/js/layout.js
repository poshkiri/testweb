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
        <div class="footer-social" aria-label="Соцсети">
          <a
            class="footer-social-link"
            href="https://www.instagram.com/nakonez_vkusno/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram — @nakonez_vkusno"
          >
            <svg class="footer-social-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
        </div>
        <div class="theme-switch" aria-label="Варианты оформления сайта">
          <span class="theme-switch__label">Оформление:</span>
          <button type="button" class="theme-btn" data-theme-set="kitchen">Уютная кухня</button>
          <button type="button" class="theme-btn" data-theme-set="garden">Свежий сад</button>
        </div>
        <a href="/privacy">Политика конфиденциальности</a>
      </div>
    </footer>
    <div class="contact-fab" id="contact-fab">
      <div class="contact-fab__items" id="fab-items">
        <a href="tel:+79501110733" class="fab-item fab-phone" title="Позвонить" aria-label="Позвонить">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#25D366" aria-hidden="true">
            <path
              d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
            />
          </svg>
        </a>
        <a
          href="https://wa.me/79501110733"
          target="_blank"
          rel="noopener noreferrer"
          class="fab-item fab-whatsapp"
          title="WhatsApp"
          aria-label="WhatsApp"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="white" aria-hidden="true">
            <path
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
            />
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.413A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
          </svg>
        </a>
        <a
          href="https://t.me/da_doroxova"
          target="_blank"
          rel="noopener noreferrer"
          class="fab-item fab-telegram"
          title="Telegram"
          aria-label="Telegram"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="white" aria-hidden="true">
            <path
              d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.93 7.235l-1.687 7.952c-.124.561-.453.698-.917.434l-2.54-1.872-1.226 1.18c-.136.136-.249.249-.51.249l.181-2.584 4.693-4.24c.204-.181-.044-.282-.315-.1L8.132 14.4l-2.5-.782c-.543-.17-.554-.543.114-.803l9.765-3.765c.453-.164.85.1.419.385z"
            />
          </svg>
        </a>
        <a
          href="https://www.instagram.com/nakonez_vkusno/"
          target="_blank"
          rel="noopener noreferrer"
          class="fab-item fab-instagram"
          title="Instagram"
          aria-label="Instagram"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="white" aria-hidden="true">
            <path
              d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
            />
          </svg>
        </a>
      </div>
      <button type="button" class="fab-main" id="fab-main" aria-label="Контакты" aria-expanded="false">💬</button>
    </div>
  `;

  bindThemeSwitcher();
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
      const idAttr = escLayout(String(item.id));
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
        '<button type="button" class="btn-remove cart-dropdown__remove" data-cart-remove="' +
        idAttr +
        '" aria-label="Удалить из корзины">✕</button>' +
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

function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  const body = document.getElementById("cart-dropdown-body");

  let count = 0;
  if (window.CartStore && typeof window.CartStore.getCartTotals === "function") {
    try {
      const totals = window.CartStore.getCartTotals();
      count = totals && typeof totals.count === "number" ? totals.count : 0;
    } catch (_e) {
      count = 0;
    }
  }

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

  dropdown.addEventListener("click", function (e) {
    const removeBtn = e.target.closest("[data-cart-remove]");
    if (!removeBtn || !dropdown.contains(removeBtn)) return;
    e.preventDefault();
    e.stopPropagation();
    const id = removeBtn.getAttribute("data-cart-remove");
    if (!id || !window.CartStore || typeof window.CartStore.removeFromCart !== "function") return;
    window.CartStore.removeFromCart(id);
  });
}

function bindContactFab() {
  const btn = document.getElementById("fab-main");
  const items = document.getElementById("fab-items");
  const root = document.getElementById("contact-fab");
  if (!btn || !items || !root) return;

  function setOpen(open) {
    btn.classList.toggle("active", open);
    items.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const next = !items.classList.contains("open");
    setOpen(next);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".contact-fab")) {
      setOpen(false);
    }
  });
}

window.addEventListener("cart:changed", updateCartBadge);
window.addEventListener("products:loaded", updateCartBadge);
window.addEventListener("DOMContentLoaded", () => {
  renderLayout();
  updateCartBadge();
  bindContactFab();
});

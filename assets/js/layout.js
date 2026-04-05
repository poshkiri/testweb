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
    <a
      href="https://wa.me/79501110733"
      target="_blank"
      rel="noopener noreferrer"
      class="whatsapp-float"
      aria-label="Написать в WhatsApp"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="28" height="28" aria-hidden="true">
        <path
          d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
        />
        <path
          d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.528 5.855L.057 23.522a.75.75 0 00.921.921l5.667-1.471A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.726 9.726 0 01-4.964-1.359l-.356-.211-3.688.957.978-3.578-.232-.368A9.725 9.725 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"
        />
      </svg>
    </a>
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

let scrollAnimationObserver = null;

function initScrollAnimations() {
  if (typeof IntersectionObserver === "undefined") {
    document.querySelectorAll(".animate-on-scroll").forEach((el) => el.classList.add("visible"));
    return;
  }
  if (!scrollAnimationObserver) {
    scrollAnimationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
  }
  document.querySelectorAll(".animate-on-scroll:not([data-scroll-observed])").forEach((el) => {
    el.setAttribute("data-scroll-observed", "");
    scrollAnimationObserver.observe(el);
  });
}

window.initScrollAnimations = initScrollAnimations;

window.addEventListener("cart:changed", updateCartBadge);
window.addEventListener("products:loaded", updateCartBadge);
window.addEventListener("DOMContentLoaded", () => {
  renderLayout();
  updateCartBadge();
  initScrollAnimations();
});

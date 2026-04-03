const CART_KEY = "semiProductsCart";

function readCart() {
  const raw = window.localStorage.getItem(CART_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch (_error) {
    return {};
  }
}

function writeCart(cart) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getCartItems() {
  const cart = readCart();
  return Object.entries(cart)
    .filter(([_id, qty]) => qty > 0)
    .map(([id, quantity]) => ({ id, quantity }));
}

function getCartDetailedItems() {
  const items = getCartItems();
  return items
    .map((item) => {
      const product = (window.PRODUCTS || []).find((p) => p.id === item.id);
      if (!product) return null;
      return { ...product, quantity: item.quantity, lineTotal: product.price * item.quantity };
    })
    .filter(Boolean);
}

function getCartTotals() {
  const detailed = getCartDetailedItems();
  const count = detailed.reduce((acc, item) => acc + item.quantity, 0);
  const total = detailed.reduce((acc, item) => acc + item.lineTotal, 0);
  return { count, total };
}

function addToCart(productId, quantity = 1) {
  const cart = readCart();
  cart[productId] = (cart[productId] || 0) + quantity;
  if (cart[productId] < 1) cart[productId] = 1;
  writeCart(cart);
  notifyCartChanged();
}

function setCartQuantity(productId, quantity) {
  const cart = readCart();
  if (quantity <= 0) {
    delete cart[productId];
  } else {
    cart[productId] = quantity;
  }
  writeCart(cart);
  notifyCartChanged();
}

function removeFromCart(productId) {
  const cart = readCart();
  delete cart[productId];
  writeCart(cart);
  notifyCartChanged();
}

function clearCart() {
  writeCart({});
  notifyCartChanged();
}

function formatRub(value) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

function notifyCartChanged() {
  window.dispatchEvent(new Event("cart:changed"));
}

window.CartStore = {
  getCartItems,
  getCartDetailedItems,
  getCartTotals,
  addToCart,
  setCartQuantity,
  removeFromCart,
  clearCart,
  formatRub
};

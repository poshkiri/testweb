function renderCheckoutItems() {
  const root = document.getElementById("checkout-items");
  const items = window.CartStore.getCartDetailedItems();
  if (!items.length) {
    root.innerHTML = "<p class='muted'>Корзина пуста. Добавьте товары из каталога.</p><a class='btn' href='catalog.html'>Перейти в каталог</a>";
    return;
  }

  const lines = items.map((item) => `<li>${item.name} x ${item.quantity} — ${window.CartStore.formatRub(item.lineTotal)}</li>`).join("");
  const totals = window.CartStore.getCartTotals();
  root.innerHTML = `<ul>${lines}</ul><p><strong>Итого: ${window.CartStore.formatRub(totals.total)}</strong></p>`;
}

async function handleSubmit(event) {
  event.preventDefault();
  const items = window.CartStore.getCartDetailedItems().map((item) => ({
    id: item.id,
    quantity: item.quantity
  }));
  const result = document.getElementById("checkout-result");

  if (!items.length) {
    result.textContent = "Нельзя оформить пустую корзину.";
    return;
  }

  const form = new FormData(event.currentTarget);
  const payload = {
    customer: {
      name: form.get("name"),
      phone: form.get("phone"),
      address: form.get("address"),
      contactMethod: form.get("contactMethod") || "phone",
      comment: form.get("comment") || ""
    },
    items
  };

  result.textContent = "Отправляем заказ...";

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok || !data.ok) {
      const message = Array.isArray(data.errors) ? data.errors.join(" ") : "Ошибка при оформлении заказа.";
      result.textContent = message;
      return;
    }

    window.localStorage.setItem("lastOrderDraft", JSON.stringify(data));

    if (data.paymentUrl) {
      window.CartStore.clearCart();
      event.currentTarget.reset();
      renderCheckoutItems();
      window.location.href = data.paymentUrl;
      return;
    }

    if (data.paymentError) {
      result.textContent =
        "Заказ " +
        data.orderId +
        " создан. Онлайн-оплата не запустилась: " +
        data.paymentError +
        " Свяжитесь с нами или попробуйте позже.";
      window.CartStore.clearCart();
      event.currentTarget.reset();
      renderCheckoutItems();
      return;
    }

    window.CartStore.clearCart();
    event.currentTarget.reset();
    renderCheckoutItems();
    result.textContent =
      "Заказ " +
      data.orderId +
      " принят. Онлайн-оплата не настроена — оплату можно согласовать по телефону (статус оплаты: " +
      (data.paymentStatus || "pending") +
      ").";
  } catch (_error) {
    result.textContent = "Сервер недоступен. Проверьте, что backend запущен.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const boot = () => {
    renderCheckoutItems();
    document.getElementById("checkout-form").addEventListener("submit", handleSubmit);
  };
  if (typeof ensureProductsLoaded === "function") {
    ensureProductsLoaded().then(boot);
  } else {
    boot();
  }
});

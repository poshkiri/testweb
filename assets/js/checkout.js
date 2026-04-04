function renderCheckoutItems() {
  const root = document.getElementById("checkout-items");
  const items = window.CartStore.getCartDetailedItems();
  if (!items.length) {
    root.innerHTML = "<p class='muted'>Корзина пуста. Добавьте товары из каталога.</p><a class='btn' href='/catalog'>Перейти в каталог</a>";
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

    let data = {};
    try {
      data = await response.json();
    } catch (_parseError) {
      data = {};
    }

    if (!response.ok || !data.ok) {
      let message = "";
      if (Array.isArray(data.errors) && data.errors.length) {
        message = data.errors.join(" ");
      } else if (data.message) {
        message = String(data.message);
      } else if (!response.ok) {
        message = "Ошибка " + response.status + (response.statusText ? ": " + response.statusText : "");
      } else {
        message = "Ошибка при оформлении заказа.";
      }
      result.textContent = message;
      return;
    }

    window.localStorage.setItem("lastOrderDraft", JSON.stringify(data));

    window.CartStore.clearCart();
    renderCheckoutItems();

    if (data.paymentUrl) {
      window.location.href = data.paymentUrl;
      return;
    }

    window.location.href = "/payment-success?orderId=" + data.orderId;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    result.textContent = message || "Не удалось выполнить запрос.";
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

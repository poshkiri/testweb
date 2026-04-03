function formatRub(value) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

async function loadStatus() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("orderId");
  const statusEl = document.getElementById("payment-status");
  const detailEl = document.getElementById("payment-detail");

  if (!orderId) {
    statusEl.textContent = "Не указан номер заказа.";
    return;
  }

  statusEl.textContent = "Проверяем статус оплаты...";

  try {
    const r = await fetch("/api/orders/" + encodeURIComponent(orderId));
    const data = await r.json();

    if (!r.ok || !data.ok) {
      statusEl.textContent = data.message || "Заказ не найден. Если вы только что оплатили, обновите страницу через минуту.";
      return;
    }

    const statusText =
      data.paymentStatus === "succeeded"
        ? "Оплата прошла успешно. Спасибо за заказ!"
        : data.paymentStatus === "pending"
          ? "Ожидаем подтверждения оплаты. Обновите страницу через несколько секунд."
          : data.paymentStatus === "canceled"
            ? "Платёж отменён."
            : "Статус: " + (data.paymentStatus || "неизвестно");

    statusEl.textContent = statusText;
    detailEl.textContent = "Заказ " + data.orderId + " · Сумма " + formatRub(data.total);
  } catch (_e) {
    statusEl.textContent = "Не удалось связаться с сервером.";
  }
}

document.addEventListener("DOMContentLoaded", loadStatus);

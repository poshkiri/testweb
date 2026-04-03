function setMessage(text, isError) {
  const el = document.getElementById("admin-msg");
  if (!el) return;
  el.textContent = text || "";
  el.style.color = isError ? "#b71c1c" : "var(--muted, #666)";
}

async function loadCatalog() {
  setMessage("");
  try {
    const res = await fetch("/api/catalog");
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Ошибка загрузки");
    }
    const products = Array.isArray(data) ? data : data.products || [];
    document.getElementById("catalog-json").value = JSON.stringify({ products }, null, 2);
    setMessage("Каталог загружен.");
  } catch (e) {
    setMessage(e instanceof Error ? e.message : String(e), true);
  }
}

async function saveCatalog() {
  setMessage("");
  const token = document.getElementById("admin-token").value.trim();
  if (!token) {
    setMessage("Введите секретный ключ.", true);
    return;
  }
  sessionStorage.setItem("catalogAdminToken", token);

  let body;
  try {
    body = JSON.parse(document.getElementById("catalog-json").value);
  } catch (e) {
    setMessage("Некорректный JSON: " + (e instanceof Error ? e.message : String(e)), true);
    return;
  }

  try {
    const res = await fetch("/api/admin/catalog", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Неверный секретный ключ. Проверьте, что скопировали ключ полностью, и попробуйте снова.");
      }
      if (res.status === 503 && String(data.message || "").includes("CATALOG_ADMIN_TOKEN")) {
        throw new Error(
          "На сервере не настроен ключ доступа. Попросите администратора добавить CATALOG_ADMIN_TOKEN в файл .env и перезапустить сайт."
        );
      }
      const msg = Array.isArray(data.errors) ? data.errors.join(" ") : data.message || "Ошибка сохранения";
      throw new Error(msg);
    }
    setMessage("Сохранено. Обновите страницу каталога на сайте.");
    window.__productsPromise = null;
  } catch (e) {
    setMessage(e instanceof Error ? e.message : String(e), true);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const saved = sessionStorage.getItem("catalogAdminToken");
  if (saved) {
    document.getElementById("admin-token").value = saved;
  }
  document.getElementById("btn-load").addEventListener("click", loadCatalog);
  document.getElementById("btn-save").addEventListener("click", saveCatalog);
  loadCatalog();
});

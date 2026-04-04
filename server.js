const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, "");
const CATALOG_PATH = path.join(__dirname, "data", "catalog.json");
const ORDERS_PATH = path.join(__dirname, "data", "orders.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase() || ".bin";
      cb(null, `${Date.now()}${ext}`);
    }
  })
});

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/catalog", (req, res) => res.sendFile(path.join(__dirname, "catalog.html")));
app.get("/cart", (req, res) => res.sendFile(path.join(__dirname, "cart.html")));
app.get("/checkout", (req, res) => res.sendFile(path.join(__dirname, "checkout.html")));
app.get("/contacts", (req, res) => res.sendFile(path.join(__dirname, "contacts.html")));
app.get("/admin", (req, res) => {
  const auth = req.headers.authorization || "";
  const base64 = auth.startsWith("Basic ") ? auth.slice(6) : "";
  let decoded = "";
  try {
    decoded = Buffer.from(base64, "base64").toString("utf8");
  } catch (_e) {
    decoded = "";
  }
  const colon = decoded.indexOf(":");
  const user = colon === -1 ? decoded : decoded.slice(0, colon);
  const pass = colon === -1 ? "" : decoded.slice(colon + 1);

  const adminUser = process.env.ADMIN_USER || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || "";

  if (!adminPass || user !== adminUser || pass !== adminPass) {
    res.set("WWW-Authenticate", 'Basic realm="Admin Panel"');
    return res.status(401).send("Доступ закрыт");
  }

  res.sendFile(path.join(__dirname, "admin.html"));
});
app.get("/payment-success", (req, res) => res.sendFile(path.join(__dirname, "payment-success.html")));
app.get("/privacy", (req, res) => res.sendFile(path.join(__dirname, "privacy.html")));
app.use(express.static(path.join(__dirname)));
app.use("/uploads", express.static(UPLOADS_DIR));

function getCatalogSync() {
  try {
    const raw = fs.readFileSync(CATALOG_PATH, "utf8");
    const data = JSON.parse(raw);
    const products = Array.isArray(data) ? data : data.products;
    if (!Array.isArray(products)) {
      return { products: [], productById: {} };
    }
    const productById = Object.fromEntries(products.map((p) => [p.id, p]));
    return { products, productById };
  } catch (e) {
    console.error("Catalog read error:", e);
    return { products: [], productById: {} };
  }
}

function validateCatalogPayload(products) {
  const errors = [];
  if (!Array.isArray(products) || products.length === 0) {
    return ["Нужен непустой массив products."];
  }
  const seen = new Set();
  products.forEach((p, i) => {
    const prefix = `Товар #${i + 1}: `;
    if (!p || typeof p !== "object") {
      errors.push(prefix + "некорректная запись.");
      return;
    }
    if (!p.id || typeof p.id !== "string" || !String(p.id).trim()) {
      errors.push(prefix + "нужен id (строка).");
    } else if (seen.has(p.id)) {
      errors.push(prefix + "дублируется id «" + p.id + "».");
    } else {
      seen.add(p.id);
    }
    if (!p.name || typeof p.name !== "string" || !String(p.name).trim()) {
      errors.push(prefix + "нужно название.");
    }
    const price = Number(p.price);
    if (!Number.isFinite(price) || price < 0) {
      errors.push(prefix + "нужна цена (число ≥ 0).");
    }
    if (!p.unit || typeof p.unit !== "string" || !String(p.unit).trim()) {
      errors.push(prefix + "нужна единица (например «6 шт»).");
    }
  });
  return errors;
}

function readOrdersFile() {
  try {
    const raw = fs.readFileSync(ORDERS_PATH, "utf8");
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    return data;
  } catch (_e) {
    return {};
  }
}

function writeOrdersFile(obj) {
  const tmp = ORDERS_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2), "utf8");
  fs.renameSync(tmp, ORDERS_PATH);
}

function saveOrder(order) {
  const ordersObj = readOrdersFile();
  ordersObj[order.orderId] = order;
  writeOrdersFile(ordersObj);
}

function getOrderById(orderId) {
  const ordersObj = readOrdersFile();
  return ordersObj[orderId] || null;
}

function ensureOrdersFile() {
  if (!fs.existsSync(ORDERS_PATH)) {
    writeOrdersFile({});
  }
}

function checkAdminAuth(req, res) {
  const secret = process.env.CATALOG_ADMIN_TOKEN;
  if (!secret || !String(secret).trim()) {
    res.status(503).json({ ok: false, message: "Админ-доступ не настроен (CATALOG_ADMIN_TOKEN)." });
    return false;
  }
  const auth = req.headers.authorization || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (bearer !== secret) {
    res.status(401).json({ ok: false, message: "Неверный ключ доступа." });
    return false;
  }
  return true;
}

app.get("/api/catalog", (_req, res) => {
  const { products } = getCatalogSync();
  res.json({ products });
});

app.put("/api/admin/catalog", (req, res) => {
  if (!checkAdminAuth(req, res)) return;
  const body = req.body || {};
  const products = Array.isArray(body) ? body : body.products;
  const errors = validateCatalogPayload(products);
  if (errors.length) {
    return res.status(400).json({ ok: false, errors });
  }
  try {
    const out = JSON.stringify({ products }, null, 2);
    const tmp = CATALOG_PATH + ".tmp";
    fs.writeFileSync(tmp, out, "utf8");
    fs.renameSync(tmp, CATALOG_PATH);
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, message: e instanceof Error ? e.message : String(e) });
  }
});

app.get("/api/admin/orders", (req, res) => {
  if (!checkAdminAuth(req, res)) return;
  const ordersObj = readOrdersFile();
  const orders = Object.values(ordersObj).sort((a, b) => {
    const ta = Date.parse(a?.createdAt || 0) || 0;
    const tb = Date.parse(b?.createdAt || 0) || 0;
    return tb - ta;
  });
  return res.json({ ok: true, orders });
});

app.patch("/api/admin/orders/:orderId/status", async (req, res) => {
  if (!checkAdminAuth(req, res)) return;
  const orderId = req.params.orderId;
  const allowedStatuses = new Set(["new", "preparing", "ready", "delivering", "done", "cancelled"]);
  const deliveryStatus = req.body?.deliveryStatus;

  if (!allowedStatuses.has(deliveryStatus)) {
    return res.status(400).json({
      ok: false,
      message: "Некорректный deliveryStatus. Допустимо: new, preparing, ready, delivering, done, cancelled."
    });
  }

  const order = getOrderById(orderId);
  if (!order) {
    return res.status(404).json({ ok: false, message: "Заказ не найден." });
  }

  order.deliveryStatus = deliveryStatus;
  saveOrder(order);

  try {
    await sendStatusNotification(order, deliveryStatus);
  } catch (_e) {
    // ignore notification errors in status update
  }

  return res.json({ ok: true, orderId, deliveryStatus });
});

app.post("/api/upload", (req, res) => {
  if (!checkAdminAuth(req, res)) return;
  upload.single("image")(req, res, (err) => {
    if (err && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ ok: false, message: "Файл слишком большой. Максимум 5MB." });
    }
    if (err) {
      return res.status(400).json({ ok: false, message: "Ошибка загрузки файла." });
    }
    if (!req.file) {
      return res.status(400).json({ ok: false, message: "Файл image не передан." });
    }
    return res.json({ ok: true, url: `/uploads/${req.file.filename}` });
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "workForWeb-order-api" });
});

app.get("/api/orders/:orderId", async (req, res) => {
  const orderId = req.params.orderId;
  const order = getOrderById(orderId);
  if (!order) {
    return res.status(404).json({ ok: false, message: "Заказ не найден." });
  }

  if (order.yooPaymentId && isYooKassaConfigured()) {
    try {
      await syncOrderPaymentFromYooKassa(order);
    } catch (_e) {
      // ignore sync errors for read path
    }
  }

  return res.json({
    ok: true,
    orderId: order.orderId,
    createdAt: order.createdAt,
    deliveryStatus: order.deliveryStatus || "new",
    customer: order.customer,
    items: Array.isArray(order.items) ? order.items : [],
    total: order.total,
    paymentStatus: order.paymentStatus
  });
});

app.post("/api/webhooks/yookassa", async (req, res) => {
  const body = req.body || {};
  const paymentObj = body.object;
  const paymentId = paymentObj && paymentObj.id;
  const metaOrderId = paymentObj && paymentObj.metadata && paymentObj.metadata.orderId;

  if (!paymentId && !metaOrderId) {
    return res.status(400).json({ ok: false });
  }

  let order = null;
  if (metaOrderId) {
    order = getOrderById(metaOrderId);
  }
  if (!order) {
    const ordersObj = readOrdersFile();
    for (const o of Object.values(ordersObj)) {
      if (o.yooPaymentId === paymentId) {
        order = o;
        break;
      }
    }
  }

  if (order && paymentId) {
    try {
      const remote = await fetchYooPayment(paymentId);
      applyYooStatusToOrder(order, remote);
      await notifyIfPaymentSucceeded(order);
      saveOrder(order);
    } catch (_e) {
      // ignore
    }
  }

  res.status(200).send("OK");
});

app.post("/api/orders", async (req, res) => {
  const { customer, items } = req.body || {};
  const errors = validateOrder(customer, items);

  if (errors.length) {
    return res.status(400).json({ ok: false, errors });
  }

  const { productById } = getCatalogSync();
  const normalizedItems = items.map((item) => {
    const product = productById[item.id];
    const quantity = Number(item.quantity);
    return {
      id: product.id,
      name: product.name,
      unit: product.unit,
      price: product.price,
      quantity,
      lineTotal: product.price * quantity
    };
  });

  const total = normalizedItems.reduce((acc, item) => acc + item.lineTotal, 0);
  const orderId = "ORD-" + Date.now();
  const order = {
    orderId,
    customer: {
      name: String(customer.name).trim(),
      phone: String(customer.phone).trim(),
      address: String(customer.address).trim(),
      contactMethod: customer.contactMethod || "phone",
      comment: customer.comment || ""
    },
    items: normalizedItems,
    total,
    paymentStatus: "pending",
    deliveryStatus: "new",
    paymentSuccessNotifiedAt: null,
    yooPaymentId: null,
    createdAt: new Date().toISOString()
  };

  saveOrder(order);

  let telegramDelivered = false;
  let telegramError = null;

  try {
    telegramDelivered = await sendTelegramNotification(order);
  } catch (error) {
    telegramError = error instanceof Error ? error.message : "Unknown telegram error";
  }

  let paymentUrl = null;
  let paymentError = null;

  if (isYooKassaConfigured()) {
    try {
      const returnUrl = `${PUBLIC_BASE_URL}/payment-success?orderId=${encodeURIComponent(orderId)}`;
      const created = await createYooKassaPayment(order, returnUrl);
      order.yooPaymentId = created.id;
      saveOrder(order);
      paymentUrl = created.confirmationUrl;
    } catch (error) {
      paymentError = error instanceof Error ? error.message : "YooKassa error";
    }
  }

  return res.status(201).json({
    ok: true,
    orderId,
    total,
    paymentStatus: order.paymentStatus,
    paymentUrl,
    paymentError,
    telegramDelivered,
    telegramError
  });
});

function validateOrder(customer, items) {
  const errors = [];
  const { productById } = getCatalogSync();
  if (!customer || typeof customer !== "object") {
    return ["Некорректные данные клиента."];
  }

  if (!String(customer.name || "").trim()) errors.push("Укажите имя.");
  if (!String(customer.phone || "").trim()) errors.push("Укажите телефон.");
  if (!String(customer.address || "").trim()) errors.push("Укажите адрес доставки.");

  if (!Array.isArray(items) || !items.length) {
    errors.push("Корзина пуста.");
    return errors;
  }

  for (const item of items) {
    if (!productById[item.id]) {
      errors.push(`Товар с id ${item.id} не найден.`);
      continue;
    }
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      errors.push(`Некорректное количество для товара ${item.id}.`);
    }
  }

  return errors;
}

function isYooKassaConfigured() {
  return Boolean(process.env.YOOKASSA_SHOP_ID && process.env.YOOKASSA_SECRET_KEY);
}

function yooAuthHeader() {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secret = process.env.YOOKASSA_SECRET_KEY;
  const token = Buffer.from(`${shopId}:${secret}`).toString("base64");
  return `Basic ${token}`;
}

async function createYooKassaPayment(order, returnUrl) {
  const idempotenceKey = crypto.randomUUID();
  const body = {
    amount: {
      value: order.total.toFixed(2),
      currency: "RUB"
    },
    capture: true,
    confirmation: {
      type: "redirect",
      return_url: returnUrl
    },
    description: `Заказ ${order.orderId}`,
    metadata: {
      orderId: order.orderId
    }
  };

  const response = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: yooAuthHeader(),
      "Idempotence-Key": idempotenceKey
    },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data.description || data.type || JSON.stringify(data);
    throw new Error(`YooKassa: ${msg}`);
  }

  const confirmationUrl = data.confirmation && data.confirmation.confirmation_url;
  if (!confirmationUrl) {
    throw new Error("YooKassa: нет confirmation_url");
  }

  return { id: data.id, confirmationUrl };
}

async function fetchYooPayment(paymentId) {
  const response = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
    headers: { Authorization: yooAuthHeader() }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error("YooKassa fetch failed");
  }
  return data;
}

function applyYooStatusToOrder(order, remote) {
  const status = remote.status;
  if (status === "succeeded") {
    order.paymentStatus = "succeeded";
  } else if (status === "canceled") {
    order.paymentStatus = "canceled";
  } else {
    order.paymentStatus = "pending";
  }
}

async function syncOrderPaymentFromYooKassa(order) {
  if (!order.yooPaymentId) return;
  const remote = await fetchYooPayment(order.yooPaymentId);
  applyYooStatusToOrder(order, remote);
  await notifyIfPaymentSucceeded(order);
  saveOrder(order);
}

async function sendTelegramNotification(order) {
  const dateRu = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });
  const dateLine = dateRu.includes(",") ? dateRu.replace(", ", " в ") : dateRu;

  const commentRaw = order.customer?.comment;
  const commentLine =
    commentRaw != null && String(commentRaw).trim()
      ? `💬 Комментарий: ${String(commentRaw).trim()}`
      : "";

  const orderLines = (order.items || [])
    .map((item) => `• ${item.name} × ${item.quantity} = ${item.lineTotal} ₽`)
    .join("\n");

  const message = [
    `🛒 НОВЫЙ ЗАКАЗ #${order.orderId}`,
    `📅 ${dateLine}`,
    "",
    "👤 КЛИЕНТ",
    `Имя: ${order.customer.name}`,
    `Телефон: ${order.customer.phone}`,
    `Адрес: ${order.customer.address}`,
    `Связь: ${order.customer.contactMethod}`,
    ...(commentLine ? [commentLine] : []),
    "",
    "🧾 СОСТАВ ЗАКАЗА",
    orderLines,
    "",
    `💰 ИТОГО: ${order.total} ₽`
  ].join("\n");

  return sendTelegramMessage(message);
}

async function sendTelegramPaymentSuccessNotification(order) {
  const orderLines = order.items
    .map((item) => `- ${item.name} x ${item.quantity} = ${item.lineTotal} ₽`)
    .join("\n");

  const message = [
    "Оплата подтверждена ✅",
    `Заказ: ${order.orderId}`,
    `Сумма: ${order.total} ₽`,
    `Клиент: ${order.customer.name}`,
    `Телефон: ${order.customer.phone}`,
    `Адрес: ${order.customer.address}`,
    "",
    "Состав заказа:",
    orderLines
  ].join("\n");

  return sendTelegramMessage(message);
}

function formatDeliveryStatusLabel(deliveryStatus) {
  const labels = {
    new: "Новый",
    preparing: "Готовится",
    ready: "Готов",
    delivering: "Доставляется",
    done: "Завершён",
    cancelled: "Отменён"
  };
  return labels[deliveryStatus] || deliveryStatus;
}

async function sendStatusNotification(order, deliveryStatus) {
  const label = formatDeliveryStatusLabel(deliveryStatus);
  const message = [
    `📦 Статус заказа ${order.orderId} изменён на: ${label}`,
    `👤 Клиент: ${order.customer.name} (${order.customer.phone})`
  ].join("\n");
  return sendTelegramMessage(message);
}

async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram API error: ${response.status} ${body}`);
  }

  return true;
}

async function notifyIfPaymentSucceeded(order) {
  if (order.paymentStatus !== "succeeded") return;
  if (order.paymentSuccessNotifiedAt) return;

  const delivered = await sendTelegramPaymentSuccessNotification(order);
  if (delivered) {
    order.paymentSuccessNotifiedAt = new Date().toISOString();
  }
}

ensureOrdersFile();
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "404.html"));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});

# WorkForWeb - semi-products delivery site

## Run locally

1. Copy `.env.example` to `.env`.
2. Заполните переменные: Telegram (по желанию), ЮKassa (по желанию), **`CATALOG_ADMIN_TOKEN`** — секрет для страницы редактирования каталога (`admin.html`).
3. Install dependencies:
   - `npm install`
4. Start:
   - `npm run start`  
   Важно: сайт нужно открывать **через этот сервер** (адрес `http://localhost:…`). Только «просмотр папки» или Live Server без Node — **каталог и заказы работать не будут**, потому что не поднимается API (`/api/catalog`, оформление заказа).
5. Open:
   - `http://localhost:3001` (или порт из `PORT` в `.env`)

## Каталог товаров (без правки кода)

- Файл данных: `data/catalog.json` (массив `products` на сервере).
- Публичная выдача: `GET /api/catalog` — его читает сайт (каталог, корзина, оформление).
- Редактирование для владельца: откройте **`/admin.html`**, введите ключ из `CATALOG_ADMIN_TOKEN`, нажмите «Сохранить».
- В каждой позиции должны быть поля: **`id`** (уникальный), **`name`**, **`price`** (число), **`unit`** (например «6 шт»), опционально **`image`**, **`category`**, **`description`**.

### Что сказать клиентке (владелице магазина)

1. Выдайте ей **ссылку** на страницу: `https://ваш-домен/admin.html` (и то же для теста на `http://localhost:3001/admin.html`).
2. Выдайте **секретный ключ** — значение `CATALOG_ADMIN_TOKEN` из `.env` (или отдельная фраза-пароль, которую вы туда вписали).
3. На странице админки уже есть **пошаговая инструкция** и **шпаргалка по полям** — ей не нужно разбираться в коде: копировать блок товара, менять поля, сохранить, обновить каталог в браузере.
4. Если она «не из IT»: не отправляйте её править `.env` сам — только ключ и ссылку.

## API

- `GET /api/health` - health check
- `GET /api/catalog` - каталог для витрины
- `PUT /api/admin/catalog` - сохранить каталог (заголовок `Authorization: Bearer <CATALOG_ADMIN_TOKEN>`)
- `POST /api/orders` - create order with server-side validation; при настроенной ЮKassa возвращает `paymentUrl`
- `GET /api/orders/:orderId` - статус заказа и оплаты (для страницы `payment-success.html`)
- `POST /api/webhooks/yookassa` - webhook ЮKassa (указать URL в личном кабинете ЮKassa)

## Онлайн-оплата (ЮKassa)

1. Зарегистрируйте магазин в [ЮKassa](https://yookassa.ru/), получите `shopId` и секретный ключ.
2. В `.env` задайте `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY`.
3. `PUBLIC_BASE_URL` должен совпадать с публичным URL сайта (для редиректа после оплаты и webhook).
4. В кабинете ЮKassa укажите URL уведомлений: `https://ваш-домен/api/webhooks/yookassa`.

Без ключей ЮKassa заказ создаётся как раньше, поле `paymentUrl` не приходит — оплата вручную.

## Оформление сайта (два варианта)

В подвале переключатель:

- **Уютная кухня** — тёплый кремовый фон, акцент на коричневом и зелёном.
- **Свежий сад** — более светлый «эко»-вариант с зелёными оттенками.

Выбор сохраняется в браузере. Можно открыть сразу нужную тему:  
`http://localhost:3001/?theme=garden` или `?theme=kitchen`.

## Notes

- Заказы хранятся в памяти процесса: после перезапуска сервера история заказов сбрасывается (для продакшена нужна БД).
- Telegram notification is optional and enabled only when both env vars are set.

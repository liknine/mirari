# Mirari Telegram Mini App + Cloudflare Worker

Готовая архитектура без платного VPS:

- `docs/` — статический Telegram Mini App для GitHub Pages;
- `worker/` — Telegram-бот и админка на Cloudflare Workers;
- `docs/catalog-data/` — текущий каталог Mirari на 17 618 товаров;
- `docs/data/catalog-overrides.json` — безопасный слой добавлений, правок и удалений;
- `docs/assets/products/` — фотографии, загруженные администратором через Telegram.

## Что уже сделано

### Mini App

- мобильный дизайн в палитре Mirari;
- нижняя навигация: Каталог / Корзина / Профиль;
- мужской и женский каталог;
- категории и подкатегории;
- карточка товара с галереей;
- цены в BYN и RUB;
- корзина с количеством и общей суммой;
- кнопка «Купить» и оформление корзины переводят в личные сообщения менеджеру с готовым текстом и ссылками;
- профиль Telegram: аватар, имя и username;
- кнопка связи с менеджером;
- поиск по всему каталогу;
- сохранение корзины в localStorage.

### Админка бота

- добавление товара с фотографией;
- поиск существующего товара по ID;
- редактирование имени, бренда, цен, описания, раздела, категории, подкатегории и фотографий;
- удаление реализовано как безопасное скрытие;
- ID при редактировании не меняется;
- старые фотографии физически не удаляются;
- все правки автоматически коммитятся в GitHub через API;
- исходные 17 618 товаров не перезаписываются: изменения хранятся в overlay-файле.

## 1. Настройка Mini App

Откройте `docs/config.js` и замените:

```js
window.MIRARI_CONFIG = {
  managerUsername: "und333r",
  botUsername: "YOUR_BOT_USERNAME",
  catalogVersion: "2026-07-30-v1",
  pageSize: 24
};
```

`managerUsername` указывается без `@`.

## 2. Публикация на GitHub Pages

Из корня проекта:

```bash
cd ~/Downloads/mirari-telegram-miniapp-v1

git init
git add .
git commit -m "Mirari Telegram Mini App"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

На GitHub:

1. `Settings` → `Pages`.
2. `Source`: `Deploy from a branch`.
3. Branch: `main`.
4. Folder: `/docs`.
5. Сохранить.

Адрес будет вида:

```text
https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPOSITORY/
```

## 3. GitHub-токен для админки

Создайте Fine-grained personal access token только для нужного репозитория:

- Repository access: только репозиторий Mirari;
- Repository permissions → Contents: Read and write;
- остальные права не нужны.

Токен нельзя добавлять в GitHub или отправлять в чат. Он хранится как Cloudflare secret.

## 4. Настройка Cloudflare Worker

```bash
cd ~/Downloads/mirari-telegram-miniapp-v1/worker
npm install
npx wrangler login
```

Создайте KV для временных шагов админки:

```bash
npx wrangler kv namespace create ADMIN_STATE
```

Скопируйте полученный `id` в `worker/wrangler.jsonc` вместо:

```text
PASTE_KV_NAMESPACE_ID_HERE
```

В `wrangler.jsonc` также замените:

- `MINI_APP_URL`;
- `GITHUB_REPO` в формате `owner/repo`;
- при необходимости `MANAGER_USERNAME`.

Добавьте секреты. Wrangler попросит ввести каждое значение скрыто:

```bash
npx wrangler secret put BOT_TOKEN
npx wrangler secret put WEBHOOK_SECRET
npx wrangler secret put ADMIN_IDS
npx wrangler secret put GITHUB_TOKEN
```

`ADMIN_IDS` — Telegram ID администраторов через запятую, например:

```text
123456789,987654321
```

`WEBHOOK_SECRET` — случайная длинная строка. На Mac её можно создать так:

```bash
openssl rand -hex 32
```

Публикация Worker:

```bash
npm run deploy
```

После публикации Cloudflare покажет адрес вида:

```text
https://mirari-telegram-bot.YOUR_SUBDOMAIN.workers.dev
```

## 5. Подключение webhook

В терминале:

```bash
cd ~/Downloads/mirari-telegram-miniapp-v1/worker

read -s "BOT_TOKEN?Bot token: "
echo
export BOT_TOKEN

read -s "WEBHOOK_SECRET?Webhook secret: "
echo
export WEBHOOK_SECRET

export WORKER_URL="https://mirari-telegram-bot.YOUR_SUBDOMAIN.workers.dev"

npm run webhook:set
npm run commands:set

unset BOT_TOKEN WEBHOOK_SECRET WORKER_URL
```

## 6. Подключение Mini App в BotFather

В `@BotFather`:

1. `/mybots` → выбрать бота.
2. `Bot Settings` → `Menu Button` → указать GitHub Pages URL.
3. `Configure Mini App` → `Enable Mini App` → указать тот же URL.

После этого у бота появится кнопка запуска приложения.

## 7. Работа с админкой

Откройте бота с аккаунта, чей ID добавлен в `ADMIN_IDS`, и отправьте:

```text
/admin
```

Доступно:

- добавить товар;
- найти по ID;
- изменить товар;
- скрыть товар;
- посмотреть последние добавленные и изменённые товары.

После изменения бот создаёт GitHub-коммит. Обновление GitHub Pages может появиться не мгновенно.

## 8. Обычные будущие обновления через Git

```bash
cd ~/Downloads/mirari-telegram-miniapp-v1
git add .
git commit -m "Update Mirari"
git pull --rebase origin main
git push origin main
```

Не используйте `git push --force`: админка бота тоже создаёт коммиты в репозитории.

## Проверка перед публикацией

```bash
cd ~/Downloads/mirari-telegram-miniapp-v1
node scripts/check-project.mjs
node --check docs/app.js
cd worker
tsc --noEmit
```

После установки зависимостей вместо глобального TypeScript можно использовать:

```bash
npm run typecheck
```

## Ручной чек-лист

1. Бот отвечает на `/start` и показывает кнопку Mirari.
2. Mini App открывается на всю доступную высоту.
3. Переключаются мужской и женский разделы.
4. Открываются категории, подкатегории и товары.
5. Товар добавляется в корзину.
6. Количество и сумма пересчитываются.
7. «Купить» открывает личные сообщения менеджеру с готовым текстом.
8. В профиле отображаются имя, username и аватар Telegram.
9. `/admin` доступна только ID из `ADMIN_IDS`.
10. Добавленный товар появляется после публикации GitHub Pages.
11. Редактирование не меняет ID.
12. Удаление скрывает товар, но не удаляет старые изображения.

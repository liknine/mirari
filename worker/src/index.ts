interface Env {
  BOT_TOKEN: string;
  WEBHOOK_SECRET: string;
  ADMIN_IDS: string;
  GITHUB_TOKEN: string;
  MINI_APP_URL: string;
  MANAGER_USERNAME: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH: string;
  GITHUB_OVERRIDES_PATH: string;
  GITHUB_PRODUCT_ASSETS_DIR: string;
  GITHUB_COMMITTER_NAME: string;
  GITHUB_COMMITTER_EMAIL: string;
  ADMIN_STATE: KVNamespace;
  CATALOG_DB: D1Database;
}

type Json = Record<string, any>;
type SearchIntent = 'view' | 'edit' | 'delete';
type AdminState = {
  mode: 'add' | 'search' | 'edit';
  step?: string;
  intent?: SearchIntent;
  targetId?: string;
  field?: string;
  photoMode?: 'add' | 'replace';
  draft?: Json;
};

type OverrideRow = {
  id: string;
  action: 'upsert' | 'delete';
  is_new: number;
  name: string | null;
  brand: string | null;
  gender: string | null;
  category: string | null;
  subcategory: string | null;
  product_json: string | null;
  created_at: string;
  updated_at: string;
  admin_id: string | null;
};

type StaticOverrides = {
  version: number;
  updatedAt: string;
  products: Record<string, Json>;
  deletedIds: string[];
};

const CATEGORY_LABELS: Record<string, string> = {
  clothes: 'Одежда',
  shoes: 'Обувь',
  bags: 'Сумки',
  accessories: 'Аксессуары',
  belts: 'Ремни',
  watches: 'Часы',
  perfume: 'Парфюмерия'
};

const SUBCATEGORY_LABELS: Record<string, string> = {
  'all-bags-sub': 'Все сумки', 'backpacks-sub': 'Рюкзаки', 'ballerinas-sub': 'Балетки',
  'beach-bags-sub': 'Пляжные сумки', 'beach-sub': 'Пляжная одежда', 'beach-suits-sub': 'Пляжные комплекты',
  'blazers-sub': 'Блейзеры', 'blouses-sub': 'Блузы', 'bodysuit-sub': 'Боди', 'bombers-sub': 'Бомберы',
  'boots-sub': 'Ботинки', 'bracelets-sub': 'Браслеты', 'briefcases-sub': 'Портфели',
  'canvas-shoes-sub': 'Кеды', 'caps-sub': 'Кепки', 'chains-sub': 'Цепи', 'clogs-sub': 'Сабо',
  'clutches-sub': 'Клатчи', coat: 'Пальто', 'coats-sub': 'Пальто', 'cosmetic-bags-sub': 'Косметички',
  'cowboy-boots-sub': 'Казаки', 'crossbody-sub': 'Кросс-боди', 'document-covers-sub': 'Обложки документов',
  'down-jackets-sub': 'Пуховики', 'dress-shoes-sub': 'Классическая обувь', 'dresses-sub': 'Платья',
  'earrings-sub': 'Серьги', 'flip-flops-sub': 'Шлёпанцы', 'glasses-sub': 'Очки', 'gloves-sub': 'Перчатки',
  'hair-acc-sub': 'Аксессуары для волос', 'hand-bags-sub': 'Сумки в руку', 'hats-sub': 'Шляпы',
  'heels-sub': 'Туфли на каблуке', 'high-boots-sub': 'Сапоги', 'home-clothes-sub': 'Домашняя одежда',
  'home-shoes-sub': 'Домашняя обувь', 'hoodies-sub': 'Худи', 'jackets-sub': 'Куртки',
  'jeans-jackets-sub': 'Джинсовые куртки', 'jeans-sub': 'Джинсы', 'jewelry-sub': 'Украшения',
  'jumpsuits-sub': 'Комбинезоны', 'kerchiefs-sub': 'Платки', 'keychains-sub': 'Брелоки',
  'leggings-sub': 'Легинсы', 'loafers-sub': 'Лоферы', maiki: 'Майки', 'mini-bags-sub': 'Мини-сумки',
  'mules-sub': 'Мюли', 'panamas-sub': 'Панамы', 'pants-sub': 'Брюки', 'phone-cases-sub': 'Чехлы',
  'polo-sub': 'Поло', 'rings-sub': 'Кольца', 'saddle-bags-sub': 'Сумки-седло',
  'sandals-open-sub': 'Открытые сандалии', 'sandals-sub': 'Сандалии', 'scarves-sub': 'Шарфы',
  'shirts-sub': 'Рубашки', 'shorts-sub': 'Шорты', 'ski-sub': 'Горнолыжная одежда',
  'skirts-shorts-sub': 'Юбки и шорты', 'skirts-sub': 'Юбки', 'slippers-sub': 'Тапочки',
  'sneakers-sub': 'Кроссовки', 'socks-sub': 'Носки', 'sportpants-sub': 'Спортивные брюки',
  'sportsuit-sub': 'Спортивные костюмы', 'sportsuits-sub': 'Спортивные костюмы',
  'suitcases-sub': 'Чемоданы', 'suits-sub': 'Костюмы', 'sweaters-sub': 'Трикотаж',
  'sweatshirts-sub': 'Свитшоты', 'swim-sub': 'Пляжная одежда', 'swimsuit-sub': 'Купальники',
  'tops-sub': 'Топы', 'travel-bags-sub': 'Дорожные сумки', 'tshirts-sub': 'Футболки',
  'uggs-sub': 'Угги', 'umbrellas-sub': 'Зонты', 'underwear-sub': 'Нижнее бельё',
  'vests-sub': 'Жилеты', 'waist-bags-sub': 'Поясные сумки', 'wallets-sub': 'Кошельки',
  'windbreakers-sub': 'Ветровки', 'winter-sneakers-sub': 'Зимние кроссовки'
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store'
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (url.pathname === '/health') {
      return Response.json({ ok: true, service: 'mirari-telegram-bot', database: Boolean(env.CATALOG_DB) });
    }

    if (url.pathname === '/api/catalog-overrides' && request.method === 'GET') {
      try {
        return Response.json(await publicOverrides(env), { headers: CORS_HEADERS });
      } catch (error) {
        console.error('catalog overrides api failed', error);
        return Response.json({ ok: false, error: 'catalog_overrides_unavailable' }, { status: 500, headers: CORS_HEADERS });
      }
    }

    if (url.pathname === '/telegram/webhook' && request.method === 'POST') {
      const secret = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
      if (!env.WEBHOOK_SECRET || secret !== env.WEBHOOK_SECRET) return new Response('Forbidden', { status: 403 });
      const update = await request.json() as Json;
      ctx.waitUntil(handleUpdate(update, env));
      return Response.json({ ok: true });
    }

    return new Response('Mirari Telegram bot worker', { status: 200 });
  }
} satisfies ExportedHandler<Env>;

async function handleUpdate(update: Json, env: Env): Promise<void> {
  try {
    if (update.callback_query) await handleCallback(update.callback_query, env);
    else if (update.message) await handleMessage(update.message, env);
  } catch (error) {
    console.error('update failed', error);
    const chatId = update.callback_query?.message?.chat?.id ?? update.message?.chat?.id;
    if (chatId) await sendMessage(env, chatId, 'Произошла ошибка. Нажмите /admin и попробуйте ещё раз.');
  }
}

function adminIds(env: Env): Set<string> {
  return new Set(String(env.ADMIN_IDS || '').split(/[;,\s]+/).map((value) => value.trim()).filter(Boolean));
}

function isAdmin(env: Env, userId: string | number | undefined): boolean {
  return userId != null && adminIds(env).has(String(userId));
}

async function handleMessage(message: Json, env: Env): Promise<void> {
  const chatId = message.chat?.id;
  const userId = message.from?.id;
  if (!chatId || !userId) return;
  const text = String(message.text || '').trim();
  const admin = isAdmin(env, userId);

  if (text === '/start' || text.startsWith('/start ')) {
    await clearState(env, userId);
    await sendWelcome(env, chatId, admin);
    return;
  }

  if (text === '/admin' || text === '⚙️ Админка') {
    if (!admin) {
      await sendMessage(env, chatId, 'У вас нет доступа к админке.');
      return;
    }
    await clearState(env, userId);
    await sendAdminPanel(env, chatId);
    return;
  }

  if (!admin) return;

  const state = await getState(env, userId);
  if (!state) {
    if (text) await sendMessage(env, chatId, 'Откройте /admin и выберите действие.', productsPanelKeyboard());
    return;
  }

  if (state.mode === 'search') {
    await handleSearchInput(message, state, env);
    return;
  }

  if (state.mode === 'edit') {
    await handleEditInput(message, state, env);
    return;
  }

  if (state.mode === 'add') {
    await handleAddInput(message, state, env);
  }
}

async function handleCallback(query: Json, env: Env): Promise<void> {
  const data = String(query.data || '');
  const userId = query.from?.id;
  const chatId = query.message?.chat?.id;
  if (!userId || !chatId) return;
  await answerCallback(env, query.id);

  if (!isAdmin(env, userId)) {
    await sendMessage(env, chatId, 'У вас нет доступа к админке.');
    return;
  }

  if (data === 'admin:panel') {
    await clearState(env, userId);
    await sendAdminPanel(env, chatId);
    return;
  }
  if (data === 'admin:products') {
    await clearState(env, userId);
    await sendProductsPanel(env, chatId);
    return;
  }
  if (data === 'admin:home') {
    await clearState(env, userId);
    await sendWelcome(env, chatId, true);
    return;
  }
  if (data === 'admin:cancel') {
    await clearState(env, userId);
    await sendProductsPanel(env, chatId);
    return;
  }
  if (data === 'admin:add') {
    await startAdd(env, chatId, userId);
    return;
  }
  if (data === 'admin:list') {
    await showRecent(env, chatId);
    return;
  }
  if (data === 'admin:find') {
    await startSearch(env, chatId, userId, 'view');
    return;
  }
  if (data === 'admin:edit') {
    await startSearch(env, chatId, userId, 'edit');
    return;
  }
  if (data === 'admin:delete') {
    await startSearch(env, chatId, userId, 'delete');
    return;
  }

  if (data.startsWith('a:g:')) {
    const state = await getState(env, userId);
    if (!state || state.mode !== 'add' || !state.draft) return;
    state.draft.gender = data.slice('a:g:'.length) === 'female' ? 'female' : 'male';
    state.step = 'category';
    await setState(env, userId, state);
    await sendMessage(env, chatId, 'Выберите категорию:', categoryKeyboard('a:c'));
    return;
  }

  if (data.startsWith('a:c:')) {
    const state = await getState(env, userId);
    if (!state || state.mode !== 'add' || !state.draft) return;
    state.draft.category = data.slice('a:c:'.length);
    const subcategories = await categorySubcategories(env, state.draft.gender, state.draft.category);
    if (!subcategories.length) {
      state.draft.subcategory = 'none';
      state.step = 'name';
      await setState(env, userId, state);
      await sendMessage(env, chatId, 'Отправьте название товара.', cancelKeyboard());
      return;
    }
    state.step = 'subcategory';
    await setState(env, userId, state);
    await sendMessage(env, chatId, 'Выберите подкатегорию:', await subcategoryKeyboard(env, state.draft.gender, state.draft.category, 0, 'a'));
    return;
  }

  if (data.startsWith('a:sp:')) {
    const state = await getState(env, userId);
    if (!state || state.mode !== 'add' || !state.draft) return;
    const page = Math.max(0, Number(data.slice('a:sp:'.length)) || 0);
    await sendMessage(env, chatId, 'Выберите подкатегорию:', await subcategoryKeyboard(env, state.draft.gender, state.draft.category, page, 'a'));
    return;
  }

  if (data.startsWith('a:s:')) {
    const state = await getState(env, userId);
    if (!state || state.mode !== 'add' || !state.draft) return;
    state.draft.subcategory = data.slice('a:s:'.length) || 'none';
    state.step = 'name';
    await setState(env, userId, state);
    await sendMessage(env, chatId, 'Отправьте название товара.', cancelKeyboard());
    return;
  }

  if (data === 'a:photos:done') {
    const state = await getState(env, userId);
    if (!state || state.mode !== 'add' || !state.draft) return;
    if (!Array.isArray(state.draft.images) || state.draft.images.length === 0) {
      await sendMessage(env, chatId, 'Добавьте хотя бы одно фото товара.');
      return;
    }
    state.step = 'confirm';
    await setState(env, userId, state);
    await sendMessage(env, chatId, productSummary(finalizeProduct(state.draft), 'Проверьте новый товар'), {
      inline_keyboard: [
        [{ text: '✅ Сохранить товар', callback_data: 'a:save' }],
        [{ text: '❌ Отмена', callback_data: 'admin:cancel' }]
      ]
    });
    return;
  }

  if (data === 'a:save') {
    const state = await getState(env, userId);
    if (!state || state.mode !== 'add' || !state.draft) return;
    const product = finalizeProduct(state.draft);
    await saveProductOverride(env, product, true, userId);
    await clearState(env, userId);
    await sendMessage(env, chatId, `✅ Товар добавлен.\nID: ${product.id}\n\nОн появится в Mini App сразу после повторного открытия каталога.`, productKeyboard(product.id));
    return;
  }

  if (data.startsWith('s:')) {
    const [, intentCode, ...idParts] = data.split(':');
    const id = idParts.join(':');
    const intent: SearchIntent = intentCode === 'e' ? 'edit' : intentCode === 'd' ? 'delete' : 'view';
    await clearState(env, userId);
    if (intent === 'delete') await confirmDelete(env, chatId, id);
    else await showProduct(env, chatId, id);
    return;
  }

  if (data.startsWith('p:view:')) {
    await showProduct(env, chatId, data.slice('p:view:'.length));
    return;
  }

  if (data.startsWith('p:edit:')) {
    const [, , field, ...idParts] = data.split(':');
    const id = idParts.join(':');
    if (!id) return;

    if (field === 'gender') {
      await sendMessage(env, chatId, 'Выберите раздел:', {
        inline_keyboard: [
          [{ text: 'Мужское', callback_data: `e:g:${id}:male` }, { text: 'Женское', callback_data: `e:g:${id}:female` }],
          [{ text: 'Отмена', callback_data: `p:view:${id}` }]
        ]
      });
      return;
    }

    if (field === 'category') {
      await sendMessage(env, chatId, 'Выберите категорию:', categoryKeyboard(`e:c:${id}`));
      return;
    }

    if (field === 'subcategory') {
      const product = await loadProduct(env, id);
      if (!product) return void await sendMessage(env, chatId, 'Товар не найден.');
      await sendMessage(env, chatId, 'Выберите подкатегорию:', await subcategoryKeyboard(env, product.gender, product.category, 0, `e:${id}`));
      return;
    }

    await setState(env, userId, { mode: 'edit', targetId: id, field });
    const prompts: Record<string, string> = {
      name: 'Отправьте новое название.',
      brand: 'Отправьте новый бренд.',
      rub: 'Отправьте новую цену в RUB числом.',
      byn: 'Отправьте новую цену в BYN числом.',
      description: 'Отправьте новое описание или «нет».'
    };
    await sendMessage(env, chatId, prompts[field] || 'Отправьте новое значение.', cancelKeyboard());
    return;
  }

  if (data.startsWith('e:g:')) {
    const parts = data.split(':');
    const gender = parts.pop() === 'female' ? 'female' : 'male';
    const id = parts.slice(2).join(':');
    const product = await loadProduct(env, id);
    if (!product) return void await sendMessage(env, chatId, 'Товар не найден.');
    product.gender = gender;
    product.subcategory = 'none';
    await saveProductOverride(env, finalizeProduct(product), await isNewOverride(env, id), userId);
    await showProduct(env, chatId, id, '✅ Раздел изменён.');
    return;
  }

  if (data.startsWith('e:c:')) {
    const parts = data.split(':');
    const category = String(parts.pop() || 'clothes');
    const id = parts.slice(2).join(':');
    const product = await loadProduct(env, id);
    if (!product) return void await sendMessage(env, chatId, 'Товар не найден.');
    product.category = category;
    const subcategories = await categorySubcategories(env, product.gender, category);
    product.subcategory = subcategories.length ? subcategories[0].slug : 'none';
    await saveProductOverride(env, finalizeProduct(product), await isNewOverride(env, id), userId);
    if (subcategories.length) {
      await sendMessage(env, chatId, 'Категория изменена. Теперь выберите подкатегорию:', await subcategoryKeyboard(env, product.gender, category, 0, `e:${id}`));
    } else {
      await showProduct(env, chatId, id, '✅ Категория изменена.');
    }
    return;
  }

  if (data.startsWith('e:sp:')) {
    const parts = data.split(':');
    const page = Math.max(0, Number(parts.pop()) || 0);
    const id = parts.slice(2).join(':');
    const product = await loadProduct(env, id);
    if (!product) return void await sendMessage(env, chatId, 'Товар не найден.');
    await sendMessage(env, chatId, 'Выберите подкатегорию:', await subcategoryKeyboard(env, product.gender, product.category, page, `e:${id}`));
    return;
  }

  if (data.startsWith('e:s:')) {
    const parts = data.split(':');
    const subcategory = String(parts.pop() || 'none');
    const id = parts.slice(2).join(':');
    const product = await loadProduct(env, id);
    if (!product) return void await sendMessage(env, chatId, 'Товар не найден.');
    product.subcategory = subcategory;
    await saveProductOverride(env, finalizeProduct(product), await isNewOverride(env, id), userId);
    await showProduct(env, chatId, id, '✅ Подкатегория изменена.');
    return;
  }

  if (data.startsWith('p:photo:')) {
    const [, , mode, ...idParts] = data.split(':');
    const id = idParts.join(':');
    await setState(env, userId, { mode: 'edit', targetId: id, field: 'photo', photoMode: mode === 'replace' ? 'replace' : 'add' });
    await sendMessage(env, chatId, mode === 'replace'
      ? 'Пришлите новое главное фото. Старые файлы останутся в GitHub, но в карточке будут заменены.'
      : 'Пришлите дополнительное фото товара.', cancelKeyboard());
    return;
  }

  if (data.startsWith('p:delete:')) {
    await confirmDelete(env, chatId, data.slice('p:delete:'.length));
    return;
  }

  if (data.startsWith('p:delete_yes:')) {
    const id = data.slice('p:delete_yes:'.length);
    const product = await loadProduct(env, id);
    if (!product) return void await sendMessage(env, chatId, 'Товар уже скрыт или не найден.', productsPanelKeyboard());
    await hideProduct(env, product, userId);
    await sendMessage(env, chatId, `🗑 Товар ${id} скрыт из каталога. Файлы изображений не удалены.`, productsPanelKeyboard());
    return;
  }
}

async function startAdd(env: Env, chatId: number | string, userId: number | string): Promise<void> {
  const now = new Date().toISOString();
  const draft = {
    id: `custom-${Date.now()}`,
    sourceId: '',
    name: '', brand: '', gender: '', category: '', subcategory: 'none',
    price: 0, priceRub: 0, priceByn: 0, originalPrice: 0,
    color: 'Уточнить', sizes: [], images: [], imageAlt: '',
    description: '', details: '', featured: false, pricingStatus: 'manual',
    createdAt: now, updatedAt: now
  };
  await setState(env, userId, { mode: 'add', step: 'gender', draft });
  await sendMessage(env, chatId, '➕ Добавление товара\n\nВыберите раздел:', {
    inline_keyboard: [
      [{ text: 'Мужское', callback_data: 'a:g:male' }, { text: 'Женское', callback_data: 'a:g:female' }],
      [{ text: '❌ Отмена', callback_data: 'admin:cancel' }]
    ]
  });
}

async function startSearch(env: Env, chatId: number | string, userId: number | string, intent: SearchIntent): Promise<void> {
  await setState(env, userId, { mode: 'search', step: 'query', intent });
  const labels: Record<SearchIntent, string> = {
    view: 'найти товар',
    edit: 'найти товар для редактирования',
    delete: 'найти товар для удаления'
  };
  await sendMessage(env, chatId, `🔎 Отправьте ID, название или бренд, чтобы ${labels[intent]}.`, cancelKeyboard());
}

async function handleSearchInput(message: Json, state: AdminState, env: Env): Promise<void> {
  const chatId = message.chat.id;
  const userId = message.from.id;
  const query = String(message.text || '').trim();
  if (!query) return;

  const results = await findProducts(env, query, 10);
  if (!results.length) {
    await sendMessage(env, chatId, 'Ничего не найдено. Попробуйте другой ID, название или бренд.', cancelKeyboard());
    return;
  }

  await clearState(env, userId);
  const intent = state.intent || 'view';
  const code = intent === 'edit' ? 'e' : intent === 'delete' ? 'd' : 'v';
  const rows = results.map((product) => [{
    text: `${String(product.id)} · ${String(product.brand || '')} ${String(product.name || '')}`.slice(0, 60),
    callback_data: `s:${code}:${product.id}`
  }]);
  rows.push([{ text: '⬅️ Товары', callback_data: 'admin:products' }]);
  await sendMessage(env, chatId, results.length === 1 ? 'Найден товар:' : `Найдено вариантов: ${results.length}`, { inline_keyboard: rows });
}

async function handleAddInput(message: Json, state: AdminState, env: Env): Promise<void> {
  const chatId = message.chat.id;
  const userId = message.from.id;
  const draft = state.draft || {};
  const text = String(message.text || '').trim();

  if (state.step === 'name') {
    if (!text) return;
    draft.name = text;
    state.step = 'brand';
    await setState(env, userId, state);
    await sendMessage(env, chatId, 'Отправьте бренд.', cancelKeyboard());
    return;
  }

  if (state.step === 'brand') {
    if (!text) return;
    draft.brand = text;
    state.step = 'rub';
    await setState(env, userId, state);
    await sendMessage(env, chatId, 'Отправьте цену в российских рублях числом.', cancelKeyboard());
    return;
  }

  if (state.step === 'rub') {
    const value = parsePrice(text);
    if (value == null) return void await sendMessage(env, chatId, 'Цена должна быть числом. Например: 12990');
    draft.priceRub = value;
    draft.price = value;
    draft.originalPrice = value;
    state.step = 'byn';
    await setState(env, userId, state);
    await sendMessage(env, chatId, 'Отправьте цену в BYN числом.', cancelKeyboard());
    return;
  }

  if (state.step === 'byn') {
    const value = parsePrice(text);
    if (value == null) return void await sendMessage(env, chatId, 'Цена должна быть числом. Например: 450');
    draft.priceByn = value;
    state.step = 'description';
    await setState(env, userId, state);
    await sendMessage(env, chatId, 'Отправьте описание товара или «нет».', cancelKeyboard());
    return;
  }

  if (state.step === 'description') {
    draft.description = /^нет$/i.test(text) ? '' : text;
    draft.details = draft.description;
    draft.imageAlt = `${draft.brand || ''} ${draft.name || ''}`.trim();
    state.step = 'photo';
    await setState(env, userId, state);
    await sendMessage(env, chatId, 'Пришлите главное фото товара.', cancelKeyboard());
    return;
  }

  if (state.step === 'photo' || state.step === 'photos') {
    const photo = Array.isArray(message.photo) ? message.photo.at(-1) : null;
    if (!photo?.file_id) {
      await sendMessage(env, chatId, 'Нужно прислать изображение именно как фото.');
      return;
    }
    const imageUrl = await uploadTelegramPhoto(env, photo.file_id, draft.id);
    draft.images = [...(Array.isArray(draft.images) ? draft.images : []), imageUrl];
    state.step = 'photos';
    state.draft = draft;
    await setState(env, userId, state);
    await sendMessage(env, chatId, `Фото добавлено: ${draft.images.length}. Можно прислать ещё одно или завершить.`, {
      inline_keyboard: [
        [{ text: '✅ Фото готовы', callback_data: 'a:photos:done' }],
        [{ text: '❌ Отмена', callback_data: 'admin:cancel' }]
      ]
    });
  }
}

async function handleEditInput(message: Json, state: AdminState, env: Env): Promise<void> {
  const chatId = message.chat.id;
  const userId = message.from.id;
  const id = String(state.targetId || '');
  const field = String(state.field || '');
  if (!id || !field) return;

  const product = await loadProduct(env, id);
  if (!product) {
    await clearState(env, userId);
    await sendMessage(env, chatId, 'Товар не найден.');
    return;
  }

  const text = String(message.text || '').trim();

  if (field === 'photo') {
    const photo = Array.isArray(message.photo) ? message.photo.at(-1) : null;
    if (!photo?.file_id) return void await sendMessage(env, chatId, 'Пришлите изображение как фото.');
    const imageUrl = await uploadTelegramPhoto(env, photo.file_id, id);
    product.images = state.photoMode === 'replace'
      ? [imageUrl]
      : [...(Array.isArray(product.images) ? product.images : []), imageUrl];
  } else if (field === 'rub' || field === 'byn') {
    const value = parsePrice(text);
    if (value == null) return void await sendMessage(env, chatId, 'Отправьте цену числом.');
    if (field === 'rub') {
      product.priceRub = value;
      product.price = value;
    } else {
      product.priceByn = value;
    }
  } else if (field === 'description') {
    product.description = /^нет$/i.test(text) ? '' : text;
    product.details = product.description;
  } else if (field === 'name' || field === 'brand') {
    if (!text) return;
    product[field] = text;
  } else {
    return;
  }

  product.imageAlt = `${product.brand || ''} ${product.name || ''}`.trim();
  await saveProductOverride(env, finalizeProduct(product), await isNewOverride(env, id), userId);
  await clearState(env, userId);
  await showProduct(env, chatId, id, '✅ Изменения сохранены.');
}

async function sendWelcome(env: Env, chatId: number | string, admin: boolean): Promise<void> {
  const keyboard: Json = {
    keyboard: [
      [{ text: '🛍 Открыть каталог', web_app: { url: env.MINI_APP_URL } }],
      ...(admin ? [[{ text: '⚙️ Админка' }]] : [])
    ],
    resize_keyboard: true,
    is_persistent: true,
    input_field_placeholder: 'Откройте каталог Mirari'
  };
  await sendMessage(
    env,
    chatId,
    'Добро пожаловать в Mirari. Кнопка каталога теперь всегда находится снизу возле поля ввода.',
    keyboard
  );
}

async function sendAdminPanel(env: Env, chatId: number | string): Promise<void> {
  const stats = await adminStats(env);
  const text = [
    '🛠 Админ-панель Mirari',
    '',
    `📦 Товаров в каталоге: ${numberText(stats.totalActive)}`,
    `🆕 Добавлено через админку: ${numberText(stats.newActive)}`,
    `✏️ Изменено через админку: ${numberText(stats.editedActive)}`,
    `🗑 Скрыто: ${numberText(stats.hidden)}`,
    '',
    'Выберите раздел:'
  ].join('\n');
  await sendMessage(env, chatId, text, adminMainKeyboard(env));
}

async function sendProductsPanel(env: Env, chatId: number | string): Promise<void> {
  await sendMessage(env, chatId, '📦 Товары\n\nВыберите действие:', productsPanelKeyboard());
}

function adminMainKeyboard(env: Env): Json {
  return {
    inline_keyboard: [
      [{ text: '📦 Товары', callback_data: 'admin:products' }],
      [{ text: '🛍 Открыть магазин', web_app: { url: env.MINI_APP_URL } }],
      [{ text: '⬅️ Вернуться в главное меню', callback_data: 'admin:home' }]
    ]
  };
}

function productsPanelKeyboard(): Json {
  return {
    inline_keyboard: [
      [{ text: '➕ Добавить товар', callback_data: 'admin:add' }],
      [{ text: '📋 Список товаров', callback_data: 'admin:list' }],
      [{ text: '🔎 Найти товар', callback_data: 'admin:find' }],
      [{ text: '✏️ Редактировать товар', callback_data: 'admin:edit' }],
      [{ text: '🗑 Удалить товар', callback_data: 'admin:delete' }],
      [{ text: '⬅️ Назад', callback_data: 'admin:panel' }]
    ]
  };
}

function cancelKeyboard(): Json {
  return { inline_keyboard: [[{ text: '❌ Отмена', callback_data: 'admin:cancel' }]] };
}

function categoryKeyboard(prefix: string): Json {
  return {
    inline_keyboard: [
      [{ text: 'Одежда', callback_data: `${prefix}:clothes` }, { text: 'Обувь', callback_data: `${prefix}:shoes` }],
      [{ text: 'Сумки', callback_data: `${prefix}:bags` }, { text: 'Аксессуары', callback_data: `${prefix}:accessories` }],
      [{ text: 'Ремни', callback_data: `${prefix}:belts` }, { text: 'Часы', callback_data: `${prefix}:watches` }],
      [{ text: 'Парфюмерия', callback_data: `${prefix}:perfume` }],
      [{ text: '❌ Отмена', callback_data: 'admin:cancel' }]
    ]
  };
}

async function subcategoryKeyboard(
  env: Env,
  gender: string,
  category: string,
  page: number,
  prefix: string
): Promise<Json> {
  const all = await categorySubcategories(env, gender, category);
  const perPage = 8;
  const totalPages = Math.max(1, Math.ceil(all.length / perPage));
  const current = Math.min(Math.max(page, 0), totalPages - 1);
  const pageItems = all.slice(current * perPage, current * perPage + perPage);
  const rows: Json[][] = [];

  for (let index = 0; index < pageItems.length; index += 2) {
    rows.push(pageItems.slice(index, index + 2).map((item) => ({
      text: subcategoryLabel(item.slug).slice(0, 28),
      callback_data: prefix === 'a' ? `a:s:${item.slug}` : `e:s:${prefix.slice(2)}:${item.slug}`
    })));
  }

  if (totalPages > 1) {
    const id = prefix === 'a' ? '' : prefix.slice(2);
    const pagination: Json[] = [];
    if (current > 0) pagination.push({ text: '←', callback_data: prefix === 'a' ? `a:sp:${current - 1}` : `e:sp:${id}:${current - 1}` });
    pagination.push({ text: `${current + 1}/${totalPages}`, callback_data: 'noop' });
    if (current + 1 < totalPages) pagination.push({ text: '→', callback_data: prefix === 'a' ? `a:sp:${current + 1}` : `e:sp:${id}:${current + 1}` });
    rows.push(pagination);
  }

  rows.push([{ text: 'Без подкатегории', callback_data: prefix === 'a' ? 'a:s:none' : `e:s:${prefix.slice(2)}:none` }]);
  rows.push([{ text: '❌ Отмена', callback_data: 'admin:cancel' }]);
  return { inline_keyboard: rows };
}

function productKeyboard(id: string): Json {
  return {
    inline_keyboard: [
      [{ text: '✏️ Название', callback_data: `p:edit:name:${id}` }, { text: '✏️ Бренд', callback_data: `p:edit:brand:${id}` }],
      [{ text: '💵 RUB', callback_data: `p:edit:rub:${id}` }, { text: '💵 BYN', callback_data: `p:edit:byn:${id}` }],
      [{ text: '📝 Описание', callback_data: `p:edit:description:${id}` }],
      [{ text: '👤 Раздел', callback_data: `p:edit:gender:${id}` }, { text: '🗂 Категория', callback_data: `p:edit:category:${id}` }],
      [{ text: '📂 Подкатегория', callback_data: `p:edit:subcategory:${id}` }],
      [{ text: '➕ Добавить фото', callback_data: `p:photo:add:${id}` }, { text: '♻️ Заменить фото', callback_data: `p:photo:replace:${id}` }],
      [{ text: '🗑 Удалить товар', callback_data: `p:delete:${id}` }],
      [{ text: '⬅️ Товары', callback_data: 'admin:products' }]
    ]
  };
}

async function showProduct(env: Env, chatId: number | string, id: string, notice = ''): Promise<void> {
  const product = await loadProduct(env, id);
  if (!product) {
    await sendMessage(env, chatId, `Товар с ID ${id} не найден или скрыт.`, productsPanelKeyboard());
    return;
  }
  const text = [notice, productSummary(product, '📦 Товар')].filter(Boolean).join('\n\n');
  const photo = Array.isArray(product.images) ? product.images[0] : null;
  if (photo) {
    try {
      await telegram(env, 'sendPhoto', {
        chat_id: chatId,
        photo,
        caption: text.slice(0, 1024),
        reply_markup: productKeyboard(String(product.id))
      });
      return;
    } catch (error) {
      console.warn('sendPhoto fallback', error);
    }
  }
  await sendMessage(env, chatId, text, productKeyboard(String(product.id)));
}

async function confirmDelete(env: Env, chatId: number | string, id: string): Promise<void> {
  const product = await loadProduct(env, id);
  if (!product) {
    await sendMessage(env, chatId, 'Товар уже скрыт или не найден.', productsPanelKeyboard());
    return;
  }
  await sendMessage(env, chatId, `${productSummary(product, 'Удаление товара')}\n\nСкрыть этот товар из каталога?`, {
    inline_keyboard: [
      [{ text: '✅ Да, удалить', callback_data: `p:delete_yes:${id}` }],
      [{ text: '❌ Отмена', callback_data: `p:view:${id}` }]
    ]
  });
}

async function showRecent(env: Env, chatId: number | string): Promise<void> {
  const result = await env.CATALOG_DB.prepare(
    `SELECT id, action, is_new, name, brand, updated_at
     FROM product_overrides
     ORDER BY updated_at DESC
     LIMIT 20`
  ).all<OverrideRow>();
  const rows = result.results || [];
  if (!rows.length) {
    await sendMessage(env, chatId, 'Добавленных или изменённых товаров пока нет.', productsPanelKeyboard());
    return;
  }
  const keyboard = rows.map((row) => [{
    text: `${row.action === 'delete' ? '🗑' : row.is_new ? '🆕' : '✏️'} ${row.id} · ${row.brand || ''} ${row.name || ''}`.slice(0, 60),
    callback_data: row.action === 'delete' ? 'admin:products' : `p:view:${row.id}`
  }]);
  keyboard.push([{ text: '⬅️ Товары', callback_data: 'admin:products' }]);
  await sendMessage(env, chatId, '📋 Последние товары и изменения:', { inline_keyboard: keyboard });
}

function productSummary(product: Json, title: string): string {
  return [
    title,
    '',
    `${product.brand || 'Mirari'} — ${product.name || 'Товар'}`,
    `ID: ${product.id}`,
    `Раздел: ${product.gender === 'female' ? 'Женское' : 'Мужское'}`,
    `Категория: ${CATEGORY_LABELS[product.category] || product.category || '—'}`,
    `Подкатегория: ${subcategoryLabel(product.subcategory)}`,
    `Цена: ${numberText(product.priceByn)} BYN / ${numberText(product.priceRub ?? product.price)} ₽`,
    `Фото: ${Array.isArray(product.images) ? product.images.length : 0}`,
    product.description ? `Описание: ${String(product.description).slice(0, 420)}` : ''
  ].filter(Boolean).join('\n');
}

function finalizeProduct(input: Json): Json {
  const id = String(input.id || `custom-${Date.now()}`);
  const priceRub = Number(input.priceRub ?? input.price) || 0;
  return {
    ...input,
    id,
    sourceId: String(input.sourceId || id),
    name: String(input.name || 'Товар'),
    brand: String(input.brand || 'Mirari'),
    gender: input.gender === 'female' ? 'female' : 'male',
    category: String(input.category || 'clothes'),
    subcategory: String(input.subcategory || 'none'),
    price: priceRub,
    priceRub,
    priceByn: Number(input.priceByn) || 0,
    originalPrice: Number(input.originalPrice ?? priceRub) || priceRub,
    color: String(input.color || 'Уточнить'),
    sizes: Array.isArray(input.sizes) ? input.sizes : [],
    images: Array.isArray(input.images) ? input.images.filter(Boolean) : [],
    imageAlt: String(input.imageAlt || `${input.brand || ''} ${input.name || ''}`.trim()),
    description: String(input.description || ''),
    details: String(input.details ?? input.description ?? ''),
    featured: Boolean(input.featured),
    pricingStatus: String(input.pricingStatus || 'manual'),
    createdAt: String(input.createdAt || new Date().toISOString()),
    updatedAt: new Date().toISOString()
  };
}

function parsePrice(value: string): number | null {
  const parsed = Number(String(value).replace(/[^0-9.,-]/g, '').replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : null;
}

function numberText(value: unknown): string {
  return Math.round(Number(value) || 0).toLocaleString('ru-RU');
}

function subcategoryLabel(slug: unknown): string {
  const value = String(slug || 'none');
  if (value === 'none') return 'Без подкатегории';
  if (SUBCATEGORY_LABELS[value]) return SUBCATEGORY_LABELS[value];
  const clean = value.replace(/-sub$/i, '').replace(/[_-]+/g, ' ').trim();
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : 'Без подкатегории';
}

async function adminStats(env: Env): Promise<{ totalActive: number; newActive: number; editedActive: number; hidden: number }> {
  const [manifest, counts] = await Promise.all([
    loadManifest(env).catch(() => ({ total: 0 })),
    env.CATALOG_DB.prepare(
      `SELECT
        SUM(CASE WHEN action = 'upsert' AND is_new = 1 THEN 1 ELSE 0 END) AS new_active,
        SUM(CASE WHEN action = 'upsert' AND is_new = 0 THEN 1 ELSE 0 END) AS edited_active,
        SUM(CASE WHEN action = 'delete' THEN 1 ELSE 0 END) AS hidden,
        SUM(CASE WHEN action = 'delete' AND is_new = 0 THEN 1 ELSE 0 END) AS hidden_base
       FROM product_overrides`
    ).first<Json>()
  ]);
  const base = Number(manifest.total) || 0;
  const newActive = Number(counts?.new_active) || 0;
  const editedActive = Number(counts?.edited_active) || 0;
  const hidden = Number(counts?.hidden) || 0;
  const hiddenBase = Number(counts?.hidden_base) || 0;
  return { totalActive: Math.max(0, base + newActive - hiddenBase), newActive, editedActive, hidden };
}

async function publicOverrides(env: Env): Promise<Json> {
  const result = await env.CATALOG_DB.prepare(
    `SELECT id, action, product_json, updated_at
     FROM product_overrides
     ORDER BY updated_at ASC`
  ).all<OverrideRow>();
  const products: Record<string, Json> = {};
  const deletedIds: string[] = [];
  let updatedAt = '';
  for (const row of result.results || []) {
    updatedAt = row.updated_at || updatedAt;
    if (row.action === 'delete') deletedIds.push(String(row.id));
    else {
      const product = parseJson(row.product_json);
      if (product) products[String(row.id)] = product;
    }
  }
  return { version: 2, updatedAt, products, deletedIds };
}

async function saveProductOverride(env: Env, product: Json, isNew: boolean, adminId: string | number): Promise<void> {
  const normalized = finalizeProduct(product);
  const now = new Date().toISOString();
  await env.CATALOG_DB.prepare(
    `INSERT INTO product_overrides (
       id, action, is_new, name, brand, gender, category, subcategory,
       product_json, created_at, updated_at, admin_id
     ) VALUES (?, 'upsert', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       action = 'upsert',
       is_new = MAX(product_overrides.is_new, excluded.is_new),
       name = excluded.name,
       brand = excluded.brand,
       gender = excluded.gender,
       category = excluded.category,
       subcategory = excluded.subcategory,
       product_json = excluded.product_json,
       updated_at = excluded.updated_at,
       admin_id = excluded.admin_id`
  ).bind(
    normalized.id,
    isNew ? 1 : 0,
    normalized.name,
    normalized.brand,
    normalized.gender,
    normalized.category,
    normalized.subcategory,
    JSON.stringify(normalized),
    normalized.createdAt || now,
    now,
    String(adminId)
  ).run();
}

async function hideProduct(env: Env, product: Json, adminId: string | number): Promise<void> {
  const id = String(product.id);
  const existing = await getOverrideRow(env, id);
  const isNew = existing ? Number(existing.is_new) === 1 : id.startsWith('custom-');
  const now = new Date().toISOString();
  const normalized = finalizeProduct(product);
  await env.CATALOG_DB.prepare(
    `INSERT INTO product_overrides (
       id, action, is_new, name, brand, gender, category, subcategory,
       product_json, created_at, updated_at, admin_id
     ) VALUES (?, 'delete', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       action = 'delete',
       is_new = MAX(product_overrides.is_new, excluded.is_new),
       name = excluded.name,
       brand = excluded.brand,
       gender = excluded.gender,
       category = excluded.category,
       subcategory = excluded.subcategory,
       product_json = excluded.product_json,
       updated_at = excluded.updated_at,
       admin_id = excluded.admin_id`
  ).bind(
    id,
    isNew ? 1 : 0,
    normalized.name,
    normalized.brand,
    normalized.gender,
    normalized.category,
    normalized.subcategory,
    JSON.stringify(normalized),
    existing?.created_at || normalized.createdAt || now,
    now,
    String(adminId)
  ).run();
}

async function getOverrideRow(env: Env, id: string): Promise<OverrideRow | null> {
  return env.CATALOG_DB.prepare(
    `SELECT id, action, is_new, name, brand, gender, category, subcategory,
            product_json, created_at, updated_at, admin_id
     FROM product_overrides WHERE id = ? LIMIT 1`
  ).bind(id).first<OverrideRow>();
}

async function isNewOverride(env: Env, id: string): Promise<boolean> {
  const row = await getOverrideRow(env, id);
  return row ? Number(row.is_new) === 1 : id.startsWith('custom-');
}

async function loadProduct(env: Env, id: string): Promise<Json | null> {
  const key = String(id).replace(/^#/, '').trim();
  if (!key) return null;

  const dbRow = await getOverrideRow(env, key);
  if (dbRow?.action === 'delete') return null;
  if (dbRow?.action === 'upsert') {
    const product = parseJson(dbRow.product_json);
    if (product) return finalizeProduct(product);
  }

  const staticOverrides = await readStaticOverrides(env);
  if (staticOverrides.deletedIds.includes(key)) return null;
  if (staticOverrides.products[key]) return finalizeProduct(staticOverrides.products[key]);

  const bucket = getProductBucket(key);
  const url = new URL(`catalog-data/details/bucket-${String(bucket).padStart(3, '0')}.json`, ensureSlash(env.MINI_APP_URL));
  const response = await fetch(url.toString(), { cf: { cacheTtl: 120 } });
  if (!response.ok) return null;
  const data = await response.json() as Json;
  const product = (data.items || []).find((item: Json) => String(item.id) === key);
  return product ? finalizeProduct(product) : null;
}

async function findProducts(env: Env, query: string, limit: number): Promise<Json[]> {
  const clean = query.replace(/^#/, '').trim();
  if (!clean) return [];

  const exact = await loadProduct(env, clean);
  if (exact) return [exact];

  const needle = `%${clean.toLocaleLowerCase('ru')}%`;
  const db = await env.CATALOG_DB.prepare(
    `SELECT id, action, product_json
     FROM product_overrides
     WHERE action = 'upsert'
       AND (LOWER(id) LIKE ? OR LOWER(name) LIKE ? OR LOWER(brand) LIKE ?)
     ORDER BY updated_at DESC
     LIMIT ?`
  ).bind(needle, needle, needle, limit).all<OverrideRow>();

  const map = new Map<string, Json>();
  for (const row of db.results || []) {
    const product = parseJson(row.product_json);
    if (product) map.set(String(row.id), finalizeProduct(product));
  }

  const staticOverrides = await readStaticOverrides(env);
  const deleted = new Set(staticOverrides.deletedIds.map(String));
  for (const item of Object.values(staticOverrides.products)) {
    if (map.size >= limit) break;
    if (deleted.has(String(item.id))) continue;
    if (matchesSearch(item, clean)) map.set(String(item.id), finalizeProduct(item));
  }

  if (map.size < limit) {
    const searchUrl = new URL('catalog-data/search.json', ensureSlash(env.MINI_APP_URL));
    const response = await fetch(searchUrl.toString(), { cf: { cacheTtl: 300 } });
    if (response.ok) {
      const data = await response.json() as Json;
      for (const item of data.items || []) {
        if (map.size >= limit) break;
        if (!matchesSearch(item, clean)) continue;
        const id = String(item.id || '');
        const row = await getOverrideRow(env, id);
        if (row?.action === 'delete' || deleted.has(id)) continue;
        const product = row?.action === 'upsert' ? parseJson(row.product_json) : staticOverrides.products[id] || item;
        if (product) map.set(id, finalizeProduct(product));
      }
    }
  }

  return [...map.values()].slice(0, limit);
}

function matchesSearch(product: Json, query: string): boolean {
  const needle = query.toLocaleLowerCase('ru');
  return [product.id, product.name, product.brand, product.category, product.subcategory]
    .join(' ')
    .toLocaleLowerCase('ru')
    .includes(needle);
}

async function readStaticOverrides(env: Env): Promise<StaticOverrides> {
  try {
    const url = new URL('data/catalog-overrides.json', ensureSlash(env.MINI_APP_URL));
    const response = await fetch(url.toString(), { cf: { cacheTtl: 60 } });
    if (!response.ok) throw new Error('static overrides unavailable');
    const parsed = await response.json() as Json;
    return {
      version: Number(parsed.version) || 1,
      updatedAt: String(parsed.updatedAt || ''),
      products: parsed.products && typeof parsed.products === 'object' ? parsed.products : {},
      deletedIds: Array.isArray(parsed.deletedIds) ? parsed.deletedIds.map(String) : []
    };
  } catch {
    return { version: 1, updatedAt: '', products: {}, deletedIds: [] };
  }
}

async function loadManifest(env: Env): Promise<Json> {
  const url = new URL('catalog-data/manifest.json', ensureSlash(env.MINI_APP_URL));
  const response = await fetch(url.toString(), { cf: { cacheTtl: 300 } });
  if (!response.ok) throw new Error('manifest unavailable');
  return response.json() as Promise<Json>;
}

async function categorySubcategories(env: Env, gender: string, category: string): Promise<Json[]> {
  const manifest = await loadManifest(env);
  const categories = manifest?.genders?.[gender]?.categories || [];
  const match = categories.find((item: Json) => String(item.slug) === String(category));
  return Array.isArray(match?.subcategories) ? match.subcategories : [];
}

function getProductBucket(id: string): number {
  const digits = id.replace(/\D+/g, '');
  if (digits) return Number(digits) % 128;
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % 128;
}

async function getState(env: Env, userId: string | number): Promise<AdminState | null> {
  return env.ADMIN_STATE.get(`admin:${userId}`, 'json');
}

async function setState(env: Env, userId: string | number, state: AdminState): Promise<void> {
  await env.ADMIN_STATE.put(`admin:${userId}`, JSON.stringify(state), { expirationTtl: 3600 });
}

async function clearState(env: Env, userId: string | number): Promise<void> {
  await env.ADMIN_STATE.delete(`admin:${userId}`);
}

async function sendMessage(env: Env, chatId: string | number, text: string, replyMarkup?: Json): Promise<Json> {
  return telegram(env, 'sendMessage', {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {})
  });
}

async function answerCallback(env: Env, callbackQueryId: string): Promise<void> {
  await telegram(env, 'answerCallbackQuery', { callback_query_id: callbackQueryId }).catch(() => undefined);
}

async function telegram(env: Env, method: string, payload: Json): Promise<Json> {
  const response = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json() as Json;
  if (!response.ok || !data.ok) throw new Error(data.description || `Telegram ${method} failed`);
  return data.result;
}

function repoParts(env: Env): [string, string] {
  const [owner, repo] = String(env.GITHUB_REPO || '').split('/');
  if (!owner || !repo) throw new Error('GITHUB_REPO must be owner/repo');
  return [owner, repo];
}

async function githubRequest(env: Env, path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'mirari-telegram-worker',
      ...(init.headers || {})
    }
  });
}

async function putGithubFile(env: Env, filePath: string, bytes: Uint8Array, message: string, sha?: string): Promise<void> {
  const [owner, repo] = repoParts(env);
  const path = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${filePath.split('/').map(encodeURIComponent).join('/')}`;
  const response = await githubRequest(env, path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: bytesToBase64(bytes),
      branch: env.GITHUB_BRANCH || 'main',
      ...(sha ? { sha } : {}),
      committer: {
        name: env.GITHUB_COMMITTER_NAME || 'Mirari Catalog Bot',
        email: env.GITHUB_COMMITTER_EMAIL || 'bot@users.noreply.github.com'
      }
    })
  });
  if (!response.ok) throw new Error(`GitHub write failed: ${response.status} ${await response.text()}`);
}

async function uploadTelegramPhoto(env: Env, fileId: string, productId: string): Promise<string> {
  const file = await telegram(env, 'getFile', { file_id: fileId });
  const filePath = String(file.file_path || '');
  if (!filePath) throw new Error('Telegram did not return file_path');
  const response = await fetch(`https://api.telegram.org/file/bot${env.BOT_TOKEN}/${filePath}`);
  if (!response.ok) throw new Error('Не удалось скачать фото из Telegram');
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > 8 * 1024 * 1024) throw new Error('Фото слишком большое. Отправьте его как обычное фото.');
  const ext = filePath.split('.').pop()?.toLowerCase() || 'jpg';
  const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
  const fileName = `${sanitize(productId)}-${Date.now()}.${safeExt}`;
  const githubPath = `${env.GITHUB_PRODUCT_ASSETS_DIR.replace(/\/$/, '')}/${fileName}`;
  await putGithubFile(env, githubPath, bytes, `catalog: add image for ${productId}`);
  const relative = githubPath.replace(/^docs\//, '');
  return new URL(relative, ensureSlash(env.MINI_APP_URL)).toString();
}

function ensureSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}

function sanitize(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 80);
}

function bytesToBase64(bytes: Uint8Array): string {
  let result = '';
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    result += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(result);
}

function parseJson(value: string | null | undefined): Json | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

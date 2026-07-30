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
}

type Json = Record<string, any>;
type AdminState = {
  mode: 'add' | 'find' | 'edit';
  step?: string;
  targetId?: string;
  field?: string;
  draft?: Json;
};

type Overrides = {
  version: number;
  updatedAt: string;
  products: Record<string, Json>;
  deletedIds: string[];
};

const CATEGORY_LABELS: Record<string, string> = {
  clothes: 'Одежда', shoes: 'Обувь', bags: 'Сумки', accessories: 'Аксессуары',
  belts: 'Ремни', watches: 'Часы', perfume: 'Парфюмерия'
};

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return Response.json({ ok: true, service: 'mirari-telegram-bot' });
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
    if (chatId) await sendMessage(env, chatId, 'Произошла ошибка. Попробуйте ещё раз или нажмите /admin.');
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

  if (text === '/start' || text.startsWith('/start ')) {
    await sendWelcome(env, chatId, isAdmin(env, userId));
    return;
  }
  if (text === '/admin') {
    if (!isAdmin(env, userId)) {
      await sendMessage(env, chatId, 'У вас нет доступа к админке.');
      return;
    }
    await clearState(env, userId);
    await sendAdminPanel(env, chatId);
    return;
  }
  if (!isAdmin(env, userId)) return;

  const state = await getState(env, userId);
  if (!state) {
    if (text) await sendMessage(env, chatId, 'Для управления каталогом откройте /admin.');
    return;
  }

  if (state.mode === 'find') {
    const id = text.replace(/^#/, '').trim();
    if (!id) return;
    await clearState(env, userId);
    await showProduct(env, chatId, id);
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
  if (data === 'admin:add') {
    const draft = {
      id: `custom-${Date.now()}`,
      sourceId: '',
      name: '', brand: '', gender: '', category: '', subcategory: 'none',
      price: 0, priceRub: 0, priceByn: 0, originalPrice: 0,
      color: 'Уточнить', sizes: [], images: [], imageAlt: '',
      description: '', details: '', featured: false, pricingStatus: 'manual',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    await setState(env, userId, { mode: 'add', step: 'photo', draft });
    await sendMessage(env, chatId, 'Пришлите главное фото товара. Telegram отправит его в GitHub автоматически.', cancelKeyboard());
    return;
  }
  if (data === 'admin:find') {
    await setState(env, userId, { mode: 'find', step: 'id' });
    await sendMessage(env, chatId, 'Отправьте ID товара. Его видно в карточке и ссылке товара.', cancelKeyboard());
    return;
  }
  if (data === 'admin:recent') {
    await showRecent(env, chatId);
    return;
  }
  if (data === 'admin:cancel') {
    await clearState(env, userId);
    await sendAdminPanel(env, chatId);
    return;
  }
  if (data.startsWith('add:gender:')) {
    const state = await getState(env, userId);
    if (!state || state.mode !== 'add') return;
    state.draft!.gender = data.split(':')[2];
    state.step = 'category';
    await setState(env, userId, state);
    await sendMessage(env, chatId, 'Выберите категорию:', categoryKeyboard('add:category'));
    return;
  }
  if (data.startsWith('add:category:')) {
    const state = await getState(env, userId);
    if (!state || state.mode !== 'add') return;
    state.draft!.category = data.split(':')[2];
    state.step = 'subcategory';
    await setState(env, userId, state);
    await sendMessage(env, chatId, 'Напишите slug подкатегории или отправьте «нет».\nНапример: tshirts-sub, sneakers-sub, crossbody-sub.');
    return;
  }
  if (data === 'add:save') {
    const state = await getState(env, userId);
    if (!state || state.mode !== 'add' || !state.draft) return;
    const product = finalizeProduct(state.draft);
    await mutateOverrides(env, (overrides) => {
      overrides.products[product.id] = product;
      overrides.deletedIds = overrides.deletedIds.filter((id) => id !== product.id);
    });
    await clearState(env, userId);
    await sendMessage(env, chatId, `✅ Товар добавлен.\nID: ${product.id}\n\nНа GitHub Pages обновление обычно появляется после публикации Pages.`, productKeyboard(product.id));
    return;
  }
  if (data.startsWith('p:view:')) {
    await showProduct(env, chatId, data.slice('p:view:'.length));
    return;
  }
  if (data.startsWith('p:edit:')) {
    const [, , field, ...idParts] = data.split(':');
    const id = idParts.join(':');
    await setState(env, userId, { mode: 'edit', field, targetId: id });
    const prompts: Record<string, string> = {
      name: 'Отправьте новое название.', brand: 'Отправьте новый бренд.',
      rub: 'Отправьте новую цену в RUB числом.', byn: 'Отправьте новую цену в BYN числом.',
      description: 'Отправьте новое описание.', gender: 'Отправьте male или female.',
      category: 'Отправьте slug категории: clothes, shoes, bags, accessories, belts, watches, perfume.',
      subcategory: 'Отправьте slug подкатегории или «нет».', photo: 'Пришлите новое фото. Старые фото останутся в истории товара.'
    };
    await sendMessage(env, chatId, prompts[field] || 'Отправьте новое значение.', cancelKeyboard());
    return;
  }
  if (data.startsWith('p:delete:')) {
    const id = data.slice('p:delete:'.length);
    await sendMessage(env, chatId, `Скрыть товар ${id} из каталога? Фотографии физически не удаляются.`, {
      inline_keyboard: [[
        { text: 'Да, скрыть', callback_data: `p:delete_yes:${id}` },
        { text: 'Отмена', callback_data: `p:view:${id}` }
      ]]
    });
    return;
  }
  if (data.startsWith('p:delete_yes:')) {
    const id = data.slice('p:delete_yes:'.length);
    await mutateOverrides(env, (overrides) => {
      if (!overrides.deletedIds.includes(id)) overrides.deletedIds.push(id);
    });
    await sendMessage(env, chatId, `🗑 Товар ${id} скрыт из каталога. Файлы изображений сохранены.`, adminKeyboard());
  }
}

async function handleAddInput(message: Json, state: AdminState, env: Env): Promise<void> {
  const chatId = message.chat.id;
  const userId = message.from.id;
  const draft = state.draft || {};
  const text = String(message.text || '').trim();

  if (state.step === 'photo') {
    const photo = Array.isArray(message.photo) ? message.photo.at(-1) : null;
    if (!photo?.file_id) {
      await sendMessage(env, chatId, 'Нужно прислать изображение как фото.');
      return;
    }
    const imageUrl = await uploadTelegramPhoto(env, photo.file_id, draft.id);
    draft.images = [imageUrl];
    state.step = 'name';
    state.draft = draft;
    await setState(env, userId, state);
    await sendMessage(env, chatId, 'Фото сохранено. Теперь отправьте название товара.');
    return;
  }
  if (state.step === 'name') {
    if (!text) return;
    draft.name = text; state.step = 'brand';
    await setState(env, userId, state);
    await sendMessage(env, chatId, 'Отправьте бренд.');
    return;
  }
  if (state.step === 'brand') {
    if (!text) return;
    draft.brand = text; state.step = 'gender';
    await setState(env, userId, state);
    await sendMessage(env, chatId, 'Выберите раздел:', {
      inline_keyboard: [[
        { text: 'Мужское', callback_data: 'add:gender:male' },
        { text: 'Женское', callback_data: 'add:gender:female' }
      ], [{ text: 'Отмена', callback_data: 'admin:cancel' }]]
    });
    return;
  }
  if (state.step === 'subcategory') {
    draft.subcategory = /^нет$/i.test(text) || !text ? 'none' : text;
    state.step = 'rub'; await setState(env, userId, state);
    await sendMessage(env, chatId, 'Отправьте цену в российских рублях числом.');
    return;
  }
  if (state.step === 'rub') {
    const value = parsePrice(text);
    if (value == null) return void await sendMessage(env, chatId, 'Цена должна быть числом. Например: 12990');
    draft.priceRub = value; draft.price = value; draft.originalPrice = value;
    state.step = 'byn'; await setState(env, userId, state);
    await sendMessage(env, chatId, 'Отправьте цену в BYN числом.');
    return;
  }
  if (state.step === 'byn') {
    const value = parsePrice(text);
    if (value == null) return void await sendMessage(env, chatId, 'Цена должна быть числом. Например: 450');
    draft.priceByn = value; state.step = 'description';
    await setState(env, userId, state);
    await sendMessage(env, chatId, 'Отправьте описание товара или «нет».');
    return;
  }
  if (state.step === 'description') {
    draft.description = /^нет$/i.test(text) ? '' : text;
    draft.details = draft.description;
    draft.imageAlt = `${draft.brand} ${draft.name}`.trim();
    state.step = 'confirm'; state.draft = draft;
    await setState(env, userId, state);
    await sendMessage(env, chatId, productSummary(finalizeProduct(draft), 'Новый товар'), {
      inline_keyboard: [[
        { text: '✅ Сохранить', callback_data: 'add:save' },
        { text: 'Отмена', callback_data: 'admin:cancel' }
      ]]
    });
  }
}

async function handleEditInput(message: Json, state: AdminState, env: Env): Promise<void> {
  const chatId = message.chat.id;
  const userId = message.from.id;
  const id = String(state.targetId || '');
  const field = String(state.field || '');
  if (!id || !field) return;

  const base = await loadProduct(env, id);
  if (!base) {
    await clearState(env, userId);
    await sendMessage(env, chatId, 'Товар не найден.');
    return;
  }
  const updated = { ...base };
  const text = String(message.text || '').trim();

  if (field === 'photo') {
    const photo = Array.isArray(message.photo) ? message.photo.at(-1) : null;
    if (!photo?.file_id) return void await sendMessage(env, chatId, 'Пришлите изображение как фото.');
    const imageUrl = await uploadTelegramPhoto(env, photo.file_id, id);
    updated.images = [...(Array.isArray(updated.images) ? updated.images : []), imageUrl];
  } else if (field === 'rub' || field === 'byn') {
    const value = parsePrice(text);
    if (value == null) return void await sendMessage(env, chatId, 'Отправьте цену числом.');
    if (field === 'rub') { updated.priceRub = value; updated.price = value; }
    else updated.priceByn = value;
  } else if (field === 'subcategory') {
    updated.subcategory = /^нет$/i.test(text) ? 'none' : text;
  } else {
    const keyMap: Record<string, string> = { name: 'name', brand: 'brand', description: 'description', gender: 'gender', category: 'category' };
    const key = keyMap[field];
    if (!key || !text) return;
    updated[key] = text;
    if (field === 'description') updated.details = text;
  }

  updated.updatedAt = new Date().toISOString();
  updated.imageAlt = `${updated.brand || ''} ${updated.name || ''}`.trim();
  await mutateOverrides(env, (overrides) => {
    overrides.products[id] = finalizeProduct(updated);
    overrides.deletedIds = overrides.deletedIds.filter((value) => value !== id);
  });
  await clearState(env, userId);
  await sendMessage(env, chatId, '✅ Изменения сохранены.', productKeyboard(id));
}

async function sendWelcome(env: Env, chatId: number | string, admin: boolean): Promise<void> {
  const keyboard: Json = {
    inline_keyboard: [[{ text: 'Открыть Mirari', web_app: { url: env.MINI_APP_URL } }]]
  };
  if (admin) keyboard.inline_keyboard.push([{ text: 'Админка', callback_data: 'admin:panel' }]);
  await sendMessage(env, chatId, 'Добро пожаловать в Mirari. Откройте каталог, добавьте товары в корзину и свяжитесь с менеджером в один клик.', keyboard);
}

async function sendAdminPanel(env: Env, chatId: number | string): Promise<void> {
  await sendMessage(env, chatId, 'Админка Mirari\n\nТовары редактируются через безопасный overlay-файл — исходный каталог не перезаписывается.', adminKeyboard());
}

function adminKeyboard(): Json {
  return { inline_keyboard: [
    [{ text: '➕ Добавить товар', callback_data: 'admin:add' }],
    [{ text: '🔎 Найти / изменить по ID', callback_data: 'admin:find' }],
    [{ text: '🕘 Последние добавленные', callback_data: 'admin:recent' }]
  ] };
}
function cancelKeyboard(): Json { return { inline_keyboard: [[{ text: 'Отмена', callback_data: 'admin:cancel' }]] }; }
function categoryKeyboard(prefix: string): Json {
  return { inline_keyboard: [
    [{ text: 'Одежда', callback_data: `${prefix}:clothes` }, { text: 'Обувь', callback_data: `${prefix}:shoes` }],
    [{ text: 'Сумки', callback_data: `${prefix}:bags` }, { text: 'Аксессуары', callback_data: `${prefix}:accessories` }],
    [{ text: 'Ремни', callback_data: `${prefix}:belts` }, { text: 'Часы', callback_data: `${prefix}:watches` }],
    [{ text: 'Парфюмерия', callback_data: `${prefix}:perfume` }],
    [{ text: 'Отмена', callback_data: 'admin:cancel' }]
  ] };
}
function productKeyboard(id: string): Json {
  return { inline_keyboard: [
    [{ text: '✏️ Название', callback_data: `p:edit:name:${id}` }, { text: '✏️ Бренд', callback_data: `p:edit:brand:${id}` }],
    [{ text: '💵 RUB', callback_data: `p:edit:rub:${id}` }, { text: '💵 BYN', callback_data: `p:edit:byn:${id}` }],
    [{ text: '📝 Описание', callback_data: `p:edit:description:${id}` }],
    [{ text: '👤 Раздел', callback_data: `p:edit:gender:${id}` }, { text: '🗂 Категория', callback_data: `p:edit:category:${id}` }],
    [{ text: '📂 Подкатегория', callback_data: `p:edit:subcategory:${id}` }, { text: '🖼 Добавить фото', callback_data: `p:edit:photo:${id}` }],
    [{ text: '🗑 Скрыть товар', callback_data: `p:delete:${id}` }],
    [{ text: '⬅️ Админка', callback_data: 'admin:panel' }]
  ] };
}

async function showProduct(env: Env, chatId: number | string, id: string): Promise<void> {
  const product = await loadProduct(env, id);
  if (!product) {
    await sendMessage(env, chatId, `Товар с ID ${id} не найден. Проверьте ID.` , adminKeyboard());
    return;
  }
  await sendMessage(env, chatId, productSummary(product, 'Товар'), productKeyboard(String(product.id)));
}

async function showRecent(env: Env, chatId: number | string): Promise<void> {
  const overrides = await readOverrides(env);
  const products = Object.values(overrides.products)
    .sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')))
    .slice(0, 15);
  if (!products.length) return void await sendMessage(env, chatId, 'Добавленных или изменённых товаров пока нет.', adminKeyboard());
  const rows = products.map((product) => [{
    text: `${String(product.id).slice(-8)} · ${String(product.brand || '')} ${String(product.name || '')}`.slice(0, 60),
    callback_data: `p:view:${product.id}`
  }]);
  rows.push([{ text: '⬅️ Админка', callback_data: 'admin:panel' }]);
  await sendMessage(env, chatId, 'Последние добавленные и изменённые товары:', { inline_keyboard: rows });
}

function productSummary(product: Json, title: string): string {
  return [
    title,
    '',
    `${product.brand || 'Mirari'} — ${product.name || 'Товар'}`,
    `ID: ${product.id}`,
    `Раздел: ${product.gender === 'female' ? 'Женское' : 'Мужское'}`,
    `Категория: ${CATEGORY_LABELS[product.category] || product.category || '—'}`,
    `Подкатегория: ${product.subcategory || 'none'}`,
    `Цена: ${numberText(product.priceByn)} BYN / ${numberText(product.priceRub ?? product.price)} ₽`,
    `Фото: ${Array.isArray(product.images) ? product.images.length : 0}`,
    product.description ? `Описание: ${String(product.description).slice(0, 500)}` : ''
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
function numberText(value: unknown): string { return Math.round(Number(value) || 0).toLocaleString('ru-RU'); }

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
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2026-03-10',
      'User-Agent': 'mirari-telegram-worker',
      ...(init.headers || {})
    }
  });
  return response;
}

async function getGithubFile(env: Env, filePath: string): Promise<{ sha: string; bytes: Uint8Array } | null> {
  const [owner, repo] = repoParts(env);
  const path = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${filePath.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(env.GITHUB_BRANCH || 'main')}`;
  const response = await githubRequest(env, path);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub read failed: ${response.status} ${await response.text()}`);
  const data = await response.json() as Json;
  return { sha: data.sha, bytes: base64ToBytes(String(data.content || '').replace(/\n/g, '')) };
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

async function readOverrides(env: Env): Promise<Overrides> {
  const file = await getGithubFile(env, env.GITHUB_OVERRIDES_PATH);
  if (!file) return { version: 1, updatedAt: '', products: {}, deletedIds: [] };
  const parsed = JSON.parse(textDecoder.decode(file.bytes));
  return {
    version: Number(parsed.version) || 1,
    updatedAt: String(parsed.updatedAt || ''),
    products: parsed.products && typeof parsed.products === 'object' ? parsed.products : {},
    deletedIds: Array.isArray(parsed.deletedIds) ? parsed.deletedIds.map(String) : []
  };
}

async function mutateOverrides(env: Env, mutator: (overrides: Overrides) => void): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const current = await getGithubFile(env, env.GITHUB_OVERRIDES_PATH);
      const overrides: Overrides = current
        ? JSON.parse(textDecoder.decode(current.bytes))
        : { version: 1, updatedAt: '', products: {}, deletedIds: [] };
      overrides.products ||= {};
      overrides.deletedIds ||= [];
      mutator(overrides);
      overrides.version = Number(overrides.version || 0) + 1;
      overrides.updatedAt = new Date().toISOString();
      await putGithubFile(
        env,
        env.GITHUB_OVERRIDES_PATH,
        textEncoder.encode(JSON.stringify(overrides, null, 2)),
        `catalog: update products (${overrides.updatedAt})`,
        current?.sha
      );
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  throw lastError;
}

async function loadProduct(env: Env, id: string): Promise<Json | null> {
  const overrides = await readOverrides(env);
  if (overrides.deletedIds.includes(id)) return null;
  const override = overrides.products[id];
  if (override) return finalizeProduct(override);
  const bucket = getProductBucket(id);
  const url = new URL(`catalog-data/details/bucket-${String(bucket).padStart(3, '0')}.json`, ensureSlash(env.MINI_APP_URL));
  const response = await fetch(url.toString(), { cf: { cacheTtl: 60 } });
  if (!response.ok) return null;
  const data = await response.json() as Json;
  const product = (data.items || []).find((item: Json) => String(item.id) === id);
  return product ? finalizeProduct(product) : null;
}

function getProductBucket(id: string): number {
  const digits = id.replace(/\D+/g, '');
  if (digits) return Number(digits) % 128;
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % 128;
}

async function uploadTelegramPhoto(env: Env, fileId: string, productId: string): Promise<string> {
  const file = await telegram(env, 'getFile', { file_id: fileId });
  const filePath = String(file.file_path || '');
  if (!filePath) throw new Error('Telegram did not return file_path');
  const response = await fetch(`https://api.telegram.org/file/bot${env.BOT_TOKEN}/${filePath}`);
  if (!response.ok) throw new Error('Не удалось скачать фото из Telegram');
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > 8 * 1024 * 1024) throw new Error('Фото слишком большое. Отправьте его как обычное фото, а не файл.');
  const ext = filePath.split('.').pop()?.toLowerCase() || 'jpg';
  const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
  const fileName = `${sanitize(productId)}-${Date.now()}.${safeExt}`;
  const githubPath = `${env.GITHUB_PRODUCT_ASSETS_DIR.replace(/\/$/, '')}/${fileName}`;
  await putGithubFile(env, githubPath, bytes, `catalog: add image for ${productId}`);
  const relative = githubPath.replace(/^docs\//, '');
  return new URL(relative, ensureSlash(env.MINI_APP_URL)).toString();
}

function ensureSlash(value: string): string { return value.endsWith('/') ? value : `${value}/`; }
function sanitize(value: string): string { return value.replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 80); }
function bytesToBase64(bytes: Uint8Array): string {
  let result = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) result += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(result);
}
function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

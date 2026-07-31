(() => {
  'use strict';

  const CONFIG = window.MIRARI_CONFIG || {};
  const TG = window.Telegram?.WebApp || null;
  const CART_KEY = 'mirari_cart_v1';
  const RECENT_KEY = 'mirari_recent_v1';
  const PAGE_SIZE = Number(CONFIG.pageSize) || 24;
  const API_BASE = String(CONFIG.apiBase || '').replace(/\/+$/, '');
  const cache = new Map();

  const CATEGORY_LABELS = {
    clothes: 'Одежда', shoes: 'Обувь', bags: 'Сумки', accessories: 'Аксессуары',
    belts: 'Ремни', watches: 'Часы', perfume: 'Парфюмерия'
  };
  const SUBCATEGORY_LABELS = {
    'all-bags-sub': 'Все сумки', 'backpacks-sub': 'Рюкзаки', 'ballerinas-sub': 'Балетки',
    'beach-bags-sub': 'Пляжные сумки', 'beach-sub': 'Пляжная одежда', 'beach-suits-sub': 'Пляжные комплекты',
    'blazers-sub': 'Блейзеры', 'blouses-sub': 'Блузы', 'bodysuit-sub': 'Боди', 'bombers-sub': 'Бомберы',
    'boots-sub': 'Ботинки', 'bracelets-sub': 'Браслеты', 'briefcases-sub': 'Портфели',
    'canvas-shoes-sub': 'Кеды', 'caps-sub': 'Кепки', 'chains-sub': 'Цепи', 'clogs-sub': 'Сабо',
    'clutches-sub': 'Клатчи', coat: 'Пальто', 'coats-sub': 'Пальто', 'cosmetic-bags-sub': 'Косметички',
    'cowboy-boots-sub': 'Казаки', 'crossbody-sub': 'Кросс-боди', 'document-covers-sub': 'Обложки для документов',
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

  const SUBCATEGORY_PRIORITY = {
    male: {
      clothes: ['tshirts-sub', 'maiki', 'polo-sub', 'hoodies-sub', 'sweaters-sub', 'jackets-sub', 'down-jackets-sub', 'shirts-sub', 'pants-sub', 'jeans-sub', 'sportpants-sub', 'sportsuit-sub', 'shorts-sub', 'sweatshirts-sub', 'windbreakers-sub', 'vests-sub', 'suits-sub', 'bombers-sub', 'coats-sub', 'jeans-jackets-sub', 'beach-suits-sub', 'swim-sub', 'ski-sub', 'underwear-sub', 'socks-sub'],
      shoes: ['sneakers-sub', 'loafers-sub', 'dress-shoes-sub', 'boots-sub', 'winter-sneakers-sub', 'canvas-shoes-sub', 'sandals-sub', 'flip-flops-sub', 'high-boots-sub', 'clogs-sub', 'slippers-sub'],
      bags: ['crossbody-sub', 'all-bags-sub', 'backpacks-sub', 'wallets-sub', 'briefcases-sub', 'travel-bags-sub', 'waist-bags-sub', 'cosmetic-bags-sub', 'suitcases-sub', 'document-covers-sub', 'saddle-bags-sub'],
      accessories: ['glasses-sub', 'jewelry-sub', 'scarves-sub', 'caps-sub', 'hats-sub', 'gloves-sub', 'keychains-sub', 'panamas-sub', 'umbrellas-sub', 'phone-cases-sub']
    },
    female: {
      clothes: ['tshirts-sub', 'tops-sub', 'dresses-sub', 'sweaters-sub', 'jackets-sub', 'down-jackets-sub', 'hoodies-sub', 'jeans-sub', 'pants-sub', 'skirts-shorts-sub', 'blouses-sub', 'blazers-sub', 'suits-sub', 'shirts-sub', 'coats-sub', 'coat', 'sportsuits-sub', 'sportpants-sub', 'sweatshirts-sub', 'vests-sub', 'bombers-sub', 'windbreakers-sub', 'swimsuit-sub', 'beach-sub', 'home-clothes-sub', 'underwear-sub', 'bodysuit-sub', 'leggings-sub', 'jumpsuits-sub', 'jeans-jackets-sub', 'ski-sub', 'socks-sub', 'skirts-sub'],
      shoes: ['sneakers-sub', 'loafers-sub', 'ballerinas-sub', 'heels-sub', 'boots-sub', 'high-boots-sub', 'uggs-sub', 'winter-sneakers-sub', 'canvas-shoes-sub', 'mules-sub', 'sandals-open-sub', 'flip-flops-sub', 'cowboy-boots-sub', 'dress-shoes-sub', 'home-shoes-sub', 'slippers-sub'],
      bags: ['hand-bags-sub', 'crossbody-sub', 'mini-bags-sub', 'all-bags-sub', 'backpacks-sub', 'wallets-sub', 'clutches-sub', 'travel-bags-sub', 'beach-bags-sub', 'cosmetic-bags-sub', 'waist-bags-sub', 'suitcases-sub', 'document-covers-sub', 'saddle-bags-sub'],
      accessories: ['jewelry-sub', 'bracelets-sub', 'earrings-sub', 'rings-sub', 'chains-sub', 'glasses-sub', 'scarves-sub', 'hair-acc-sub', 'caps-sub', 'hats-sub', 'gloves-sub', 'kerchiefs-sub', 'panamas-sub', 'umbrellas-sub']
    }
  };

  const state = {
    tab: 'catalog',
    gender: 'male',
    view: 'categories',
    category: null,
    subcategory: null,
    manifest: null,
    overrides: { version: 1, products: {}, deletedIds: [] },
    currentItems: [],
    visibleCount: PAGE_SIZE,
    activeProduct: null,
    searchQuery: '',
    searchItems: null,
    filters: { brands: [], currency: 'BYN', min: null, max: null, sort: 'newest' },
    cart: loadCart(),
    loading: false
  };

  const els = {
    screens: [...document.querySelectorAll('[data-screen]')],
    navItems: [...document.querySelectorAll('[data-tab]')],
    genderButtons: [...document.querySelectorAll('[data-gender]')],
    catalogTitle: document.querySelector('#catalog-title'),
    categoryGrid: document.querySelector('[data-category-grid]'),
    subcategoryGrid: document.querySelector('[data-subcategory-grid]'),
    productGrid: document.querySelector('[data-product-grid]'),
    breadcrumbs: document.querySelector('.breadcrumbs'),
    status: document.querySelector('.catalog-status'),
    empty: document.querySelector('[data-empty-state]'),
    loadMore: document.querySelector('[data-load-more]'),
    back: document.querySelector('.back-button'),
    brand: document.querySelector('.brand-button'),
    searchToggle: document.querySelector('.search-toggle'),
    searchPanel: document.querySelector('.search-panel'),
    searchInput: document.querySelector('.search-input'),
    searchClear: document.querySelector('.search-clear'),
    filterToolbar: document.querySelector('[data-filter-toolbar]'),
    filterToggle: document.querySelector('[data-filter-toggle]'),
    filterCount: document.querySelector('[data-filter-count]'),
    filterResultCount: document.querySelector('[data-filter-result-count]'),
    filterPanel: document.querySelector('[data-filter-panel]'),
    filterBrands: document.querySelector('[data-filter-brands]'),
    filterCurrencyButtons: [...document.querySelectorAll('[data-filter-currency]')],
    filterMin: document.querySelector('[data-filter-min]'),
    filterMax: document.querySelector('[data-filter-max]'),
    filterSort: document.querySelector('[data-filter-sort]'),
    filterApply: document.querySelector('[data-filter-apply]'),
    filterReset: document.querySelector('[data-filter-reset]'),
    productView: document.querySelector('[data-product-view]'),
    productGallery: document.querySelector('[data-product-gallery]'),
    productDots: document.querySelector('[data-product-dots]'),
    productBrand: document.querySelector('[data-product-brand]'),
    productName: document.querySelector('[data-product-name]'),
    productPrice: document.querySelector('[data-product-price]'),
    productDescription: document.querySelector('[data-product-description]'),
    addToCart: document.querySelector('[data-add-to-cart]'),
    buyNow: document.querySelector('[data-buy-now]'),
    cartList: document.querySelector('[data-cart-list]'),
    cartEmpty: document.querySelector('[data-cart-empty]'),
    cartSummary: document.querySelector('[data-cart-summary]'),
    cartBadge: document.querySelector('[data-cart-badge]'),
    cartCountLabel: document.querySelector('[data-cart-count-label]'),
    cartItemsCount: document.querySelector('[data-cart-items-count]'),
    cartTotal: document.querySelector('[data-cart-total]'),
    checkout: document.querySelector('[data-checkout]'),
    profileAvatar: document.querySelector('[data-profile-avatar]'),
    profileName: document.querySelector('[data-profile-name]'),
    profileUsername: document.querySelector('[data-profile-username]'),
    toast: document.querySelector('[data-toast]')
  };

  function initializeTelegram() {
    if (!TG) return;
    try {
      TG.ready();
      TG.expand();
      TG.setHeaderColor?.('#212c45');
      TG.setBackgroundColor?.('#f7f4ec');
      TG.setBottomBarColor?.('#182137');
    } catch (error) {
      console.warn('Telegram WebApp setup failed', error);
    }
  }

  function baseUrl(path) {
    if (!path) return '';
    if (/^(https?:|data:|blob:)/i.test(path)) return path;
    return new URL(String(path).replace(/^\//, ''), document.baseURI).href;
  }

  async function fetchJson(path, { fresh = false } = {}) {
    const url = baseUrl(path);
    if (!fresh && cache.has(url)) return cache.get(url);
    const query = fresh || CONFIG.catalogVersion
      ? `${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(CONFIG.catalogVersion || Date.now())}`
      : url;
    const response = await fetch(query, { cache: fresh ? 'no-store' : 'default' });
    if (!response.ok) throw new Error(`Не удалось загрузить ${path}`);
    const json = await response.json();
    if (!fresh) cache.set(url, json);
    return json;
  }

  function mergeOverrides(staticLayer, liveLayer) {
    const base = staticLayer && typeof staticLayer === 'object' ? staticLayer : {};
    const live = liveLayer && typeof liveLayer === 'object' ? liveLayer : {};
    const products = {
      ...(base.products && typeof base.products === 'object' ? base.products : {}),
      ...(live.products && typeof live.products === 'object' ? live.products : {})
    };
    const deleted = new Set([
      ...(Array.isArray(base.deletedIds) ? base.deletedIds : []),
      ...(Array.isArray(live.deletedIds) ? live.deletedIds : [])
    ].map(String));

    Object.keys(live.products || {}).forEach((id) => deleted.delete(String(id)));

    return {
      version: Math.max(Number(base.version) || 1, Number(live.version) || 1),
      updatedAt: String(live.updatedAt || base.updatedAt || ''),
      products,
      deletedIds: [...deleted]
    };
  }

  async function loadOverrides() {
    const staticRequest = fetchJson('data/catalog-overrides.json', { fresh: true })
      .catch(() => ({ version: 1, products: {}, deletedIds: [] }));
    const liveRequest = API_BASE
      ? fetch(`${API_BASE}/api/catalog-overrides?v=${Date.now()}`, { cache: 'no-store' })
          .then((response) => {
            if (!response.ok) throw new Error('D1 overrides unavailable');
            return response.json();
          })
          .catch((error) => {
            console.warn('Mirari: live catalog changes unavailable', error);
            return { version: 2, products: {}, deletedIds: [] };
          })
      : Promise.resolve({ version: 2, products: {}, deletedIds: [] });

    const [staticLayer, liveLayer] = await Promise.all([staticRequest, liveRequest]);
    return mergeOverrides(staticLayer, liveLayer);
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function humanize(value) {
    const clean = String(value || '').replace(/-sub$/i, '').replace(/[_-]+/g, ' ').trim();
    return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : 'Другое';
  }

  function categoryLabel(slug) { return CATEGORY_LABELS[slug] || humanize(slug); }
  function subcategoryLabel(slug) { return SUBCATEGORY_LABELS[slug] || humanize(slug); }
  function sortedSubcategories(categorySlug, subcategories) {
    const priority = SUBCATEGORY_PRIORITY[state.gender]?.[categorySlug] || [];
    const positions = new Map(priority.map((slug, index) => [slug, index]));
    return [...(subcategories || [])].sort((a, b) => {
      const aRank = positions.has(a.slug) ? positions.get(a.slug) : Number.MAX_SAFE_INTEGER;
      const bRank = positions.has(b.slug) ? positions.get(b.slug) : Number.MAX_SAFE_INTEGER;
      if (aRank !== bRank) return aRank - bRank;
      return Number(b.count || 0) - Number(a.count || 0);
    });
  }
  function cleanDescriptionPart(value) {
    const text = String(value || '').trim();
    if (!text) return '';
    return text
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => line && !/^состав\s+уточняется[.!]?$/i.test(line))
      .join('\n');
  }
  function plural(count, one, few, many) {
    const n = Math.abs(Number(count)) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return many;
    if (n1 > 1 && n1 < 5) return few;
    if (n1 === 1) return one;
    return many;
  }
  function formatRub(value) { return `${Math.round(Number(value) || 0).toLocaleString('ru-RU')} ₽`; }
  function formatByn(value) { return `${Math.round(Number(value) || 0).toLocaleString('ru-RU')} BYN`; }
  function priceText(product) {
    const byn = Number(product?.priceByn) || 0;
    const rub = Number(product?.priceRub ?? product?.price) || 0;
    return `${byn ? formatByn(byn) : ''}${byn && rub ? ' / ' : ''}${rub ? formatRub(rub) : ''}` || 'Уточнить';
  }

  function getImage(product, index = 0) {
    const images = Array.isArray(product?.images) ? product.images.filter(Boolean) : [];
    return baseUrl(images[index] || images[0] || '');
  }

  function imageMarkup(src, alt) {
    const safe = escapeHtml(src || '');
    const fallback = baseUrl('category-covers/male/clothes.webp');
    return `<img src="${safe}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${escapeHtml(fallback)}'">`;
  }

  function loadCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
    renderCartBadge();
  }

  function cartQuantity() { return state.cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0); }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.hidden = false;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => { els.toast.hidden = true; }, 2200);
    try { TG?.HapticFeedback?.notificationOccurred?.('success'); } catch {}
  }

  function setLoading(message = 'Загрузка…') {
    state.loading = true;
    els.status.textContent = message;
  }
  function clearLoading() {
    state.loading = false;
    els.status.textContent = '';
  }

  function setTab(tab) {
    state.tab = tab;
    state.activeProduct = null;
    els.productView.hidden = true;
    els.screens.forEach((screen) => {
      const active = screen.dataset.screen === tab;
      screen.hidden = !active;
      screen.classList.toggle('is-active', active);
    });
    els.navItems.forEach((item) => item.classList.toggle('is-active', item.dataset.tab === tab));
    els.back.hidden = tab !== 'catalog' || state.view === 'categories';
    if (tab === 'cart') renderCart();
    if (tab === 'profile') renderProfile();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function renderCartBadge() {
    const quantity = cartQuantity();
    els.cartBadge.textContent = quantity > 99 ? '99+' : String(quantity);
    els.cartBadge.hidden = quantity === 0;
  }

  function categoryData() {
    return state.manifest?.genders?.[state.gender]?.categories || [];
  }

  function normalizeProduct(product) {
    if (!product) return null;
    const override = state.overrides.products?.[String(product.id)] || {};
    const merged = { ...product, ...override };
    merged.id = String(merged.id || product.id || '');
    merged.images = Array.isArray(merged.images) ? merged.images : [];
    merged.priceRub = Number(merged.priceRub ?? merged.price) || 0;
    merged.priceByn = Number(merged.priceByn) || 0;
    return merged;
  }

  function applyOverrides(baseItems) {
    const deleted = new Set((state.overrides.deletedIds || []).map(String));
    const map = new Map();
    (baseItems || []).forEach((item) => {
      const normalized = normalizeProduct(item);
      if (normalized?.id && !deleted.has(normalized.id)) map.set(normalized.id, normalized);
    });
    Object.values(state.overrides.products || {}).forEach((item) => {
      const normalized = normalizeProduct(item);
      if (!normalized?.id || deleted.has(normalized.id)) return;
      const matchesGender = normalized.gender === state.gender;
      const matchesCategory = normalized.category === state.category;
      const matchesSubcategory = !state.subcategory || normalized.subcategory === state.subcategory;
      const matchesSearch = !state.searchQuery || productMatchesQuery(normalized, state.searchQuery);
      if (matchesGender && matchesCategory && matchesSubcategory && matchesSearch) map.set(normalized.id, normalized);
    });
    return [...map.values()];
  }

  function productMatchesQuery(item, query) {
    const q = String(query || '').trim().toLocaleLowerCase('ru');
    if (!q) return true;
    return [item.id, item.name, item.brand, item.description, item.details, categoryLabel(item.category), subcategoryLabel(item.subcategory)]
      .join(' ').toLocaleLowerCase('ru').includes(q);
  }

  function renderCategories() {
    state.view = 'categories';
    state.category = null;
    state.subcategory = null;
    state.searchQuery = '';
    state.currentItems = [];
    els.catalogTitle.textContent = 'Выберите раздел';
    els.categoryGrid.hidden = false;
    els.subcategoryGrid.hidden = true;
    els.productGrid.hidden = true;
    els.loadMore.hidden = true;
    els.empty.hidden = true;
    els.breadcrumbs.hidden = true;
    els.filterToolbar.hidden = true;
    els.filterPanel.hidden = true;
    els.back.hidden = true;
    els.searchInput.value = '';

    const categories = categoryData();
    els.categoryGrid.innerHTML = categories.map((category) => `
      <button type="button" class="category-card" data-category="${escapeHtml(category.slug)}">
        <div class="card-image">${imageMarkup(baseUrl(category.coverImage), category.label)}</div>
        <div class="category-card-copy">
          <strong>${escapeHtml(category.label || categoryLabel(category.slug))}</strong>
          <span>${Number(category.count).toLocaleString('ru-RU')} товаров</span>
        </div>
      </button>`).join('');
  }

  function renderSubcategories(categorySlug) {
    state.view = 'subcategories';
    state.category = categorySlug;
    state.subcategory = null;
    const category = categoryData().find((item) => item.slug === categorySlug);
    if (!category) return renderCategories();
    if (!Array.isArray(category.subcategories) || category.subcategories.length === 0) {
      loadProducts(categorySlug, null);
      return;
    }
    els.catalogTitle.textContent = category.label || categoryLabel(categorySlug);
    els.categoryGrid.hidden = true;
    els.subcategoryGrid.hidden = false;
    els.productGrid.hidden = true;
    els.loadMore.hidden = true;
    els.empty.hidden = true;
    els.filterToolbar.hidden = true;
    els.filterPanel.hidden = true;
    els.back.hidden = false;
    renderBreadcrumbs();
    const subcategories = sortedSubcategories(categorySlug, category.subcategories);
    els.subcategoryGrid.innerHTML = subcategories.map((subcategory) => `
      <button type="button" class="subcategory-card" data-subcategory="${escapeHtml(subcategory.slug)}">
        <div class="card-image">${imageMarkup(baseUrl(subcategory.coverImage), subcategoryLabel(subcategory.slug))}</div>
        <div class="subcategory-card-copy">
          <strong>${escapeHtml(subcategoryLabel(subcategory.slug))}</strong>
          <span>${Number(subcategory.count).toLocaleString('ru-RU')} товаров</span>
        </div>
      </button>`).join('');
  }

  function renderBreadcrumbs() {
    const parts = [`<button type="button" data-crumb="root">Каталог</button>`];
    if (state.category) parts.push(`<span> / </span><button type="button" data-crumb="category">${escapeHtml(categoryLabel(state.category))}</button>`);
    if (state.subcategory) parts.push(`<span> / </span><span>${escapeHtml(subcategoryLabel(state.subcategory))}</span>`);
    els.breadcrumbs.innerHTML = parts.join('');
    els.breadcrumbs.hidden = state.view === 'categories';
  }

  async function loadProducts(categorySlug, subcategorySlug = null) {
    state.view = 'products';
    state.category = categorySlug;
    state.subcategory = subcategorySlug;
    state.visibleCount = PAGE_SIZE;
    state.searchQuery = '';
    resetFilters({ render: false });
    els.catalogTitle.textContent = subcategorySlug ? subcategoryLabel(subcategorySlug) : categoryLabel(categorySlug);
    els.categoryGrid.hidden = true;
    els.subcategoryGrid.hidden = true;
    els.productGrid.hidden = false;
    els.back.hidden = false;
    els.empty.hidden = true;
    els.filterToolbar.hidden = !subcategorySlug;
    els.filterPanel.hidden = true;
    renderBreadcrumbs();
    setLoading('Загружаем товары…');
    try {
      const path = subcategorySlug
        ? `catalog-data/listings/${state.gender}/${categorySlug}/${subcategorySlug}.json`
        : `catalog-data/listings/${state.gender}/${categorySlug}.json`;
      const data = await fetchJson(path);
      state.currentItems = applyOverrides(data.items || []).sort((a, b) => Number(b.id) - Number(a.id));
      renderFilterControls();
      renderProducts();
    } catch (error) {
      console.error(error);
      state.currentItems = [];
      renderProducts();
      els.status.textContent = 'Не удалось загрузить раздел. Попробуйте ещё раз.';
      return;
    }
    clearLoading();
  }

  function activeFilterCount() {
    return state.filters.brands.length
      + (state.filters.min !== null ? 1 : 0)
      + (state.filters.max !== null ? 1 : 0)
      + (state.filters.sort !== 'newest' ? 1 : 0);
  }

  function filteredProducts() {
    if (!state.subcategory) return [...state.currentItems];
    const currencyKey = state.filters.currency === 'RUB' ? 'priceRub' : 'priceByn';
    let items = [...state.currentItems];
    if (state.filters.brands.length) {
      const selected = new Set(state.filters.brands);
      items = items.filter((product) => selected.has(product.brand || 'Без бренда'));
    }
    if (state.filters.min !== null) items = items.filter((product) => Number(product[currencyKey] || 0) >= state.filters.min);
    if (state.filters.max !== null) items = items.filter((product) => Number(product[currencyKey] || 0) <= state.filters.max);
    if (state.filters.sort === 'price-asc') items.sort((a, b) => Number(a[currencyKey] || 0) - Number(b[currencyKey] || 0));
    if (state.filters.sort === 'price-desc') items.sort((a, b) => Number(b[currencyKey] || 0) - Number(a[currencyKey] || 0));
    if (state.filters.sort === 'brand') items.sort((a, b) => String(a.brand || '').localeCompare(String(b.brand || ''), 'ru'));
    return items;
  }

  function renderFilterControls() {
    if (!state.subcategory) {
      els.filterToolbar.hidden = true;
      els.filterPanel.hidden = true;
      return;
    }
    const brands = [...new Set(state.currentItems.map((item) => item.brand || 'Без бренда'))]
      .sort((a, b) => a.localeCompare(b, 'ru'));
    els.filterBrands.innerHTML = brands.map((brand) => `
      <label class="brand-filter-option">
        <input type="checkbox" value="${escapeHtml(brand)}" ${state.filters.brands.includes(brand) ? 'checked' : ''}>
        <span>${escapeHtml(brand)}</span>
      </label>`).join('');
    els.filterCurrencyButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.filterCurrency === state.filters.currency));
    els.filterMin.value = state.filters.min ?? '';
    els.filterMax.value = state.filters.max ?? '';
    els.filterSort.value = state.filters.sort;
    const count = activeFilterCount();
    els.filterCount.textContent = count ? String(count) : '';
    els.filterCount.hidden = count === 0;
  }

  function resetFilters({ render = true } = {}) {
    state.filters = { brands: [], currency: 'BYN', min: null, max: null, sort: 'newest' };
    if (render) {
      renderFilterControls();
      renderProducts();
    }
  }

  function applyFilterForm() {
    state.filters.brands = [...els.filterBrands.querySelectorAll('input:checked')].map((input) => input.value);
    const minValue = Number(els.filterMin.value);
    const maxValue = Number(els.filterMax.value);
    state.filters.min = els.filterMin.value === '' || !Number.isFinite(minValue) ? null : Math.max(0, minValue);
    state.filters.max = els.filterMax.value === '' || !Number.isFinite(maxValue) ? null : Math.max(0, maxValue);
    if (state.filters.min !== null && state.filters.max !== null && state.filters.min > state.filters.max) {
      [state.filters.min, state.filters.max] = [state.filters.max, state.filters.min];
    }
    state.filters.sort = els.filterSort.value || 'newest';
    state.visibleCount = PAGE_SIZE;
    renderFilterControls();
    renderProducts();
    els.filterPanel.hidden = true;
  }

  function renderProducts() {
    const filtered = filteredProducts();
    const items = filtered.slice(0, state.visibleCount);
    els.productGrid.innerHTML = items.map((product) => `
      <button type="button" class="product-card" data-product-id="${escapeHtml(product.id)}">
        <div class="product-card-image">${imageMarkup(getImage(product), `${product.brand || ''} ${product.name || ''}`)}</div>
        <div class="product-card-copy">
          <p class="product-card-brand">${escapeHtml(product.brand || 'Mirari')}</p>
          <h2 class="product-card-name">${escapeHtml(product.name || 'Товар')}</h2>
          <p class="product-card-price"><span>${escapeHtml(formatByn(product.priceByn || 0))}</span><span>${escapeHtml(formatRub(product.priceRub || product.price || 0))}</span></p>
        </div>
      </button>`).join('');
    els.empty.hidden = filtered.length > 0;
    els.loadMore.hidden = state.visibleCount >= filtered.length;
    els.filterResultCount.textContent = state.subcategory ? `${filtered.length.toLocaleString('ru-RU')} из ${state.currentItems.length.toLocaleString('ru-RU')}` : '';
    const count = activeFilterCount();
    els.filterCount.textContent = count ? String(count) : '';
    els.filterCount.hidden = count === 0;
    if (filtered.length) {
      els.status.textContent = `${filtered.length.toLocaleString('ru-RU')} ${plural(filtered.length, 'товар', 'товара', 'товаров')}`;
    } else if (state.currentItems.length) {
      els.status.textContent = 'По выбранным фильтрам ничего не найдено';
    }
  }

  function getBucketPath(id) {
    const digits = String(id).replace(/\D+/g, '');
    let bucket;
    if (digits) bucket = Number(digits) % 128;
    else {
      let hash = 0;
      for (const char of String(id)) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
      bucket = hash % 128;
    }
    return `catalog-data/details/bucket-${String(bucket).padStart(3, '0')}.json`;
  }

  async function loadProduct(id) {
    const key = String(id);
    let product = state.overrides.products?.[key] || state.currentItems.find((item) => String(item.id) === key) || null;
    try {
      const details = await fetchJson(getBucketPath(key));
      const base = (details.items || []).find((item) => String(item.id) === key);
      if (base) product = { ...base, ...(state.overrides.products?.[key] || {}) };
    } catch (error) {
      console.warn('Product detail fallback', error);
    }
    if (!product) throw new Error('Товар не найден');
    product = normalizeProduct(product);
    state.activeProduct = product;
    renderProduct(product);
    rememberRecent(product);
    return product;
  }

  function renderProduct(product) {
    els.screens.forEach((screen) => { screen.hidden = true; });
    els.productView.hidden = false;
    els.back.hidden = false;
    const images = (product.images || []).filter(Boolean).slice(0, 12);
    const galleryImages = images.length ? images : [''];
    els.productGallery.innerHTML = galleryImages.map((src, index) => `
      <figure data-gallery-index="${index}">${imageMarkup(baseUrl(src), `${product.name || 'Товар'}, фото ${index + 1}`)}</figure>`).join('');
    els.productDots.innerHTML = galleryImages.length > 1
      ? galleryImages.map((_, index) => `<button type="button" class="gallery-dot${index === 0 ? ' is-active' : ''}" data-gallery-dot="${index}" aria-label="Фото ${index + 1}"></button>`).join('')
      : '';
    els.productDots.hidden = galleryImages.length <= 1;
    els.productGallery.scrollLeft = 0;
    els.productBrand.textContent = product.brand || 'Mirari';
    els.productName.textContent = product.name || 'Товар';
    els.productPrice.innerHTML = `<span>${escapeHtml(formatByn(product.priceByn || 0))}</span><span class="price-divider">/</span><span>${escapeHtml(formatRub(product.priceRub || product.price || 0))}</span>`;
    const description = [cleanDescriptionPart(product.description), cleanDescriptionPart(product.details)].filter(Boolean).join('\n\n');
    els.productDescription.innerHTML = description
      ? description.split(/\n+/).map((line) => `<p>${escapeHtml(line)}</p>`).join('')
      : '<p>Подробности, доступные варианты и исполнение уточнит менеджер.</p>';
    const url = new URL(window.location.href);
    url.searchParams.set('product', String(product.id));
    history.pushState({ productId: product.id }, '', url);
    window.scrollTo({ top: 0, behavior: 'instant' });
    try { TG?.BackButton?.show?.(); } catch {}
  }

  function closeProduct({ replaceHistory = true } = {}) {
    state.activeProduct = null;
    els.productView.hidden = true;
    setTab('catalog');
    els.screens.find((screen) => screen.dataset.screen === 'catalog').hidden = false;
    if (replaceHistory) {
      const url = new URL(window.location.href);
      url.searchParams.delete('product');
      history.replaceState({}, '', url);
    }
    try { TG?.BackButton?.hide?.(); } catch {}
  }

  function addProductToCart(product, quantity = 1) {
    const id = String(product.id);
    const existing = state.cart.find((item) => item.id === id);
    if (existing) existing.quantity += quantity;
    else state.cart.push({
      id,
      quantity,
      name: product.name || 'Товар',
      brand: product.brand || 'Mirari',
      priceRub: Number(product.priceRub ?? product.price) || 0,
      priceByn: Number(product.priceByn) || 0,
      image: getImage(product)
    });
    saveCart();
    showToast('Добавлено в корзину');
  }

  function renderCart() {
    const quantity = cartQuantity();
    els.cartCountLabel.textContent = `${quantity} ${plural(quantity, 'товар', 'товара', 'товаров')}`;
    els.cartEmpty.hidden = state.cart.length > 0;
    els.cartSummary.hidden = state.cart.length === 0;
    els.cartList.hidden = state.cart.length === 0;
    els.cartList.innerHTML = state.cart.map((item) => `
      <article class="cart-item" data-cart-id="${escapeHtml(item.id)}">
        <div class="cart-item-image">${imageMarkup(item.image, `${item.brand} ${item.name}`)}</div>
        <div class="cart-item-copy">
          <p class="cart-item-brand">${escapeHtml(item.brand)}</p>
          <h2 class="cart-item-name">${escapeHtml(item.name)}</h2>
          <p class="cart-item-price">${escapeHtml(formatByn(item.priceByn))} / ${escapeHtml(formatRub(item.priceRub))}</p>
          <div class="cart-item-bottom">
            <div class="quantity-control">
              <button type="button" data-qty="minus" aria-label="Уменьшить">−</button>
              <span>${Number(item.quantity) || 1}</span>
              <button type="button" data-qty="plus" aria-label="Увеличить">+</button>
            </div>
            <button type="button" class="cart-remove" data-remove>Удалить</button>
          </div>
        </div>
      </article>`).join('');
    const totalByn = state.cart.reduce((sum, item) => sum + item.priceByn * item.quantity, 0);
    const totalRub = state.cart.reduce((sum, item) => sum + item.priceRub * item.quantity, 0);
    els.cartItemsCount.textContent = String(quantity);
    els.cartTotal.textContent = `${formatByn(totalByn)} / ${formatRub(totalRub)}`;
  }

  function productLink(id) {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('product', String(id));
    return url.href;
  }

  function managerUrl(message = '') {
    const username = String(CONFIG.managerUsername || '').replace(/^@/, '');
    if (!username || username === 'YOUR_MANAGER_USERNAME') return null;
    return `https://t.me/${username}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
  }

  function openManager(message = '') {
    const url = managerUrl(message);
    if (!url) {
      showToast('Укажите managerUsername в config.js');
      return;
    }
    try {
      if (TG?.openTelegramLink) TG.openTelegramLink(url);
      else window.open(url, '_blank', 'noopener,noreferrer');
    } catch { window.location.href = url; }
  }

  function buyProduct(product) {
    const message = [
      'Здравствуйте! Хочу уточнить по товару:', '',
      `${product.brand || 'Mirari'} — ${product.name || 'Товар'}`,
      `Цена: ${priceText(product)}`,
      `ID: ${product.id}`,
      `Ссылка: ${productLink(product.id)}`
    ].join('\n');
    openManager(message);
  }

  function checkoutCart() {
    if (!state.cart.length) return;
    const lines = ['Здравствуйте! Хочу заказать:', ''];
    state.cart.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.brand} — ${item.name}`);
      lines.push(`Количество: ${item.quantity}`);
      lines.push(`Цена: ${formatByn(item.priceByn)} / ${formatRub(item.priceRub)}`);
      lines.push(`Ссылка: ${productLink(item.id)}`);
      lines.push('');
    });
    const totalByn = state.cart.reduce((sum, item) => sum + item.priceByn * item.quantity, 0);
    const totalRub = state.cart.reduce((sum, item) => sum + item.priceRub * item.quantity, 0);
    lines.push(`Итого: ${formatByn(totalByn)} / ${formatRub(totalRub)}`);
    openManager(lines.join('\n'));
  }

  function renderProfile() {
    const user = TG?.initDataUnsafe?.user || null;
    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Гость Mirari';
    const username = user?.username ? `@${user.username}` : 'Персональный каталог';
    els.profileName.textContent = fullName;
    els.profileUsername.textContent = username;
    const initial = String(user?.first_name || user?.username || 'M').trim().charAt(0).toUpperCase();
    if (user?.photo_url) {
      els.profileAvatar.innerHTML = `<img src="${escapeHtml(user.photo_url)}" alt="${escapeHtml(fullName)}"><span hidden>${escapeHtml(initial)}</span>`;
      const img = els.profileAvatar.querySelector('img');
      img.addEventListener('error', () => { els.profileAvatar.innerHTML = `<span>${escapeHtml(initial)}</span>`; }, { once: true });
    } else {
      els.profileAvatar.innerHTML = `<span>${escapeHtml(initial)}</span>`;
    }
  }

  function rememberRecent(product) {
    try {
      const current = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      const next = [String(product.id), ...current.filter((id) => String(id) !== String(product.id))].slice(0, 20);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
  }

  async function performSearch(query) {
    state.searchQuery = String(query || '').trim();
    if (!state.searchQuery) {
      if (state.view === 'products' && state.category) await loadProducts(state.category, state.subcategory);
      else renderCategories();
      return;
    }
    if (state.searchQuery.length < 2) return;
    setLoading('Ищем по каталогу…');
    try {
      if (!state.searchItems) {
        const data = await fetchJson('catalog-data/search.json');
        state.searchItems = data.items || [];
      }
      const deleted = new Set((state.overrides.deletedIds || []).map(String));
      const results = state.searchItems
        .filter((item) => item.gender === state.gender && !deleted.has(String(item.id)) && productMatchesQuery(item, state.searchQuery))
        .map(normalizeProduct);
      const overrideMatches = Object.values(state.overrides.products || {})
        .map(normalizeProduct)
        .filter((item) => item?.gender === state.gender && !deleted.has(String(item.id)) && productMatchesQuery(item, state.searchQuery));
      const map = new Map(results.map((item) => [String(item.id), item]));
      overrideMatches.forEach((item) => map.set(String(item.id), item));
      state.currentItems = [...map.values()];
      state.view = 'products';
      state.category = null;
      state.subcategory = null;
      state.visibleCount = PAGE_SIZE;
      els.catalogTitle.textContent = `Поиск: ${state.searchQuery}`;
      els.categoryGrid.hidden = true;
      els.subcategoryGrid.hidden = true;
      els.productGrid.hidden = false;
      els.back.hidden = false;
      els.breadcrumbs.hidden = true;
      els.filterToolbar.hidden = true;
      els.filterPanel.hidden = true;
      renderProducts();
    } catch (error) {
      console.error(error);
      els.status.textContent = 'Поиск временно недоступен.';
    }
  }

  function goBack() {
    if (state.activeProduct) {
      closeProduct();
      return;
    }
    if (state.tab !== 'catalog') {
      setTab('catalog');
      return;
    }
    if (state.searchQuery) {
      state.searchQuery = '';
      els.searchInput.value = '';
      renderCategories();
      return;
    }
    if (state.view === 'products' && state.category) {
      const category = categoryData().find((item) => item.slug === state.category);
      if (category?.subcategories?.length && state.subcategory) renderSubcategories(state.category);
      else renderCategories();
      return;
    }
    if (state.view === 'subcategories') renderCategories();
  }

  function bindEvents() {
    els.navItems.forEach((item) => item.addEventListener('click', () => setTab(item.dataset.tab)));
    els.genderButtons.forEach((button) => button.addEventListener('click', () => {
      state.gender = button.dataset.gender;
      els.genderButtons.forEach((item) => item.classList.toggle('is-active', item === button));
      renderCategories();
    }));
    els.categoryGrid.addEventListener('click', (event) => {
      const card = event.target.closest('[data-category]');
      if (card) renderSubcategories(card.dataset.category);
    });
    els.subcategoryGrid.addEventListener('click', (event) => {
      const card = event.target.closest('[data-subcategory]');
      if (card) loadProducts(state.category, card.dataset.subcategory);
    });
    els.productGrid.addEventListener('click', async (event) => {
      const card = event.target.closest('[data-product-id]');
      if (!card) return;
      setLoading('Открываем товар…');
      try { await loadProduct(card.dataset.productId); } catch (error) { showToast(error.message || 'Товар не найден'); }
      clearLoading();
    });
    els.loadMore.addEventListener('click', () => { state.visibleCount += PAGE_SIZE; renderProducts(); });
    els.back.addEventListener('click', goBack);
    els.brand.addEventListener('click', () => { setTab('catalog'); renderCategories(); });
    els.breadcrumbs.addEventListener('click', (event) => {
      const crumb = event.target.closest('[data-crumb]');
      if (!crumb) return;
      if (crumb.dataset.crumb === 'root') renderCategories();
      if (crumb.dataset.crumb === 'category') renderSubcategories(state.category);
    });
    els.searchToggle.addEventListener('click', () => {
      els.searchPanel.hidden = !els.searchPanel.hidden;
      if (!els.searchPanel.hidden) setTimeout(() => els.searchInput.focus(), 50);
    });
    let searchTimer;
    els.searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => performSearch(els.searchInput.value), 350);
    });
    els.searchClear.addEventListener('click', () => {
      els.searchInput.value = '';
      performSearch('');
      els.searchInput.focus();
    });
    els.filterToggle.addEventListener('click', () => { els.filterPanel.hidden = !els.filterPanel.hidden; });
    els.filterCurrencyButtons.forEach((button) => button.addEventListener('click', () => {
      state.filters.currency = button.dataset.filterCurrency;
      els.filterCurrencyButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    }));
    els.filterApply.addEventListener('click', applyFilterForm);
    els.filterReset.addEventListener('click', () => {
      resetFilters();
      els.filterPanel.hidden = true;
    });
    els.productGallery.addEventListener('scroll', () => {
      const width = els.productGallery.clientWidth || 1;
      const index = Math.max(0, Math.min(els.productDots.children.length - 1, Math.round(els.productGallery.scrollLeft / width)));
      [...els.productDots.children].forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
    }, { passive: true });
    els.productDots.addEventListener('click', (event) => {
      const dot = event.target.closest('[data-gallery-dot]');
      if (!dot) return;
      els.productGallery.scrollTo({ left: Number(dot.dataset.galleryDot) * els.productGallery.clientWidth, behavior: 'smooth' });
    });
    document.querySelector('[data-reset-search]').addEventListener('click', () => { els.searchInput.value = ''; performSearch(''); });
    els.addToCart.addEventListener('click', () => state.activeProduct && addProductToCart(state.activeProduct));
    els.buyNow.addEventListener('click', () => state.activeProduct && buyProduct(state.activeProduct));
    els.cartList.addEventListener('click', (event) => {
      const itemNode = event.target.closest('[data-cart-id]');
      if (!itemNode) return;
      const item = state.cart.find((entry) => entry.id === itemNode.dataset.cartId);
      if (!item) return;
      if (event.target.closest('[data-qty="plus"]')) item.quantity += 1;
      if (event.target.closest('[data-qty="minus"]')) item.quantity = Math.max(1, item.quantity - 1);
      if (event.target.closest('[data-remove]')) state.cart = state.cart.filter((entry) => entry.id !== item.id);
      saveCart(); renderCart();
    });
    els.checkout.addEventListener('click', checkoutCart);
    document.querySelector('[data-go-catalog]').addEventListener('click', () => setTab('catalog'));
    document.querySelector('[data-contact-manager]').addEventListener('click', () => openManager('Здравствуйте! Хочу получить консультацию по каталогу Mirari.'));
    window.addEventListener('popstate', () => {
      const id = new URL(window.location.href).searchParams.get('product');
      if (id) loadProduct(id).catch(() => renderCategories());
      else if (state.activeProduct) closeProduct({ replaceHistory: false });
    });
    try { TG?.BackButton?.onClick?.(goBack); } catch {}

    let lastOverrideRefresh = 0;
    document.addEventListener('visibilitychange', async () => {
      if (document.hidden || !API_BASE || Date.now() - lastOverrideRefresh < 10000) return;
      lastOverrideRefresh = Date.now();
      try {
        state.overrides = await loadOverrides();
        if (state.view === 'products' && state.category) await loadProducts(state.category, state.subcategory);
        else if (state.view === 'categories') renderCategories();
      } catch (error) {
        console.warn('Mirari: catalog changes refresh failed', error);
      }
    });
  }

  async function bootstrap() {
    initializeTelegram();
    bindEvents();
    renderCartBadge();
    renderProfile();
    setLoading('Загружаем каталог…');
    try {
      const [manifest, overrides] = await Promise.all([
        fetchJson('catalog-data/manifest.json'),
        loadOverrides()
      ]);
      state.manifest = manifest;
      state.overrides = overrides && typeof overrides === 'object' ? overrides : state.overrides;
      renderCategories();
      clearLoading();
      const productId = new URL(window.location.href).searchParams.get('product');
      if (productId) await loadProduct(productId);
    } catch (error) {
      console.error(error);
      els.status.textContent = 'Не удалось загрузить каталог. Проверьте подключение к интернету.';
    }
  }

  bootstrap();
})();

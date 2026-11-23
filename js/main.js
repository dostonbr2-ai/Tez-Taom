
const STORAGE_CART_KEY = 'teztaom_cart_items';
const STORAGE_FAVS_KEY = 'teztaom_favorites';
const STORAGE_USER_KEY = 'teztaom_current_user';

let cart = [];
let favorites = [];

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function logoutUser() {
  localStorage.removeItem(STORAGE_USER_KEY);
  updateHeaderAuth();
  showToast("Hisobdan chiqildi", "box-arrow-right");
  if (window.location.pathname.includes('profil.html')) {
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 600);
  }
}

function updateHeaderAuth() {
  const user = getCurrentUser();
  const containers = document.querySelectorAll('.header-auth-container');
  containers.forEach(container => {
    if (!user) {
      container.innerHTML = `
        <div class="flex items-center gap-1.5 sm:gap-2">
          <a href="login.html" class="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-[#173B2D] hover:text-[#D95A2B] hover:bg-white/80 rounded-lg transition whitespace-nowrap">Kirish</a>
          <a href="register.html" class="btn-primary text-xs sm:text-sm font-semibold px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg whitespace-nowrap shadow-xs">Ro'yxatdan o'tish</a>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="flex items-center gap-1.5 sm:gap-2">
          <a href="profil.html" class="flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white border border-[#E8EDE9] text-xs font-semibold text-[#173B2D] hover:border-[#D95A2B] transition shadow-xs" title="${user.name}">
            <span class="w-6 h-6 rounded-full bg-[#DEEADC] text-[#173B2D] flex items-center justify-center font-bold text-[11px]">${user.initials || 'U'}</span>
            <span class="hidden md:inline max-w-[90px] truncate">${user.name}</span>
          </a>
          <button onclick="logoutUser()" title="Chiqish" class="w-8 h-8 rounded-lg bg-white border border-[#E8EDE9] flex items-center justify-center text-[#7B7266] hover:text-red-500 hover:bg-red-50 transition shadow-xs cursor-pointer">
            <i class="bi bi-box-arrow-right text-xs"></i>
          </button>
        </div>
      `;
    }
  });

  const mobileContainers = document.querySelectorAll('.mobile-auth-container');
  mobileContainers.forEach(container => {
    if (!user) {
      container.innerHTML = `
        <div class="p-3 bg-white rounded-xl border border-gray-100 flex flex-col gap-2 mb-3">
          <a href="register.html" class="btn-primary text-center py-2 text-xs font-semibold rounded-lg">Ro'yxatdan o'tish</a>
          <a href="login.html" class="text-center py-1.5 text-xs font-semibold text-[#173B2D] hover:text-[#D95A2B]">Tizimga kirish</a>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="p-3 bg-white rounded-xl border border-gray-100 flex items-center justify-between gap-3 mb-3">
          <a href="profil.html" class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-full bg-[#DEEADC] text-[#173B2D] font-bold text-xs flex items-center justify-center shrink-0">${user.initials || 'U'}</div>
            <div class="min-w-0">
              <div class="font-bold text-xs truncate text-[#173B2D]">${user.name}</div>
              <div class="text-[10px] text-[#7B7266] truncate">${user.phone || ''}</div>
            </div>
          </a>
          <button onclick="logoutUser()" class="text-xs text-red-500 font-semibold px-2 py-1 hover:bg-red-50 rounded-lg cursor-pointer">Chiqish</button>
        </div>
      `;
    }
  });
}

function loadStorage() {
  try {
    const savedCart = localStorage.getItem(STORAGE_CART_KEY);
    cart = savedCart ? JSON.parse(savedCart) : [];

    const savedFavs = localStorage.getItem(STORAGE_FAVS_KEY);
    favorites = savedFavs ? JSON.parse(savedFavs) : [1, 2];
  } catch (e) {
    console.error('Storage parse error:', e);
    cart = [];
    favorites = [];
  }
}

function saveCart() {
  localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
  updateCartBadges();
  renderCartDrawer();
}

function saveFavorites() {
  localStorage.setItem(STORAGE_FAVS_KEY, JSON.stringify(favorites));
}

function formatPrice(num) {
  return Number(num).toLocaleString('uz-UZ') + " so'm";
}

function addToCart(dishId, qty = 1) {
  const dish = TEZTAOM_DISHES.find(d => d.id === Number(dishId));
  if (!dish) return;

  const existing = cart.find(item => item.id === Number(dishId));
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({
      id: dish.id,
      title: dish.title,
      price: dish.price,
      image: dish.image,
      prepTime: dish.prepTime,
      quantity: qty
    });
  }

  saveCart();
  showToast(`"${dish.title}" savatchaga qo'shildi!`, "check-circle");

  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(b => {
    b.classList.remove('badge-bump');
    void b.offsetWidth;
    b.classList.add('badge-bump');
  });
}

function removeFromCart(dishId) {
  cart = cart.filter(item => item.id !== Number(dishId));
  saveCart();
}

function changeQuantity(dishId, delta) {
  const item = cart.find(i => i.id === Number(dishId));
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(dishId);
  } else {
    saveCart();
  }
}

function clearCart() {
  cart = [];
  saveCart();
  showToast("Savatcha tozalandi", "info-circle");
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getCartCount() {
  return cart.reduce((count, item) => count + item.quantity, 0);
}

function updateCartBadges() {
  const count = getCartCount();
  const total = getCartTotal();

  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(badge => {
    badge.textContent = count;
    if (count > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  });

  const totalDisplays = document.querySelectorAll('.cart-total-display');
  totalDisplays.forEach(el => {
    el.textContent = formatPrice(total);
  });

  const favBadge = document.getElementById('favoritesBadge');
  if (favBadge) {
    const favs = JSON.parse(localStorage.getItem('teztaom_favorites') || '[]');
    favBadge.textContent = favs.length;
    if (favs.length > 0) {
      favBadge.classList.remove('hidden');
    } else {
      favBadge.classList.add('hidden');
    }
  }
}

function openCartDrawer() {
  renderCartDrawer();
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  if (drawer && backdrop) {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function renderCartDrawer() {
  const container = document.getElementById('cartDrawerItems');
  const footerContainer = document.getElementById('cartDrawerFooter');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center p-8 text-[#7A9185]">
        <div class="w-20 h-20 rounded-full bg-[#FAF7F0] flex items-center justify-center text-4xl text-[#7A9185] mb-4">
          <i class="bi bi-bag-x"></i>
        </div>
        <h4 class="text-lg font-bold text-[#173B2D] mb-1">Savatchangiz bo'sh</h4>
        <p class="text-xs max-w-xs mb-6">Menyudan xohlagan lazzatli taomingizni tanlang va savatchaga qo'shing.</p>
        <a href="menyu.html" onclick="closeCartDrawer()" class="btn-primary text-xs font-semibold px-6 py-2.5">
          Menyuga o'tish →
        </a>
      </div>
    `;
    if (footerContainer) footerContainer.style.display = 'none';
    return;
  }

  if (footerContainer) footerContainer.style.display = 'block';

  let html = '<div class="divide-y divide-gray-100">';
  cart.forEach(item => {
    html += `
      <div class="py-4 flex items-center gap-3">
        <img src="${item.image}" alt="${item.title}" class="w-16 h-16 rounded-2xl object-cover shrink-0 border border-gray-100">
        <div class="flex-1 min-w-0">
          <h5 class="text-sm font-bold text-[#173B2D] truncate">${item.title}</h5>
          <span class="text-xs text-[#7A9185]">${item.prepTime}</span>
          <div class="text-sm font-extrabold text-[#173B2D] mt-1">${formatPrice(item.price)}</div>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex items-center border border-gray-200 rounded-full bg-gray-50 px-2 py-1">
            <button onclick="changeQuantity(${item.id}, -1)" class="w-5 h-5 flex items-center justify-center text-xs font-bold text-[#173B2D] hover:text-[#F07B36]">-</button>
            <span class="px-2 text-xs font-bold text-[#173B2D]">${item.quantity}</span>
            <button onclick="changeQuantity(${item.id}, 1)" class="w-5 h-5 flex items-center justify-center text-xs font-bold text-[#173B2D] hover:text-[#F07B36]">+</button>
          </div>
          <button onclick="removeFromCart(${item.id})" class="text-gray-400 hover:text-red-500 p-1 text-sm" title="O'chirish">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;

  const total = getCartTotal();
  const delivery = total > 100000 ? 0 : 15000;
  const grandTotal = total + delivery;

  const subTotalEl = document.getElementById('drawerSubtotal');
  const deliveryEl = document.getElementById('drawerDelivery');
  const grandTotalEl = document.getElementById('drawerGrandTotal');

  if (subTotalEl) subTotalEl.textContent = formatPrice(total);
  if (deliveryEl) deliveryEl.textContent = delivery === 0 ? "Bepul" : formatPrice(delivery);
  if (grandTotalEl) grandTotalEl.textContent = formatPrice(grandTotal);
}

function showToast(message, icon = 'check-circle') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.innerHTML = `
    <i class="bi bi-${icon} text-lg text-[#F07B36]"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

function openAiModal() {
  const modal = document.getElementById('aiRecommendModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeAiModal() {
  const modal = document.getElementById('aiRecommendModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function processAiRecommendation(e) {
  if (e) e.preventDefault();

  const budget = Number(document.getElementById('aiBudgetSelect')?.value || 50000);
  const mood = document.getElementById('aiMoodSelect')?.value || 'milliy';
  const person = Number(document.getElementById('aiPersonSelect')?.value || 1);

  let candidates = [...TEZTAOM_DISHES];

  if (mood === 'yengil') {
    candidates = candidates.filter(d => d.category === 'Salatlar' || d.category === "Sho'rvalar" || d.calories.includes('190'));
  } else if (mood === 'goshtli') {
    candidates = candidates.filter(d => d.subCategory === 'Go\'shtli' || d.category === 'Go\'shtli');
  } else if (mood === 'issiq') {
    candidates = candidates.filter(d => d.category === 'Sho\'rvalar' || d.title.includes('osh') || d.title.includes('lag\'mon'));
  }

  let selected = [];
  let currentSum = 0;

  for (let dish of candidates) {
    if (currentSum + dish.price <= budget * person) {
      selected.push(dish);
      currentSum += dish.price;
    }
  }

  if (selected.length === 0) {
    selected = [TEZTAOM_DISHES[0]];
    currentSum = TEZTAOM_DISHES[0].price;
  }

  const resultContainer = document.getElementById('aiResultContainer');
  if (resultContainer) {
    let dishesHtml = selected.map(d => `
      <div class="flex items-center gap-3 bg-[#FAF7F0] p-3 rounded-2xl border border-[#E8EDE9]">
        <img src="${d.image}" alt="${d.title}" class="w-14 h-14 rounded-xl object-cover shrink-0">
        <div class="flex-1 min-w-0">
          <h6 class="text-sm font-bold text-[#173B2D] truncate">${d.title}</h6>
          <span class="text-xs text-[#7A9185]">${d.prepTime} • ${d.calories}</span>
        </div>
        <div class="text-sm font-extrabold text-[#173B2D]">${formatPrice(d.price)}</div>
      </div>
    `).join('');

    resultContainer.innerHTML = `
      <div class="mt-6 pt-6 border-t border-gray-100">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-[#F07B36] uppercase tracking-wider flex items-center gap-1">
            <i class="bi bi-stars"></i> AI Saralagan Taklif:
          </span>
          <span class="text-xs font-extrabold text-[#173B2D]">Jami: ${formatPrice(currentSum)}</span>
        </div>
        <div class="space-y-2 mb-4">
          ${dishesHtml}
        </div>
        <button onclick="addAiComboToCart([${selected.map(s => s.id).join(',')}])" class="w-full btn-accent font-semibold py-3 text-sm flex items-center justify-center gap-2 shadow-md">
          <i class="bi bi-bag-plus"></i> Barchasini savatchaga qo'shish (${formatPrice(currentSum)})
        </button>
      </div>
    `;
  }
}

function addAiComboToCart(ids) {
  ids.forEach(id => addToCart(id, 1));
  closeAiModal();
  openCartDrawer();
  showToast("AI taklifi savatchaga to'liq qo'shildi!", "magic");
}

function handleHeaderSearch(event) {
  if (event.key === 'Enter' || event.type === 'click') {
    const input = document.getElementById('headerSearchInput');
    if (!input) return;
    const q = input.value.trim();
    if (q) {
      window.location.href = `menyu.html?search=${encodeURIComponent(q)}`;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadStorage();
  updateCartBadges();
  updateHeaderAuth();

  const cartBtns = document.querySelectorAll('.open-cart-btn');
  cartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  });

  const closeBtn = document.getElementById('closeCartDrawerBtn');
  const backdrop = document.getElementById('drawerBackdrop');
  if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
  if (backdrop) backdrop.addEventListener('click', closeCartDrawer);

  const aiBtns = document.querySelectorAll('.open-ai-modal-btn');
  aiBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openAiModal();
    });
  });

  const searchInput = document.getElementById('headerSearchInput');
  if (searchInput) {
    searchInput.addEventListener('keydown', handleHeaderSearch);
  }
});

function toggleMobileNav() {
  const drawer = document.getElementById('mobileNavDrawer');
  const backdrop = document.getElementById('mobileNavBackdrop');
  if (!drawer || !backdrop) return;

  const isActive = drawer.classList.contains('active');
  if (isActive) {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  } else {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

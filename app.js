// ==========================================================================
// SOLIDERE ATACADISTA x LATTAFA BRASIL - APPLICATION JAVASCRIPT
// ==========================================================================

let productsData = [];
let cart = [];
let isWholesaleMode = false;
let currentSlide = 0;
const totalSlides = 3;
let slideInterval;

const SOLIDERE_PHONE = '5562984522644'; // WhatsApp Solidere Atacadista
const INSTAGRAM_URL = 'https://www.instagram.com/solidere_atacadista/';

document.addEventListener('DOMContentLoaded', async () => {
  initSlider();
  await loadProducts();
  setupEventListeners();
  initCalculator();
});

// ---------------------------------------------------------------------------
// 1. PRODUCTS LOADING & RENDERING
// ---------------------------------------------------------------------------
async function loadProducts() {
  try {
    const res = await fetch('assets/products.json');
    productsData = await res.json();
    renderProducts(productsData);
  } catch (err) {
    console.error('Erro ao carregar catálogo:', err);
  }
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #777;">
        <i class="fas fa-search" style="font-size: 32px; margin-bottom: 12px; color: #d4af37;"></i>
        <p>Nenhum perfume encontrado com esse termo. Tente buscar por "Asad", "Yara", "Khamrah" ou selecione uma categoria.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(p => {
    const displayPrice = isWholesaleMode ? p.wholesalePrice : p.price;
    const installments = (displayPrice / 10).toFixed(2).replace('.', ',');
    const formattedPrice = displayPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formattedOldPrice = p.listPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formattedWholesale = p.wholesalePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const discountPct = Math.round(((p.listPrice - p.price) / p.listPrice) * 100);

    return `
      <div class="product-card" data-id="${p.id}" data-category="${p.category}">
        <span class="badge-tag">100% Original</span>
        ${discountPct > 0 ? `<span class="badge-atacado-discount">-${discountPct}% OFF</span>` : ''}
        
        <div class="product-img-box">
          <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='assets/images/cat-lattafa.png'">
        </div>
        
        <span class="product-category-label">${p.category} · Lattafa</span>
        <h3 class="product-title" title="${p.name}">${p.name}</h3>
        
        <div class="price-box">
          <div class="price-retail-row">
            <span class="price-old">${formattedOldPrice}</span>
            <span class="price-current">${formattedPrice}</span>
          </div>
          <div class="price-installments">ou 10x de R$ ${installments} sem juros</div>
          
          <div class="price-wholesale-highlight">
            <span class="wholesale-label"><i class="fas fa-boxes-stacked"></i> No Atacado:</span>
            <span class="wholesale-value">${formattedWholesale}</span>
          </div>
        </div>
        
        <div class="card-actions">
          <button class="btn-add-cart" onclick="addToCart('${p.id}')">
            <i class="fas fa-cart-plus"></i> Adicionar
          </button>
          <button class="btn-quick-zap" title="Orçamento Rápido via WhatsApp" onclick="quoteWhatsApp('${p.id}')">
            <i class="fab fa-whatsapp"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ---------------------------------------------------------------------------
// 2. HERO CAROUSEL SLIDER
// ---------------------------------------------------------------------------
function initSlider() {
  const track = document.getElementById('slideTrack');
  const prevBtn = document.getElementById('slidePrev');
  const nextBtn = document.getElementById('slideNext');
  if (!track) return;

  function goToSlide(index) {
    currentSlide = (index + totalSlides) % totalSlides;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); resetInterval(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); resetInterval(); });

  function startInterval() {
    slideInterval = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 5500);
  }

  function resetInterval() {
    clearInterval(slideInterval);
    startInterval();
  }

  startInterval();
}

// ---------------------------------------------------------------------------
// 3. WHOLESALE / RETAIL TOGGLE
// ---------------------------------------------------------------------------
function setPriceMode(isWholesale) {
  isWholesaleMode = isWholesale;
  const btnRetail = document.getElementById('btnModeRetail');
  const btnWholesale = document.getElementById('btnModeWholesale');
  
  if (btnRetail && btnWholesale) {
    if (isWholesale) {
      btnWholesale.classList.add('active');
      btnRetail.classList.remove('active');
    } else {
      btnRetail.classList.add('active');
      btnWholesale.classList.remove('active');
    }
  }

  const notice = document.getElementById('wholesaleNoticeBanner');
  if (notice) {
    notice.style.display = isWholesale ? 'block' : 'none';
  }

  renderProducts(filterCurrentProducts());
}

// ---------------------------------------------------------------------------
// 4. FILTER & SEARCH
// ---------------------------------------------------------------------------
let activeCategory = 'all';

function filterByCategory(cat) {
  activeCategory = cat;
  
  // Highlight active link
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.category === cat);
  });

  renderProducts(filterCurrentProducts());
  
  // Scroll to products
  const section = document.getElementById('productsSection');
  if (section) section.scrollIntoView({ behavior: 'smooth' });
}

function filterCurrentProducts() {
  const searchInput = document.getElementById('searchInput');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  return productsData.filter(p => {
    const matchesCat = (activeCategory === 'all' || p.category.toLowerCase().includes(activeCategory.toLowerCase()));
    const matchesQuery = !query || p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
    return matchesCat && matchesQuery;
  });
}

// ---------------------------------------------------------------------------
// 5. SHOPPING CART & WHATSAPP CHECKOUT
// ---------------------------------------------------------------------------
function addToCart(productId) {
  const product = productsData.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  updateCartUI();
  openCartDrawer();
}

function updateCartQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }

  updateCartUI();
}

function updateCartUI() {
  const countEl = document.getElementById('cartCount');
  const itemsContainer = document.getElementById('cartItemsList');
  const subtotalEl = document.getElementById('cartSubtotal');

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  if (countEl) countEl.innerText = totalItems;

  const subtotal = cart.reduce((sum, item) => {
    const price = isWholesaleMode ? item.wholesalePrice : item.price;
    return sum + (price * item.qty);
  }, 0);

  if (subtotalEl) {
    subtotalEl.innerText = subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  if (itemsContainer) {
    if (cart.length === 0) {
      itemsContainer.innerHTML = `
        <div style="text-align: center; padding: 40px 10px; color: #888;">
          <i class="fas fa-shopping-bag" style="font-size: 32px; color: #d4af37; margin-bottom: 12px;"></i>
          <p>Sua sacola está vazia.</p>
          <span style="font-size: 12px; color: #aaa;">Selecione os perfumes Lattafa para montar seu pedido.</span>
        </div>
      `;
    } else {
      itemsContainer.innerHTML = cart.map(item => {
        const itemPrice = isWholesaleMode ? item.wholesalePrice : item.price;
        return `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price">${itemPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
              <div class="cart-item-qty">
                <button class="qty-btn" onclick="updateCartQty('${item.id}', -1)">-</button>
                <span style="font-size: 13px; font-weight: 700;">${item.qty}</span>
                <button class="qty-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

function openCartDrawer() {
  document.getElementById('cartOverlay')?.classList.add('active');
  document.getElementById('cartDrawer')?.classList.add('active');
}

function closeCartDrawer() {
  document.getElementById('cartOverlay')?.classList.remove('active');
  document.getElementById('cartDrawer')?.classList.remove('active');
}

async function checkoutWhatsApp() {
  if (cart.length === 0) {
    alert('Sua sacola está vazia!');
    return;
  }

  const modeText = isWholesaleMode ? 'ATACADO' : 'VAREJO';
  let total = 0;
  const itemsList = cart.map(item => {
    const price = isWholesaleMode ? item.wholesalePrice : item.price;
    const sub = price * item.qty;
    total += sub;
    return { id: item.id, name: item.name, qty: item.qty, price, subtotal: sub };
  });

  // Salva no Supabase (se configurado)
  let orderCode = 'SOL-' + Math.floor(100000 + Math.random() * 900000);
  if (typeof window.recordOrderToSupabase === 'function') {
    try {
      const code = await window.recordOrderToSupabase({
        isWholesale: isWholesaleMode,
        items: itemsList,
        itemsCount: cart.reduce((s, i) => s + i.qty, 0),
        subtotal: total
      });
      if (code) orderCode = code;
    } catch (e) {
      console.warn("Supabase background log:", e);
    }
  }

  let message = `Olá Solidere Atacadista! 👋\n`;
  message += `Gostaria de fechar meu pedido de perfumes Lattafa (${modeText}) [Ref: #${orderCode}]:\n\n`;

  itemsList.forEach((item, idx) => {
    message += `${idx + 1}. *${item.name}*\n   Qtd: ${item.qty} un | R$ ${item.subtotal.toFixed(2)}\n`;
  });

  message += `\n💰 *Total Estimado:* R$ ${total.toFixed(2)}\n`;
  message += `📦 *Forma de Envio:* Gostaria de cotar o frete para minha cidade.\n`;
  message += `Aguardando a confirmação do vendedor!`;

  const url = `https://wa.me/${SOLIDERE_PHONE}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

function quoteWhatsApp(productId) {
  const p = productsData.find(item => item.id === productId);
  if (!p) return;

  const msg = `Olá Solidere Atacadista! 👋\nTenho interesse no perfume *${p.name}*.\n` +
              `Poderiam me informar valores para compra no Atacado/Varejo e prazo de envio? Obrigado!`;
  const url = `https://wa.me/${SOLIDERE_PHONE}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// ---------------------------------------------------------------------------
// 6. PROFIT CALCULATOR FOR RESELLERS
// ---------------------------------------------------------------------------
function initCalculator() {
  const slider = document.getElementById('calcQuantitySlider');
  const qtyLabel = document.getElementById('calcQtyLabel');
  const investEl = document.getElementById('calcInvestTotal');
  const revEl = document.getElementById('calcRevenueTotal');
  const profitEl = document.getElementById('calcProfitTotal');

  if (!slider) return;

  function updateCalc() {
    const qty = parseInt(slider.value, 10);
    qtyLabel.innerText = `${qty} frascos`;

    // Média de atacado Solidere: R$ 259,90 | Venda sugerida Lattafa Brasil: R$ 399,90
    const avgWholesale = 259.90;
    const avgRetail = 399.90;

    const totalInvest = qty * avgWholesale;
    const totalRev = qty * avgRetail;
    const totalProfit = totalRev - totalInvest;

    investEl.innerText = totalInvest.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    revEl.innerText = totalRev.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    profitEl.innerText = `+ ${totalProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
  }

  slider.addEventListener('input', updateCalc);
  updateCalc();
}

function quoteCalculatorWhatsApp() {
  const slider = document.getElementById('calcQuantitySlider');
  const qty = slider ? slider.value : '10';
  const msg = `Olá Solidere Atacadista! 👋\nUtilizei a calculadora de revenda no site e quero solicitar uma cotação para *${qty} perfumes Lattafa no Atacado*. Como funciona o envio para minha região?`;
  window.open(`https://wa.me/${SOLIDERE_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ---------------------------------------------------------------------------
// 7. EVENT LISTENERS
// ---------------------------------------------------------------------------
function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderProducts(filterCurrentProducts());
    });
  }

  document.getElementById('cartBtn')?.addEventListener('click', openCartDrawer);
  document.getElementById('cartCloseBtn')?.addEventListener('click', closeCartDrawer);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCartDrawer);
  document.getElementById('checkoutZapBtn')?.addEventListener('click', checkoutWhatsApp);
}

/* ============================================
   VENTAS A&A - SCRIPT PRINCIPAL
   ============================================ */

// ─── ESTADO GLOBAL ─────────────────────────
let cart = [];
let products = [];
let currentCategory = 'all';
let currentProductId = null;
let currentQty = 1;
let currentUser = null;

// ─── PRODUCTOS POR DEFECTO ──────────────────
const defaultProducts = [
  {
    id: 'p1', name: 'Netflix Premium 4K', category: 'streaming',
    price: 35000, oldPrice: 60000, stock: 50,
    img: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&q=80',
    desc: 'Cuenta Netflix Premium Ultra HD 4K. Disfruta de todo el contenido en la mejor calidad. Pantallas ilimitadas, descarga de contenido, sin anuncios.',
    featured: true
  },
  {
    id: 'p2', name: 'Disney+ Anual', category: 'streaming',
    price: 45000, oldPrice: 0, stock: 30,
    img: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&q=80',
    desc: 'Acceso completo a Disney+, Marvel, Star Wars y National Geographic. Un año de entretenimiento sin interrupciones.',
    featured: false
  },
  {
    id: 'p3', name: 'Freidora de Aire 5L', category: 'hogar',
    price: 185000, oldPrice: 250000, stock: 15,
    img: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80',
    desc: 'Freidora de aire caliente 5 litros, 1700W. Cocina sin aceite de forma saludable. Incluye canasta antiadherente y recetario.',
    featured: true
  },
  {
    id: 'p4', name: 'Licuadora Portátil USB', category: 'hogar',
    price: 65000, oldPrice: 90000, stock: 8,
    img: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&q=80',
    desc: 'Licuadora personal recargable por USB. Ideal para smoothies, batidos y jugos naturales en cualquier lugar.',
    featured: false
  },
  {
    id: 'p5', name: 'Kit Skincare Coreano', category: 'belleza',
    price: 120000, oldPrice: 150000, stock: 20,
    img: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&q=80',
    desc: 'Kit completo de cuidado facial coreano. Incluye sérum, tónico, crema hidratante y protector solar. Piel radiante garantizada.',
    featured: true
  },
  {
    id: 'p6', name: 'Rizador Automático 360°', category: 'belleza',
    price: 89000, oldPrice: 130000, stock: 12,
    img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80',
    desc: 'Rizador automático con tecnología cerámica 360°. Rulos definidos sin esfuerzo. Con protector de calor y temperatura ajustable.',
    featured: false
  },
  {
    id: 'p7', name: 'Audífonos Bluetooth Pro', category: 'tecnologia',
    price: 145000, oldPrice: 200000, stock: 25,
    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    desc: 'Audífonos inalámbricos con cancelación de ruido activa. Batería de 30 horas, sonido HiFi, micrófono incorporado.',
    featured: true
  },
  {
    id: 'p8', name: 'Smartwatch Fitness Pro', category: 'relojes',
    price: 195000, oldPrice: 280000, stock: 18,
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    desc: 'Reloj inteligente con monitor de salud, GPS, resistente al agua 5ATM. Compatible con iOS y Android. Pantalla AMOLED.',
    featured: true
  },
  {
    id: 'p9', name: 'Reloj Elegante Clásico', category: 'relojes',
    price: 250000, oldPrice: 0, stock: 5,
    img: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=400&q=80',
    desc: 'Reloj análogo con caja de acero inoxidable y correa de cuero genuino. Movimiento japonés de alta precisión.',
    featured: false
  },
  {
    id: 'p10', name: 'Cargador Inalámbrico 3 en 1', category: 'tecnologia',
    price: 85000, oldPrice: 120000, stock: 40,
    img: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&q=80',
    desc: 'Base de carga inalámbrica para celular, smartwatch y audífonos simultáneamente. Carga rápida 15W.',
    featured: false
  },
  {
    id: 'p11', name: 'Caneca Térmica 1L', category: 'otros',
    price: 55000, oldPrice: 75000, stock: 35,
    img: 'https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=400&q=80',
    desc: 'Termo de acero inoxidable. Mantiene bebidas frías 24 horas y calientes 12 horas. Libre de BPA, tapa hermética.',
    featured: false
  },
  {
    id: 'p12', name: 'Mochila Antirrobo USB', category: 'otros',
    price: 165000, oldPrice: 220000, stock: 10,
    img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
    desc: 'Mochila con puerto USB externo, bolsillo antirrobo oculto, compartimento acolchado para laptop 15.6". Impermeable.',
    featured: true
  }
];

// ─── INICIALIZACIÓN ──────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderProducts();
  updateCartBadge();
  loadSocialLinks();
  loadLogoDisplay();
  checkUserSession();
});

// ─── DATOS ──────────────────────────────────
function loadData() {
  const stored = localStorage.getItem('aa_products');
  products = stored ? JSON.parse(stored) : defaultProducts;
  if (!stored) saveProducts();

  const cartStored = localStorage.getItem('aa_cart');
  cart = cartStored ? JSON.parse(cartStored) : [];
}

function saveProducts() {
  localStorage.setItem('aa_products', JSON.stringify(products));
}

function saveCart() {
  localStorage.setItem('aa_cart', JSON.stringify(cart));
}

// ─── RENDER PRODUCTOS ────────────────────────
function renderProducts() {
  const grid = document.getElementById('products-grid');
  const empty = document.getElementById('empty-state');
  if (!grid) return;

  const query = document.getElementById('search-input')?.value.toLowerCase() || '';
  let filtered = products.filter(p => {
    const matchCat = currentCategory === 'all' || p.category === currentCategory;
    const matchQ = p.name.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query);
    return matchCat && matchQ;
  });

  const countEl = document.getElementById('product-count');
  if (countEl) countEl.textContent = `${filtered.length} productos`;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  grid.innerHTML = filtered.map(p => {
    const hasOldPrice = p.oldPrice && p.oldPrice > 0;
    const noStock = p.stock <= 0;
    return `
      <div class="product-card" onclick="openProduct('${p.id}')">
        <div class="product-img">
          ${p.img ? `<img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.parentNode.innerHTML='<div class=no-img><i class=fas fa-image></i></div>'" />` : `<div class="no-img"><i class="fas fa-image"></i></div>`}
          ${p.featured ? '<span class="badge-featured">⭐ Destacado</span>' : ''}
          ${p.stock > 0 && p.stock <= 5 ? `<span class="badge-stock-low">Últimas ${p.stock}</span>` : ''}
          ${noStock ? '<div class="badge-no-stock">AGOTADO</div>' : ''}
        </div>
        <div class="product-info">
          <div class="product-category-tag">${categoryLabel(p.category)}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-price-row">
            <span class="product-price">${formatPrice(p.price)}</span>
            ${hasOldPrice ? `<span class="product-old-price">${formatPrice(p.oldPrice)}</span>` : ''}
          </div>
          <button class="btn-add" onclick="event.stopPropagation(); addToCart('${p.id}')" ${noStock ? 'disabled' : ''}>
            <i class="fas fa-cart-plus"></i> ${noStock ? 'Agotado' : 'Agregar'}
          </button>
        </div>
      </div>`;
  }).join('');
}

function filterProducts() { renderProducts(); }

function setCategory(cat, btn) {
  currentCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else {
    const target = document.querySelector(`[data-cat="${cat}"]`);
    if (target) target.classList.add('active');
  }
  const titles = {
    all: '✨ Todos los Productos', streaming: '📺 Streaming',
    hogar: '🏠 Hogar', belleza: '💄 Belleza',
    tecnologia: '💻 Tecnología', relojes: '⌚ Relojes', otros: '📦 Otros'
  };
  const titleEl = document.getElementById('catalog-title');
  if (titleEl) titleEl.textContent = titles[cat] || 'Productos';
  renderProducts();
  scrollToCatalog();
}

function goHome() {
  setCategory('all');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToCatalog() {
  document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
}

// ─── PRODUCTO DETALLE ────────────────────────
function openProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  currentProductId = id;
  currentQty = 1;

  document.getElementById('modal-img').src = p.img || '';
  document.getElementById('modal-name').textContent = p.name;
  document.getElementById('modal-price').textContent = formatPrice(p.price);
  document.getElementById('modal-desc').textContent = p.desc || 'Sin descripción disponible.';
  document.getElementById('modal-category').textContent = categoryLabel(p.category);
  document.getElementById('modal-qty').textContent = 1;

  const stockEl = document.getElementById('modal-stock');
  if (p.stock <= 0) {
    stockEl.innerHTML = '<span style="color:var(--danger)"><i class="fas fa-times-circle"></i> Agotado</span>';
  } else if (p.stock <= 5) {
    stockEl.innerHTML = `<span style="color:var(--primary)"><i class="fas fa-exclamation-circle"></i> Solo quedan ${p.stock} unidades</span>`;
  } else {
    stockEl.innerHTML = `<span><i class="fas fa-check-circle" style="color:var(--success)"></i> En stock (${p.stock} disponibles)</span>`;
  }

  openModal('product-modal');
}

function changeQty(delta) {
  const p = products.find(x => x.id === currentProductId);
  if (!p) return;
  currentQty = Math.max(1, Math.min(currentQty + delta, p.stock));
  document.getElementById('modal-qty').textContent = currentQty;
}

function addToCartFromModal() {
  if (!currentProductId) return;
  addToCart(currentProductId, currentQty);
  closeProductModal();
}

function buyDirectWhatsApp() {
  const p = products.find(x => x.id === currentProductId);
  if (!p) return;
  const msg = `Hola! Quiero comprar:\n- ${p.name} x${currentQty}\nTotal: ${formatPrice(p.price * currentQty)}\n\n¿Está disponible?`;
  window.open(`https://wa.me/573146542604?text=${encodeURIComponent(msg)}`, '_blank');
}

function closeProductModal(e) {
  if (!e || e.target.id === 'product-modal') closeModal('product-modal');
}

// ─── CARRITO ─────────────────────────────────
function addToCart(id, qty = 1) {
  const p = products.find(x => x.id === id);
  if (!p || p.stock <= 0) { showToast('Producto sin stock disponible', 'error'); return; }

  const existing = cart.find(x => x.id === id);
  if (existing) {
    const newQty = existing.qty + qty;
    if (newQty > p.stock) { showToast(`Solo hay ${p.stock} en stock`, 'error'); return; }
    existing.qty = newQty;
  } else {
    cart.push({ id, qty, price: p.price, name: p.name, img: p.img });
  }

  saveCart();
  updateCartBadge();
  showToast(`✅ ${p.name} agregado al carrito`, 'success');
}

function removeFromCart(id) {
  cart = cart.filter(x => x.id !== id);
  saveCart();
  updateCartBadge();
  renderCart();
}

function updateCartQty(id, delta) {
  const item = cart.find(x => x.id === id);
  const p = products.find(x => x.id === id);
  if (!item || !p) return;
  item.qty = Math.max(1, Math.min(item.qty + delta, p.stock));
  item.price = p.price;
  saveCart();
  updateCartBadge();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartBadge();
  renderCart();
}

function updateCartBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = total;
}

function openCart() {
  renderCart();
  openModal('cart-modal');
}

function closeCart(e) {
  if (!e || e.target.id === 'cart-modal') closeModal('cart-modal');
}

function renderCart() {
  const list = document.getElementById('cart-items-list');
  const footer = document.getElementById('cart-footer');
  if (!list) return;

  if (cart.length === 0) {
    list.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-cart"></i><p>Tu carrito está vacío</p></div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'flex';

  list.innerHTML = cart.map(item => {
    const p = products.find(x => x.id === item.id);
    const price = p ? p.price : item.price;
    return `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.img || ''}" alt="${item.name}" onerror="this.src=''" />
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatPrice(price * item.qty)}</div>
        </div>
        <div class="cart-item-controls">
          <button class="cart-qty-btn" onclick="updateCartQty('${item.id}',-1)">−</button>
          <span class="cart-item-qty">${item.qty}</span>
          <button class="cart-qty-btn" onclick="updateCartQty('${item.id}',1)">+</button>
          <button class="cart-remove" onclick="removeFromCart('${item.id}')"><i class="fas fa-trash"></i></button>
        </div>
      </div>`;
  }).join('');

  const total = cart.reduce((s, i) => {
    const p = products.find(x => x.id === i.id);
    return s + (p ? p.price : i.price) * i.qty;
  }, 0);
  const totalEl = document.getElementById('cart-total-amount');
  if (totalEl) totalEl.textContent = formatPrice(total);
}

// ─── CHECKOUT ────────────────────────────────
function openCheckout() {
  if (cart.length === 0) { showToast('Tu carrito está vacío', 'error'); return; }
  closeCart();
  renderCheckoutSummary();
  openModal('checkout-modal');
}

function closeCheckout(e) {
  if (!e || e.target.id === 'checkout-modal') closeModal('checkout-modal');
}

function renderCheckoutSummary() {
  const el = document.getElementById('checkout-summary');
  if (!el) return;
  const total = cart.reduce((s, i) => {
    const p = products.find(x => x.id === i.id);
    return s + (p ? p.price : i.price) * i.qty;
  }, 0);

  el.innerHTML = `
    <strong>📦 Resumen del pedido:</strong>
    ${cart.map(i => {
      const p = products.find(x => x.id === i.id);
      const price = p ? p.price : i.price;
      return `<div class="cs-item"><span>${i.name} x${i.qty}</span><span>${formatPrice(price * i.qty)}</span></div>`;
    }).join('')}
    <div class="cs-item"><span>🛍️ Subtotal productos</span>
    <span>${formatPrice(total)}</span></div>
    <div class="cs-item"><span>🚚 Costo de envío</span><span>$14.500</span></div>
    <div class="cs-total"><span>💰 TOTAL A PAGAR</span><span>${formatPrice(total + 14500)}</span></div>`;
       
}

function submitOrder(e) {
  e.preventDefault();
  const name    = document.getElementById('f-name').value.trim();
  const address = document.getElementById('f-address').value.trim();
  const city    = document.getElementById('f-city').value.trim();
  const phone   = document.getElementById('f-phone').value.trim();
  const email   = document.getElementById('f-email').value.trim();
  const notes   = document.getElementById('f-notes').value.trim();

  const total = cart.reduce((s, i) => {
    const p = products.find(x => x.id === i.id);
    return s + (p ? p.price : i.price) * i.qty;
  }, 0);

  const items = cart.map(i => {
    const p = products.find(x => x.id === i.id);
    const price = p ? p.price : i.price;
    return `• ${i.name} x${i.qty} = ${formatPrice(price * i.qty)}`;
  }).join('\n');

  const msg = `🛒 *NUEVO PEDIDO - Ventas A&A*\n\n` +
    `👤 *Cliente:* ${name}\n📍 *Dirección:* ${address}, ${city}\n📞 *Teléfono:* ${phone}\n📧 *Correo:* ${email}\n\n` +
    `📦 *Productos:*\n${items}\n\n`🛍️ *Subtotal productos:* ${formatPrice(total)}\n` +
    `🚚 *Costo de envío:* $14.500\n` +
    `💰 *TOTAL A PAGAR: ${formatPrice(total + 14500)}*` +
    (notes ? `\n\n📝 *Observaciones:* ${notes}` : '');

  // Decrease stock
  cart.forEach(item => {
    const p = products.find(x => x.id === item.id);
    if (p) p.stock = Math.max(0, p.stock - item.qty);
  });
  saveProducts();

  // Save order
  saveOrder({ name, address, city, phone, email, notes, items: [...cart], total, date: new Date().toISOString() });

  window.open(`https://wa.me/573146542604?text=${encodeURIComponent(msg)}`, '_blank');

  clearCart();
  closeCheckout();
  showToast('¡Pedido enviado por WhatsApp! 🎉', 'success');
}

function saveOrder(order) {
  const orders = JSON.parse(localStorage.getItem('aa_orders') || '[]');
  order.id = 'o' + Date.now();
  orders.unshift(order);
  localStorage.setItem('aa_orders', JSON.stringify(orders));
}

// ─── USUARIOS ────────────────────────────────
function checkUserSession() {
  const u = localStorage.getItem('aa_current_user');
  if (u) {
    currentUser = JSON.parse(u);
    updateUserUI();
  }
}

function updateUserUI() {
  const label = document.getElementById('user-label');
  if (label) label.textContent = currentUser ? currentUser.name.split(' ')[0] : 'Entrar';
}

function openUserModal() {
  if (currentUser) {
    document.getElementById('login-form-section').style.display = 'none';
    document.getElementById('register-form-section').style.display = 'none';
    document.getElementById('logged-section').style.display = 'block';
    document.getElementById('logged-name').textContent = `Hola, ${currentUser.name}!`;
    document.getElementById('logged-email-display').textContent = currentUser.email;
  } else {
    switchUserTab('login');
  }
  openModal('user-modal');
}

function closeUserModal(e) {
  if (!e || e.target.id === 'user-modal') closeModal('user-modal');
}

function switchUserTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  document.getElementById('login-form-section').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('register-form-section').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('logged-section').style.display = 'none';
}

function doLogin() {
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value;
  if (!user || !pass) { showToast('Completa todos los campos', 'error'); return; }

  const users = JSON.parse(localStorage.getItem('aa_users') || '[]');
  const found = users.find(u => (u.username === user || u.email === user) && u.password === pass);
  if (!found) { showToast('Credenciales incorrectas', 'error'); return; }

  currentUser = found;
  localStorage.setItem('aa_current_user', JSON.stringify(found));
  updateUserUI();
  closeUserModal();
  showToast(`Bienvenido, ${found.name}! 👋`, 'success');
}

function doRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const uname = document.getElementById('reg-user').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value;

  if (!name || !uname || !email || !pass) { showToast('Completa todos los campos', 'error'); return; }
  if (pass.length < 6) { showToast('La contraseña debe tener al menos 6 caracteres', 'error'); return; }

  const users = JSON.parse(localStorage.getItem('aa_users') || '[]');
  if (users.find(u => u.username === uname || u.email === email)) {
    showToast('Usuario o correo ya registrado', 'error'); return;
  }

  const newUser = { id: 'u' + Date.now(), name, username: uname, email, password: pass, created: new Date().toISOString() };
  users.push(newUser);
  localStorage.setItem('aa_users', JSON.stringify(users));

  currentUser = newUser;
  localStorage.setItem('aa_current_user', JSON.stringify(newUser));
  updateUserUI();
  closeUserModal();
  showToast(`Cuenta creada. Bienvenido, ${name}! 🎉`, 'success');
}

function doLogout() {
  currentUser = null;
  localStorage.removeItem('aa_current_user');
  updateUserUI();
  closeUserModal();
  showToast('Sesión cerrada', 'info');
}

// ─── REDES SOCIALES ──────────────────────────
function loadSocialLinks() {
  const socials = JSON.parse(localStorage.getItem('aa_socials') || '{}');
  const container = document.getElementById('social-links');
  if (!container) return;

  const links = [];
  if (socials.facebook) links.push(`<a href="${socials.facebook}" target="_blank"><i class="fab fa-facebook-f"></i></a>`);
  if (socials.instagram) links.push(`<a href="${socials.instagram}" target="_blank"><i class="fab fa-instagram"></i></a>`);
  const wa = socials.whatsapp || '573146542604';
  links.push(`<a href="https://wa.me/${wa}" target="_blank"><i class="fab fa-whatsapp"></i></a>`);
  if (socials.tiktok) links.push(`<a href="${socials.tiktok}" target="_blank"><i class="fab fa-tiktok"></i></a>`);

  container.innerHTML = links.join('');
}

// ─── LOGO ─────────────────────────────────────
function loadLogoDisplay() {
  const logoData = localStorage.getItem('aa_logo');
  const logoDisplay = document.getElementById('logo-display');
  if (!logoDisplay) return;

  if (logoData) {
    logoDisplay.innerHTML = `<img src="${logoData}" alt="Logo" style="height:48px;width:48px;object-fit:contain;border-radius:8px;" />`;
  }
}

// ─── MODALES UTILES ───────────────────────────
function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.style.display = 'flex'; setTimeout(() => m.classList.add('open'), 10); }
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.remove('open');
    setTimeout(() => { m.style.display = 'none'; }, 250);
  }
  document.body.style.overflow = '';
}

// Escape key closes modals
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['product-modal','cart-modal','checkout-modal','user-modal','product-form-modal'].forEach(closeModal);
  }
});

// ─── UTILIDADES ──────────────────────────────
function formatPrice(n) {
  return '$' + Number(n).toLocaleString('es-CO');
}

function categoryLabel(cat) {
  const m = { streaming:'Streaming', hogar:'Hogar', belleza:'Belleza', tecnologia:'Tecnología', relojes:'Relojes', otros:'Otros' };
  return m[cat] || cat;
}

function showToast(msg, type = 'info') {
  const tc = document.getElementById('toast-container');
  if (!tc) return;
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || 'fa-info-circle'}"></i> ${msg}`;
  tc.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut .3s ease forwards';
    setTimeout(() => toast.remove(), 320);
  }, 2800);
}

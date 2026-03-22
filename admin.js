/* ============================================
   VENTAS A&A - PANEL ADMINISTRADOR
   ============================================ */

const DEFAULT_ADMIN = { user: 'admin', pass: 'admin123' };

// ─── INICIALIZACIÓN ──────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const adminData = JSON.parse(localStorage.getItem('aa_admin_creds') || 'null') || DEFAULT_ADMIN;
  if (!localStorage.getItem('aa_admin_creds')) {
    localStorage.setItem('aa_admin_creds', JSON.stringify(DEFAULT_ADMIN));
  }

  const session = localStorage.getItem('aa_admin_session');
  if (session === 'active') showAdminPanel();
});

// ─── LOGIN ───────────────────────────────────
function adminLogin() {
  const user = document.getElementById('adm-user').value.trim();
  const pass = document.getElementById('adm-pass').value;

  const creds = JSON.parse(localStorage.getItem('aa_admin_creds') || '{}');
  const adminUser = creds.user || DEFAULT_ADMIN.user;
  const adminPass = creds.pass || DEFAULT_ADMIN.pass;

  if (user === adminUser && pass === adminPass) {
    localStorage.setItem('aa_admin_session', 'active');
    showAdminPanel();
  } else {
    showToast('Credenciales incorrectas', 'error');
  }
}

function adminLogout() {
  localStorage.removeItem('aa_admin_session');
  document.getElementById('admin-panel').style.display = 'none';
  document.getElementById('admin-login-screen').style.display = 'flex';
  showToast('Sesión cerrada', 'info');
}

function showAdminPanel() {
  document.getElementById('admin-login-screen').style.display = 'none';
  document.getElementById('admin-panel').style.display = 'grid';
  renderDashboard();
  renderAdminProducts();
  renderOrders();
  renderUsers();
  loadSettingsForm();
}

// ─── TABS ─────────────────────────────────────
function adminTab(name, btn) {
  document.querySelectorAll('.admin-tab').forEach(t => { t.style.display = 'none'; t.classList.remove('active'); });
  document.querySelectorAll('.snav-btn').forEach(b => b.classList.remove('active'));

  const tab = document.getElementById(`tab-${name}`);
  if (tab) { tab.style.display = 'block'; tab.classList.add('active'); }
  if (btn) btn.classList.add('active');

  const titles = { dashboard: 'Dashboard', products: 'Productos', orders: 'Pedidos', users: 'Usuarios', settings: 'Ajustes' };
  const titleEl = document.getElementById('admin-page-title');
  if (titleEl) titleEl.textContent = titles[name] || name;
}

// ─── DASHBOARD ───────────────────────────────
function renderDashboard() {
  const prods = JSON.parse(localStorage.getItem('aa_products') || '[]');
  const orders = JSON.parse(localStorage.getItem('aa_orders') || '[]');
  const users = JSON.parse(localStorage.getItem('aa_users') || '[]');

  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  document.getElementById('stat-products').textContent = prods.length;
  document.getElementById('stat-orders').textContent = orders.length;
  document.getElementById('stat-users').textContent = users.length;
  document.getElementById('stat-revenue').textContent = formatAdminPrice(revenue);

  // Low stock
  const lowStock = prods.filter(p => p.stock <= 5);
  const el = document.getElementById('low-stock-list');
  if (el) {
    if (lowStock.length === 0) {
      el.innerHTML = '<p style="color:var(--gray);font-size:.88rem;">✅ Todos los productos tienen stock suficiente</p>';
    } else {
      el.innerHTML = lowStock.map(p => `
        <div class="low-stock-item">
          <span>${p.name}</span>
          <span class="stock-badge">${p.stock === 0 ? 'AGOTADO' : `${p.stock} restantes`}</span>
        </div>`).join('');
    }
  }
}

// ─── PRODUCTOS ───────────────────────────────
function renderAdminProducts() {
  const prods = JSON.parse(localStorage.getItem('aa_products') || '[]');
  const query = document.getElementById('admin-search')?.value.toLowerCase() || '';
  const filtered = prods.filter(p => p.name.toLowerCase().includes(query));
  const list = document.getElementById('admin-products-list');
  if (!list) return;

  if (filtered.length === 0) {
    list.innerHTML = '<p style="color:var(--gray);">No se encontraron productos.</p>';
    return;
  }

  list.innerHTML = filtered.map(p => `
    <div class="admin-product-card">
      <img class="admin-prod-img" src="${p.img || ''}" alt="${p.name}" onerror="this.src=''" />
      <div class="admin-prod-info">
        <h4>${p.name}</h4>
        <p>${categoryLabelAdmin(p.category)} • Stock: <strong>${p.stock}</strong></p>
        <p class="ap-price">${formatAdminPrice(p.price)}</p>
        <div class="admin-prod-actions">
          <button class="btn-edit" onclick="editProduct('${p.id}')"><i class="fas fa-edit"></i> Editar</button>
          <button class="btn-delete" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i> Eliminar</button>
        </div>
      </div>
    </div>`).join('');
}

function openProductForm(id = null) {
  const titleEl = document.getElementById('product-form-title');
  if (titleEl) titleEl.innerHTML = id ? '<i class="fas fa-edit"></i> Editar producto' : '<i class="fas fa-box"></i> Agregar producto';

  // Reset form
  document.getElementById('pf-id').value = '';
  document.getElementById('pf-name').value = '';
  document.getElementById('pf-category').value = '';
  document.getElementById('pf-price').value = '';
  document.getElementById('pf-oldprice').value = '';
  document.getElementById('pf-stock').value = '';
  document.getElementById('pf-desc').value = '';
  document.getElementById('pf-imgurl').value = '';
  document.getElementById('pf-img-data').value = '';
  document.getElementById('pf-featured').checked = false;
  const preview = document.getElementById('pf-img-preview');
  if (preview) { preview.style.display = 'none'; preview.src = ''; }

  if (id) {
    const prods = JSON.parse(localStorage.getItem('aa_products') || '[]');
    const p = prods.find(x => x.id === id);
    if (p) {
      document.getElementById('pf-id').value = p.id;
      document.getElementById('pf-name').value = p.name;
      document.getElementById('pf-category').value = p.category;
      document.getElementById('pf-price').value = p.price;
      document.getElementById('pf-oldprice').value = p.oldPrice || '';
      document.getElementById('pf-stock').value = p.stock;
      document.getElementById('pf-desc').value = p.desc || '';
      document.getElementById('pf-featured').checked = !!p.featured;

      if (p.img && !p.img.startsWith('data:')) document.getElementById('pf-imgurl').value = p.img;
      else if (p.img) document.getElementById('pf-img-data').value = p.img;

      if (p.img) {
        if (preview) { preview.src = p.img; preview.style.display = 'block'; }
      }
    }
  }

  openAdminModal('product-form-modal');
}

function editProduct(id) { openProductForm(id); }

function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('pf-id').value;
  const name = document.getElementById('pf-name').value.trim();
  const category = document.getElementById('pf-category').value;
  const price = parseFloat(document.getElementById('pf-price').value);
  const oldPrice = parseFloat(document.getElementById('pf-oldprice').value) || 0;
  const stock = parseInt(document.getElementById('pf-stock').value);
  const desc = document.getElementById('pf-desc').value.trim();
  const imgData = document.getElementById('pf-img-data').value;
  const imgUrl = document.getElementById('pf-imgurl').value.trim();
  const featured = document.getElementById('pf-featured').checked;

  const img = imgData || imgUrl || '';

  let prods = JSON.parse(localStorage.getItem('aa_products') || '[]');

  if (id) {
    const idx = prods.findIndex(x => x.id === id);
    if (idx !== -1) {
      prods[idx] = { ...prods[idx], name, category, price, oldPrice, stock, desc, img, featured };
    }
    showToast('Producto actualizado ✅', 'success');
  } else {
    const newProd = {
      id: 'p' + Date.now(),
      name, category, price, oldPrice, stock, desc, img, featured
    };
    prods.unshift(newProd);
    showToast('Producto agregado ✅', 'success');
  }

  localStorage.setItem('aa_products', JSON.stringify(prods));
  closeProductForm();
  renderAdminProducts();
  renderDashboard();
}

function deleteProduct(id) {
  if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
  let prods = JSON.parse(localStorage.getItem('aa_products') || '[]');
  prods = prods.filter(p => p.id !== id);
  localStorage.setItem('aa_products', JSON.stringify(prods));
  renderAdminProducts();
  renderDashboard();
  showToast('Producto eliminado', 'info');
}

function previewProductImg(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = e.target.result;
    document.getElementById('pf-img-data').value = data;
    const preview = document.getElementById('pf-img-preview');
    if (preview) { preview.src = data; preview.style.display = 'block'; }
  };
  reader.readAsDataURL(file);
}

function previewImgUrl(url) {
  const preview = document.getElementById('pf-img-preview');
  if (!preview) return;
  if (url) { preview.src = url; preview.style.display = 'block'; }
  else { preview.style.display = 'none'; }
}

function closeProductForm(e) {
  if (!e || e.target.id === 'product-form-modal') closeAdminModal('product-form-modal');
}

// ─── PEDIDOS ─────────────────────────────────
function renderOrders() {
  const orders = JSON.parse(localStorage.getItem('aa_orders') || '[]');
  const list = document.getElementById('orders-list');
  if (!list) return;

  if (orders.length === 0) {
    list.innerHTML = '<div class="order-card"><p style="color:var(--gray);">No hay pedidos registrados aún.</p></div>';
    return;
  }

  list.innerHTML = orders.map(o => `
    <div class="order-card">
      <div>
        <h4>📦 ${o.name}</h4>
        <p>📍 ${o.address}, ${o.city}</p>
        <p>📞 ${o.phone} • 📧 ${o.email}</p>
        <p style="margin-top:6px;font-size:.8rem;color:var(--gray);">${new Date(o.date).toLocaleString('es-CO')}</p>
        ${o.notes ? `<p style="font-size:.82rem;margin-top:4px;">📝 ${o.notes}</p>` : ''}
        <div style="margin-top:8px;font-size:.82rem;">
          ${(o.items||[]).map(i => `<div>• ${i.name} x${i.qty}</div>`).join('')}
        </div>
      </div>
      <div class="order-total">${formatAdminPrice(o.total || 0)}</div>
    </div>`).join('');
}

// ─── USUARIOS ────────────────────────────────
function renderUsers() {
  const users = JSON.parse(localStorage.getItem('aa_users') || '[]');
  const list = document.getElementById('users-list');
  if (!list) return;

  if (users.length === 0) {
    list.innerHTML = '<div class="user-card"><p style="color:var(--gray);">No hay usuarios registrados.</p></div>';
    return;
  }

  list.innerHTML = users.map(u => `
    <div class="user-card">
      <div>
        <h4><i class="fas fa-user" style="color:var(--primary)"></i> ${u.name}</h4>
        <p>@${u.username} • ${u.email}</p>
        <p style="font-size:.78rem;color:var(--gray);">Registro: ${new Date(u.created).toLocaleDateString('es-CO')}</p>
      </div>
      <button class="btn-delete" onclick="deleteUser('${u.id}')"><i class="fas fa-user-times"></i></button>
    </div>`).join('');
}

function deleteUser(id) {
  if (!confirm('¿Eliminar este usuario?')) return;
  let users = JSON.parse(localStorage.getItem('aa_users') || '[]');
  users = users.filter(u => u.id !== id);
  localStorage.setItem('aa_users', JSON.stringify(users));
  renderUsers();
  renderDashboard();
  showToast('Usuario eliminado', 'info');
}

// ─── AJUSTES ─────────────────────────────────
function loadSettingsForm() {
  const socials = JSON.parse(localStorage.getItem('aa_socials') || '{}');
  const info = JSON.parse(localStorage.getItem('aa_store_info') || '{}');

  if (document.getElementById('s-facebook')) document.getElementById('s-facebook').value = socials.facebook || '';
  if (document.getElementById('s-instagram')) document.getElementById('s-instagram').value = socials.instagram || '';
  if (document.getElementById('s-whatsapp')) document.getElementById('s-whatsapp').value = socials.whatsapp || '573146542604';
  if (document.getElementById('s-tiktok')) document.getElementById('s-tiktok').value = socials.tiktok || '';

  if (document.getElementById('s-storename')) document.getElementById('s-storename').value = info.name || 'Ventas A&A';
  if (document.getElementById('s-storedesc')) document.getElementById('s-storedesc').value = info.desc || '';
  if (document.getElementById('s-email')) document.getElementById('s-email').value = info.email || '';

  loadLogoPreviewAdmin();
}

function saveSocials() {
  const data = {
    facebook:  document.getElementById('s-facebook').value.trim(),
    instagram: document.getElementById('s-instagram').value.trim(),
    whatsapp:  document.getElementById('s-whatsapp').value.trim(),
    tiktok:    document.getElementById('s-tiktok').value.trim(),
  };
  localStorage.setItem('aa_socials', JSON.stringify(data));
  showToast('Redes sociales guardadas ✅', 'success');
}

function saveStoreInfo() {
  const data = {
    name:  document.getElementById('s-storename').value.trim(),
    desc:  document.getElementById('s-storedesc').value.trim(),
    email: document.getElementById('s-email').value.trim(),
  };
  localStorage.setItem('aa_store_info', JSON.stringify(data));
  showToast('Información guardada ✅', 'success');
}

function changeAdminPass() {
  const oldp = document.getElementById('s-oldpass').value;
  const newp = document.getElementById('s-newpass').value;
  const conf = document.getElementById('s-confpass').value;

  const creds = JSON.parse(localStorage.getItem('aa_admin_creds') || '{}');
  const currentPass = creds.pass || DEFAULT_ADMIN.pass;

  if (oldp !== currentPass) { showToast('Contraseña actual incorrecta', 'error'); return; }
  if (newp.length < 6) { showToast('La nueva contraseña debe tener al menos 6 caracteres', 'error'); return; }
  if (newp !== conf) { showToast('Las contraseñas no coinciden', 'error'); return; }

  creds.pass = newp;
  localStorage.setItem('aa_admin_creds', JSON.stringify(creds));
  document.getElementById('s-oldpass').value = '';
  document.getElementById('s-newpass').value = '';
  document.getElementById('s-confpass').value = '';
  showToast('Contraseña cambiada exitosamente ✅', 'success');
}

function uploadLogo(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    localStorage.setItem('aa_logo', e.target.result);
    loadLogoPreviewAdmin();
    showToast('Logo actualizado ✅', 'success');
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  localStorage.removeItem('aa_logo');
  loadLogoPreviewAdmin();
  showToast('Logo eliminado', 'info');
}

function loadLogoPreviewAdmin() {
  const el = document.getElementById('logo-preview-admin');
  if (!el) return;
  const logo = localStorage.getItem('aa_logo');
  if (logo) {
    el.innerHTML = `<img src="${logo}" alt="Logo" style="max-height:70px;" />`;
  } else {
    el.innerHTML = `<span style="color:var(--gray);font-size:.85rem;">Sin logo</span>`;
  }
}

// ─── MODALES ADMIN ────────────────────────────
function openAdminModal(id) {
  const m = document.getElementById(id);
  if (m) { m.style.display = 'flex'; setTimeout(() => m.classList.add('open'), 10); }
  document.body.style.overflow = 'hidden';
}

function closeAdminModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.remove('open');
    setTimeout(() => { m.style.display = 'none'; }, 250);
  }
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAdminModal('product-form-modal');
});

// ─── UTILS ───────────────────────────────────
function formatAdminPrice(n) {
  return '$' + Number(n).toLocaleString('es-CO');
}

function categoryLabelAdmin(cat) {
  const m = { streaming:'Streaming', hogar:'Hogar', belleza:'Belleza', tecnologia:'Tecnología', relojes:'Relojes', otros:'Otros' };
  return m[cat] || cat;
}

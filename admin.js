/* ============================================
   VENTAS DE PRODUCTOS A&A - ADMIN CON FIREBASE
   ============================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, setDoc, deleteDoc, doc, addDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBs2GXhxPsPJv4tKKNJmOr4DyQe1H15JAc",
  authDomain: "tienda-aa.firebaseapp.com",
  projectId: "tienda-aa",
  storageBucket: "tienda-aa.firebasestorage.app",
  messagingSenderId: "1023419169592",
  appId: "1:1023419169592:web:b2c717b01ce49a805e1fcd"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ─── IMGBB CONFIG ────────────────────────────
// Obtén tu API key gratis en: https://api.imgbb.com/
const IMGBB_KEY = '151ddb52ce6b4df2fafc2c49422cf17b'; // ← Reemplaza con tu clave de imgbb.com/api

const DEFAULT_ADMIN = { user: 'admin', pass: 'admin123' };
let adminProducts = [];

// ─── INICIALIZACIÓN ──────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('aa_admin_creds')) {
    localStorage.setItem('aa_admin_creds', JSON.stringify(DEFAULT_ADMIN));
  }
  const session = localStorage.getItem('aa_admin_session');
  if (session === 'active') showAdminPanel();
});

// ─── LOGIN ───────────────────────────────────
window.adminLogin = function() {
  const user = document.getElementById('adm-user').value.trim();
  const pass = document.getElementById('adm-pass').value;
  const creds = JSON.parse(localStorage.getItem('aa_admin_creds') || '{}');

  if (user === (creds.user || DEFAULT_ADMIN.user) && pass === (creds.pass || DEFAULT_ADMIN.pass)) {
    localStorage.setItem('aa_admin_session', 'active');
    showAdminPanel();
  } else {
    showToast('Credenciales incorrectas', 'error');
  }
}

window.adminLogout = function() {
  localStorage.removeItem('aa_admin_session');
  document.getElementById('admin-panel').style.display = 'none';
  document.getElementById('admin-login-screen').style.display = 'flex';
  showToast('Sesión cerrada', 'info');
}

async function showAdminPanel() {
  document.getElementById('admin-login-screen').style.display = 'none';
  document.getElementById('admin-panel').style.display = 'grid';
  await loadAdminProducts();
  renderDashboard();
  renderAdminProducts();
  renderOrders();
  renderUsers();
  loadSettingsForm();
}

// ─── CARGAR PRODUCTOS DESDE FIREBASE ─────────
async function loadAdminProducts() {
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    adminProducts = [];
    snapshot.forEach(docSnap => {
      adminProducts.push({ id: docSnap.id, ...docSnap.data() });
    });
  } catch (error) {
    console.error('Error:', error);
    showToast('Error conectando con la base de datos', 'error');
  }
}

// ─── TABS ─────────────────────────────────────
window.adminTab = function(name, btn) {
  document.querySelectorAll('.admin-tab').forEach(t => { t.style.display = 'none'; t.classList.remove('active'); });
  document.querySelectorAll('.snav-btn').forEach(b => b.classList.remove('active'));
  const tab = document.getElementById(`tab-${name}`);
  if (tab) { tab.style.display = 'block'; tab.classList.add('active'); }
  if (btn) btn.classList.add('active');
  const titles = { dashboard:'Dashboard', products:'Productos', orders:'Pedidos', users:'Usuarios', settings:'Ajustes' };
  const titleEl = document.getElementById('admin-page-title');
  if (titleEl) titleEl.textContent = titles[name] || name;
}

// ─── DASHBOARD ───────────────────────────────
function renderDashboard() {
  document.getElementById('stat-products').textContent = adminProducts.length;
  const orders = JSON.parse(localStorage.getItem('aa_orders') || '[]');
  const users = JSON.parse(localStorage.getItem('aa_users') || '[]');
  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  document.getElementById('stat-orders').textContent = orders.length;
  document.getElementById('stat-users').textContent = users.length;
  document.getElementById('stat-revenue').textContent = '$' + Number(revenue).toLocaleString('es-CO');

  const lowStock = adminProducts.filter(p => p.stock <= 5);
  const el = document.getElementById('low-stock-list');
  if (el) {
    el.innerHTML = lowStock.length === 0
      ? '<p style="color:var(--gray);font-size:.88rem;">✅ Todos los productos tienen stock suficiente</p>'
      : lowStock.map(p => `
          <div class="low-stock-item">
            <span>${p.name}</span>
            <span class="stock-badge">${p.stock === 0 ? 'AGOTADO' : `${p.stock} restantes`}</span>
          </div>`).join('');
  }
}

// ─── PRODUCTOS ───────────────────────────────
function renderAdminProducts() {
  const query = document.getElementById('admin-search')?.value.toLowerCase() || '';
  const filtered = adminProducts.filter(p => p.name.toLowerCase().includes(query));
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
        <p>${p.category} • Stock: <strong>${p.stock}</strong></p>
        <p class="ap-price">$${Number(p.price).toLocaleString('es-CO')}</p>
        <div class="admin-prod-actions">
          <button class="btn-edit" onclick="editProduct('${p.id}')"><i class="fas fa-edit"></i> Editar</button>
          <button class="btn-delete" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i> Eliminar</button>
        </div>
      </div>
    </div>`).join('');
}

window.renderAdminProducts = renderAdminProducts;

window.openProductForm = function(id = null) {
  const titleEl = document.getElementById('product-form-title');
  if (titleEl) titleEl.innerHTML = id ? '<i class="fas fa-edit"></i> Editar producto' : '<i class="fas fa-box"></i> Agregar producto';

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
    const p = adminProducts.find(x => x.id === id);
    if (p) {
      document.getElementById('pf-id').value = p.id;
      document.getElementById('pf-name').value = p.name;
      document.getElementById('pf-category').value = p.category;
      document.getElementById('pf-price').value = p.price;
      document.getElementById('pf-oldprice').value = p.oldPrice || '';
      document.getElementById('pf-stock').value = p.stock;
      document.getElementById('pf-desc').value = p.desc || '';
      document.getElementById('pf-featured').checked = !!p.featured;
      if (document.getElementById('pf-show-stock'))   document.getElementById('pf-show-stock').checked   = !!p.showStock;
      if (document.getElementById('pf-show-agotado')) document.getElementById('pf-show-agotado').checked = p.showAgotado !== false;
      if (p.img) {
        document.getElementById('pf-imgurl').value = p.img;
        if (preview) { preview.src = p.img; preview.style.display = 'block'; }
      }
    }
  }

  openAdminModal('product-form-modal');
}

window.editProduct = function(id) { window.openProductForm(id); }

window.saveProduct = async function(e) {
  e.preventDefault();
  const id       = document.getElementById('pf-id').value;
  const name     = document.getElementById('pf-name').value.trim();
  const category = document.getElementById('pf-category').value;
  const price    = parseFloat(document.getElementById('pf-price').value);
  const oldPrice = parseFloat(document.getElementById('pf-oldprice').value) || 0;
  const showStock   = document.getElementById('pf-show-stock')   ? document.getElementById('pf-show-stock').checked   : false;
  const showAgotado = document.getElementById('pf-show-agotado') ? document.getElementById('pf-show-agotado').checked : true;
  const stockVal    = document.getElementById('pf-stock').value;
  const stock       = showStock ? (parseInt(stockVal) || 0) : (stockVal ? parseInt(stockVal) : 999);
  const desc     = document.getElementById('pf-desc').value.trim();
  const imgData  = document.getElementById('pf-img-data').value;
  const imgUrl   = document.getElementById('pf-imgurl').value.trim();
  const featured = document.getElementById('pf-featured').checked;
  const img         = imgUrl || imgData || '';

  const productId = id || 'p' + Date.now();
  const productData = { name, category, price, oldPrice, stock, desc, img, featured, showStock, showAgotado };

  try {
    showToast('Guardando producto...', 'info');
    await setDoc(doc(db, 'products', productId), productData);
    await loadAdminProducts();
    renderAdminProducts();
    renderDashboard();
    closeProductForm();
    showToast(id ? '✅ Producto actualizado' : '✅ Producto agregado — visible para todos', 'success');
  } catch (error) {
    console.error('Error:', error);
    showToast('Error guardando el producto', 'error');
  }
}

window.deleteProduct = async function(id) {
  if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
  try {
    await deleteDoc(doc(db, 'products', id));
    await loadAdminProducts();
    renderAdminProducts();
    renderDashboard();
    showToast('Producto eliminado', 'info');
  } catch (error) {
    showToast('Error eliminando el producto', 'error');
  }
}

window.previewProductImg = async function(input) {
  const file = input.files[0];
  if (!file) return;
  await uploadToImgBB(file, 'product');
}

window.previewImgUrl = function(url) {
  const preview = document.getElementById('pf-img-preview');
  if (!preview) return;
  if (url) { preview.src = url; preview.style.display = 'block'; }
  else { preview.style.display = 'none'; }
}

window.closeProductForm = function(e) {
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
        <p>📞 ${o.phone} ${o.email ? '• 📧 ' + o.email : ''}</p>
        <p style="margin-top:6px;font-size:.8rem;color:var(--gray);">${new Date(o.date).toLocaleString('es-CO')}</p>
        <div style="margin-top:8px;font-size:.82rem;">
          ${(o.items||[]).map(i => `<div>• ${i.name} x${i.qty}</div>`).join('')}
        </div>
      </div>
      <div class="order-total">$${Number(o.total||0).toLocaleString('es-CO')}</div>
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
      </div>
      <button class="btn-delete" onclick="deleteUser('${u.id}')"><i class="fas fa-user-times"></i></button>
    </div>`).join('');
}

window.deleteUser = function(id) {
  if (!confirm('¿Eliminar este usuario?')) return;
  let users = JSON.parse(localStorage.getItem('aa_users') || '[]');
  users = users.filter(u => u.id !== id);
  localStorage.setItem('aa_users', JSON.stringify(users));
  renderUsers();
  showToast('Usuario eliminado', 'info');
}

// ─── AJUSTES ─────────────────────────────────
async function loadSettingsForm() {
  const info = JSON.parse(localStorage.getItem('aa_store_info') || '{}');
  // Cargar logo desde Firebase
  try {
    const logoSnap = await getDoc(doc(db, 'settings', 'logo'));
    const logoUrl  = logoSnap.exists() ? (logoSnap.data().url || '') : '';
    if (logoUrl) localStorage.setItem('aa_logo', logoUrl);
    if (document.getElementById('s-logourl')) document.getElementById('s-logourl').value = logoUrl;
  } catch(e) {
    const logoUrl = localStorage.getItem('aa_logo') || '';
    if (document.getElementById('s-logourl')) document.getElementById('s-logourl').value = logoUrl;
  }
  // Cargar redes desde Firebase
  try {
    const socSnap = await getDoc(doc(db, 'settings', 'socials'));
    const socials = socSnap.exists() ? socSnap.data() : JSON.parse(localStorage.getItem('aa_socials') || '{}');
    if (document.getElementById('s-facebook'))  document.getElementById('s-facebook').value  = socials.facebook  || '';
    if (document.getElementById('s-instagram')) document.getElementById('s-instagram').value = socials.instagram || '';
    if (document.getElementById('s-whatsapp'))  document.getElementById('s-whatsapp').value  = socials.whatsapp  || '573146542604';
    if (document.getElementById('s-tiktok'))    document.getElementById('s-tiktok').value    = socials.tiktok    || '';
  } catch(e) {
    const socials = JSON.parse(localStorage.getItem('aa_socials') || '{}');
    if (document.getElementById('s-facebook'))  document.getElementById('s-facebook').value  = socials.facebook  || '';
    if (document.getElementById('s-instagram')) document.getElementById('s-instagram').value = socials.instagram || '';
    if (document.getElementById('s-whatsapp'))  document.getElementById('s-whatsapp').value  = socials.whatsapp  || '573146542604';
    if (document.getElementById('s-tiktok'))    document.getElementById('s-tiktok').value    = socials.tiktok    || '';
  }
  if (document.getElementById('s-storename')) document.getElementById('s-storename').value = info.name  || 'Ventas A&A';
  if (document.getElementById('s-storedesc')) document.getElementById('s-storedesc').value = info.desc  || '';
  if (document.getElementById('s-email'))     document.getElementById('s-email').value     = info.email || '';
  loadLogoPreviewAdmin();
}

window.previewLogoUrl = function(url) {
  const el = document.getElementById('logo-preview-admin');
  if (!el) return;
  if (url) el.innerHTML = '<img src="'+url+'" alt="Logo" style="max-height:70px;" />';
  else loadLogoPreviewAdmin();
};

window.saveLogoFromUrl = async function() {
  const url = document.getElementById('s-logourl') ? document.getElementById('s-logourl').value.trim() : '';
  if (!url) { showToast('Ingresa una URL válida de imgbb.com', 'error'); return; }
  try {
    await setDoc(doc(db, 'settings', 'logo'), { url });
    localStorage.setItem('aa_logo', url);
    loadLogoPreviewAdmin();
    showToast('✅ Logo guardado — visible para todos', 'success');
  } catch(e) { showToast('Error guardando logo: ' + e.message, 'error'); }
};

window.saveSocials = async function() {
  const data = {
    facebook:  document.getElementById('s-facebook').value.trim(),
    instagram: document.getElementById('s-instagram').value.trim(),
    whatsapp:  document.getElementById('s-whatsapp').value.trim(),
    tiktok:    document.getElementById('s-tiktok').value.trim(),
  };
  try {
    await setDoc(doc(db, 'settings', 'socials'), data);
    localStorage.setItem('aa_socials', JSON.stringify(data));
    showToast('Redes sociales guardadas ✅ — visible para todos', 'success');
  } catch(e) { showToast('Error guardando redes: ' + e.message, 'error'); }
}

window.saveStoreInfo = function() {
  const data = {
    name:  document.getElementById('s-storename').value.trim(),
    desc:  document.getElementById('s-storedesc').value.trim(),
    email: document.getElementById('s-email').value.trim(),
  };
  localStorage.setItem('aa_store_info', JSON.stringify(data));
  showToast('Información guardada ✅', 'success');
}

window.changeAdminPass = function() {
  const oldp = document.getElementById('s-oldpass').value;
  const newp = document.getElementById('s-newpass').value;
  const conf = document.getElementById('s-confpass').value;
  const creds = JSON.parse(localStorage.getItem('aa_admin_creds') || '{}');
  if (oldp !== (creds.pass || DEFAULT_ADMIN.pass)) { showToast('Contraseña actual incorrecta', 'error'); return; }
  if (newp.length < 6) { showToast('Mínimo 6 caracteres', 'error'); return; }
  if (newp !== conf) { showToast('Las contraseñas no coinciden', 'error'); return; }
  creds.pass = newp;
  localStorage.setItem('aa_admin_creds', JSON.stringify(creds));
  document.getElementById('s-oldpass').value = '';
  document.getElementById('s-newpass').value = '';
  document.getElementById('s-confpass').value = '';
  showToast('Contraseña cambiada ✅', 'success');
}

window.uploadLogo = function(input) {
  showToast('⚠️ Usa imgbb.com → pega el enlace en el campo URL', 'info');
}

window.removeLogo = async function() {
  try {
    await deleteDoc(doc(db, 'settings', 'logo'));
  } catch(e) {}
  localStorage.removeItem('aa_logo');
  if (document.getElementById('s-logourl')) document.getElementById('s-logourl').value = '';
  loadLogoPreviewAdmin();
  showToast('Logo eliminado', 'info');
}

function loadLogoPreviewAdmin() {
  const el = document.getElementById('logo-preview-admin');
  if (!el) return;
  const logo = localStorage.getItem('aa_logo');
  el.innerHTML = logo
    ? `<img src="${logo}" alt="Logo" style="max-height:70px;" />`
    : `<span style="color:var(--gray);font-size:.85rem;">Sin logo</span>`;
}

// ─── SUBIDA AUTOMÁTICA A IMGBB ───────────────
async function uploadToImgBB(file, target) {
  if (!file) return;

  // Validar tamaño máx 32MB
  if (file.size > 32 * 1024 * 1024) {
    showToast('❌ Imagen muy grande (máx 32MB)', 'error');
    return;
  }

  // Verificar que la API key está configurada
  if (!IMGBB_KEY || IMGBB_KEY === 'TU_API_KEY_AQUI') {
    showToast('⚠️ Configura tu API Key de ImgBB en admin.js', 'error');
    return;
  }

  const statusId = target === 'product' ? 'imgbb-status-product' : 'imgbb-status-logo';
  const setStatus = (msg, type) => {
    const el = document.getElementById(statusId);
    if (!el) return;
    el.textContent = msg;
    el.className = 'imgbb-status ' + type;
    el.style.display = msg ? 'flex' : 'none';
  };

  setStatus('⏳ Subiendo imagen a ImgBB...', 'loading');

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target.result.split(',')[1];
    const form = new FormData();
    form.append('key', IMGBB_KEY);
    form.append('image', base64);
    form.append('name', file.name.replace(/\.[^.]+$/, '') + '_' + Date.now());

    try {
      const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: form });
      const data = await res.json();

      if (data.success) {
        const url = data.data.url;
        if (target === 'product') {
          document.getElementById('pf-imgurl').value = url;
          document.getElementById('pf-img-data').value = '';
          const preview = document.getElementById('pf-img-preview');
          if (preview) { preview.src = url; preview.style.display = 'block'; }
          setStatus('✅ Imagen subida correctamente', 'ok');
        } else if (target === 'logo') {
          document.getElementById('s-logourl').value = url;
          const el = document.getElementById('logo-preview-admin');
          if (el) el.innerHTML = '<img src="' + url + '" alt="Logo" style="max-height:70px;" />';
          setStatus('✅ Logo subido correctamente — haz clic en Guardar logo', 'ok');
        }
        setTimeout(() => setStatus('', ''), 4000);
      } else {
        const msg = data.error?.message || 'Error desconocido';
        setStatus('❌ Error ImgBB: ' + msg, 'error');
        console.error('ImgBB error:', data);
      }
    } catch (err) {
      setStatus('❌ Error de red. Verifica tu conexión.', 'error');
      console.error('Upload error:', err);
    }
  };
  reader.readAsDataURL(file);
}

window.uploadLogoFile = async function(input) {
  const file = input.files[0];
  if (!file) return;
  await uploadToImgBB(file, 'logo');
};

// ─── MODALES ─────────────────────────────────
function openAdminModal(id) {
  const m = document.getElementById(id);
  if (m) { m.style.display = 'flex'; setTimeout(() => m.classList.add('open'), 10); }
  document.body.style.overflow = 'hidden';
}

function closeAdminModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('open'); setTimeout(() => { m.style.display = 'none'; }, 250); }
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAdminModal('product-form-modal');
});

// ─── TOAST ───────────────────────────────────
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

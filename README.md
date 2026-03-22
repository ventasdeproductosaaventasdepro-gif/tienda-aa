# 🛒 VENTAS A&A — Tienda Online

Tienda e-commerce completa, moderna y funcional. Lista para subir a GitHub Pages.

---

## 🚀 Despliegue en GitHub Pages

1. Sube todos los archivos a un repositorio de GitHub
2. Ve a **Settings → Pages**
3. En "Source" selecciona `main` branch y carpeta `/root`
4. Guarda. Tu tienda estará en: `https://tu-usuario.github.io/nombre-repo/`

---

## 📁 Estructura del Proyecto

```
/
├── index.html          ← Tienda principal
├── admin.html          ← Panel administrador
├── styles.css          ← Estilos globales
├── script.js           ← Lógica principal (carrito, productos, usuarios)
├── admin.js            ← Lógica del panel admin
└── README.md           ← Este archivo
```

---

## 🔑 Acceso al Panel Admin

- **URL:** `/admin.html`
- **Usuario:** `admin`
- **Contraseña:** `admin123`

> ⚠️ Cambia la contraseña después del primer acceso en Ajustes → Cambiar contraseña.

---

## ✨ Funcionalidades

### Tienda Principal
- ✅ Catálogo con 12 productos de ejemplo
- ✅ Filtro por categorías (Streaming, Hogar, Belleza, Tecnología, Relojes, Otros)
- ✅ Buscador de productos en tiempo real
- ✅ Vista detalle del producto con selector de cantidad
- ✅ Carrito de compras persistente (LocalStorage)
- ✅ Formulario de envío con validación
- ✅ Botón de compra por WhatsApp con mensaje automático
- ✅ Sistema de registro e inicio de sesión
- ✅ Control de stock automático al comprar

### Panel Administrador
- ✅ Login seguro
- ✅ Dashboard con estadísticas
- ✅ Agregar/Editar/Eliminar productos
- ✅ Subir imágenes desde PC o URL
- ✅ Control de inventario
- ✅ Ver pedidos realizados
- ✅ Gestión de usuarios
- ✅ Configurar redes sociales
- ✅ Subir logo personalizado
- ✅ Cambiar contraseña admin

---

## 📞 WhatsApp de Contacto
**Número configurado:** 3146542604

Para cambiar el número, busca `573146542604` en `script.js` y `index.html` y reemplázalo.

---

## 💾 Almacenamiento

Todos los datos se guardan en **LocalStorage** del navegador:
- `aa_products` — Catálogo de productos
- `aa_cart` — Carrito actual
- `aa_orders` — Pedidos realizados
- `aa_users` — Usuarios registrados
- `aa_socials` — Redes sociales
- `aa_logo` — Logo de la tienda
- `aa_admin_creds` — Credenciales admin
- `aa_store_info` — Información de la tienda

---

## 🎨 Tecnologías Usadas

- HTML5 semántico
- CSS3 moderno (variables, grid, flexbox, animaciones)
- JavaScript puro (ES6+)
- Font Awesome 6 (íconos)
- Google Fonts (Bebas Neue + Nunito)

---

## 📱 Compatibilidad

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Dispositivos móviles y tablets
- ✅ GitHub Pages (sin backend necesario)

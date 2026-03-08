// =============================================
//  BAJAR | বাজার — Frontend App Logic
//  This file talks to our Node.js backend
// =============================================

let cart = [];

// ── When the page loads, fetch products from backend ──
window.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});

// ── Fetch products from our backend API ──
async function loadProducts() {
  try {
    const response = await fetch('/api/products'); // calls our Node.js server
    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    document.getElementById('productsGrid').innerHTML =
      '<p style="color:#e74c3c;text-align:center;grid-column:1/-1">Could not load products. Make sure the server is running!</p>';
  }
}

// ── Draw product cards on the page ──
function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';

  products.forEach((product, index) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 0.08}s`;

    card.innerHTML = `
      <div class="product-img">
        ${product.emoji}
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
      </div>
      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <h3 class="product-name-en">${product.nameEn}</h3>
        <p class="product-name-bn">${product.nameBn}</p>
        <div class="product-footer">
          <span class="product-price">৳${product.price}</span>
          <button class="add-to-cart" onclick="addToCart(${product.id})">
            + Add
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ── Add item to cart ──
function addToCart(productId) {
  fetch('/api/products')
    .then(res => res.json())
    .then(products => {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const existing = cart.find(item => item.id === productId);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ ...product, qty: 1 });
      }

      updateCartUI();
      showCartBump();
    });
}

// ── Remove item from cart ──
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartUI();
}

// ── Update the cart sidebar UI ──
function updateCartUI() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  document.getElementById('cartCount').textContent = count;

  const cartItemsEl = document.getElementById('cartItems');
  const cartFooter = document.getElementById('cartFooter');

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="empty-cart">Your cart is empty.<br/>আপনার কার্ট খালি।</p>';
    cartFooter.style.display = 'none';
    return;
  }

  cartFooter.style.display = 'block';
  document.getElementById('cartTotal').textContent = '৳' + total.toLocaleString();

  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <span class="cart-item-emoji">${item.emoji}</span>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.nameEn} × ${item.qty}</p>
        <p class="cart-item-price">৳${(item.price * item.qty).toLocaleString()}</p>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</button>
    </div>
  `).join('');
}

// ── Open/close cart sidebar ──
function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
}

// ── Animate the cart button when item added ──
function showCartBump() {
  const btn = document.querySelector('.cart-btn');
  btn.style.transform = 'scale(1.15)';
  setTimeout(() => btn.style.transform = 'scale(1)', 200);
}

// ── Checkout: send order to backend ──
async function checkout() {
  if (cart.length === 0) return;

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  try {
    const response = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, total })
    });

    const result = await response.json();

    if (result.success) {
      cart = [];
      updateCartUI();
      toggleCart();
      document.getElementById('modalOverlay').style.display = 'flex';
    }
  } catch (error) {
    alert('Order failed. Please try again. / অর্ডার ব্যর্থ হয়েছে।');
  }
}

// ── Close success modal ──
function closeModal() {
  document.getElementById('modalOverlay').style.display = 'none';
}

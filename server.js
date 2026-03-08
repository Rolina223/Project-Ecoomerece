// =============================================
//  BAJAR | বাজার — Backend Server (Node.js)
//  This is the "brain" behind our website
// =============================================

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware: allow JSON data & serve frontend files ──
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Our Product Database (stored in a JSON file) ──
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const ORDERS_FILE   = path.join(__dirname, 'data', 'orders.json');

// Make sure data folder & files exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

if (!fs.existsSync(PRODUCTS_FILE)) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
}

// ──────────────────────────────────────────────
//  API ROUTES
// ──────────────────────────────────────────────

// GET all products
app.get('/api/products', (req, res) => {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    const products = JSON.parse(data);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Could not load products' });
  }
});

// GET product by ID
app.get('/api/products/:id', (req, res) => {
  const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
  const products = JSON.parse(data);

  const product = products.find(p => p.id === parseInt(req.params.id));

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
});

// POST order
app.post('/api/order', (req, res) => {
  const { items, total } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Cart is empty'
    });
  }

  const newOrder = {
    id: Date.now(),
    items,
    total,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const existing = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));

  existing.push(newOrder);

  fs.writeFileSync(
    ORDERS_FILE,
    JSON.stringify(existing, null, 2)
  );

  console.log(`\n✅ New Order #${newOrder.id} received!`);
  console.log(`Items: ${items.map(i => i.nameEn).join(', ')}`);
  console.log(`Total: ৳${total}\n`);

  res.json({
    success: true,
    orderId: newOrder.id
  });
});

// GET all orders (admin)
app.get('/api/orders', (req, res) => {
  const orders = JSON.parse(
    fs.readFileSync(ORDERS_FILE, 'utf-8')
  );

  res.json(orders);
});

// ── Start the server ──
app.listen(PORT, () => {
  console.log('');
  console.log('🛒 BAJAR | বাজার — Server Started!');
  console.log('─────────────────────────────────');
  console.log(`Server running on port ${PORT}`);
  console.log('');
});
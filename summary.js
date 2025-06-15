// summary.js

// Firebase references
const db = firebase.firestore();

// Element selectors
const totalGoodsBox = document.getElementById('totalGoods');
const totalWorthBox = document.getElementById('totalWorth');
const popupOverlay = document.getElementById('popupOverlay');
const popupTitle = document.getElementById('popupTitle');
const productList = document.getElementById('productList');
const addProductBtn = document.getElementById('addProductBtn');

const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const productNameInput = document.getElementById('productName');
const productPriceInput = document.getElementById('productPrice');
const availableAddInput = document.getElementById('availableAdd');
const modalTitle = document.getElementById('modalTitle');

const salesTableBody = document.getElementById('salesTableBody');

let editingProductId = null;

// Open popup
totalGoodsBox.onclick = () => openPopup('Total Goods');
totalWorthBox.onclick = () => openPopup('Total Net Worth');

function openPopup(type) {
  popupOverlay.style.display = 'block';
  popupTitle.textContent = type;
  fetchProducts(type);
}

// Close popup
function closePopup() {
  popupOverlay.style.display = 'none';
  productList.innerHTML = '';
}

// Open modal
addProductBtn.onclick = () => {
  openProductModal();
};

function openProductModal(product = null) {
  productModal.style.display = 'block';
  if (product) {
    modalTitle.textContent = 'Edit Product';
    productNameInput.value = product.name;
    productPriceInput.value = product.price;
    availableAddInput.value = '';
    editingProductId = product.id;
  } else {
    modalTitle.textContent = 'Add Product';
    productForm.reset();
    editingProductId = null;
  }
}

// Close modal
function closeModal() {
  productModal.style.display = 'none';
}

// Submit add/edit product
productForm.onsubmit = async (e) => {
  e.preventDefault();
  const name = productNameInput.value.trim();
  const price = parseFloat(productPriceInput.value);
  const addedAmount = parseInt(availableAddInput.value) || 0;

  if (editingProductId) {
    const ref = db.collection('products').doc(editingProductId);
    const doc = await ref.get();
    const oldData = doc.data();
    const updatedAvailable = (oldData.available || 0) + addedAmount;
    await ref.update({ name, price, available: updatedAvailable });
  } else {
    await db.collection('products').add({
      name,
      price,
      available: addedAmount,
    });
  }

  closeModal();
  fetchProducts(popupTitle.textContent);
  updateTopBoxes();
};

// Fetch all products and show in popup
async function fetchProducts(type) {
  const snapshot = await db.collection('products').get();
  const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  productList.innerHTML = '';

  docs.forEach(product => {
    const netWorth = product.price * (product.available || 0);
    const row = document.createElement('div');
    row.className = 'product-row';

    row.innerHTML = `
      <strong>${product.name}</strong> |
      ₦${product.price} |
      ${type === 'Total Goods' ? `Available: ${product.available || 0}` : `Net Worth: ₦${netWorth}`}
    `;

    // Long-press delete/edit logic
    let pressTimer;
    row.onmousedown = () => {
      pressTimer = setTimeout(() => {
        showEditDeleteOptions(product);
      }, 700);
    };
    row.onmouseup = () => clearTimeout(pressTimer);
    productList.appendChild(row);
  });
}

// Show edit/delete options
function showEditDeleteOptions(product) {
  if (confirm(`Edit or Delete "${product.name}"?\n\nOK = Edit\nCancel = Delete`)) {
    openProductModal(product);
  } else {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      db.collection('products').doc(product.id).delete().then(() => {
        fetchProducts(popupTitle.textContent);
        updateTopBoxes();
      });
    }
  }
}

// Update Top Boxes: Total Goods and Net Worth
async function updateTopBoxes() {
  const snapshot = await db.collection('products').get();
  const products = snapshot.docs.map(doc => doc.data());
  const totalGoods = products.reduce((sum, p) => sum + (p.available || 0), 0);
  const netWorth = products.reduce((sum, p) => sum + (p.price * (p.available || 0)), 0);

  document.getElementById('goodsCount').textContent = totalGoods;
  document.getElementById('netWorth').textContent = `₦${netWorth}`;
}

// Populate Product Sales Table
async function populateSalesTable() {
  const snapshot = await db.collection('sales').orderBy('timestamp', 'desc').get();
  salesTableBody.innerHTML = '';

  snapshot.forEach(doc => {
    const sale = doc.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${sale.productName}</td>
      <td>₦${sale.price}</td>
      <td>${sale.amount}</td>
      <td>${sale.soldBy}</td>
      <td>${new Date(sale.timestamp.toDate()).toLocaleString()}</td>
    `;
    salesTableBody.appendChild(tr);
  });
}

// Init
updateTopBoxes();
populateSalesTable();
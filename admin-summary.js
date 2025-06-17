import { db } from './firebase.js';
import {
  collection, getDocs, addDoc, deleteDoc, updateDoc,
  doc, serverTimestamp
} from './firebase.js';

const totalGoods = document.getElementById('totalGoods');
const totalWorth = document.getElementById('totalWorth');
const popupOverlay = document.getElementById('popupOverlay');
const productTableBody = document.getElementById('productTableBody');
const addProductBtn = document.getElementById('addProductBtn');
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const salesTableBody = document.getElementById('salesTableBody');

let editProductId = null;

totalGoods.onclick = totalWorth.onclick = () => {
  loadProductList();
  popupOverlay.style.display = 'flex';
};

addProductBtn.onclick = () => {
  editProductId = null;
  productForm.reset();
  productModal.style.display = 'flex';
};

window.closePopup = () => (popupOverlay.style.display = 'none');
window.closeModal = () => (productModal.style.display = 'none');

productForm.onsubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById('productName').value;
  const price = +document.getElementById('productPrice').value;
  const amount = +document.getElementById('productAmount').value;

  if (editProductId) {
    await updateDoc(doc(db, 'products', editProductId), { name, price, amount });
  } else {
    await addDoc(collection(db, 'products'), { name, price, amount });
  }

  productModal.style.display = 'none';
  loadProductList();
};

async function loadProductList() {
  const snapshot = await getDocs(collection(db, 'products'));
  productTableBody.innerHTML = '';
  let totalItems = 0, totalValue = 0;

  snapshot.forEach(docSnap => {
    const { name, price, amount } = docSnap.data();
    const total = price * amount;
    totalItems += 1;
    totalValue += total;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${name}</td>
      <td>${amount}</td>
      <td>₦${price}</td>
      <td>₦${total}</td>
      <td>
        <button onclick="editProduct('${docSnap.id}', '${name}', ${price}, ${amount})">Edit</button>
        <button onclick="deleteProduct('${docSnap.id}')">Delete</button>
      </td>`;
    productTableBody.appendChild(row);
  });

  document.getElementById('goodsCount').textContent = totalItems;
  document.getElementById('netWorth').textContent = '₦' + totalValue;
}

window.editProduct = (id, name, price, amount) => {
  editProductId = id;
  document.getElementById('productName').value = name;
  document.getElementById('productPrice').value = price;
  document.getElementById('productAmount').value = amount;
  productModal.style.display = 'flex';
};

window.deleteProduct = async (id) => {
  await deleteDoc(doc(db, 'products', id));
  loadProductList();
};

// ✅ Load sales history without modifying stock
async function loadSalesTable() {
  const salesSnapshot = await getDocs(collection(db, 'sales'));
  salesTableBody.innerHTML = '';

  // Convert to array and sort by timestamp descending
  const sortedSales = salesSnapshot.docs
    .map(docSnap => docSnap.data())
    .sort((a, b) => {
      const aTime = a.timestamp?.toMillis?.() || 0;
      const bTime = b.timestamp?.toMillis?.() || 0;
      return bTime - aTime; // newest first
    });

  for (const sale of sortedSales) {
    const { name, price, amount, soldBy, timestamp, type = 'sold', reason } = sale;
    const dateStr = timestamp?.toDate().toLocaleString() || '-';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${name}</td>
      <td>₦${price}</td>
      <td>${amount}</td>
      <td>${soldBy}</td>
      <td>
        ${dateStr}
        ${type === 'refund' ? ' <span style="color:red;">(Refund)</span><br><small style="color: #ccc">Reason: ' + (reason || '-') + '</small>' : ''}
      </td>
    `;
    salesTableBody.appendChild(row);
  }
}

// ✅ Call this when issuing a refund
window.processRefund = async ({ name, amount, price, soldBy, reason = 'Not specified' }) => {
  // Get the product document
  const productsSnapshot = await getDocs(collection(db, 'products'));
  let productDoc = null;

  productsSnapshot.forEach(docSnap => {
    if (docSnap.data().name === name) {
      productDoc = { id: docSnap.id, ...docSnap.data() };
    }
  });

  if (!productDoc) {
    alert('Product not found');
    return;
  }

  const newAmount = productDoc.amount + amount;

  // 1. Update product stock
  await updateDoc(doc(db, 'products', productDoc.id), {
    amount: newAmount
  });

  // 2. Log refund in sales collection
  await addDoc(collection(db, 'sales'), {
    name,
    amount,
    price,
    soldBy,
    reason,
    type: 'refund',
    timestamp: serverTimestamp()
  });

  // 3. Refresh UI
  loadProductList();
  loadSalesTable();
};

loadProductList();
loadSalesTable();
import {
  db, collection, addDoc, doc,
  getDoc, updateDoc, getDocs,
  auth, serverTimestamp
} from './firebase.js';

// 🔁 Load product names into the dropdown with readable names
export async function loadProductNames() {
  const productSelect = document.getElementById('productSelect');
  productSelect.innerHTML = '<option value="">Select product</option>';

  const snapshot = await getDocs(collection(db, 'products'));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const option = document.createElement('option');
    option.value = docSnap.id;
    option.textContent = data.name || docSnap.id; // Use readable name if available
    productSelect.appendChild(option);
  });
}

// ↩️ Process refund and update stock
export async function refundProduct() {
  const productId = document.getElementById('productSelect').value;
  const amount = parseInt(document.getElementById('amount').value);
  const reason = document.getElementById('reason').value.trim();

  if (!productId || !amount || !reason) {
    alert('Please fill out all fields.');
    return;
  }

  const productRef = doc(db, 'products', productId);
  const snap = await getDoc(productRef);
  if (!snap.exists()) {
    alert('Product not found.');
    return;
  }

  const productData = snap.data();
  const name = productData.name || productId;
  const price = productData.price;
  const oldStock = productData.amount ?? 0;

  const currentUser = auth.currentUser;
  if (!currentUser) {
    alert('You must be logged in.');
    return;
  }

  const soldBy = currentUser.email;

  // 🔐 Save refund to sales history
  await addDoc(collection(db, 'sales'), {
    name,
    amount,
    price,
    reason,
    soldBy,
    type: 'refund',
    timestamp: serverTimestamp()
  });

  // ➕ Add refunded amount back to stock
  await updateDoc(productRef, {
    amount: oldStock + amount
  });

  alert('Refund processed and stock updated.');
  location.reload();
}

// ⏳ Initialize on DOM ready
window.addEventListener('DOMContentLoaded', loadProductNames);
window.refundProduct = refundProduct;
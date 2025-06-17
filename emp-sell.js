import { auth, db, collection, getDocs, addDoc, doc, updateDoc } from './firebase.js';

const productSelect = document.getElementById('productSelect');
const amountInput = document.getElementById('sellAmount');
const sellBtn = document.getElementById('sellBtn');
const sellStatus = document.getElementById('sellStatus');

// Load products into the dropdown
async function loadProducts() {
  const snapshot = await getDocs(collection(db, 'products'));
  productSelect.innerHTML = '<option value="">Select Product</option>';
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    productSelect.innerHTML += `<option value="${docSnap.id}" data-name="${data.name}" data-price="${data.price}" data-amount="${data.amount}">${data.name} (₦${data.price} | In Stock: ${data.amount})</option>`;
  });
}

// Handle sale
sellBtn.addEventListener('click', async () => {
  sellStatus.textContent = '';
  const productId = productSelect.value;
  const sellAmount = parseInt(amountInput.value);

  if (!productId || isNaN(sellAmount) || sellAmount <= 0) {
    sellStatus.textContent = 'Please select a valid product and quantity.';
    return;
  }

  const selectedOption = productSelect.selectedOptions[0];
  const name = selectedOption.dataset.name;
  const price = +selectedOption.dataset.price;
  const stock = +selectedOption.dataset.amount;

  if (sellAmount > stock) {
    sellStatus.textContent = 'Not enough stock available.';
    return;
  }

  const user = auth.currentUser;
  const soldBy = user?.email || 'Unknown';

  try {
    // Add sale to Firestore
    await addDoc(collection(db, 'sales'), {
      name,
      price,
      amount: sellAmount,
      soldBy,
      type: 'sold',
      timestamp: new Date()
    });

    // Update product stock
    const newStock = stock - sellAmount;
    await updateDoc(doc(db, 'products', productId), { amount: newStock });

    sellStatus.style.color = 'green';
    sellStatus.textContent = 'Sale recorded successfully.';
    loadProducts(); // Refresh dropdown with updated stock
    amountInput.value = '';
  } catch (err) {
    console.error(err);
    sellStatus.style.color = 'red';
    sellStatus.textContent = 'Error recording sale: ' + err.message;
  }
});

loadProducts();
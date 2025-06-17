import { db, collection, getDocs, auth, onAuthStateChanged } from './firebase.js';

export async function loadTransactions() {
  const filter = document.getElementById('filter').value.toLowerCase();
  const container = document.getElementById('records');
  container.innerHTML = '';

  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const querySnapshot = await getDocs(collection(db, 'sales'));

  // Use a Set to track unique transaction IDs
  const seen = new Set();

  const transactions = querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(data => {
      if (data.soldBy !== currentUser.email) return false;
      if (seen.has(data.id)) return false;
      seen.add(data.id);
      return true;
    })
    .sort((a, b) => {
      const aTime = a.timestamp?.toMillis?.() || 0;
      const bTime = b.timestamp?.toMillis?.() || 0;
      return bTime - aTime;
    });

  let found = false;

  for (const data of transactions) {
    const type = data.type?.toLowerCase() || 'sold';

    if (filter !== 'all' && type !== filter) continue;

    found = true;

    const total = (data.amount || 0) * (data.price || 0);

    const card = document.createElement('div');
    card.className = `card ${type}`;
    card.style = `
      background: ${type === 'refund' ? 'rgba(255, 230, 230, 0.8)' : 'rgba(255, 255, 255, 0.1)'};
      border-left: 6px solid ${type === 'refund' ? '#ff4d4d' : '#4caf50'};
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 1rem;
      color: black;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    `;

    card.innerHTML = `
      <p><strong>Product:</strong> ${data.name || 'N/A'}</p>
      <p><strong>Amount:</strong> ${data.amount || 0} × ₦${data.price || 0} = ₦${total}</p>
      <p><strong>Type:</strong> ${capitalize(type)}</p>
    `;

    if (type === 'refund') {
      card.style.cursor = 'pointer';
      card.title = 'Click to view refund reason';
      card.addEventListener('click', () => {
        alert(`Refund Reason:\n${data.reason || 'No reason provided.'}`);
      });
    }

    container.appendChild(card);
  }

  if (!found) {
    container.innerHTML = `<p style="color: black; text-align: center;">No ${filter} transactions found.</p>`;
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 🛑 Wait for auth before loading transactions
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('filter').addEventListener('change', loadTransactions);

  // ✅ Load only after Firebase Auth confirms login
  onAuthStateChanged(auth, user => {
    if (user) {
      loadTransactions();
    }
  });
});
import { db, collection, getDocs, auth } from './firebase.js';

export async function loadTransactions() {
  const filter = document.getElementById('filter').value;
  const q = collection(db, 'sales');
  const docs = await getDocs(q);
  const container = document.getElementById('records');
  container.innerHTML = '';

  docs.forEach(doc => {
    const d = doc.data();
    if (d.employee !== auth.currentUser.uid) return;

    if (filter !== 'All' && d.type !== filter.toLowerCase()) return;

    const card = document.createElement('div');
    card.className = `card ${d.type}`;
    card.innerHTML = `
      <p><strong>${d.product}</strong></p>
      <p>${d.amount} @ ₦${d.price}</p>
    `;
    if (d.type === 'refund') {
      card.addEventListener('click', () => {
        alert('Reason: ' + d.reason);
      });
    }
    container.appendChild(card);
  });
}

// Auto-load on page open
loadTransactions();

// Allow reloading when filter changes
document.getElementById('filter').addEventListener('change', loadTransactions);
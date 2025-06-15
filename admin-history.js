// transaction.js

const db = firebase.firestore();

// CLOCK OUT
const clockOutBtn = document.getElementById('clockOutBtn');

clockOutBtn.onclick = async () => {
  const now = new Date();
  const unlockTime = new Date();
  unlockTime.setDate(now.getDate() + 1);
  unlockTime.setHours(6, 0, 0, 0);

  await db.collection('system').doc('loginLock').set({
    locked: true,
    unlockAt: firebase.firestore.Timestamp.fromDate(unlockTime)
  });

  await db.collection('transactions').add({
    type: 'clockout',
    timestamp: firebase.firestore.Timestamp.now(),
    message: 'Clocked out – logins disabled until 6:00 AM'
  });

  alert("All employees clocked out. Login locked until 6:00 AM tomorrow.");
};

// DAILY SUMMARY TABLE
async function loadDailySummary() {
  const summaryBody = document.getElementById('summaryTableBody');
  summaryBody.innerHTML = '';

  const sales = await db.collection('sales').get();
  const grouped = {};

  sales.forEach(doc => {
    const sale = doc.data();
    const date = new Date(sale.timestamp.toDate()).toLocaleDateString();
    if (!grouped[date]) grouped[date] = 0;
    grouped[date] += sale.price * sale.amount;
  });

  Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>₦${grouped[date]}</td>
      <td>${date}</td>
    `;
    row.onclick = () => {
      window.location.href = `receipt.html?date=${encodeURIComponent(date)}`;
    };
    summaryBody.appendChild(row);
  });
}

// DOWNLOAD PDF
document.getElementById('downloadPDFBtn').onclick = async () => {
  const start = prompt("Enter start date (YYYY-MM-DD):");
  const end = prompt("Enter end date (YYYY-MM-DD):");

  if (!start || !end) return alert("Date range required.");

  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T23:59:59`);

  const snapshot = await db.collection('sales')
    .where('timestamp', '>=', firebase.firestore.Timestamp.fromDate(startDate))
    .where('timestamp', '<=', firebase.firestore.Timestamp.fromDate(endDate))
    .orderBy('timestamp', 'asc')
    .get();

  let content = `Transaction Report (${start} to ${end})\n\n`;
  let total = 0;

  snapshot.forEach(doc => {
    const sale = doc.data();
    const time = new Date(sale.timestamp.toDate()).toLocaleString();
    const amount = sale.price * sale.amount;
    total += amount;
    content += `${sale.productName} – Qty: ${sale.amount} – ₦${sale.price} – ${sale.soldBy} – ${time}\n`;
  });

  content = `${start} — ₦${total}\n\n` + content;

  const blob = new Blob([content], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Transaction_${start}_to_${end}.txt`;
  link.click();
};

// INIT
loadDailySummary();
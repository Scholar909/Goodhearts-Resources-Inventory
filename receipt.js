import { db } from './firebase.js';
import { doc, getDoc, getDocs, collection } from './firebase.js';

const selectedDate = localStorage.getItem('receiptDate');

const receiptDate = document.getElementById('receiptDate');
const totalItems = document.getElementById('totalItems');
const totalQuantity = document.getElementById('totalQuantity');
const totalAmount = document.getElementById('totalAmount');
const receiptTableBody = document.getElementById('receiptTableBody');

async function loadReceipt() {
  if (!selectedDate) {
    alert("❌ No receipt date selected.");
    return;
  }

  try {
    // Get summary data from dailySummaries/{date}
    const summaryDocRef = doc(db, 'dailySummaries', selectedDate);
    const summarySnap = await getDoc(summaryDocRef);

    if (!summarySnap.exists()) {
      alert("📭 No receipt summary found for this date.");
      return;
    }

    const summaryData = summarySnap.data();

    // Display summary
    receiptDate.textContent = selectedDate;
    totalItems.textContent = "-"; // Not stored; optional to calculate
    totalQuantity.textContent = summaryData.totalQuantity || 0;
    totalAmount.textContent = summaryData.totalAmount?.toLocaleString() || "0";

    // Get individual item receipts from dailySummaries/{date}/receipts
    const receiptsSnap = await getDocs(collection(db, `dailySummaries/${selectedDate}/receipts`));

    const mergedSales = {};
    receiptsSnap.forEach(docSnap => {
      const r = docSnap.data();
      mergedSales[r.item] = {
        qty: r.quantity,
        totalPrice: r.total,
        stockLeft: r.stockLeft ?? "-"
      };
    });

    renderTable(mergedSales);
  } catch (error) {
    console.error("❌ Error loading receipt:", error);
    alert("❌ Failed to load receipt.");
  }
}

function renderTable(mergedSales) {
  for (const [product, info] of Object.entries(mergedSales)) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${product}</td>
      <td>${info.qty}</td>
      <td>₦${info.totalPrice.toLocaleString()}</td>
      <td>-</td>
      <td>${info.stockLeft}</td>
    `;
    receiptTableBody.appendChild(tr);
  }
}

loadReceipt();
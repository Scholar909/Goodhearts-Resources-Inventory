// receipt.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, Timestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ... other config values
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helpers
function getDateParam() {
  const url = new URL(window.location.href);
  return url.searchParams.get('date');
}

function formatTime(date) {
  return new Date(date).toLocaleString();
}

// Load Receipt
async function loadReceipt() {
  const receiptDate = getDateParam();
  if (!receiptDate) return alert("No date provided.");

  document.getElementById("receiptDate").textContent = receiptDate;

  const start = new Date(receiptDate + "T00:00:00");
  const end = new Date(receiptDate + "T23:59:59");

  const q = query(
    collection(db, "sales"),
    where("timestamp", ">=", Timestamp.fromDate(start)),
    where("timestamp", "<=", Timestamp.fromDate(end))
  );

  const snapshot = await getDocs(q);
  const tbody = document.getElementById("receiptTableBody");

  let totalItems = 0;
  let totalQty = 0;
  let totalAmount = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    const amount = data.price * data.amount;

    totalItems++;
    totalQty += data.amount;
    totalAmount += amount;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.productName}</td>
      <td>${data.amount}</td>
      <td>₦${data.price}</td>
      <td>${data.soldBy}</td>
      <td>${formatTime(data.timestamp.toDate())}</td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById("totalItems").textContent = totalItems;
  document.getElementById("totalQuantity").textContent = totalQty;
  document.getElementById("totalAmount").textContent = totalAmount;
}

loadReceipt();
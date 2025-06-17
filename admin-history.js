import { db } from './firebase.js';
import {
  collection,
  query,
  orderBy,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc
} from './firebase.js';

document.addEventListener("DOMContentLoaded", () => {
  const clockOutBtn = document.getElementById("clockOutBtn");
  const unlockBtn = document.getElementById("unlockBtn");
  const downloadPDFBtn = document.getElementById("downloadPDFBtn");
  const summaryTableBody = document.getElementById("summaryTableBody");

  async function loadTransactionSummaries(startDate = null, endDate = null, forPDF = false) {
    summaryTableBody.innerHTML = "";
    const q = query(collection(db, "dailySummaries"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    const pdfLines = [];

    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      const total = data.totalAmount || 0;
      const date = data.date;

      if (startDate && endDate && (date < startDate || date > endDate)) return;

      if (!forPDF) {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>₦${total.toLocaleString()}</td>
          <td>${date}</td>
        `;
        row.addEventListener("click", () => {
          localStorage.setItem("receiptDate", date);
          window.location.href = "receipt.html";
        });
        summaryTableBody.appendChild(row);
      }

      if (forPDF) pdfLines.push({ date, total });
    });

    if (forPDF) return pdfLines;
  }

  // 🕔 CLOCK OUT (Block employee login until 6:00 AM next day)
  if (clockOutBtn) {
    clockOutBtn.addEventListener("click", async () => {
      const salesSnapshot = await getDocs(collection(db, "sales"));
      const productsSnapshot = await getDocs(collection(db, "products"));

      const today = new Date().toISOString().split("T")[0];
      const productStockMap = {};
      const mergedSales = {};
      let totalAmount = 0;
      let totalQty = 0;

      productsSnapshot.forEach(docSnap => {
        const data = docSnap.data();
        productStockMap[data.name] = data.amount;
      });

      salesSnapshot.forEach(docSnap => {
        const data = docSnap.data();
        const date = new Date(data.timestamp.toDate()).toISOString().split("T")[0];

        if (date === today && data.type === "sold") {
          const name = data.name;
          const qty = data.amount;
          const price = data.price * qty;

          if (!mergedSales[name]) {
            mergedSales[name] = { quantity: 0, total: 0 };
          }

          mergedSales[name].quantity += qty;
          mergedSales[name].total += price;

          totalAmount += price;
          totalQty += qty;
        }
      });

      for (const name in mergedSales) {
        mergedSales[name].stockLeft = productStockMap[name] ?? "-";
      }

      await setDoc(doc(db, "dailySummaries", today), {
        date: today,
        totalAmount,
        totalQuantity: totalQty,
        timestamp: new Date()
      });

      const receiptsCollectionRef = collection(db, `dailySummaries/${today}/receipts`);
      for (const [item, data] of Object.entries(mergedSales)) {
        await setDoc(doc(receiptsCollectionRef, item), {
          item,
          quantity: data.quantity,
          amount: data.total / data.quantity,
          total: data.total,
          stockLeft: data.stockLeft
        });
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(6, 0, 0, 0);

      // Store the block timestamp in Firestore (global lock)
      await setDoc(doc(db, "settings", "loginControl"), {
        clockedOutUntil: tomorrow.toISOString()
      });

      alert("✅ Clocked out. Employees can't log in until 6:00 AM tomorrow.");
    });
  }

// 🔓 UNLOCK MANUALLY
if (unlockBtn) {
  unlockBtn.addEventListener("click", async () => {
    try {
      // Remove the global clock-out
      await deleteDoc(doc(db, "settings", "loginControl"));

      // Get all employees
      const employeesSnapshot = await getDocs(collection(db, "employees"));

      // Loop through and update each employee's unlock status
      for (const empDoc of employeesSnapshot.docs) {
        const empRef = doc(db, "employees", empDoc.id);
        await setDoc(empRef, {
          clockedOut: false,
          unlockOverride: true
        }, { merge: true });
      }

      alert("✅ Clock-out overrides applied. Employees can now login.");
    } catch (error) {
      console.error("Unlock failed:", error);
      alert("❌ Failed to unlock employee login access.");
    }
  });
}

  // 🧾 EXPORT AS TEXT REPORT
  if (downloadPDFBtn) {
    downloadPDFBtn.addEventListener("click", async () => {
      const startDate = prompt("📅 Enter start date (YYYY-MM-DD):");
      const endDate = prompt("📅 Enter end date (YYYY-MM-DD):");
      if (!startDate || !endDate) return alert("❌ Both dates are required.");

      const summaries = await loadTransactionSummaries(startDate, endDate, true);
      if (summaries.length === 0) return alert("📭 No records found for selected range.");

      const lines = [];

      for (const { date, total } of summaries) {
        lines.push(`${String(date).padEnd(25)}₦${total.toLocaleString().padStart(15)}`);

        const receiptsSnap = await getDocs(collection(db, `dailySummaries/${date}/receipts`));
        receiptsSnap.forEach(receiptDoc => {
          const r = receiptDoc.data();
          lines.push(`• ${r.item} - ₦${r.amount} x${r.quantity} = ₦${r.total}`);
        });

        lines.push("-".repeat(40));
        lines.push("");
      }

      const blob = new Blob([lines.join("\n")], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Transaction-Summary-${startDate}-to-${endDate}.txt`;
      link.click();
    });
  }

  // 🔃 Load summaries on page load
  loadTransactionSummaries();
});
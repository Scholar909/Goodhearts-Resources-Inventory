import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  // your firebase config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const reportTableBody = document.getElementById("reportTableBody");

async function loadReports() {
  const snapshot = await getDocs(collection(db, "reports"));
  reportTableBody.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${data.employeeName}</td>
      <td>${data.title}</td>
      <td>${new Date(data.timestamp.toDate()).toLocaleDateString()}</td>
      <td><button onclick="alert(\`${data.fullReport.replace(/`/g, "'")}\`)">View</button></td>
    `;

    reportTableBody.appendChild(row);
  });
}

loadReports();
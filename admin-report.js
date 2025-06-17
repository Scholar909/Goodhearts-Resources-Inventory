// ======= Import Firebase modules =======
import {
  db,
  getMessaging,
  getToken,
  onMessage,
  firebaseConfig
} from './firebase.js';

import {
  collection,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  query,
  orderBy
} from './firebase.js';

// ======= Initialize Firebase Messaging =======
const messaging = getMessaging();

// ======= Request permission and get FCM token =======
async function initFCM() {
  try {
    if (!("Notification" in window)) {
      console.warn("🚫 This browser does not support notifications.");
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BL_Zo95CQLz__GsaESagJQDfLcHfNRRhlK53jMeT6lqm7QKAocCWn5YJEit7DiEvMNcKUDvZnHw6QR5i-JhXK_E"
      });

      if (token) {
        console.log("✅ Admin FCM Token:", token);
        // Optionally save the token in Firestore here
      } else {
        console.warn("⚠️ No FCM token retrieved.");
      }
    } else {
      console.warn("❌ Notifications permission not granted.");
    }
  } catch (error) {
    console.error("🔴 FCM Token Error:", error);
  }
}

// ======= Handle in-app push messages =======
onMessage(messaging, (payload) => {
  console.log("🔔 Foreground message received:", payload);
  const { title, body } = payload.notification;

  if ("Notification" in window && Notification.permission === "granted") {
    const notification = new Notification(title, {
      body,
      icon: "logo.png",
      data: { url: "https://scholar909.github.io/Goodhearts-Resources-Inventory/admin-report.html" }
    });

    notification.onclick = () => {
      window.location.href = notification.data.url;
    };
  }
});

// ======= Table body reference =======
const reportTableBody = document.getElementById('reportTableBody');

// ======= Load reports and auto-update live =======
function loadReportsLive() {
  const reportsQuery = query(
    collection(db, 'employeeReports'),
    orderBy('date', 'desc')
  );

  onSnapshot(reportsQuery, (snapshot) => {
    reportTableBody.innerHTML = ""; // Clear old table rows

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${data.employeeName || data.employeeEmail}</td>
        <td>${data.title}</td>
        <td>${data.date}</td>
        <td><button onclick="alert('${data.message.replace(/'/g, "\\'")}')">View</button></td>
      `;

      reportTableBody.appendChild(row);

      // Only send WhatsApp alert if not already sent
      if (data.sendWhatsApp !== false) {
        sendWhatsAppNotification(data.employeeName, data.title, data.date, data.employeeEmail);

        // Mark report as notified
        const reportRef = doc(db, 'employeeReports', docSnap.id);
        updateDoc(reportRef, { sendWhatsApp: false }).catch(err =>
          console.error("❌ Error updating sendWhatsApp:", err)
        );
      }
    });
  });
}

// ======= Send WhatsApp notification to admin =======
function sendWhatsAppNotification(name, title, date, email) {
  const phone = "2348118663849";
  const apikey = "4093230";
  const url = "https://scholar909.github.io/Goodhearts-Resources-Inventory/admin-report.html";

  const message = `🆕 *New Employee Report Received*\n👤 Name: ${name}\n📄 Title: ${title}\n📅 Date: ${date}\n📧 Email: ${email}\n🔗 View at: ${url}`;

  fetch(`https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apikey}`)
    .then(response => {
      if (response.ok) {
        console.log("✅ WhatsApp alert sent");
      } else {
        console.error("❌ WhatsApp failed with status:", response.status);
      }
    })
    .catch(error => console.error("🔴 WhatsApp error:", error));
}

// ======= Start execution =======
initFCM();
loadReportsLive();
// sell.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_MSG_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const productInput = document.getElementById("product");
const amountInput = document.getElementById("amount");
const sellBtn = document.getElementById("sellBtn");

// Sample admin product list with prices (replace with Firebase fetch)
const productList = {
  "Book A": 1500,
  "Book B": 2000,
  "Gadget X": 5000
};

// Auto-suggestion (basic)
productInput.addEventListener("input", () => {
  const datalistId = "product-suggestions";
  let datalist = document.getElementById(datalistId);
  if (!datalist) {
    datalist = document.createElement("datalist");
    datalist.id = datalistId;
    document.body.appendChild(datalist);
    productInput.setAttribute("list", datalistId);
  }

  datalist.innerHTML = "";
  const val = productInput.value.toLowerCase();
  Object.keys(productList).forEach((name) => {
    if (name.toLowerCase().includes(val)) {
      const option = document.createElement("option");
      option.value = name;
      datalist.appendChild(option);
    }
  });
});

// Handle Sell
sellBtn.addEventListener("click", async () => {
  const product = productInput.value.trim();
  const amount = parseInt(amountInput.value);

  if (!product || isNaN(amount) || amount <= 0) {
    alert("Please enter valid product and amount.");
    return;
  }

  const unitPrice = productList[product];
  if (!unitPrice) {
    alert("Product not found in the list.");
    return;
  }

  const totalPrice = unitPrice * amount;

  const confirmed = confirm("Ensure you have received full payment from the customer before clicking Sell. Any mistake will be deducted from your salary.");
  if (!confirmed) return;

  try {
    await addDoc(collection(db, "sales"), {
      product,
      amount,
      price: totalPrice,
      date: serverTimestamp()
    });

    showSuccessModal(`Successfully recorded sale of ${amount} ${product}(s) for ₦${totalPrice}.`);
    productInput.value = "";
    amountInput.value = "";

  } catch (error) {
    alert("Error saving sale: " + error.message);
  }
});

// Success Modal
function showSuccessModal(message) {
  const modal = document.createElement("div");
  modal.className = "modal-glass";
  modal.innerHTML = `
    <div class="modal-content">
      <p>${message}</p>
      <button class="close-modal">OK</button>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector(".close-modal").onclick = () => {
    modal.remove();
  };

  setTimeout(() => {
    if (document.body.contains(modal)) modal.remove();
  }, 5000);
}
// refund.js
import { db, collection, doc, getDoc, setDoc, auth } from './firebase.js';
import { serverTimestamp } from 'firebase/firestore';

document.querySelector('button[onclick*="refundProduct"]').addEventListener('click', refundProduct);

async function refundProduct() {
  const name = document.getElementById('product').value.trim();
  const amount = parseInt(document.getElementById('amount').value);
  const reason = document.getElementById('reason').value.trim();

  if (!name || !amount || !reason) {
    alert("Please fill out all fields.");
    return;
  }

  try {
    const snap = await getDoc(doc(db, 'products', name));
    if (!snap.exists()) {
      alert('Product not found.');
      return;
    }

    const price = snap.data().price * amount;

    await setDoc(doc(collection(db, 'sales')), {
      product: name,
      amount,
      price,
      reason,
      type: 'refund',
      employee: auth.currentUser.uid,
      time: serverTimestamp()
    });

    alert('✅ Refund recorded successfully.');
    location.reload();
  } catch (err) {
    console.error("Refund Error:", err);
    alert('❌ Failed to record refund. Try again.');
  }
}
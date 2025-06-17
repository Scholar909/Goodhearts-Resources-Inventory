// employee-dashboard.js
import { auth, db, doc, getDoc, onAuthStateChanged } from './firebase.js';

const welcomeEl = document.getElementById('welcomeMessage');

auth.onAuthStateChanged(async user => {
  if (user) {
    try {
      const snap = await getDoc(doc(db, 'employees', user.uid));
      if (snap.exists()) {
        welcomeEl.textContent = 'Welcome, ' + snap.data().name;
      } else {
        welcomeEl.textContent = 'Welcome, Employee';
      }
    } catch (err) {
      console.error('Error fetching employee:', err);
      welcomeEl.textContent = 'Error loading profile.';
    }
  } else {
    // Not signed in
    window.location.href = 'admin_login.html';
  }
});
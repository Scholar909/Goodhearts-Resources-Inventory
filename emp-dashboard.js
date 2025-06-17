// employee-dashboard.js
import { auth, db, doc, getDoc, onAuthStateChanged } from './firebase.js';

const welcomeEl = document.getElementById('welcomeMessage');
const userType = localStorage.getItem('userType');

onAuthStateChanged(auth, async (user) => {
  if (!user || userType !== 'employee') {
    // Not signed in or not an employee
    redirectToLogin();
    return;
  }

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
});

function redirectToLogin() {
  localStorage.removeItem('userType');
  window.location.href = 'admin-login.html';
}
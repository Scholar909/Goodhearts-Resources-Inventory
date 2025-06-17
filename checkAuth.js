// checkAuth.js
import { getAuth, onAuthStateChanged } from './firebase.js';

const auth = getAuth();
const userType = localStorage.getItem('userType');

// ✅ If Admin, allow access without Firebase auth
if (userType === 'admin') {
  // Admins don’t use Firebase Auth, just localStorage
  // Allow access
} else if (userType === 'employee') {
  // ✅ Firebase session check only for employees
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      redirectToLogin();
    }
  });
} else {
  // No valid userType
  redirectToLogin();
}

function redirectToLogin() {
  localStorage.clear(); // safer to clear all
  window.location.href = 'admin-login.html';
}
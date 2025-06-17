// checkAuth.js
import { auth, getAuth, onAuthStateChanged } from './firebase.js';

const authInstance = getAuth();
const userType = localStorage.getItem('userType');
const currentPath = window.location.pathname;

onAuthStateChanged(authInstance, (user) => {
  if (!user) {
    // If not logged in
    if (currentPath.includes('admin' || 'employee')) {
      window.location.href = 'admin-login.html';
    } else {
      window.location.href = 'index.html'; // employee login
    }
  } 
  }
});
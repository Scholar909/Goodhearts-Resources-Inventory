import { getAuth, signOut, onAuthStateChanged } from "./firebase.js";

const auth = getAuth();

// 🔒 Protect access: redirect if not logged in
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "admin-login.html";
  }
});

function logout() {
  signOut(auth)
    .then(() => {
      localStorage.clear(); // Clear saved session or app data
      console.log("User signed out");
      window.location.href = "admin-login.html"; // Redirect to login page
    })
    .catch((error) => {
      console.error("Sign out error", error);
    });
}

// Expose logout() for HTML buttons like <button onclick="logout()">Logout</button>
window.logout = logout;

// Expand/collapse nav toggle
document.getElementById('toggleExpand').addEventListener('click', () => {
  const extraNav = document.getElementById('extraNav');
  const toggle = document.getElementById('toggleExpand');

  if (extraNav.classList.contains('hidden')) {
    extraNav.classList.remove('hidden');
    toggle.querySelector('span').textContent = '🔽';
  } else {
    extraNav.classList.add('hidden');
    toggle.querySelector('span').textContent = '🔼';
  }
});

// Page navigation helper
function navigateTo(page) {
  window.location.href = page;
}
window.navigateTo = navigateTo;
import { getAuth, signOut, onAuthStateChanged } from "./firebase.js";

const auth = getAuth();

// 🔒 Enforce login before accessing any page
onAuthStateChanged(auth, (user) => {
  const userType = localStorage.getItem('userType');

  if (!user || userType !== 'employee') {
    // If not signed in or not an employee, redirect
    window.location.href = "admin-login.html";
  }
});

// ✅ Logout function
function logout() {
  signOut(auth)
    .then(() => {
      localStorage.clear(); // Clear session data
      console.log("Employee signed out");
      window.location.href = "admin-login.html"; // Redirect to login
    })
    .catch((error) => {
      console.error("Sign out error", error);
    });
}
window.logout = logout; // For use in HTML onclick="logout()"

// ✅ Expand/collapse nav toggle
const toggleExpandBtn = document.getElementById('toggleExpand');
if (toggleExpandBtn) {
  toggleExpandBtn.addEventListener('click', () => {
    const extraNav = document.getElementById('extraNav');
    const icon = toggleExpandBtn.querySelector('span');

    if (extraNav.classList.contains('hidden')) {
      extraNav.classList.remove('hidden');
      icon.textContent = '🔽';
    } else {
      extraNav.classList.add('hidden');
      icon.textContent = '🔼';
    }
  });
}

// ✅ Page navigation helper
function navigateTo(page) {
  window.location.href = page;
}
window.navigateTo = navigateTo;
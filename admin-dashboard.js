// Import Firebase modules
import {
  auth,
  db,
  signInWithEmailAndPassword,
  doc,
  getDoc,
  getAuth,
  signOut,
  collection,
  getDocs,
  deleteDoc,
  updateDoc
} from './firebase.js';

const hardcodedAdminEmail = 'admin@goodheartscoop.local';
const hardcodedAdminPassword = 'AdminPass247';

// DOM Elements for login
const loginBtn = document.getElementById('loginBtn');
const loginTypeEl = document.getElementById('loginType');
const emailEl = document.getElementById('email');
const passwordEl = document.getElementById('password');
const statusEl = document.getElementById('loginStatus');

// Page protection: Redirect if not authenticated
const restrictedPages = ['admin-dashboard.html', 'emp-dashboard.html', 'employee-view.html'];
const currentPage = window.location.pathname.split('/').pop();
const userType = localStorage.getItem('userType');

const authInstance = getAuth();

if (restrictedPages.includes(currentPage)) {
  if (userType === 'admin') {
    // Allow access to admin pages only
    if (currentPage.startsWith('emp-')) {
      alert("Admins cannot access employee pages.");
      localStorage.clear();
      window.location.href = 'admin-login.html';
    }
    // Otherwise, allow access
  } else if (userType === 'employee') {
    // For employees, check Firebase session
    authInstance.onAuthStateChanged((user) => {
      if (!user || currentPage.startsWith('admin-')) {
        alert("Access denied.");
        localStorage.clear();
        window.location.href = 'admin-login.html';
      }
    });
  } else {
    // No userType at all
    localStorage.clear();
    window.location.href = 'admin-login.html';
  }
}

// Handle login
async function handleLogin() {
  const type = loginTypeEl.value;
  const email = emailEl.value.trim();
  const password = passwordEl.value.trim();
  statusEl.innerText = '';

  if (type === 'admin') {
    if (email === hardcodedAdminEmail && password === hardcodedAdminPassword) {
      localStorage.setItem('userType', 'admin');
      window.location.href = 'admin-dashboard.html';
    } else {
      statusEl.innerText = 'Incorrect admin email or password.';
    }
  } else {
    if (email === hardcodedAdminEmail) {
      statusEl.innerText = 'Admins must use "Admin" type to login.';
      return;
    }

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const empRef = doc(db, 'employees', uid);
      const empSnap = await getDoc(empRef);

      if (!empSnap.exists()) {
        statusEl.innerText = 'Employee record not found.';
        return;
      }

      const empData = empSnap.data();
      if (empData.blocked) {
        statusEl.innerText = 'Access denied. This account has been blocked.';
        return;
      }

      localStorage.setItem('userType', 'employee');
      window.location.href = 'emp-dashboard.html';
    } catch (err) {
      console.error('Login error:', err);
      statusEl.innerText = 'Login failed. Please check credentials.';
    }
  }
}

loginBtn?.addEventListener('click', handleLogin);

// =================== ADMIN DASHBOARD SECTION =================== //

const totalEmployeesEl = document.getElementById('totalEmployees');
const employeeTableBody = document.getElementById('employeeTableBody');

// Load all employees from Firestore
async function loadEmployees() {
  try {
    const snapshot = await getDocs(collection(db, 'employees'));
    let count = 0;
    employeeTableBody.innerHTML = '';

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      count++;

      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${data.name}</td>
        <td>${data.phone}</td>
        <td>${data.blocked ? 'Blocked ❌' : 'Active ✅'}
        <button onclick="toggleBlock('${docSnap.id}', ${data.blocked})">
            ${data.blocked ? 'Unblock' : 'Block'}</button>
        <button onclick="deleteEmployee('${docSnap.id}')">Delete</button>
        <button onclick="viewEmployee('${docSnap.id}')">View</button>
        </td>
      `;

      employeeTableBody.appendChild(row);
    });

    totalEmployeesEl.innerText = count;
  } catch (err) {
    console.error('Error loading employees:', err);
    alert('Failed to load employee data.');
  }
}

// ✅ Delete employee
window.deleteEmployee = async function (id) {
  if (confirm('Are you sure you want to delete this employee?')) {
    try {
      await deleteDoc(doc(db, 'employees', id));
      alert('Employee deleted from records.');
      loadEmployees();
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('Failed to delete employee.');
    }
  }
};

// ✅ Block/Unblock employee
window.toggleBlock = async function (id, currentlyBlocked) {
  const action = currentlyBlocked ? 'unblock' : 'block';
  if (confirm(`Are you sure you want to ${action} this employee?`)) {
    try {
      const ref = doc(db, 'employees', id);
      await updateDoc(ref, { blocked: !currentlyBlocked });
      alert(`Employee has been ${action}ed.`);
      loadEmployees();
    } catch (err) {
      console.error('Error updating block status:', err);
      alert('Failed to update block status.');
    }
  }
};

// ✅ View employee (redirect to view page)
window.viewEmployee = function (id) {
  localStorage.setItem('viewEmpId', id);
  window.location.href = 'employee-view.html';
};

// ✅ Navigation toggle
const toggleExpandBtn = document.getElementById('toggleExpand');
if (toggleExpandBtn) {
  toggleExpandBtn.addEventListener('click', () => {
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
}

// ✅ Navigation helpers
window.navigateTo = function (page) {
  window.location.href = page;
};

// ✅ Updated logout function
const logoutBtn = document.getElementById('logout-btn');

logoutBtn?.addEventListener('click', async () => {
  const userType = localStorage.getItem('userType');

  if (userType === 'employee') {
    try {
      await signOut(auth); // Only sign out Firebase for employees
    } catch (error) {
      console.warn('No active Firebase session, skipping signOut.');
    }
  }

  localStorage.clear(); // Remove all session data
  window.location.href = 'admin-login.html';
});

// ✅ Load employees if on dashboard
if (employeeTableBody) {
  loadEmployees();
}
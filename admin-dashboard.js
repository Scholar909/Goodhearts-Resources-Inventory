// Import Firebase modules
import {
  db,
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from './firebase.js';

// DOM Elements
const totalEmployeesEl = document.getElementById('totalEmployees');
const employeeTableBody = document.getElementById('employeeTableBody');

// Fetch employees from Firestore
async function loadEmployees() {
  try {
    const snapshot = await getDocs(collection(db, 'employees'));
    let count = 0;
    employeeTableBody.innerHTML = ''; // Clear existing rows

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      count++;

      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${data.name}</td>
        <td>${data.phone}</td>
        <td>${data.blocked ? 'Blocked ❌' : 'Active ✅'}</td> <!-- ✅ NEW -->
        <td>
          <button onclick="toggleBlock('${docSnap.id}', ${data.blocked})">
            ${data.blocked ? 'Unblock' : 'Block'}
          </button> <!-- ✅ NEW -->
        </td>
        <td>
          <button onclick="deleteEmployee('${docSnap.id}')">Delete</button>
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

// Delete employee function
window.deleteEmployee = async function (id) {
  if (confirm('Are you sure you want to delete this employee?')) {
    try {
      await deleteDoc(doc(db, 'employees', id));
      loadEmployees(); // Refresh list
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('Failed to delete employee.');
    }
  }
};

// ✅ NEW: Toggle Block/Unblock
window.toggleBlock = async function (id, currentlyBlocked) {
  const action = currentlyBlocked ? 'unblock' : 'block';
  if (confirm(`Are you sure you want to ${action} this employee?`)) {
    try {
      const ref = doc(db, 'employees', id);
      await updateDoc(ref, { blocked: !currentlyBlocked });
      loadEmployees(); // Refresh list
    } catch (err) {
      console.error('Error updating block status:', err);
      alert('Failed to update block status.');
    }
  }
};

// Navigation toggle
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

function navigateTo(page) {
  window.location.href = page;
}

// Navigation helper
window.navigateTo = function (page) {
  window.location.href = page;
};

// Initial load
loadEmployees();
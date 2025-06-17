import { db, doc, getDoc, updateDoc } from './firebase.js';

const viewContainer = document.getElementById('viewContainer');
const backBtn = document.getElementById('backBtn');
const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');

const empId = localStorage.getItem('viewEmpId');

async function loadEmployeeView() {
  if (!empId) return;

  try {
    const empRef = doc(db, 'employees', empId);
    const empSnap = await getDoc(empRef);

    if (empSnap.exists()) {
      const emp = empSnap.data();

      viewContainer.innerHTML = `
        <img src="${emp.passportUrl || 'default.jpg'}" alt="Employee Passport" class="profile-img">
        <div><strong>Name:</strong> <span contenteditable="true" id="empName">${emp.name}</span></div>
        <div><strong>Phone:</strong> <span contenteditable="true" id="empPhone">${emp.phone}</span></div>
        <div><strong>Email:</strong> <span contenteditable="true" id="empEmail">${emp.email}</span></div>
        <div><strong>Position:</strong> <span id="empPosition">Employee</span></div>
        <div><strong>Address:</strong> <span contenteditable="true" id="empAddress">${emp.address || ''}</span></div>
        <div><strong>Status:</strong> ${emp.blocked ? 'Blocked ❌' : 'Active ✅'}</div>
      `;
    } else {
      viewContainer.innerText = 'Employee data not found.';
    }
  } catch (err) {
    console.error('Error loading employee view:', err);
    viewContainer.innerText = 'Error loading employee data.';
  }
}

saveBtn?.addEventListener('click', async () => {
  const updates = {
    name: document.getElementById('empName').innerText.trim(),
    phone: document.getElementById('empPhone').innerText.trim(),
    email: document.getElementById('empEmail').innerText.trim(),
    position: 'Employee',
    address: document.getElementById('empAddress').innerText.trim()
  };

  try {
    await updateDoc(doc(db, 'employees', empId), updates);
    alert('Employee info updated!');
  } catch (err) {
    console.error('Update error:', err);
    alert('Failed to update employee.');
  }
});

backBtn?.addEventListener('click', () => {
  window.location.href = 'admin-dashboard.html';
});

loadEmployeeView();
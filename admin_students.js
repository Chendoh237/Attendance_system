// admin_students.js
const tb = document.querySelector('#studentsList tbody');

async function loadStudents() {
  tb.innerHTML = '';
  try {
    const res = await fetch('/api/admin/students', { headers: { Authorization: 'Bearer ' + (localStorage.getItem('adminToken')||'') }});
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    renderStudentRows(data);
  } catch (err) {
    // mock fallback
    const mock = [
      { fullName:'John Doe', matric:'STU001', department:'CS', email:'john@example.com', photos:4 },
      { fullName:'Jane Roe', matric:'STU002', department:'EE', email:'jane@example.com', photos:3 }
    ];
    renderStudentRows(mock);
  }
}

function renderStudentRows(list) {
  tb.innerHTML = '';
  list.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.fullName}</td><td>${s.matric}</td><td>${s.department}</td><td>${s.email||''}</td><td>${s.photos||0}</td>
      <td><button class="del" data-m="${s.matric}">Delete</button></td>`;
    tb.appendChild(tr);
  });
}

tb.addEventListener('click', async (e) => {
  if (!e.target.matches('.del')) return;
  const m = e.target.dataset.m;
  if (!confirm('Delete student ' + m + '?')) return;
  try {
    const res = await fetch('/api/admin/students/' + encodeURIComponent(m), { method: 'DELETE', headers:{ Authorization: 'Bearer ' + (localStorage.getItem('adminToken')||'')}});
    if (!res.ok) throw new Error('Delete failed');
    alert('Deleted');
    loadStudents();
  } catch (err) {
    alert('Delete failed: ' + err.message);
  }
});

document.getElementById('addStudent')?.addEventListener('click', async () => {
  const fullName = prompt('Full name:');
  if (!fullName) return;
  const matric = prompt('Matric number:');
  if (!matric) return;
  const department = prompt('Department code (e.g. CS):');
  if (!department) return;
  const email = prompt('Email:');
  const payload = { fullName, matric, department, email };
  try {
    const res = await fetch('/api/admin/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (localStorage.getItem('adminToken')||'') },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Add failed');
    alert('Added');
    loadStudents();
  } catch (err) {
    alert('Add failed (mock): ' + err.message);
  }
});

document.getElementById('refreshStudents')?.addEventListener('click', loadStudents);

// init
loadStudents();

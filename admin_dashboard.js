// admin_dashboard.js

const adminNameEl = document.getElementById('adminName');
adminNameEl.innerText = localStorage.getItem('adminName') || 'Admin';

const studentsTableBody = document.querySelector('#studentsTable tbody');
const totalStudentsEl = document.getElementById('totalStudents');
const presentNowEl = document.getElementById('presentNow');
const recognitionLog = document.getElementById('recognitionLog');

// fetch students list
async function loadStudents() {
  try {
    const res = await fetch('/api/admin/students', {
      headers: { Authorization: 'Bearer ' + (localStorage.getItem('adminToken') || '') }
    });
    if (!res.ok) throw new Error('Failed to load students');
    const students = await res.json();
    renderStudents(students);
  } catch (err) {
    console.warn('Load students failed', err);
    // fallback mock
    const mock = [
      { fullName: 'John Doe', matric: 'STU001', email: 'john@example.com', photos: 5 },
      { fullName: 'Jane Smith', matric: 'STU002', email: 'jane@example.com', photos: 3 }
    ];
    renderStudents(mock);
  }
}

function renderStudents(list) {
  studentsTableBody.innerHTML = '';
  list.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.fullName}</td>
      <td>${s.matric}</td>
      <td>${s.email || ''}</td>
      <td>${s.photos || 0}</td>
      <td>
        <button class="deleteBtn" data-matric="${s.matric}">Delete</button>
      </td>
    `;
    studentsTableBody.appendChild(tr);
  });
  totalStudentsEl.innerText = list.length;
}

// delete student
studentsTableBody.addEventListener('click', async (e) => {
  if (!e.target.matches('.deleteBtn')) return;
  const matric = e.target.dataset.matric;
  if (!confirm('Delete student ' + matric + '?')) return;
  try {
    const res = await fetch('/api/admin/students/' + encodeURIComponent(matric), {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + (localStorage.getItem('adminToken') || '') }
    });
    if (!res.ok) throw new Error('Delete failed');
    alert('Deleted');
    loadStudents();
  } catch (err) {
    alert('Delete failed: ' + err.message);
  }
});

// trigger training
document.getElementById('triggerTrain').addEventListener('click', async () => {
  try {
    const res = await fetch('/api/train', { method: 'POST', headers: { Authorization: 'Bearer ' + (localStorage.getItem('adminToken') || '') }});
    if (!res.ok) throw new Error('Failed');
    alert('Training started on server.');
  } catch (err) {
    alert('Training request failed: ' + err.message);
  }
});

// CAMERA / recognition
let stream;
const adminVideo = document.getElementById('adminVideo');

document.getElementById('startCam').addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    adminVideo.srcObject = stream;
    document.getElementById('liveStatus').innerText = 'Running';
  } catch (err) {
    alert('Cannot start camera: ' + err.message);
  }
});

document.getElementById('stopCam').addEventListener('click', () => {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    adminVideo.srcObject = null;
    document.getElementById('liveStatus').innerText = 'Stopped';
  }
});

document.getElementById('snap').addEventListener('click', async () => {
  if (!adminVideo.srcObject) return alert('Start camera first');
  const canvas = document.createElement('canvas');
  canvas.width = adminVideo.videoWidth;
  canvas.height = adminVideo.videoHeight;
  canvas.getContext('2d').drawImage(adminVideo, 0, 0);
  const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.8));

  // send frame to backend for recognition
  const fd = new FormData();
  fd.append('frame', blob, 'frame.jpg');

  try {
    const res = await fetch('/api/recognize', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + (localStorage.getItem('adminToken') || '') },
      body: fd
    });
    if (!res.ok) throw new Error('Recognition failed');
    const detections = await res.json(); // expect array of {matric, name, status, confidence, timestamp}
    appendDetections(detections);
  } catch (err) {
    alert('Recognition error: ' + err.message);
  }
});

function appendDetections(list) {
  list.forEach(d => {
    const el = document.createElement('div');
    el.className = 'recognition-item';
    el.textContent = `${d.name || d.matric} — ${d.status} — ${d.timestamp} (${Math.round(d.confidence || 0)})`;
    recognitionLog.prepend(el);
  });
  // update present counter
  presentNowEl.innerText = document.querySelectorAll('.recognition-item').length;
}

// init
loadStudents();

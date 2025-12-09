// admin_timetable.js
const deptSelect = document.getElementById('deptSelect');
const daysRow = document.getElementById('daysRow');
const slotsList = document.getElementById('slotsList');
const selectedDayTitle = document.getElementById('selectedDayTitle');

const slotType = document.getElementById('slotType');
const courseCode = document.getElementById('courseCode');
const courseName = document.getElementById('courseName');
const startTime = document.getElementById('startTime');
const endTime = document.getElementById('endTime');

let currentDept = null;
let schedule = {}; // loaded schedule for current dept
let selectedDay = 'Tuesday';
const DAYS = ['Tuesday','Wednesday','Thursday','Friday','Saturday','Monday'];

// initialize days row
function renderDays() {
  daysRow.innerHTML = '';
  DAYS.forEach(d => {
    const btn = document.createElement('button');
    btn.className = 'day-btn' + (d === selectedDay ? ' active' : '');
    btn.textContent = d;
    btn.onclick = () => { selectedDay = d; renderDays(); renderSlots(); };
    daysRow.appendChild(btn);
  });
}

// load departments (mock or API)
async function loadDepts(){
  try {
    const res = await fetch('/api/departments');
    if (!res.ok) throw new Error('No depts');
    const depts = await res.json();
    populateDepts(depts);
  } catch(err){
    // fallback mock
    const depts = [
      {code:'EE', name:'Electrical Engineering'},
      {code:'CS', name:'Computer Science'},
      {code:'ME', name:'Mechanical Eng'}
    ];
    populateDepts(depts);
  }
}

function populateDepts(list){
  deptSelect.innerHTML = '';
  list.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.code;
    opt.textContent = `${d.code} — ${d.name}`;
    deptSelect.appendChild(opt);
  });
  currentDept = deptSelect.value;
  loadScheduleForDept(currentDept);
}

deptSelect.addEventListener('change', () => {
  currentDept = deptSelect.value;
  loadScheduleForDept(currentDept);
});

async function loadScheduleForDept(code){
  try {
    const res = await fetch(`/api/departments/${encodeURIComponent(code)}/schedule`);
    if (!res.ok) throw new Error('no schedule');
    schedule = await res.json();
  } catch (err) {
    // default schedule
    schedule = {
      department: currentDept,
      code: currentDept,
      weekly: { Tuesday:[], Wednesday:[], Thursday:[], Friday:[], Saturday:[], Monday:[] }
    };
  }
  renderSlots();
}

function renderSlots(){
  selectedDayTitle.textContent = `${selectedDay} — ${currentDept}`;
  slotsList.innerHTML = '';
  const slots = schedule.weekly[selectedDay] || [];
  slots.forEach((s, idx) => {
    const el = document.createElement('div');
    el.className = 'slot';
    el.innerHTML = `
      <div class="meta">
        <div><strong>${s.type === 'break' ? 'BREAK' : (s.courseCode || '')} ${s.courseName ? '- ' + s.courseName : ''}</strong></div>
        <div class="small">${s.start} → ${s.end} • id: ${s.slotId}</div>
      </div>
      <div class="controls">
        <button data-idx="${idx}" class="editBtn">Edit</button>
        <button data-idx="${idx}" class="delBtn">Delete</button>
      </div>
    `;
    slotsList.appendChild(el);
  });
}

// add slot
document.getElementById('addSlot').addEventListener('click', () => {
  if (!schedule.weekly) schedule.weekly = {};
  if (!schedule.weekly[selectedDay]) schedule.weekly[selectedDay] = [];
  const st = startTime.value;
  const et = endTime.value;
  if (!st || !et) return alert('Pick start and end');
  const slot = {
    slotId: `${selectedDay.toLowerCase().slice(0,3)}_${Date.now()}`,
    type: slotType.value,
    courseCode: slotType.value === 'class' ? courseCode.value.trim() : null,
    courseName: slotType.value === 'class' ? courseName.value.trim() : null,
    start: st,
    end: et
  };
  schedule.weekly[selectedDay].push(slot);
  renderSlots();
});

// delegate delete / edit
slotsList.addEventListener('click', (e) => {
  if (e.target.matches('.delBtn')) {
    const idx = parseInt(e.target.dataset.idx,10);
    if (confirm('Delete this slot?')) {
      schedule.weekly[selectedDay].splice(idx,1);
      renderSlots();
    }
  } else if (e.target.matches('.editBtn')) {
    const idx = parseInt(e.target.dataset.idx,10);
    const s = schedule.weekly[selectedDay][idx];
    slotType.value = s.type;
    courseCode.value = s.courseCode || '';
    courseName.value = s.courseName || '';
    startTime.value = s.start;
    endTime.value = s.end;
    // remove original slot - user will add again after editing
    schedule.weekly[selectedDay].splice(idx,1);
    renderSlots();
  }
});

// save schedule to server
document.getElementById('saveScheduleBtn').addEventListener('click', async () => {
  try {
    const res = await fetch(`/api/departments/${encodeURIComponent(currentDept)}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (localStorage.getItem('adminToken')||'') },
      body: JSON.stringify(schedule)
    });
    if (!res.ok) throw new Error('Save failed');
    alert('Saved');
  } catch (err) {
    alert('Save failed (mock): ' + err.message);
  }
});

document.getElementById('newDeptBtn').addEventListener('click', () => {
  const code = prompt('New department code (e.g. EE):');
  const name = prompt('Department name:');
  if (!code || !name) return;
  const opt = document.createElement('option');
  opt.value = code;
  opt.textContent = `${code} — ${name}`;
  deptSelect.appendChild(opt);
  deptSelect.value = code;
  currentDept = code;
  schedule = { department: name, code, weekly: { Tuesday:[], Wednesday:[], Thursday:[], Friday:[], Saturday:[], Monday:[] } };
  renderSlots();
});

// init
renderDays();
loadDepts();

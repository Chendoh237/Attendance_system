// admin_login.js
const form = document.getElementById('adminLoginForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;

  // simple demo: call backend
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    // data should include a token + admin name
    localStorage.setItem('adminToken', data.token || 'demo-token');
    localStorage.setItem('adminName', data.name || email);
    window.location.href = 'dashboard.html';
  } catch (err) {
    alert('Login failed: ' + err.message);
  }
});

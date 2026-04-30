// login.js — auth logic

const DEFAULT_USERS = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'user',  password: 'user123',  role: 'user'  },
];

// ── Storage helpers ──────────────────────────────────────────────────────────
function getUsers() {
  const stored = localStorage.getItem('bc_users');
  if (!stored) {
    localStorage.setItem('bc_users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  return JSON.parse(stored);
}

function saveUsers(users) {
  localStorage.setItem('bc_users', JSON.stringify(users));
}

// ── Tab switch ───────────────────────────────────────────────────────────────
function switchTab(tab) {
  document.getElementById('panel-login').classList.toggle('active', tab === 'login');
  document.getElementById('panel-register').classList.toggle('active', tab === 'register');
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  clearAlerts();
}

// ── Alert helpers ────────────────────────────────────────────────────────────
function showAlert(id, msg, type = 'error') {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = `alert alert-${type} show`;
}

function clearAlerts() {
  ['login-alert', 'register-alert'].forEach(id => {
    const el = document.getElementById(id);
    el.className = 'alert alert-error';
    el.textContent = '';
  });
}

// ── Role selector ────────────────────────────────────────────────────────────
function selectRole(radio) {
  document.getElementById('role-admin-opt').classList.toggle('selected', radio.value === 'admin');
  document.getElementById('role-user-opt').classList.toggle('selected', radio.value === 'user');
}

// ── Login ────────────────────────────────────────────────────────────────────
function handleLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  if (!username || !password) {
    showAlert('login-alert', 'Inserisci username e password.');
    return;
  }

  const users = getUsers();
  const found = users.find(u => u.username === username && u.password === password);

  if (!found) {
    showAlert('login-alert', 'Credenziali non valide. Riprova.');
    return;
  }

  // Save session
  sessionStorage.setItem('bc_session', JSON.stringify({ username: found.username, role: found.role }));

  // Redirect
  if (found.role === 'admin') {
    window.location.href = 'adminEs30.html';
  } else {
    window.location.href = 'userEs30.html';
  }
}

// ── Register ─────────────────────────────────────────────────────────────────
function handleRegister() {
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;
  const roleRadio = document.querySelector('input[name="role"]:checked');
  const role = roleRadio ? roleRadio.value : 'user';

  if (!username) { showAlert('register-alert', 'Inserisci uno username.'); return; }
  if (username.length < 3) { showAlert('register-alert', 'Username troppo corto (min 3 caratteri).'); return; }
  if (!password) { showAlert('register-alert', 'Inserisci una password.'); return; }
  if (password.length < 4) { showAlert('register-alert', 'Password troppo corta (min 4 caratteri).'); return; }

  const users = getUsers();
  if (users.find(u => u.username === username)) {
    showAlert('register-alert', 'Username già in uso. Scegline un altro.');
    return;
  }

  users.push({ username, password, role });
  saveUsers(users);

  showAlert('register-alert', `Account "${username}" creato con ruolo ${role}! Effettua il login.`, 'success');
  renderUsersList();

  // Auto-switch to login after 1.5s
  setTimeout(() => {
    document.getElementById('login-username').value = username;
    document.getElementById('login-password').value = '';
    switchTab('login');
  }, 1500);
}

// ── Users list (hint) ────────────────────────────────────────────────────────
function renderUsersList() {
  const list = document.getElementById('users-list');
  const users = getUsers();
  list.innerHTML = users.map(u => `
    <div class="user-row">
      <span class="name">${escHtml(u.username)}</span>
      <span class="role-tag ${u.role}">${u.role}</span>
    </div>
  `).join('');
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Enter key support ────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const loginActive = document.getElementById('panel-login').classList.contains('active');
  if (loginActive) handleLogin(); else handleRegister();
});

// ── Init ─────────────────────────────────────────────────────────────────────
(function init() {
  // If already logged in, redirect
  const session = sessionStorage.getItem('bc_session');
  if (session) {
    const { role } = JSON.parse(session);
    window.location.href = role === 'admin' ? 'adminEs30.html' : 'userEs30.html';
    return;
  }
  getUsers(); // ensure defaults
  renderUsersList();
})();

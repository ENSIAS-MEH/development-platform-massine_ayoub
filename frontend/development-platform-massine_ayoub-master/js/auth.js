(function () {
  'use strict';

  const API = 'http://localhost:8080/api';
  const SESSION_KEY = 'youthconnect_session';

  const AUTH_PAGES = ['login.html', 'signup.html'];
  const PROTECTED_PAGES = ['index.html', 'create.html', 'activities.html', 'profile.html', ''];

  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
    catch { return null; }
  }

  function setSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function getInitials(name) {
    return (name || 'YC').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  function currentPage() {
    const path = window.location.pathname;
    const file = path.split('/').pop() || 'index.html';
    return file === '' ? 'index.html' : file;
  }

  window.YouthAuth = {
    getSession,
    logout() {
      clearSession();
      window.location.href = 'login.html';
    },
    async register({ name, email, password }) {
      try {
        const res = await fetch(`${API}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) return { ok: false, message: data };
        setSession(data);
        return { ok: true, user: data };
      } catch {
        return { ok: false, message: 'Server error. Is the backend running?' };
      }
    },
    async login({ email, password }) {
      try {
        const res = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) return { ok: false, message: data };
        setSession(data);
        return { ok: true, user: data };
      } catch {
        return { ok: false, message: 'Server error. Is the backend running?' };
      }
    }
  };

  function updateNavbar() {
    const session = getSession();
    const guest = document.getElementById('navGuest');
    const userEl = document.getElementById('navUser');
    const authOnly = document.querySelectorAll('.nav-auth-only');
    const avatar = document.getElementById('navAvatar');
    const mobileGuest = document.getElementById('mobileNavGuest');
    const mobileUser = document.getElementById('mobileNavUser');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileAvatar = document.getElementById('profileAvatar');

    if (session) {
      guest?.classList.add('hidden');
      userEl?.classList.remove('hidden');
      mobileGuest?.classList.add('hidden');
      mobileUser?.classList.remove('hidden');
      authOnly.forEach(el => el.classList.remove('hidden'));
      const initials = getInitials(session.username || session.name);
      if (avatar) { avatar.textContent = initials; avatar.setAttribute('aria-label', session.username || session.name); }
      if (profileName) profileName.textContent = session.username || session.name;
      if (profileEmail) profileEmail.textContent = session.email;
      if (profileAvatar) profileAvatar.textContent = initials;
    } else {
      guest?.classList.remove('hidden');
      userEl?.classList.add('hidden');
      mobileGuest?.classList.remove('hidden');
      mobileUser?.classList.add('hidden');
      authOnly.forEach(el => el.classList.add('hidden'));
    }

    document.getElementById('btnLogout')?.addEventListener('click', () => YouthAuth.logout());
    document.getElementById('btnLogoutMobile')?.addEventListener('click', () => YouthAuth.logout());
    document.getElementById('profileLogout')?.addEventListener('click', () => YouthAuth.logout());
  }

  function guardRoutes() {
    const session = getSession();
    const page = currentPage();
    if (session && AUTH_PAGES.includes(page)) { window.location.replace('index.html'); return; }
    if (!session && PROTECTED_PAGES.includes(page) && !AUTH_PAGES.includes(page)) {
      window.location.replace(`login.html?next=${encodeURIComponent(page)}`);
    }
  }

  function showError(el, message) { if (!el) return; el.textContent = message; el.classList.add('show'); }
  function hideError(el) { el?.classList.remove('show'); }

  function setupPasswordToggle() {
    document.querySelectorAll('[data-toggle-password]').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById(btn.getAttribute('data-toggle-password'));
        if (!input) return;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.textContent = isPassword ? 'Hide' : 'Show';
      });
    });
  }

  function initLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    const errorEl = document.getElementById('authError');
    const params = new URLSearchParams(window.location.search);
    if (params.get('registered') === '1') window.showToast?.('Account created! Please log in.');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideError(errorEl);
      const result = await YouthAuth.login({ email: form.email.value, password: form.password.value });
      if (!result.ok) { showError(errorEl, result.message); return; }
      const next = params.get('next');
      window.location.href = next ? decodeURIComponent(next) : 'index.html';
    });
  }

  function initSignupForm() {
    const form = document.getElementById('signupForm');
    if (!form) return;
    const errorEl = document.getElementById('authError');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideError(errorEl);
      const password = form.password.value;
      const confirm = form.confirmPassword.value;
      if (password.length < 6) { showError(errorEl, 'Password must be at least 6 characters.'); return; }
      if (password !== confirm) { showError(errorEl, 'Passwords do not match.'); return; }
      if (!form.terms.checked) { showError(errorEl, 'Please accept the terms.'); return; }
      const result = await YouthAuth.register({ name: form.name.value, email: form.email.value, password });
      if (!result.ok) { showError(errorEl, result.message); return; }
      window.location.href = 'index.html';
    });
  }

  guardRoutes();
  updateNavbar();
  setupPasswordToggle();
  initLoginForm();
  initSignupForm();
})();
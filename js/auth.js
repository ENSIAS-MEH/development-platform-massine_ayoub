/**
 * YouthConnect — Auth frontend (localStorage, sans Spring Boot)
 * À remplacer par l’API Massine plus tard.
 */
(function () {
  'use strict';

  const USERS_KEY = 'youthconnect_users';
  const SESSION_KEY = 'youthconnect_session';

  const AUTH_PAGES = ['login.html', 'signup.html'];
  const PROTECTED_PAGES = ['index.html', 'create.html', 'activities.html', 'profile.html', ''];

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function setSession(user) {
    const session = {
      id: user.id,
      name: user.name,
      email: user.email,
      loggedInAt: Date.now(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function getInitials(name) {
    return (name || 'YC')
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  function currentPage() {
    const path = window.location.pathname;
    const file = path.split('/').pop() || 'index.html';
    return file === '' ? 'index.html' : file;
  }

  function isAuthPage() {
    return AUTH_PAGES.includes(currentPage());
  }

  function isProtectedPage() {
    const page = currentPage();
    return PROTECTED_PAGES.includes(page) || page === 'index.html';
  }

  window.YouthAuth = {
    getSession,
    getUsers,
    logout() {
      clearSession();
      window.location.href = 'login.html';
    },
    register({ name, email, password }) {
      const users = getUsers();
      const normalizedEmail = email.trim().toLowerCase();
      if (users.some((u) => u.email === normalizedEmail)) {
        return { ok: false, message: 'Un compte existe déjà avec cet email.' };
      }
      const user = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        name: name.trim(),
        email: normalizedEmail,
        password,
        createdAt: Date.now(),
      };
      users.push(user);
      saveUsers(users);
      setSession(user);
      return { ok: true, user };
    },
    login({ email, password }) {
      const users = getUsers();
      const normalizedEmail = email.trim().toLowerCase();
      const user = users.find((u) => u.email === normalizedEmail && u.password === password);
      if (!user) {
        return { ok: false, message: 'Email ou mot de passe incorrect.' };
      }
      setSession(user);
      return { ok: true, user };
    },
  };

  function updateNavbar() {
    const session = getSession();
    const guest = document.getElementById('navGuest');
    const user = document.getElementById('navUser');
    const authOnly = document.querySelectorAll('.nav-auth-only');
    const avatar = document.getElementById('navAvatar');
    const mobileGuest = document.getElementById('mobileNavGuest');
    const mobileUser = document.getElementById('mobileNavUser');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileAvatar = document.getElementById('profileAvatar');

    if (session) {
      guest?.classList.add('hidden');
      user?.classList.remove('hidden');
      mobileGuest?.classList.add('hidden');
      mobileUser?.classList.remove('hidden');
      authOnly.forEach((el) => el.classList.remove('hidden'));
      const initials = getInitials(session.name);
      if (avatar) {
        avatar.textContent = initials;
        avatar.setAttribute('aria-label', session.name);
      }
      if (profileName) profileName.textContent = session.name;
      if (profileEmail) profileEmail.textContent = session.email;
      if (profileAvatar) profileAvatar.textContent = initials;
    } else {
      guest?.classList.remove('hidden');
      user?.classList.add('hidden');
      mobileGuest?.classList.remove('hidden');
      mobileUser?.classList.add('hidden');
      authOnly.forEach((el) => el.classList.add('hidden'));
    }

    const btnLogout = document.getElementById('btnLogout');
    const btnLogoutMobile = document.getElementById('btnLogoutMobile');
    if (btnLogout) btnLogout.onclick = () => YouthAuth.logout();
    if (btnLogoutMobile) btnLogoutMobile.onclick = () => YouthAuth.logout();
    const profileLogout = document.getElementById('profileLogout');
    if (profileLogout) profileLogout.onclick = () => YouthAuth.logout();
  }

  function guardRoutes() {
    const session = getSession();
    const page = currentPage();

    if (session && isAuthPage()) {
      window.location.replace('index.html');
      return;
    }

    if (!session && isProtectedPage() && !isAuthPage()) {
      const next = encodeURIComponent(page);
      window.location.replace(`login.html?next=${next}`);
    }
  }

  function showError(el, message) {
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
  }

  function hideError(el) {
    el?.classList.remove('show');
  }

  function setupPasswordToggle() {
    document.querySelectorAll('[data-toggle-password]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-toggle-password');
        const input = document.getElementById(id);
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
    if (params.get('registered') === '1') {
      window.showToast?.('Compte créé ! Connectez-vous.');
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      hideError(errorEl);
      const email = form.email.value;
      const password = form.password.value;
      const result = YouthAuth.login({ email, password });
      if (!result.ok) {
        showError(errorEl, result.message);
        return;
      }
      const next = params.get('next');
      window.location.href = next ? decodeURIComponent(next) : 'index.html';
    });
  }

  function initSignupForm() {
    const form = document.getElementById('signupForm');
    if (!form) return;

    const errorEl = document.getElementById('authError');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      hideError(errorEl);

      const name = form.name.value;
      const email = form.email.value;
      const password = form.password.value;
      const confirm = form.confirmPassword.value;
      const terms = form.terms.checked;

      if (password.length < 6) {
        showError(errorEl, 'Le mot de passe doit contenir au moins 6 caractères.');
        return;
      }
      if (password !== confirm) {
        showError(errorEl, 'Les mots de passe ne correspondent pas.');
        return;
      }
      if (!terms) {
        showError(errorEl, 'Veuillez accepter les conditions d’utilisation.');
        return;
      }

      const result = YouthAuth.register({ name, email, password });
      if (!result.ok) {
        showError(errorEl, result.message);
        return;
      }
      window.location.href = 'index.html';
    });
  }

  guardRoutes();
  updateNavbar();
  setupPasswordToggle();
  initLoginForm();
  initSignupForm();
})();

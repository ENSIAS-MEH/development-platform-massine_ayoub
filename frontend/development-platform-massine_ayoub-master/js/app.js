const API = 'http://localhost:8080/api';

async function loadActivities() {
  const activityGrid = document.getElementById('activityGrid');
  if (!activityGrid) return;

  const session = JSON.parse(localStorage.getItem('youthconnect_session') || 'null');

  try {
    const res = await fetch(`${API}/activities`);
    const activities = await res.json();

    let joinedIds = [];
    if (session) {
      try {
        const joinedRes = await fetch(`${API}/activities/joined?email=${session.email}`);
        const joined = await joinedRes.json();
        joinedIds = joined.map(p => p.activity.id);
      } catch(e) {}
    }

    activityGrid.innerHTML = '';

    if (activities.length === 0) {
      activityGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--color-text-muted);padding:3rem 1rem;">No activities yet. Be the first to create one!</p>';
      return;
    }

    for (const activity of activities) {
      const card = document.createElement('div');
      card.className = 'activity-card';
      card.dataset.category = activity.category?.name?.toLowerCase() || 'other';
      card.dataset.search = activity.title + ' ' + activity.location;

      let count = 0;
      try {
        const countRes = await fetch(`${API}/activities/${activity.id}/count`);
        count = await countRes.json();
      } catch(e) {}

      const alreadyJoined = joinedIds.includes(activity.id);
      const isCreator = session && activity.createdBy?.id === session.id;

      const categoryColors = {
        sports: 'linear-gradient(135deg, #38a169, #276749)',
        music: 'linear-gradient(135deg, #805ad5, #553c9a)',
        art: 'linear-gradient(135deg, #dd6b20, #9c4221)',
        tech: 'linear-gradient(135deg, #3182ce, #2c5282)',
        outdoor: 'linear-gradient(135deg, #319795, #285e61)',
        other: 'linear-gradient(135deg, #667eea, #764ba2)'
      };

      const categoryEmojis = {
        sports: '⚽',
        music: '🎵',
        art: '🎨',
        tech: '💻',
        outdoor: '🌿',
        other: '🎯'
      };

      const cat = activity.category?.name?.toLowerCase() || 'other';
      const bg = categoryColors[cat] || categoryColors.other;
      const emoji = categoryEmojis[cat] || '🎯';

      card.innerHTML = `
        <div class="activity-card__img" style="background: ${bg}; display:flex; align-items:center; justify-content:center; height:120px; border-radius:12px 12px 0 0;">
          <span style="font-size:2.5rem;">${emoji}</span>
        </div>
        <div class="activity-card__body">
          <h3 class="activity-card__title">${activity.title}</h3>
          <p class="activity-card__meta">${activity.activityDate ? new Date(activity.activityDate).toDateString() : 'Date TBD'} · ${activity.location || 'Location TBD'}</p>
          <div class="activity-card__footer">
            <span class="category-badge">${activity.category?.name || 'General'}</span>
            <span class="activity-card__count">${activity.maxParticipants ? count + '/' + activity.maxParticipants : 'Open'}</span>
            <div style="display:flex;gap:6px;">
              <button class="btn-join ${alreadyJoined ? 'joined' : ''}" data-id="${activity.id}">
                ${alreadyJoined ? 'Joined' : 'Join'}
              </button>
              ${isCreator ? `<button class="btn-delete" data-id="${activity.id}" style="background:none;border:1px solid #e53e3e;color:#e53e3e;border-radius:8px;padding:4px 10px;cursor:pointer;font-size:12px;">Delete</button>` : ''}
            </div>
          </div>
        </div>
      `;
      activityGrid.appendChild(card);
    }

  } catch(e) {
    console.error('Could not load activities:', e);
  }
}

loadActivities();

(function () {
  'use strict';

  const hamburger = document.querySelector('.navbar__hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const toast = document.getElementById('toast');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('is-open');
        mobileMenu.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  let toastTimer;
  window.showToast = function (message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  };

  const activityGrid = document.getElementById('activityGrid');
  if (!activityGrid) return;

  const filterTabs = document.querySelectorAll('.filter-tab');
  const categoryPills = document.querySelectorAll('.category-pill');
  const searchInput = document.querySelector('.search-bar__input');

  let activeFilter = 'all';
  let activeCategory = 'all';
  let searchQuery = '';

  function getCards() {
    return Array.from(activityGrid.querySelectorAll('.activity-card'));
  }

  function cardMatches(card) {
    const category = card.dataset.category;
    const searchText = (card.dataset.search || '') + ' ' + card.querySelector('.activity-card__title')?.textContent;
    if (activeCategory !== 'all' && category !== activeCategory) return false;
    if (searchQuery && !searchText.toLowerCase().includes(searchQuery)) return false;
    return true;
  }

  function applyFilters() {
    let visible = 0;
    getCards().forEach((card) => {
      const show = cardMatches(card);
      card.classList.toggle('hidden', !show);
      if (show) visible += 1;
    });

    let emptyMsg = document.getElementById('emptyFilterMsg');
    if (visible === 0) {
      if (!emptyMsg) {
        emptyMsg = document.createElement('p');
        emptyMsg.id = 'emptyFilterMsg';
        emptyMsg.style.cssText = 'grid-column:1/-1;text-align:center;color:var(--color-text-muted);padding:3rem 1rem;';
        emptyMsg.textContent = 'No activities match your filters.';
        activityGrid.appendChild(emptyMsg);
      }
    } else if (emptyMsg) {
      emptyMsg.remove();
    }
  }

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      filterTabs.forEach((t) => t.classList.remove('filter-tab--active'));
      tab.classList.add('filter-tab--active');
      activeFilter = tab.dataset.filter;
      applyFilters();
    });
  });

  categoryPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      categoryPills.forEach((p) => p.classList.remove('category-pill--active'));
      pill.classList.add('category-pill--active');
      activeCategory = pill.dataset.category;
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.trim().toLowerCase();
      applyFilters();
    });
  }

  // Join / Leave handler
  activityGrid.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-join');
    if (!btn || btn.disabled) return;

    const session = JSON.parse(localStorage.getItem('youthconnect_session') || 'null');
    if (!session) { window.location.href = 'login.html'; return; }

    const card = btn.closest('.activity-card');
    const activityId = btn.dataset.id;
    const title = card?.querySelector('.activity-card__title')?.textContent || 'activity';
    const countEl = card?.querySelector('.activity-card__count');
    const isJoined = btn.classList.contains('joined');

    try {
      if (isJoined) {
        const res = await fetch(`${API}/activities/${activityId}/leave?email=${session.email}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          btn.classList.remove('joined');
          btn.textContent = 'Join';
          if (countEl) {
            const [current, max] = countEl.textContent.split('/').map(Number);
            if (!isNaN(current) && current > 0) countEl.textContent = `${current - 1}/${max}`;
          }
          showToast(`You left ${title}.`);
        }
      } else {
        const res = await fetch(`${API}/activities/${activityId}/join?email=${session.email}`, {
          method: 'POST'
        });
        if (res.ok) {
          btn.classList.add('joined');
          btn.textContent = 'Joined';
          if (countEl) {
            const [current, max] = countEl.textContent.split('/').map(Number);
            if (!isNaN(current) && !isNaN(max) && current < max) countEl.textContent = `${current + 1}/${max}`;
          }
          showToast(`You're in! See you at ${title}.`);
        } else {
          const err = await res.text();
          showToast(err);
        }
      }
    } catch(e) {
      showToast('Could not connect to server.');
    }
  });

  // Delete handler
  activityGrid.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-delete');
    if (!btn) return;

    const session = JSON.parse(localStorage.getItem('youthconnect_session') || 'null');
    if (!session) return;

    const activityId = btn.dataset.id;
    const card = btn.closest('.activity-card');
    const title = card?.querySelector('.activity-card__title')?.textContent;

    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`${API}/activities/${activityId}?email=${session.email}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        card.remove();
        showToast('Activity deleted successfully.');
      } else {
        const err = await res.text();
        showToast(err);
      }
    } catch(e) {
      showToast('Could not connect to server.');
    }
  });

})();
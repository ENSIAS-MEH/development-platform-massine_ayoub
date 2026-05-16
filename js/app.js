/**
 * YouthConnect — shared UI & discover page interactions
 */
(function () {
  'use strict';

  const hamburger = document.querySelector('.navbar__hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const toast = document.getElementById('toast');

  /* ——— Mobile menu ——— */
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

  /* ——— Toast ——— */
  let toastTimer;
  window.showToast = function (message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  };

  /* ——— Discover page only ——— */
  const activityGrid = document.getElementById('activityGrid');
  if (!activityGrid) return;

  const filterTabs = document.querySelectorAll('.filter-tab');
  const categoryPills = document.querySelectorAll('.category-pill');
  const searchInput = document.querySelector('.search-bar__input');
  const cards = Array.from(activityGrid.querySelectorAll('.activity-card'));

  let activeFilter = 'all';
  let activeCategory = 'all';
  let searchQuery = '';

  function cardMatches(card) {
    const category = card.dataset.category;
    const near = card.dataset.near === 'true';
    const week = card.dataset.week === 'true';
    const searchText = (card.dataset.search || '') + ' ' + card.querySelector('.activity-card__title')?.textContent;

    if (activeCategory !== 'all' && category !== activeCategory) return false;
    if (activeFilter === 'near' && !near) return false;
    if (activeFilter === 'week' && !week) return false;
    if (searchQuery && !searchText.toLowerCase().includes(searchQuery)) return false;

    return true;
  }

  function applyFilters() {
    let visible = 0;
    cards.forEach((card) => {
      const show = cardMatches(card);
      card.classList.toggle('hidden', !show);
      if (show) visible += 1;
    });

    let emptyMsg = document.getElementById('emptyFilterMsg');
    if (visible === 0) {
      if (!emptyMsg) {
        emptyMsg = document.createElement('p');
        emptyMsg.id = 'emptyFilterMsg';
        emptyMsg.style.cssText =
          'grid-column:1/-1;text-align:center;color:var(--color-text-muted);padding:3rem 1rem;';
        emptyMsg.textContent = 'No activities match your filters. Try adjusting your search.';
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

  activityGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-join');
    if (!btn || btn.disabled) return;

    const card = btn.closest('.activity-card');
    const title = card?.querySelector('.activity-card__title')?.textContent || 'activity';
    const countEl = card?.querySelector('.activity-card__count');
    const joined = btn.classList.toggle('joined');

    if (joined) {
      btn.textContent = 'Joined';
      if (countEl) {
        const [current, max] = countEl.textContent.split('/').map(Number);
        if (!Number.isNaN(current) && !Number.isNaN(max) && current < max) {
          countEl.textContent = `${current + 1}/${max}`;
        }
      }
      showToast(`You're in! See you at ${title}.`);
    } else {
      btn.textContent = 'Join';
      if (countEl) {
        const [current, max] = countEl.textContent.split('/').map(Number);
        if (!Number.isNaN(current) && current > 0) {
          countEl.textContent = `${current - 1}/${max}`;
        }
      }
      showToast(`You left ${title}.`);
    }
  });
})();

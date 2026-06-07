/**
 * YouthConnect — create activity form
 */
(function () {
  'use strict';

  const form = document.getElementById('createForm');
  if (!form) return;

  const titleInput = document.getElementById('title');
  const titleCounter = document.getElementById('titleCounter');
  const descInput = document.getElementById('description');
  const descCounter = document.getElementById('descCounter');
  const categoryGrid = document.getElementById('categoryGrid');
  const categoryInput = document.getElementById('categoryInput');
  const uploadArea = document.getElementById('uploadArea');
  const coverImage = document.getElementById('coverImage');
  const uploadContent = document.getElementById('uploadContent');

  function updateCounter(input, counterEl, max) {
    const len = input.value.length;
    counterEl.textContent = `${len}/${max}`;
    counterEl.style.color =
      len >= max * 0.9 ? '#f97316' : len >= max ? '#ef4444' : '';
  }

  if (titleInput && titleCounter) {
    titleInput.addEventListener('input', () => updateCounter(titleInput, titleCounter, 80));
  }

  if (descInput && descCounter) {
    descInput.addEventListener('input', () => updateCounter(descInput, descCounter, 500));
  }

  if (categoryGrid) {
    categoryGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-btn');
      if (!btn) return;

      const categoryIdMap = {
        sports: 1,
        music: 2,
        art: 3,
        tech: 4,
        outdoor: 5,
        other: 6
      };

      const wasSelected = btn.classList.contains('category-btn--selected');
      categoryGrid.querySelectorAll('.category-btn').forEach((b) => {
        b.classList.remove('category-btn--selected');
      });

      if (!wasSelected) {
        btn.classList.add('category-btn--selected');
        categoryInput.value = categoryIdMap[btn.dataset.category] || '';
      } else {
        categoryInput.value = '';
      }
    });
  }

  if (coverImage && uploadArea) {
    coverImage.addEventListener('change', () => {
      const file = coverImage.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        window.showToast?.('Image must be under 5MB.');
        coverImage.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        uploadArea.classList.add('has-image');
        uploadContent.innerHTML = `<img src="${ev.target.result}" alt="Cover preview">`;
      };
      reader.readAsDataURL(file);
    });
  }

  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!categoryInput.value) { window.showToast?.('Please select a category.'); return; }
  if (!form.checkValidity()) { form.reportValidity(); return; }

  const session = JSON.parse(localStorage.getItem('youthconnect_session') || 'null');
  if (!session) { window.location.href = 'login.html'; return; }

  const data = {
    title: titleInput.value.trim(),
    description: descInput.value.trim(),
    location: document.getElementById('location')?.value.trim(),
    activityDate: document.getElementById('date')?.value + 'T' + (document.getElementById('time')?.value || '00:00'),
    maxParticipants: document.getElementById('maxParticipants')?.value || null,
    category: { id: parseInt(categoryInput.value) }
  };

  console.log('Sending data:', JSON.stringify(data));
  try {
    const res = await fetch(`http://localhost:8080/api/activities?email=${session.email}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      window.showToast?.('Activity published! 🎉');
      setTimeout(() => window.location.href = 'index.html', 1200);
    } else {
      const err = await res.text();
      window.showToast?.(err);
    }
  } catch {
    window.showToast?.('Could not connect to server.');
  }
});
})();

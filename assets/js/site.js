// Lightweight filtering and popups
(function(){
  function byId(id){ return document.getElementById(id); }
  function $(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)); }

  function renderTagFilters(){
    const list = byId('tag-list'); if(!list || !window.__ALL_TAGS__) return;
    list.innerHTML = '';
    window.__ALL_TAGS__.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'tag-chip';
      span.textContent = '#' + tag;
      span.dataset.tag = tag;
      span.addEventListener('click', () => {
        span.classList.toggle('active');
        applyFilters();
      });
      list.appendChild(span);
    });
  }

  function applyFilters(){
    const q = (byId('search')?.value || '').trim().toLowerCase();
    const activeTags = new Set($('.tag-chip.active').map(el => el.dataset.tag));
    // Detect list type on this page
    const isProjectList = document.getElementById('projectList') !== null;
    const cards = isProjectList ? $('.aProject') : $('.aCode');
    cards.forEach(card => {
      const title = (card.dataset.title || '').toLowerCase();
      const tags = (card.dataset.tags || '').split(',').filter(Boolean);
      const matchesText = !q || title.includes(q);
      const matchesTags = activeTags.size === 0 || tags.some(t => activeTags.has(t));
      card.classList.toggle('hidden', !(matchesText && matchesTags));
    });
  }

  function initSearch(){
    const s = byId('search');
    if(s){ s.addEventListener('input', applyFilters); }
  }

  function initPopups(){
    // Attach trigger listeners
    $(".popupTrigger").forEach(t => {
      t.addEventListener('click', (e) => {
        const id = t.getAttribute('data-popup-id');
        const popup = document.querySelector('.popup[data-popup-id="'+id+'"]');
        if(popup){ popup.style.display = 'block'; }
      });
    });
    // Close buttons and backdrop
    $(".popup").forEach(p => {
      p.addEventListener('click', (e) => {
        if(e.target.classList.contains('popup') || e.target.classList.contains('popup-close')){
          p.style.display = 'none';
        }
      });
    });

    // Joke loader (keep the playful popup)
    const jokes = [
      "There are 10 kinds of people: those who understand binary and those who don't.",
      "I would tell you a UDP joke, but you might not get it.",
      "To whoever stole my copy of Microsoft Office, I will find you. You have my Word.",
      "It’s not a bug — it’s an undocumented feature.",
      "I changed my password to ‘incorrect’ so when I forget it, the computer reminds me: ‘Your password is incorrect.’"
    ];
    const jokeLine = document.getElementById('joke-line');
    if(jokeLine){
      const idx = Math.floor(Math.random() * jokes.length);
      jokeLine.textContent = jokes[idx];
    }
  }

  window.initPage = function(){
    renderTagFilters();
    initSearch();
    initPopups();
    applyFilters();
  };

  document.addEventListener('DOMContentLoaded', window.initPage);
})();

(function(){
  function $(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)); }
  function byId(id){ return document.getElementById(id); }
  function uniq(arr){ return Array.from(new Set(arr)); }

  // server-rendered chips via Liquid; JS only attaches events

  function getActive(){ return new Set($('.tag-chip.active').map(el => el.dataset.tag)); }

  function show(el){
    // If already visible, do nothing
    if(!el.classList.contains('hidden')) return;
    el.classList.remove('hidden');
    el.classList.remove('animate__zoomOut');
    el.classList.add('animate__animated','animate__zoomIn');
    el.addEventListener('animationend', function h(){ el.classList.remove('animate__animated','animate__zoomIn'); el.removeEventListener('animationend', h); });
  }
  function hide(el){
    // If already hidden, do nothing
    if(el.classList.contains('hidden')) return;
    el.classList.remove('animate__zoomIn');
    el.classList.add('animate__animated','animate__zoomOut');
    el.addEventListener('animationend', function h(){ el.classList.add('hidden'); el.classList.remove('animate__animated','animate__zoomOut'); el.removeEventListener('animationend', h); });
  }

  function applyFilters(scope){
    var active = getActive();
    var selector = scope === 'projects' ? '.aProject' : (scope === 'code' ? '.aCode' : '.aPub');
    var cards = $(selector);
    cards.forEach(function(card){
      var tags = (card.dataset.tags || '').split(',').filter(Boolean);
      var match = active.size === 0 || tags.some(function(t){ return active.has(t); });
      // Mark match state independent of animation timing
      card.dataset.match = match ? '1' : '0';
      if(match) show(card); else hide(card);
    });

    // Hide empty year blocks on publications page
    if(scope === 'publications'){
      $(".pub-year").forEach(function(block){
        var pubs = $(".aPub", block);
        var anyVisible = pubs.some(function(li){ return li.dataset.match === '1'; });
        if(anyVisible) show(block); else hide(block);
      });
    }
  }

  // No global reanimation on load/after; cards remain as-is unless filter state changes

  function boot(){
    var cfgs = [
      { scope:'projects', id:'filters-projects' },
      { scope:'code', id:'filters-code' },
      // Match the server-rendered id from render_filters.html (filters-{{ scope }})
      { scope:'publications', id:'filters-publications' }
    ];
    cfgs.forEach(function(c){
      var m = byId(c.id); if(!m) return;
      $(".tag-chip", m).forEach(function(chip){
        chip.addEventListener('click', function(){ chip.classList.toggle('active'); applyFilters(c.scope); });
      });
      applyFilters(c.scope);
    });
  }

  document.addEventListener('DOMContentLoaded', boot);
  if(window.barba){ try{ barba.hooks.after(boot); }catch(e){} }
})();

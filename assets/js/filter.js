(function(){
  function $(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)); }
  function byId(id){ return document.getElementById(id); }
  function uniq(arr){ return Array.from(new Set(arr)); }

  // server-rendered chips via Liquid; JS only attaches events

  function getActive(){ return new Set($('.tag-chip.active').map(el => el.dataset.tag)); }

  // Animation timing (ms)
  var SLIDE_MS      = 1000; // default for items and year collapse
  var YEAR_MS_SHOW  = 400;  // faster for year reappearance (open)
  function setAnimDuration(el, ms){ try{ el.style.setProperty('--animate-duration', (ms/1000) + 's'); }catch(e){} }
  function clearAnimDuration(el){ try{ el.style.removeProperty('--animate-duration'); }catch(e){} }
  function durationFor(el, phase){
    var isYear = el.classList && el.classList.contains('pub-year');
    if(isYear){ return phase === 'down' ? YEAR_MS_SHOW : SLIDE_MS; }
    return SLIDE_MS;
  }

  function slideDown(el, ms){
    if(!el.classList.contains('hidden') && el.dataset.sliding !== 'up') return;
    if(el.dataset.sliding === 'down') return;
    var phase = 'down';
    el.dataset.sliding = phase;
    el.classList.remove('hidden');
    el.style.overflow = 'hidden';
    el.style.height = '0px';
    // start zoom-in
    el.classList.remove('animate__zoomOut');
    setAnimDuration(el, ms);
    el.classList.add('animate__animated','animate__zoomIn');
    // force reflow then expand to full height
    void el.offsetHeight;
    var target = el.scrollHeight;
    el.style.transition = 'height ' + ms + 'ms ease';
    el.style.height = target + 'px';
    var done = function(ev){
      if(ev && ev.propertyName !== 'height') return;
      if(el.dataset.sliding !== phase) return; // stale event from opposite phase
      el.removeEventListener('transitionend', done);
      el.style.transition = '';
      el.style.height = '';
      el.style.overflow = '';
      el.classList.remove('animate__animated','animate__zoomIn');
      clearAnimDuration(el);
      delete el.dataset.sliding;
    };
    el.addEventListener('transitionend', done);
  }
  function slideUp(el, ms){
    if(el.classList.contains('hidden')) return;
    if(el.dataset.sliding === 'up') return;
    var phase = 'up';
    el.dataset.sliding = phase;
    var start = el.scrollHeight;
    el.style.overflow = 'hidden';
    el.style.height = start + 'px';
    // start zoom-out
    el.classList.remove('animate__zoomIn');
    setAnimDuration(el, ms);
    el.classList.add('animate__animated','animate__zoomOut');
    // force reflow then collapse to 0
    void el.offsetHeight;
    el.style.transition = 'height ' + ms + 'ms ease';
    el.style.height = '0px';
    var done = function(ev){
      if(ev && ev.propertyName !== 'height') return;
      if(el.dataset.sliding !== phase) return; // stale event from opposite phase
      el.removeEventListener('transitionend', done);
      el.classList.add('hidden');
      el.classList.remove('animate__animated','animate__zoomOut');
      clearAnimDuration(el);
      el.style.transition = '';
      el.style.height = '';
      el.style.overflow = '';
      delete el.dataset.sliding;
    };
    el.addEventListener('transitionend', done);
  }

  function show(el){ var ms = durationFor(el, 'down'); slideDown(el, ms); }
  function hide(el){ var ms = durationFor(el, 'up');   slideUp(el, ms); }

  function applyFilters(scope){
    var active = getActive();

    if(scope === 'publications'){
      var allPubs = $(".aPub");
      // 1) Compute match state for all publications
      allPubs.forEach(function(card){
        var tags = (card.dataset.tags || '').split(',').filter(Boolean);
        var match = active.size === 0 || tags.some(function(t){ return active.has(t); });
        card.dataset.match = match ? '1' : '0';
      });

      // 2) Open/close years first
      var yearBlocks = $(".pub-year");
      var needOpen = false;
      yearBlocks.forEach(function(block){
        var pubs = $(".aPub", block);
        var anyMatch = pubs.some(function(li){ return li.dataset.match === '1'; });
        if(anyMatch){
          if(block.classList.contains('hidden')) needOpen = true;
          show(block);
        } else {
          // Hide children first for smooth collapse
          pubs.forEach(hide);
          setTimeout(function(){ hide(block); }, 30);
        }
      });

      // 3) After years have opened (if any had to), sync children across ALL years
      var delay = needOpen ? (YEAR_MS_SHOW + 20) : 0;
      setTimeout(function(){
        allPubs.forEach(function(li){
          if(li.dataset.match === '1') show(li); else hide(li);
        });
      }, delay);
      return;
    }

    // Generic path for projects/code
    var selector = scope === 'projects' ? '.aProject' : '.aCode';
    var cards = $(selector);
    cards.forEach(function(card){
      var tags = (card.dataset.tags || '').split(',').filter(Boolean);
      var match = active.size === 0 || tags.some(function(t){ return active.has(t); });
      card.dataset.match = match ? '1' : '0';
      if(match) show(card); else hide(card);
    });
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

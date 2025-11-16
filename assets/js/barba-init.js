// Barba.js transitions (slide default) and page re-init
(function(){
  // Easily adjustable duration (ms). Optionally override via <html data-transition-duration="...">
  var DURATION = (function(){
    var attr = document.documentElement.getAttribute('data-transition-duration');
    var n = parseInt(attr || '1000', 10);
    return isNaN(n) ? 1000 : n;
  })();
  // Optional debug freeze percentage (0..1). Example: <html data-transition-freeze="0.5">
  var DEBUG_FREEZE = (function(){
    var attr = document.documentElement.getAttribute('data-transition-freeze');
    if(attr == null) return null;
    var f = parseFloat(attr);
    return isNaN(f) ? null : Math.min(1, Math.max(0, f));
  })();

  var gateResolve = null;
  var gatePromise = null;
  var pausedAnims = [];

  function ensureGate(){
    if(!gatePromise){ gatePromise = new Promise(function(res){ gateResolve = res; }); }
  }
  function showOverlay(){
    if(document.getElementById('barba-debug-overlay')) return;
    var ov = document.createElement('div');
    ov.id = 'barba-debug-overlay';
    ov.style.cssText = 'position:fixed;bottom:16px;right:16px;background:rgba(0,0,0,0.7);color:#fff;padding:10px 12px;border-radius:8px;z-index:9999;font:600 12px/1.4 system-ui,sans-serif;';
    ov.innerHTML = 'Transition paused at ' + Math.round((DEBUG_FREEZE||0)*100) + '% ' +
      '<button id="barba-debug-resume" style="margin-left:10px;padding:6px 10px;border:0;border-radius:6px;background:#4fb0ff;color:#0b0f14;font-weight:700;cursor:pointer;">Resume (R)</button>';
    document.body.appendChild(ov);
    var btn = document.getElementById('barba-debug-resume');
    btn.addEventListener('click', resumeAll);
    document.addEventListener('keydown', function(e){ if(e.key==='r' || e.key==='R'){ resumeAll(); } });
  }
  function hideOverlay(){
    var ov = document.getElementById('barba-debug-overlay');
    if(ov) ov.remove();
  }
  function resumeAll(){
    pausedAnims.forEach(function(a){ try{ a.play(); }catch(e){} });
    pausedAnims = [];
    if(gateResolve){ gateResolve(); }
    gateResolve = null; gatePromise = null;
    hideOverlay();
  }

  function fadeOut(el, duration){ return el.animate([{opacity:1},{opacity:0}], {duration, easing:'ease-in'}).finished; }
  function fadeIn(el, duration){ return el.animate([{opacity:0},{opacity:1}], {duration, easing:'ease-out'}).finished; }
  function slideOut(el, duration, dir){
    const x = dir === 'left' ? '-24px' : '24px';
    const a = el.animate([{opacity:1, transform:'translateX(0)'},{opacity:0, transform:'translateX(' + x + ')'}], {duration, easing:'ease-in'});
    if(DEBUG_FREEZE != null){
      ensureGate();
      try{ a.currentTime = duration * DEBUG_FREEZE; a.pause(); pausedAnims.push(a); showOverlay(); }catch(e){}
      return gatePromise.then(function(){ return a.finished; });
    }
    return a.finished;
  }
  function slideIn(el, duration, dir){
    const x = dir === 'left' ? '24px' : '-24px';
    const a = el.animate([{opacity:0, transform:'translateX(' + x + ')'}, {opacity:1, transform:'translateX(0)'}], {duration, easing:'ease-out'});
    if(DEBUG_FREEZE != null){
      ensureGate();
      try{ a.currentTime = duration * DEBUG_FREEZE; a.pause(); pausedAnims.push(a); showOverlay(); }catch(e){}
      return gatePromise.then(function(){ return a.finished; });
    }
    return a.finished;
  }

  function runInit(){ if(window.initPage) { try{ window.initPage(); }catch(e){} } }
  function setCardBlur(containerEl, value){
    try{
      var card = containerEl && containerEl.querySelector && containerEl.querySelector('.container');
      if(card){ card.style.setProperty('--container-blur', value); }
    }catch(e){}
  }
  function setBgFrom(container){
    try{
      var url = container && container.getAttribute && container.getAttribute('data-bg');
      var a = document.querySelector('.bg-layer.bg-a');
      var b = document.querySelector('.bg-layer.bg-b');
      if(!url || !a || !b) return;
      var active = a.classList.contains('is-active') ? a : b;
      var inactive = active === a ? b : a;
      var newVal = 'url("' + url + '")';
      var current = getComputedStyle(active).getPropertyValue('--bg-image').trim();
      if(current === newVal) return; // already showing

      inactive.style.setProperty('--bg-image', newVal);
      // Crossfade by toggling the active class without DOM add/remove
      requestAnimationFrame(function(){
        inactive.classList.add('is-active');
        active.classList.remove('is-active');
      });
    }catch(e){}
  }

  document.addEventListener('DOMContentLoaded', function(){
    if(!window.barba){ runInit(); return; }
    var effect = (document.documentElement.getAttribute('data-transition') || 'slide').toLowerCase();
    // Sync background fade duration with page transition duration
    try{ document.documentElement.style.setProperty('--bg-fade', DURATION + 'ms'); }catch(e){}
    try{
      barba.hooks.before(() => { document.documentElement.classList.add('is-transitioning'); });
      barba.hooks.after(() => { document.documentElement.classList.remove('is-transitioning'); });

      barba.init({
        prevent: ({ href }) => {
          try{
            var link = new URL(href, window.location.href);
            var curr = new URL(window.location.href);
            var norm = function(u){ var p = u.pathname; if(!p.endsWith('/')) p += '/'; return u.origin + p + u.search; };
            if(link.origin === curr.origin && norm(link) === norm(curr)) return true; // prevent same-page
          }catch(err){}
          return false;
        },
        transitions: [{
          name: effect,
          sync: true,
          async leave({ current }){
            current.container.classList.add('is-current');
            setCardBlur(current.container, '0px');
            //try{ current.container.style.willChange = 'opacity, transform'; }catch(e){}
            if(effect === 'fade') return fadeOut(current.container, DURATION);
            return slideOut(current.container, DURATION, 'left');
          },
          async enter({ next }){
            next.container.classList.add('is-next');
            setBgFrom(next.container);
            setCardBlur(next.container, '0px');
            //try{ next.container.style.willChange = 'opacity, transform'; }catch(e){}
            if(effect === 'fade') return fadeIn(next.container, DURATION);
            return slideIn(next.container, DURATION, 'left');
          },
          after({ current, next }){
            // Cleanup temporary classes and styles
            if(current && current.container){ current.container.classList.remove('is-current'); setCardBlur(current.container, ''); current.container.style.willChange = ''; }
            if(next && next.container){ next.container.classList.remove('is-next'); setCardBlur(next.container, ''); next.container.style.willChange = ''; }
          }
        }]
      });
      barba.hooks.after(runInit);
    }catch(e){ runInit(); }
  });
})();

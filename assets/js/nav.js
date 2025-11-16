// Burger menu toggle
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    var btn = document.querySelector('.burger');
    var nav = document.getElementById('site-nav');
    if(!btn || !nav) return;

    function open(){ nav.classList.add('open'); btn.setAttribute('aria-expanded','true'); }
    function close(){ nav.classList.remove('open'); btn.setAttribute('aria-expanded','false'); }
    function toggle(){ nav.classList.contains('open') ? close() : open(); }

    btn.addEventListener('click', toggle);
    // Close menu when a nav link is clicked (works with Barba navigation)
    Array.prototype.forEach.call(nav.querySelectorAll('a'), function(a){
      a.addEventListener('click', function(){ close(); });
    });
    // Also close before Barba transition just in case
    if(window.barba && barba.hooks){ try{ barba.hooks.before(close); }catch(e){} }
  });
  // Prevent navigation/animation if clicking a link to the current page
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a');
    if(!a) return;
    // ignore external and hash-only links
    var href = a.getAttribute('href') || '';
    if(href.startsWith('#')) return;
    try{
      var link = new URL(a.href, window.location.href);
      var curr = new URL(window.location.href);
      var norm = function(u){ var p = u.pathname; if(!p.endsWith('/')) p += '/'; return u.origin + p + u.search; };
      if(link.origin === curr.origin && norm(link) === norm(curr)){
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }catch(err){}
  }, true);
})();

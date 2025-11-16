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
})();

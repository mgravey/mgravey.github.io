// Compute header/footer heights and expose as CSS variables
(function(){
  function setChromeVars(){
    var root = document.documentElement;
    var header = document.querySelector('.site-header');
    var footer = document.querySelector('.site-footer');
    var hh = header ? header.offsetHeight : 0;
    var fh = footer ? footer.offsetHeight : 0;
    root.style.setProperty('--header-h', hh + 'px');
    root.style.setProperty('--footer-h', fh + 'px');
  }
  function onReady(){ setChromeVars(); }
  window.addEventListener('resize', setChromeVars);
  window.addEventListener('orientationchange', setChromeVars);
  document.addEventListener('DOMContentLoaded', onReady);
  if(window.barba && barba.hooks){ try{ barba.hooks.after(setChromeVars); }catch(e){} }
})();

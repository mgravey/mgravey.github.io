// Email obfuscation: set base64 below and it will render into links with [data-email]
(function(){
  // TODO: Replace with your base64-encoded email (e.g., btoa('name@example.com'))
  var EMAIL_B64 = 'cmVzZWFyY2hAbWdyYXZleS5jb20=';

  function decode(b64){ try { return atob(b64); } catch(e){ return ''; } }
  function render(){
    if(!EMAIL_B64) return;
    var email = decode(EMAIL_B64);
    Array.prototype.forEach.call(document.querySelectorAll('[data-email]'), function(el){
      el.setAttribute('href', 'mailto:' + email);
      if(!el.hasAttribute('data-email-icon')){
        el.textContent = email;
      }
    });
  }
  document.addEventListener('DOMContentLoaded', render);
  if(window.barba){ try{ barba.hooks.after(render); }catch(e){} }
})();

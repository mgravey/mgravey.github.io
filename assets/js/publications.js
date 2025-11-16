// Publications loader: add DOIs in assets/dois.json
(function(){
  function fetchJSON(url){ return fetch(url).then(r => r.json()); }
  function fetchBib(doi){
    return fetch('https://doi.org/' + encodeURIComponent(doi), {
      headers: { 'Accept': 'application/x-bibtex' }
    }).then(r => r.text());
  }

  function loadDois(){
    fetchJSON('/assets/dois.json').then(async (list) => {
      if(!Array.isArray(list)) list = [];
      let generated = '';
      let idx = 0;
      for(const doi of list){
        try { generated += await fetchBib(doi) + '\n'; }
        catch(e){ /* ignore individual failures */ }
        idx++;
      }
      document.getElementById('bibtex_input').textContent = generated;
      if(typeof createWebPage === 'function'){
        // bibtex_js exposes createWebPage(defaultTemplate)
        createWebPage(defaultTemplate);
      }
    }).catch(() => {
      // No DOIs file found; render empty state
      const display = document.getElementById('bibtex_display');
      if(display){ display.innerHTML = '<p class="opacity-8">No DOIs found in assets/dois.json.</p>'; }
    });
  }

  document.addEventListener('DOMContentLoaded', loadDois);
})();


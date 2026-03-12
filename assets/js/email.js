// Email gate + survey logger for contact links.
(function(){
  var GENERAL_EMAIL_B64 = 'cmVzZWFyY2hAbWdyYXZleS5jb20=';
  var REVIEW_EMAIL_B64 = 'cGVlcnJldmlld0BtZ3JhdmV5LmNvbQ==';
  var DEFAULT_ENDPOINT = 'https://geohub.mgravey.com/survey';
  var DEFAULT_STORAGE_KEY = 'mg_email_gate_v1';

  var modalEl = null;
  var pendingHref = null;
  var stepIndex = 0;
  var steps = [];

  function decode(b64){ try { return atob(b64); } catch(e){ return ''; } }
  function toInt(v, fallback){
    var n = parseInt(v, 10);
    return isNaN(n) ? fallback : n;
  }
  function byId(id){ return document.getElementById(id); }
  function normText(v){ return (v == null ? '' : String(v)).trim(); }

  function readSurveyConfig(){
    var cfgNode = byId('survey-config');
    if(!cfgNode) return {};
    try{ return JSON.parse(cfgNode.textContent || '{}') || {}; }
    catch(e){ return {}; }
  }
  function getQuestions(){
    var cfg = readSurveyConfig();
    return Array.isArray(cfg.questions) ? cfg.questions : [];
  }
  function getEndpoint(){
    var cfg = readSurveyConfig();
    return normText(cfg.endpoint) || DEFAULT_ENDPOINT;
  }
  function getStorageKey(){
    var cfg = readSurveyConfig();
    return normText(cfg.storage_key) || DEFAULT_STORAGE_KEY;
  }
  function getTitle(){
    var cfg = readSurveyConfig();
    return normText(cfg.title) || 'Quick Checkpoint';
  }
  function getDescription(){
    var cfg = readSurveyConfig();
    return normText(cfg.description) || 'Please answer a few quick questions before contact details are unlocked.';
  }

  function isUnlocked(){
    try{ return localStorage.getItem(getStorageKey()) === '1'; }
    catch(e){ return false; }
  }
  function setUnlocked(){
    try{ localStorage.setItem(getStorageKey(), '1'); } catch(e){}
  }

  window.sendSurveyAnswer = function sendSurveyAnswer(questionId, answerId) {
    var payload = {
      q: toInt(questionId, 0),
      a: toInt(answerId, 0)
    };
    try{
      fetch(getEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(function(){});
    }catch(e){}
  };

  function ensureModal(){
    if(modalEl) return modalEl;

    var root = document.createElement('div');
    root.className = 'survey-modal';
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML = '' +
      '<div class="survey-modal-card" role="dialog" aria-modal="true" aria-labelledby="survey-title">' +
        '<button type="button" class="survey-close" aria-label="Close">×</button>' +
        '<h3 id="survey-title" class="survey-title"></h3>' +
        '<p class="survey-description"></p>' +
        '<p class="survey-progress"></p>' +
        '<p class="survey-question"></p>' +
        '<div class="survey-actions"></div>' +
      '</div>';

    root.addEventListener('click', function(e){
      if(e.target === root){ closeModal(); }
    });
    root.querySelector('.survey-close').addEventListener('click', closeModal);

    document.body.appendChild(root);
    modalEl = root;
    return modalEl;
  }

  function closeModal(){
    if(!modalEl) return;
    modalEl.classList.remove('is-open');
    modalEl.setAttribute('aria-hidden', 'true');
  }

  function openModal(){
    var m = ensureModal();
    m.classList.add('is-open');
    m.setAttribute('aria-hidden', 'false');
  }

  function getStepId(step, idx){
    return toInt(step && step.id, idx + 1);
  }

  function pickRandomQuestion(list){
    if(!Array.isArray(list) || list.length === 0) return null;
    var idx = Math.floor(Math.random() * list.length);
    return list[idx] || null;
  }

  function nextStep(){
    stepIndex += 1;
    if(stepIndex >= steps.length){
      setUnlocked();
      closeModal();
      renderContactLinks();
      if(pendingHref){
        var href = pendingHref;
        pendingHref = null;
        window.location.href = href;
      }
      return;
    }
    renderStep();
  }

  function submitChoice(step, answer, answerIdx){
    var qid = getStepId(step, stepIndex);
    var aid = toInt(answer && answer.id, answerIdx + 1);
    window.sendSurveyAnswer(qid, aid);
    nextStep();
  }

  function submitText(step, textarea){
    var text = normText(textarea && textarea.value);
    var hasText = text.length > 0;
    if(step.required && !hasText){
      if(textarea) textarea.focus();
      return;
    }
    var qid = getStepId(step, stepIndex);
    var aidFilled = toInt(step.answer_id_filled, 1);
    var aidEmpty = toInt(step.answer_id_empty, 2);
    window.sendSurveyAnswer(qid, hasText ? aidFilled : aidEmpty);
    nextStep();
  }

  function renderChoiceStep(actions, step){
    var answers = Array.isArray(step.answers) ? step.answers : [];
    if(answers.length === 0){
      answers = [{ id: 1, label: 'Continue' }];
    }
    answers.forEach(function(answer, idx){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'survey-btn';
      btn.textContent = normText(answer.label) || ('Option ' + (idx + 1));
      btn.addEventListener('click', function(){ submitChoice(step, answer, idx); });
      actions.appendChild(btn);
    });
  }

  function renderTextStep(actions, step){
    var textarea = document.createElement('textarea');
    textarea.className = 'survey-text';
    textarea.rows = 3;
    textarea.placeholder = normText(step.placeholder) || 'Type your answer';
    actions.appendChild(textarea);

    var row = document.createElement('div');
    row.className = 'survey-row';
    actions.appendChild(row);

    if(!step.required){
      var skip = document.createElement('button');
      skip.type = 'button';
      skip.className = 'survey-btn survey-btn-muted';
      skip.textContent = 'Skip';
      skip.addEventListener('click', function(){
        if(textarea) textarea.value = '';
        submitText(step, textarea);
      });
      row.appendChild(skip);
    }

    var submit = document.createElement('button');
    submit.type = 'button';
    submit.className = 'survey-btn';
    submit.textContent = 'Continue';
    submit.addEventListener('click', function(){ submitText(step, textarea); });
    row.appendChild(submit);
  }

  function renderStep(){
    if(!modalEl) return;
    var step = steps[stepIndex] || {};
    var title = modalEl.querySelector('.survey-title');
    var desc = modalEl.querySelector('.survey-description');
    var progress = modalEl.querySelector('.survey-progress');
    var question = modalEl.querySelector('.survey-question');
    var actions = modalEl.querySelector('.survey-actions');

    title.textContent = getTitle();
    desc.textContent = getDescription();
    if(steps.length > 1){
      progress.textContent = 'Question ' + (stepIndex + 1) + ' of ' + steps.length;
      progress.style.display = '';
    } else {
      progress.textContent = '';
      progress.style.display = 'none';
    }
    question.textContent = normText(step.prompt) || 'Quick question';
    actions.innerHTML = '';

    if((step.type || 'choice') === 'text'){
      renderTextStep(actions, step);
    } else {
      renderChoiceStep(actions, step);
    }
  }

  function startSurvey(href){
    pendingHref = href || null;
    var all = getQuestions();
    var one = pickRandomQuestion(all);
    steps = one ? [one] : [];

    if(steps.length === 0){
      setUnlocked();
      renderContactLinks();
      if(pendingHref){
        var target = pendingHref;
        pendingHref = null;
        window.location.href = target;
      }
      return;
    }

    stepIndex = 0;
    openModal();
    renderStep();
  }

  function applyLinkState(link, email){
    var locked = !isUnlocked();
    if(!email) return;

    if(link.dataset.defaultLabel == null){
      link.dataset.defaultLabel = normText(link.textContent);
    }

    if(locked){
      link.setAttribute('href', '#');
      link.setAttribute('title', 'Answer quick questions to unlock this email address');
      link.classList.add('is-email-locked');
      if(!link.hasAttribute('data-email-icon') && !link.dataset.defaultLabel){
        link.textContent = 'Unlock email';
      }
    } else {
      link.setAttribute('href', 'mailto:' + email);
      link.setAttribute('title', email);
      link.classList.remove('is-email-locked');
      if(!link.hasAttribute('data-email-icon')){
        link.textContent = email;
      }
    }

    if(link.dataset.surveyBound === '1') return;
    link.dataset.surveyBound = '1';
    link.addEventListener('click', function(e){
      if(!isUnlocked()){
        e.preventDefault();
        e.stopPropagation();
        startSurvey('mailto:' + email);
      }
    });
  }

  function renderContactLinks(){
    var general = decode(GENERAL_EMAIL_B64);
    var review = decode(REVIEW_EMAIL_B64);

    Array.prototype.forEach.call(document.querySelectorAll('[data-email]'), function(link){
      applyLinkState(link, general);
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-review-email]'), function(link){
      applyLinkState(link, review);
    });
  }

  document.addEventListener('DOMContentLoaded', renderContactLinks);
  if(window.barba && barba.hooks){ try{ barba.hooks.after(renderContactLinks); }catch(e){} }
})();

import barba from "@barba/core";

const html = document.documentElement;
const transitionDuration = Number.parseInt(html.dataset.transitionDuration, 10) || 0;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let pageCleanup = [];

function readJSON(id) {
  const node = document.getElementById(id);
  if (!node) return {};
  try {
    return JSON.parse(node.textContent || "{}");
  } catch (error) {
    console.warn(`Invalid JSON in #${id}`, error);
    return {};
  }
}

function normalizedPath(value) {
  try {
    const url = new URL(value, window.location.href);
    return `${url.pathname.replace(/\/?$/, "/")}${url.search}`;
  } catch {
    return value;
  }
}

function updateActiveNavigation(url = window.location.href) {
  const activePath = normalizedPath(url);
  document.querySelectorAll("[data-nav-path]").forEach((link) => {
    const isActive = normalizedPath(link.href) === activePath;
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function setChromeVariables() {
  const header = document.querySelector(".site-header");
  const footer = document.querySelector(".site-footer");
  html.style.setProperty("--header-h", `${header?.offsetHeight || 64}px`);
  html.style.setProperty("--footer-h", `${footer?.offsetHeight || 58}px`);
}

function initializeNavigation() {
  const button = document.querySelector(".burger");
  const nav = document.getElementById("site-nav");

  const closeNav = () => {
    nav?.classList.remove("open");
    button?.setAttribute("aria-expanded", "false");
  };

  button?.addEventListener("click", () => {
    const open = !nav?.classList.contains("open");
    nav?.classList.toggle("open", open);
    button.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest("#site-nav a")) closeNav();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeNav();
    button?.focus();
  });

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(setChromeVariables);
    document.querySelectorAll(".site-header, .site-footer").forEach((node) => observer.observe(node));
  } else {
    window.addEventListener("resize", setChromeVariables);
  }

  setChromeVariables();
  updateActiveNavigation();
}

function initializeFilters(container) {
  container.querySelectorAll("[data-filter-scope]").forEach((filterGroup) => {
    const scope = filterGroup.dataset.filterScope;
    const list = container.querySelector(`[data-filter-list="${scope}"]`);
    if (!list) return;

    const buttons = [...filterGroup.querySelectorAll("[data-tag]")];
    const items = [...list.querySelectorAll("[data-filter-item]")];

    const apply = () => {
      const selected = new Set(
        buttons.filter((button) => button.getAttribute("aria-pressed") === "true")
          .map((button) => button.dataset.tag)
      );

      items.forEach((item) => {
        const tags = (item.dataset.tags || "").split(",").filter(Boolean);
        item.hidden = selected.size > 0 && !tags.some((tag) => selected.has(tag));
      });

      list.querySelectorAll(".pub-year").forEach((year) => {
        year.hidden = [...year.querySelectorAll("[data-filter-item]")].every((item) => item.hidden);
      });
    };

    buttons.forEach((button) => {
      const listener = () => {
        button.setAttribute("aria-pressed", String(button.getAttribute("aria-pressed") !== "true"));
        apply();
      };
      button.addEventListener("click", listener);
      pageCleanup.push(() => button.removeEventListener("click", listener));
    });
  });
}

function focusableElements(root) {
  return [...root.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )].filter((element) => !element.hidden);
}

function trapFocus(event, root) {
  if (event.key !== "Tab") return;
  const focusable = focusableElements(root);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function initializePopups(container) {
  container.querySelectorAll(".popup").forEach((popup) => {
    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-modal", "true");
    popup.setAttribute("aria-hidden", "true");
    const closeButton = popup.querySelector(".popup-close");
    let returnFocus = null;

    const close = () => {
      popup.classList.remove("is-open");
      popup.setAttribute("aria-hidden", "true");
      returnFocus?.focus();
    };
    const open = (trigger) => {
      returnFocus = trigger;
      popup.classList.add("is-open");
      popup.setAttribute("aria-hidden", "false");
      closeButton?.focus();
    };
    const popupListener = (event) => {
      if (event.target === popup || event.target.closest(".popup-close")) close();
    };
    const keyboardListener = (event) => {
      if (!popup.classList.contains("is-open")) return;
      if (event.key === "Escape") close();
      trapFocus(event, popup);
    };

    popup.addEventListener("click", popupListener);
    document.addEventListener("keydown", keyboardListener);
    pageCleanup.push(() => {
      popup.removeEventListener("click", popupListener);
      document.removeEventListener("keydown", keyboardListener);
    });

    const id = popup.dataset.popupId;
    container.querySelectorAll(`.popupTrigger[data-popup-id="${id}"]`).forEach((trigger) => {
      trigger.setAttribute("role", "button");
      trigger.setAttribute("tabindex", "0");
      trigger.setAttribute("aria-haspopup", "dialog");
      const clickListener = () => open(trigger);
      const keyListener = (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open(trigger);
        }
      };
      trigger.addEventListener("click", clickListener);
      trigger.addEventListener("keydown", keyListener);
      pageCleanup.push(() => {
        trigger.removeEventListener("click", clickListener);
        trigger.removeEventListener("keydown", keyListener);
      });
    });
  });
}

const surveyConfig = readJSON("survey-config");
const contactConfig = readJSON("contact-config");
let surveyModal;
let surveyReturnFocus;
let pendingEmail;

function decodeEmail(value) {
  try {
    return window.atob(value || "");
  } catch {
    return "";
  }
}

function isEmailUnlocked() {
  try {
    return localStorage.getItem(surveyConfig.storage_key) === "1";
  } catch {
    return false;
  }
}

function setEmailUnlocked() {
  try {
    localStorage.setItem(surveyConfig.storage_key, "1");
  } catch {
    // The email still unlocks for the current interaction when storage is unavailable.
  }
}

function sendSurveyAnswer(question, answer) {
  if (!surveyConfig.endpoint) return;
  fetch(surveyConfig.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: Number(question), a: Number(answer) })
  }).catch(() => {});
}

function closeSurvey() {
  if (!surveyModal) return;
  surveyModal.classList.remove("is-open");
  surveyModal.setAttribute("aria-hidden", "true");
  surveyReturnFocus?.focus();
}

function ensureSurveyModal() {
  if (surveyModal) return surveyModal;
  surveyModal = document.createElement("div");
  surveyModal.className = "survey-modal";
  surveyModal.setAttribute("aria-hidden", "true");
  surveyModal.innerHTML = `
    <div class="survey-modal-card" role="dialog" aria-modal="true" aria-labelledby="survey-title">
      <button type="button" class="survey-close" aria-label="Close">×</button>
      <h2 id="survey-title" class="survey-title"></h2>
      <p class="survey-description"></p>
      <p class="survey-progress"></p>
      <p class="survey-question"></p>
      <div class="survey-actions"></div>
    </div>`;
  surveyModal.querySelector(".survey-close").addEventListener("click", closeSurvey);
  surveyModal.addEventListener("click", (event) => {
    if (event.target === surveyModal) closeSurvey();
  });
  document.addEventListener("keydown", (event) => {
    if (!surveyModal.classList.contains("is-open")) return;
    if (event.key === "Escape") closeSurvey();
    trapFocus(event, surveyModal);
  });
  document.body.appendChild(surveyModal);
  return surveyModal;
}

function updateEmailLinks(root = document) {
  const general = decodeEmail(contactConfig.general_email_b64);
  const review = decodeEmail(contactConfig.review_email_b64);
  root.querySelectorAll("[data-email], [data-review-email]").forEach((link) => {
    const email = link.hasAttribute("data-review-email") ? review : general;
    const isIcon = link.hasAttribute("data-email-icon");
    if (!email) return;
    if (!isIcon && !link.dataset.lockedLabel) link.dataset.lockedLabel = link.textContent.trim();

    if (isEmailUnlocked()) {
      link.href = `mailto:${email}`;
      link.title = email;
      link.classList.remove("is-email-locked");
      if (!isIcon) link.textContent = email;
    } else {
      link.href = "#";
      link.title = "Answer a quick question to unlock this email address";
      link.classList.add("is-email-locked");
      if (!isIcon) link.textContent = link.dataset.lockedLabel || "Unlock email";
    }

    if (link.dataset.emailBound === "true") return;
    link.dataset.emailBound = "true";
    link.addEventListener("click", (event) => {
      if (isEmailUnlocked()) return;
      event.preventDefault();
      surveyReturnFocus = link;
      pendingEmail = email;
      openSurvey();
    });
  });
}

function completeSurvey(questionId, answerId) {
  sendSurveyAnswer(questionId, answerId);
  setEmailUnlocked();
  closeSurvey();
  updateEmailLinks(document);
  if (pendingEmail) {
    const email = pendingEmail;
    pendingEmail = null;
    window.location.href = `mailto:${email}`;
  }
}

function openSurvey() {
  const modal = ensureSurveyModal();
  const questions = Array.isArray(surveyConfig.questions) ? surveyConfig.questions : [];
  const question = questions[Math.floor(Math.random() * questions.length)];
  if (!question) {
    completeSurvey(0, 0);
    return;
  }

  modal.querySelector(".survey-title").textContent = surveyConfig.title || "Quick checkpoint";
  modal.querySelector(".survey-description").textContent = surveyConfig.description || "";
  modal.querySelector(".survey-progress").textContent = "";
  modal.querySelector(".survey-question").textContent = question.prompt || "Quick question";
  const actions = modal.querySelector(".survey-actions");
  actions.replaceChildren();

  if (question.type === "text") {
    const textarea = document.createElement("textarea");
    textarea.className = "survey-text";
    textarea.placeholder = question.placeholder || "Type your answer";
    actions.appendChild(textarea);
    const submit = document.createElement("button");
    submit.type = "button";
    submit.className = "survey-btn";
    submit.textContent = "Continue";
    submit.addEventListener("click", () => {
      const hasText = textarea.value.trim().length > 0;
      if (question.required && !hasText) {
        textarea.focus();
        return;
      }
      completeSurvey(question.id, hasText ? question.answer_id_filled || 1 : question.answer_id_empty || 2);
    });
    actions.appendChild(submit);
  } else {
    (question.answers || []).forEach((answer) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "survey-btn";
      button.textContent = answer.label;
      button.addEventListener("click", () => completeSurvey(question.id, answer.id));
      actions.appendChild(button);
    });
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  focusableElements(modal)[0]?.focus();
}

function initializePage(container) {
  pageCleanup.forEach((cleanup) => cleanup());
  pageCleanup = [];
  initializeFilters(container);
  initializePopups(container);
  updateEmailLinks(document);
  setChromeVariables();
}

function synchronizeHead(nextHTML) {
  const nextDocument = new DOMParser().parseFromString(nextHTML, "text/html");
  if (nextDocument.title) document.title = nextDocument.title;

  const selectors = [
    'meta[name="description"]',
    'link[rel="canonical"]',
    'meta[property^="og:"]',
    'meta[name^="twitter:"]',
    'script[type="application/ld+json"]'
  ];

  selectors.forEach((selector) => {
    document.head.querySelectorAll(selector).forEach((node) => node.remove());
    nextDocument.head.querySelectorAll(selector).forEach((node) => {
      document.head.appendChild(node.cloneNode(true));
    });
  });
}

async function setBackground(container) {
  const url = container?.dataset.bg;
  const layers = [...document.querySelectorAll(".bg-layer")];
  if (!url || layers.length !== 2) return;
  const active = layers.find((layer) => layer.classList.contains("is-active")) || layers[0];
  const inactive = layers.find((layer) => layer !== active);
  if (getComputedStyle(active).getPropertyValue("--bg-image").includes(url)) return;

  await Promise.race([
    new Promise((resolve) => {
      const image = new Image();
      image.onload = resolve;
      image.onerror = resolve;
      image.src = url;
    }),
    new Promise((resolve) => window.setTimeout(resolve, 700))
  ]);

  inactive.style.setProperty("--bg-image", `url("${url}")`);
  inactive.classList.add("is-active");
  active.classList.remove("is-active");
}

function restorePositionAndFocus(container) {
  const hash = window.location.hash;
  const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
  if (target) {
    target.scrollIntoView();
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  } else {
    window.scrollTo({ top: 0, behavior: "instant" });
    container.focus({ preventScroll: true });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation();
  initializePage(document.querySelector('[data-barba="container"]') || document);

  try {
    barba.init({
      preventRunning: true,
      prevent: ({ el, href }) => {
        if (el?.hasAttribute("download") || el?.target === "_blank") return true;
        if ((el?.getAttribute("href") || "").startsWith("#")) return true;
        return normalizedPath(href) === normalizedPath(window.location.href);
      },
      transitions: [{
        name: "site-transition",
        async leave({ current }) {
          html.classList.add("is-transitioning");
          if (reducedMotion.matches) return;
          await current.container.animate(
            [{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-8px)" }],
            { duration: transitionDuration, easing: "ease-in", fill: "forwards" }
          ).finished;
        },
        beforeEnter({ next }) {
          synchronizeHead(next.html);
          updateActiveNavigation(next.url.href);
        },
        async enter({ next }) {
          await setBackground(next.container);
          if (reducedMotion.matches) return;
          await next.container.animate(
            [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }],
            { duration: transitionDuration, easing: "ease-out", fill: "both" }
          ).finished;
        },
        afterEnter({ next }) {
          html.classList.remove("is-transitioning");
          initializePage(next.container);
          restorePositionAndFocus(next.container);
        }
      }]
    });
  } catch (error) {
    html.classList.remove("is-transitioning");
    console.warn("Animated navigation is unavailable; standard page navigation remains active.", error);
  }
});

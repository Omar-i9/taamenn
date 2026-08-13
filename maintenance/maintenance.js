(() => {
  "use strict";

  const config = window.TAAMEN_MAINTENANCE_CONFIG;
  const content = window.TAAMEN_MAINTENANCE_CONTENT;

  if (!config || !content) {
    console.error("[TAAMEN] Maintenance configuration/content is missing.");
    return;
  }

  const appScriptUrl = "js/app.js";

  let intervalId = null;
  let appLoaded = false;

  let modalHistory = [];
  let currentModalView = "overview";

  const root = document.getElementById("maintenanceLayer");

  if (!root) {
    console.error("[TAAMEN] #maintenanceLayer was not found.");
    return;
  }

  const targetTime = new Date(config.reopenAtUTC).getTime();

  if (Number.isNaN(targetTime)) {
    console.error("[TAAMEN] Invalid reopenAtUTC value.");
    return;
  }

  window.__TAAMEN_MAINTENANCE__ = {
    active: Boolean(config.enabled && Date.now() < targetTime),
    targetTime
  };

  function safe(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function icon(name) {
    return `<i class="fa-solid ${safe(name)}" aria-hidden="true"></i>`;
  }

  function formatUnit(value) {
    return String(Math.max(0, value)).padStart(2, "0");
  }

  function getCountdown() {
    const diff = Math.max(0, targetTime - Date.now());

    return {
      total: diff,
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000)
    };
  }

  function renderShell() {
    root.innerHTML = `
      <div class="maintenance-app" id="maintenanceApp">

        <div class="maintenance-backdrop" aria-hidden="true"></div>

        <div class="maintenance-orb maintenance-orb-a"></div>
        <div class="maintenance-orb maintenance-orb-b"></div>
        <div class="maintenance-orb maintenance-orb-c"></div>

        <div class="maintenance-grid" aria-hidden="true"></div>
        <div class="maintenance-noise" aria-hidden="true"></div>

        <div class="maintenance-floaters" id="maintenanceFloaters" aria-hidden="true">
          <span class="maintenance-floater floater-1">${icon("fa-futbol")}</span>
          <span class="maintenance-floater floater-2">${icon("fa-shield-halved")}</span>
          <span class="maintenance-floater floater-3"><i class="fa-brands fa-discord"></i></span>
          <span class="maintenance-floater floater-4">${icon("fa-brain")}</span>
          <span class="maintenance-floater floater-5">${icon("fa-calendar-check")}</span>
          <span class="maintenance-floater floater-6">${icon("fa-trophy")}</span>
          <span class="maintenance-floater floater-7">${icon("fa-code")}</span>
          <span class="maintenance-floater floater-8">${icon("fa-bolt")}</span>
          <span class="maintenance-floater floater-9">${icon("fa-layer-group")}</span>
        </div>

        <main class="maintenance-main" id="maintenanceMain">

          <section class="maintenance-hero glass-maintenance">

            <div class="maintenance-brand">
              <div class="maintenance-brand-mark">
                <img
                  src="assets/favicon.png"
                  alt="شعار تأمين"
                  width="64"
                  height="64"
                />
              </div>

              <div class="maintenance-brand-text">
                <strong>
                  ${safe(config.title)}
                  <span>${safe(config.edition)}</span>
                </strong>

                <small>${safe(content.badge)}</small>
              </div>
            </div>

            <div class="maintenance-hero-copy">
              <div class="maintenance-status-pill">
                <span class="status-live-dot"></span>
                المنصة في مرحلة إعادة تأسيس
              </div>

              <h1>${safe(content.headline)}</h1>

              <p>${safe(content.message)}</p>
            </div>

            <section class="maintenance-countdown" aria-label="العد التنازلي لإعادة فتح الموقع">

              <div class="maintenance-date-display">
                <span>${safe(content.reopenDateLabel)}</span>
                <b>${safe(content.reopenTimeLabel)}</b>
                <small>${safe(content.reopenNote)}</small>
              </div>

              <div class="countdown-grid">

                <div class="countdown-unit countdown-days">
                  <strong id="maintenanceDays">00</strong>
                  <span>يوم</span>
                </div>

                <div class="countdown-separator">:</div>

                <div class="countdown-unit">
                  <strong id="maintenanceHours">00</strong>
                  <span>ساعة</span>
                </div>

                <div class="countdown-separator">:</div>

                <div class="countdown-unit">
                  <strong id="maintenanceMinutes">00</strong>
                  <span>دقيقة</span>
                </div>

                <div class="countdown-separator">:</div>

                <div class="countdown-unit countdown-seconds">
                  <strong id="maintenanceSeconds">00</strong>
                  <span>ثانية</span>
                </div>

              </div>

              <div class="countdown-progress">
                <span id="countdownProgressBar"></span>
              </div>

            </section>

            <section class="maintenance-status-card">
              <div class="maintenance-section-heading">
                <div>
                  <span class="maintenance-eyebrow">STATUS</span>
                  <h2>${safe(content.statusTitle)}</h2>
                </div>

                <span class="maintenance-status-icon">
                  ${icon("fa-satellite-dish")}
                </span>
              </div>

              <div class="maintenance-status-list">
                ${content.statuses.map(item => `
                  <div class="maintenance-status-row">
                    <span class="maintenance-status-row-icon">
                      ${icon(item.icon)}
                    </span>

                    <span class="maintenance-status-row-label">
                      ${safe(item.label)}
                    </span>

                    <span class="maintenance-status-badge state-${safe(item.state)}">
                      <i class="fa-solid fa-circle"></i>
                      ${safe(item.value)}
                    </span>
                  </div>
                `).join("")}
              </div>
            </section>

            <div class="maintenance-actions">

              <button
                type="button"
                class="maintenance-primary-btn"
                id="openFutureBtn"
              >
                <span>${icon("fa-sparkles")}</span>
                <span>استكشف ما بعد العودة</span>
                <i class="fa-solid fa-arrow-left"></i>
              </button>

              <a
                class="maintenance-admin-btn"
                href="${safe(config.adminLink)}"
                target="_blank"
                rel="noopener noreferrer"
                id="maintenanceAdminLink"
              >
                <span class="admin-link-icon">${icon("fa-link")}</span>
                <span>صفحات الإدارة الرسمية</span>
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>

            </div>

            <div class="maintenance-footer-note">
              <span>${icon("fa-lock")}</span>
              الموقع الأساسي محفوظ بالكامل خلف طبقة الصيانة الحالية.
            </div>

          </section>

        </main>

        <div
          class="maintenance-modal"
          id="maintenanceModal"
          aria-hidden="true"
          role="dialog"
          aria-modal="true"
          aria-labelledby="maintenanceModalTitle"
        >
          <div class="maintenance-modal-backdrop" data-modal-close></div>

          <section class="maintenance-modal-panel">

            <header class="maintenance-modal-header">
              <button
                type="button"
                class="maintenance-icon-btn"
                id="maintenanceModalBack"
                aria-label="الرجوع"
                hidden
              >
                <i class="fa-solid fa-arrow-right"></i>
              </button>

              <div class="maintenance-modal-title-wrap">
                <span class="maintenance-modal-kicker">TAAMEN / FUTURE</span>
                <h2 id="maintenanceModalTitle">مستقبل تأمين</h2>
              </div>

              <button
                type="button"
                class="maintenance-icon-btn"
                id="maintenanceModalClose"
                aria-label="إغلاق"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </header>

            <div class="maintenance-modal-body" id="maintenanceModalBody"></div>

          </section>
        </div>

        <div class="maintenance-restore-screen" id="maintenanceRestoreScreen" aria-hidden="true">
          <div class="restore-core">
            <div class="restore-orb">
              ${icon("fa-futbol")}
            </div>

            <span class="restore-kicker">SYSTEM READY</span>
            <h2>تمت إعادة تفعيل منصة تأمين</h2>

            <div class="restore-progress">
              <span id="restoreProgressBar"></span>
            </div>

            <p id="restoreStatusText">جاري استعادة الواجهة...</p>
          </div>
        </div>

      </div>
    `;

    bindUI();
  }

  function bindUI() {
    document
      .getElementById("openFutureBtn")
      ?.addEventListener("click", () => openModal("overview"));

    document
      .getElementById("maintenanceModalClose")
      ?.addEventListener("click", closeModal);

    document
      .getElementById("maintenanceModalBack")
      ?.addEventListener("click", goBackModal);

    document
      .querySelector("[data-modal-close]")
      ?.addEventListener("click", closeModal);

    document.addEventListener("keydown", handleKeydown);

    initFloatingParallax();
  }

  function handleKeydown(event) {
    const modal = document.getElementById("maintenanceModal");

    if (!modal?.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      closeModal();
      return;
    }

    if (event.key === "Backspace" && modalHistory.length > 0) {
      event.preventDefault();
      goBackModal();
    }
  }

  function initFloatingParallax() {
    const app = document.getElementById("maintenanceApp");

    if (!app) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) return;

    let raf = 0;

    window.addEventListener(
      "pointermove",
      event => {
        if (raf) cancelAnimationFrame(raf);

        raf = requestAnimationFrame(() => {
          const x = (event.clientX / window.innerWidth - 0.5) * 2;
          const y = (event.clientY / window.innerHeight - 0.5) * 2;

          app.style.setProperty("--mx", `${x.toFixed(4)}`);
          app.style.setProperty("--my", `${y.toFixed(4)}`);
        });
      },
      { passive: true }
    );
  }

  function getModalElements() {
    return {
      modal: document.getElementById("maintenanceModal"),
      body: document.getElementById("maintenanceModalBody"),
      title: document.getElementById("maintenanceModalTitle"),
      back: document.getElementById("maintenanceModalBack")
    };
  }

  function openModal(view = "overview", pushHistory = true) {
    const modal = document.getElementById("maintenanceModal");

    if (!modal) return;

    if (pushHistory && currentModalView !== view) {
      modalHistory.push(currentModalView);
    }

    currentModalView = view;

    renderModalView(view);

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("maintenance-modal-open");

    window.setTimeout(() => {
      document
        .querySelector("#maintenanceModalClose")
        ?.focus({ preventScroll: true });
    }, 80);
  }

  function closeModal() {
    const modal = document.getElementById("maintenanceModal");

    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("maintenance-modal-open");

    modalHistory = [];
    currentModalView = "overview";
  }

  function goBackModal() {
    if (modalHistory.length === 0) {
      closeModal();
      return;
    }

    const previous = modalHistory.pop();

    currentModalView = previous;
    renderModalView(previous);
  }

  function renderModalView(view) {
    const { body, title, back } = getModalElements();

    if (!body || !title || !back) return;

    back.hidden = view === "overview";

    if (view === "overview") {
      title.textContent = content.future.title;

      body.innerHTML = `
        <div class="future-intro">
          <span class="future-intro-icon">
            ${icon("fa-wand-magic-sparkles")}
          </span>

          <p>${safe(content.future.intro)}</p>
        </div>

        <div class="future-card-list">

          ${renderFutureCard(
            content.future.platform,
            "platform"
          )}

          ${renderFutureCard(
            content.future.tactical,
            "tactical"
          )}

          ${renderFutureCard(
            content.future.ai,
            "ai"
          )}

          ${renderFutureCard(
            {
              ...content.future.proposed,
              linkLabel: "استعراض المقترحات"
            },
            "proposed"
          )}

        </div>

        <div class="future-disclaimer">
          ${icon("fa-circle-info")}
          <span>
            الحالات الموضحة هنا تعبّر عن حالة الفكرة الحالية،
            وقد تتغير التفاصيل أثناء مرحلة التطوير.
          </span>
        </div>
      `;

      bindFutureCards();
      return;
    }

    if (view === "platform") {
      title.textContent = content.future.platform.title;

      body.innerHTML = `
        ${renderDetailIntro(content.future.platform)}

        <div class="future-detail-sections">
          ${content.future.platform.sections
            .map(section => renderDetailSection(section))
            .join("")}
        </div>
      `;

      return;
    }

    if (view === "tactical") {
      title.textContent = content.future.tactical.title;

      body.innerHTML = `
        ${renderDetailIntro(content.future.tactical)}

        <div class="future-detail-sections">
          ${content.future.tactical.sections
            .map(section => renderDetailSection(section))
            .join("")}
        </div>

        ${renderProposedFeatures(
          content.future.tactical.proposedFeatures
        )}
      `;

      return;
    }

    if (view === "ai") {
      title.textContent = content.future.ai.title;

      body.innerHTML = `
        ${renderDetailIntro(content.future.ai)}

        <div class="future-detail-sections">
          ${content.future.ai.sections
            .map(section => renderDetailSection(section))
            .join("")}
        </div>

        ${renderProposedFeatures(
          content.future.ai.proposedFeatures
        )}
      `;

      return;
    }

    if (view === "proposed") {
      title.textContent = content.future.proposed.title;

      body.innerHTML = `
        <div class="future-intro">
          <span class="future-intro-icon">
            ${icon(content.future.proposed.icon)}
          </span>

          <p>${safe(content.future.proposed.intro)}</p>
        </div>

        <div class="proposed-features-list">
          ${content.future.proposed.features
            .map(
              feature => `
                <article class="proposed-feature-card">
                  <div class="proposed-feature-icon">
                    ${icon("fa-lightbulb")}
                  </div>

                  <div>
                    <div class="proposed-feature-topline">
                      <h3>${safe(feature.title)}</h3>
                      <span>مقترح</span>
                    </div>

                    <p>${safe(feature.description)}</p>
                  </div>
                </article>
              `
            )
            .join("")}
        </div>
      `;

      return;
    }

    title.textContent = content.future.title;
    body.innerHTML = "<p>تعذر تحميل المحتوى.</p>";
  }

  function renderFutureCard(item, view) {
    return `
      <article class="future-card">

        <div class="future-card-icon">
          ${icon(item.icon)}
        </div>

        <div class="future-card-main">

          <div class="future-card-topline">
            <h3>${safe(item.title)}</h3>
            <span class="future-status">${safe(item.status)}</span>
          </div>

          <p>${safe(item.description || item.intro || "")}</p>

          ${
            item.linkLabel
              ? `
                <button
                  type="button"
                  class="future-detail-link"
                  data-future-view="${safe(view)}"
                >
                  ${safe(item.linkLabel)}
                  <i class="fa-solid fa-arrow-left"></i>
                </button>
              `
              : ""
          }

        </div>
      </article>
    `;
  }

  function bindFutureCards() {
    document.querySelectorAll("[data-future-view]").forEach(button => {
      button.addEventListener("click", () => {
        const view = button.dataset.futureView;

        if (view) openModal(view);
      });
    });
  }

  function renderDetailIntro(item) {
    return `
      <div class="future-detail-intro">
        <div class="future-detail-icon">
          ${icon(item.icon)}
        </div>

        <p>${safe(item.intro)}</p>
      </div>
    `;
  }

  function renderDetailSection(section) {
    return `
      <article class="future-detail-section">
        <span class="detail-section-number">
          ${icon("fa-chevron-left")}
        </span>

        <div>
          <h3>${safe(section.title)}</h3>
          <p>${safe(section.text)}</p>
        </div>
      </article>
    `;
  }

  function renderProposedFeatures(features) {
    return `
      <section class="detail-proposed-section">

        <div class="detail-subheading">
          <span>${icon("fa-lightbulb")}</span>
          <div>
            <span>FUTURE IDEAS</span>
            <h3>ميزات مقترحة</h3>
          </div>
        </div>

        <div class="detail-feature-chips">
          ${features
            .map(
              feature => `
                <span class="detail-feature-chip">
                  <i class="fa-solid fa-plus"></i>
                  ${safe(feature)}
                </span>
              `
            )
            .join("")}
        </div>

        <p class="detail-note">
          هذه العناصر مقترحات مستقبلية وليست قائمة إطلاق نهائية.
        </p>

      </section>
    `;
  }

  function updateCountdown() {
    const values = getCountdown();

    const days = document.getElementById("maintenanceDays");
    const hours = document.getElementById("maintenanceHours");
    const minutes = document.getElementById("maintenanceMinutes");
    const seconds = document.getElementById("maintenanceSeconds");

    if (!days || !hours || !minutes || !seconds) return;

    days.textContent = String(values.days).padStart(2, "0");
    hours.textContent = formatUnit(values.hours);
    minutes.textContent = formatUnit(values.minutes);
    seconds.textContent = formatUnit(values.seconds);

    document.documentElement.style.setProperty(
      "--maintenance-second-progress",
      String(values.seconds / 60)
    );

    if (values.total <= 0) {
      clearInterval(intervalId);
      intervalId = null;

      if (config.autoRestore) {
        restoreApplication();
      }
    }
  }

  function startCountdown() {
    updateCountdown();

    if (getCountdown().total <= 0) return;

    intervalId = window.setInterval(updateCountdown, 250);
  }

  function restoreApplication() {
    if (appLoaded) return;

    appLoaded = true;

    const app = document.getElementById("maintenanceApp");
    const restore = document.getElementById("maintenanceRestoreScreen");
    const progress = document.getElementById("restoreProgressBar");
    const status = document.getElementById("restoreStatusText");

    if (!app || !restore || !progress || !status) {
      loadApplication();
      return;
    }

    restore.setAttribute("aria-hidden", "false");
    restore.classList.add("is-visible");

    const messages = [
      "جاري استعادة الواجهة...",
      "جاري تحميل محرك المباريات...",
      "جاري استعادة الأنظمة...",
      "TAAMEN READY"
    ];

    messages.forEach((message, index) => {
      window.setTimeout(() => {
        status.textContent = message;
      }, index * 500);
    });

    window.requestAnimationFrame(() => {
      progress.style.width = "100%";
    });

    window.setTimeout(() => {
      app.classList.add("is-restoring");

      loadApplication();

      window.setTimeout(() => {
        root.classList.add("maintenance-finished");
        document.body.classList.remove("maintenance-mode");
      }, 500);
    }, config.restoreTransitionMs);
  }

  function loadApplication() {
    const script = document.createElement("script");

    script.type = "module";
    script.src = `${appScriptUrl}?maintenance-bypass=${Date.now()}`;

    script.onload = () => {
      console.info("[TAAMEN] Main application loaded.");
    };

    script.onerror = error => {
      console.error("[TAAMEN] Failed to load main application.", error);

      const restoreStatus = document.getElementById("restoreStatusText");

      if (restoreStatus) {
        restoreStatus.textContent =
          "تعذر تحميل المنصة. حاول تحديث الصفحة مرة أخرى.";
      }

      appLoaded = false;
    };

    document.body.appendChild(script);
  }

  function disableMaintenance() {
    const app = document.getElementById("maintenanceApp");

    window.setTimeout(() => {
      app?.remove();

      root.innerHTML = "";

      document.body.classList.remove("maintenance-mode");

      root.remove();
    }, 700);
  }

  function boot() {
    document.body.classList.add("maintenance-mode");

    if (!config.enabled || Date.now() >= targetTime) {
      window.__TAAMEN_MAINTENANCE__.active = false;

      loadApplication();
      disableMaintenance();
      return;
    }

    window.__TAAMEN_MAINTENANCE__.active = true;

    renderShell();
    startCountdown();
  }

  boot();
})();
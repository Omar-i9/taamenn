/**
 * ============================================================================
 * 🏆 تأمين 2026 | النسخة الرمضانية البلاتينية (GDMi)
 * 👨‍💻 محرك المنصة الرئيسي
 * ============================================================================
 */

/* =========================================================
   [1] بيانات أساسية
   ========================================================= */

const systemMessages = {
    home: [
        "أهلاً بعودتك أيها البطل! 🏆",
        "هل أنت مستعد للمجد اليوم؟ 🔥",
        "الملعب يشتاق لأقدام الأبطال ⚽",
        "ركّز على هدفك، النصر قادم ✨",
        "تأمين 2026: حيث تولد الأساطير ⚔️"
    ],
    cannon: [
        "لا تنسى صلاتك!",
        "تقبل الله منا ومنكم صالح الأعمال 🤲",
        "الوقت يمضي.. استغله في الطاعات ⏳",
        "لا تنس الدعاء لي ولك 🌙",
        "قيام الليل هو أجمل لحظات اليوم ❤️"
    ],
    radar: [
        "الأرقام لا تكذب أبداً 📊",
        "ادرس خصمك جيداً قبل المباراة 🧐",
        "التمركز الصحيح هو مفتاح الفوز 🔑",
        "حلل أداءك لترتفع بمستواك 📈",
        "استخدم وضع التكتيكات لتطوير لعبك 🛡️"
    ],
    matches: [
        "التاريخ يكتبه المنتصرون 📜",
        "تعلم من الهزيمة لتصنع النصر 🛡️",
        "سجلات المجد خالدة هنا 💎",
        "راجع نتائجك وحسن أخطاءك 🔄",
        "مباريات لا تنسى في الذاكرة 🧠"
    ],
    weather: [
        "الجو في ملعب الخليل مناسب جداً اليوم ☁️",
        "لا أعذار.. العب في كل الظروف 🌧️",
        "تحقق من الرياح لتضبط تسديداتك 💨",
        "احذر من البرد، وسخن جيداً 🔥",
        "السماء صافية والملعب جاهز ☀️"
    ],
    royal: [
        "مرحباً بك في مجلس الكبار 👑",
        "مجتمع النخبة يرحب بك 🤝",
        "تواصل معنا لأي اقتراحات 📩",
        "الراحة جزء من التدريب 🛋️"
    ]
};

const statsElite = [
    { name: "يوسف", g: 8, a: 3, r: 9.9 },
    { name: "عمر", g: 5, a: 6, r: 9.7 },
    { name: "هاني", g: 2, a: 4, r: 8.9 },
    { name: "مؤيد", g: 1, a: 2, r: 8.8 },
    { name: "أرقم", g: 0, a: 1, r: 7.9 },
    { name: "علي", g: 3, a: 0, r: 8.5 }
];

const statsChallenge = [
    { name: "خضر", g: 7, a: 2, r: 9.8 },
    { name: "كريم", g: 4, a: 5, r: 9.5 },
    { name: "سنقرط", g: 1, a: 3, r: 8.7 },
    { name: "أحمد", g: 1, a: 1, r: 8.1 },
    { name: "محمد", g: 0, a: 2, r: 8.0 },
    { name: "إبراهيم", g: 2, a: 0, r: 8.4 }
];

const matchHistoryArchive = [
    { t1: "كريم", t2: "عمر", s: "6 - 9", st: "انتهت", d: "الجمعه 16 يناير" },
    { t1: "عمر", t2: "كريم", s: "7 - 10", st: "انتهت", d: "الجمعه 23 يناير" },
    { t1: "كريم التميمي", t2: "عمر & كريم", s: "8 - 7", st: "انتهت", d: "الجمعه 30 يناير" },
    { t1: "خضر", t2: "عمر & كريم", s: "4 - 5", st: "انتهت", d: "الجمعه 13 فبراير" },
    { t1: "كريم", t2: "عمر", s: "3 - 3", st: "انتهت", d: "الجمعه 20 فبراير" },
    { t1: "عمر", t2: "كريم", s: "6 - 8", st: "انتهت", d: "الجمعه 27 فبراير" },
    { t1: "خضر", t2: "كريم", s: "13 - 7", st: "انتهت", d: "الجمعه 6 مارس" },
    { t1: "عمر", t2: "كريم", s: "5 - 7", st: "انتهت", d: " (ودية) الخميس 12 مارس" },
    { t1: "عمر & كريم", t2: "كريم التميمي", s: "9 - 7", st: "انتهت", d: "الجمعه 13 مارس" }
];

const dhikrList = [
    "اللهم إنك عفو تحب العفو فاعف عنا",
    "سبحان الله وبحمده، عدد خلقه ورضا نفسه",
    "لا إله إلا الله وحده لا شريك له",
    "أستغفر الله العظيم وأتوب إليه",
    "اللهم صل وسلم على نبينا محمد",
    "اللهم آتنا في الدنيا حسنة وفي الآخرة حسنة"
];

const futsalTactics = [
    {
        id: "diamond",
        name: "الماسة (1-2-1)",
        icon: "💎",
        ins: "تكتيك متوازن، الجناحين يفتحوا الملعب، والمهاجم يسحب الدفاع للخلف.",
        pos: { p1: { t: 80, l: 50 }, p2: { t: 50, l: 20 }, p3: { t: 50, l: 80 }, p4: { t: 25, l: 50 }, p5: { t: 92, l: 50 } }
    },
    {
        id: "square",
        name: "المربع (2-2)",
        icon: "⬛",
        ins: "إغلاق العمق تماماً، الاعتماد على الهجمات المرتدة السريعة فور قطع الكرة.",
        pos: { p1: { t: 75, l: 30 }, p2: { t: 75, l: 70 }, p3: { t: 35, l: 30 }, p4: { t: 35, l: 70 }, p5: { t: 92, l: 50 } }
    },
    {
        id: "pyramid",
        name: "الهرم (2-1-1)",
        icon: "📐",
        ins: "لاعب الارتكاز هو المحرك الأساسي، كل الهجمات تبدأ من عنده.",
        pos: { p1: { t: 78, l: 35 }, p2: { t: 78, l: 65 }, p3: { t: 52, l: 50 }, p4: { t: 22, l: 50 }, p5: { t: 92, l: 50 } }
    },
    {
        id: "y-form",
        name: "هجوم Y",
        icon: "🚀",
        ins: "ضغط عالي رجل لرجل في مناطق الخصم لإجباره على ارتكاب الأخطاء.",
        pos: { p1: { t: 85, l: 50 }, p2: { t: 45, l: 25 }, p3: { t: 45, l: 75 }, p4: { t: 18, l: 50 }, p5: { t: 92, l: 50 } }
    }
];

const prayerIconsMap = {
    Fajr: "fa-cloud-moon",
    Sunrise: "fa-sun",
    Dhuhr: "fa-sun",
    Asr: "fa-cloud-sun",
    Maghrib: "fa-moon",
    Isha: "fa-star-and-crescent"
};

let activeSelectedTactic = null;
let currentPrayerInterval = null;
let globalPrayerData = [];
let tacticalEngine = null;

/* =========================================================
   [2] أدوات مساعدة
   ========================================================= */

function safeText(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function debounce(fn, delay = 120) {
    let timer = null;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

function pulseElement(el, scale = 1.05, duration = 220) {
    if (!el) return;
    try {
        el.animate([
            { transform: "scale(1)" },
            { transform: `scale(${scale})` },
            { transform: "scale(1)" }
        ], {
            duration,
            easing: "ease-out"
        });
    } catch (_) {}
}

function setThemeColorMeta(color) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", color);
}

function closeAnyTacticalMenus() {
    document.getElementById("tactical-advanced-menu")?.remove();
    document.getElementById("team-switch-menu")?.remove();
}

function closeAllOverlays() {
    closeLibrary();
    closeTeamSelector();
    closeAnyTacticalMenus();
    toggleMenu(false);
}

/* =========================================================
   [3] الإشعارات والتنقل
   ========================================================= */

function showNotification(pageId, customMessage = "", options = {}) {
    let container = document.getElementById("notification-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "notification-container";
        document.body.appendChild(container);
    }

    const messages = systemMessages[pageId] || systemMessages.home || ["مرحباً بك في تأمين 26"];
    const message = customMessage || messages[Math.floor(Math.random() * messages.length)];
    const icon = options.icon || "fa-bolt-lightning";
    const duration = options.duration || 3800;

    const toast = document.createElement("div");
    toast.className = "glass-toast";
    toast.innerHTML = `
        <i class="fas ${icon} toast-icon" style="color:#ffd700;"></i>
        <span>${safeText(message)}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(0)";
    });

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(100%)";
        setTimeout(() => toast.remove(), 350);
    }, duration);
}

function navigate(pageId, element = null, persist = true) {
    try {
        document.querySelectorAll(".page").forEach(page => {
            page.classList.remove("active");
            page.style.display = "none";
        });

        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add("active");
            targetPage.style.display = "block";
            targetPage.style.opacity = "1";
        }

        document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));
        if (element) element.classList.add("active");

        if (persist) {
            localStorage.setItem("taamen-last-page", pageId);
            if (history.replaceState) history.replaceState(null, "", `#${pageId}`);
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
        console.error("Navigation Error:", error);
    }
}

/* =========================================================
   [4] الثيم
   ========================================================= */

function toggleTheme() {
    document.body.classList.remove('day-mode');
    document.body.classList.add('night-mode');

    const btnIcon = document.querySelector('#themeBtn i');
    if (btnIcon) btnIcon.className = 'fas fa-moon';

    localStorage.setItem('taamen-theme', 'night');
}

function applyDynamicTheme() {
    document.body.classList.remove('day-mode');
    document.body.classList.add('night-mode');

    const btnIcon = document.querySelector('#themeBtn i');
    if (btnIcon) btnIcon.className = 'fas fa-moon';

    localStorage.setItem('taamen-theme', 'night');
}
/* =========================================================
   [5] الهامبرجر والقائمة
   ========================================================= */

function syncHamburgerVisual(isOpen) {
    const burger = document.querySelector(".hamburger-glow");
    if (!burger) return;

    const spans = burger.querySelectorAll("span");
    if (spans.length < 3) return;

    if (isOpen) {
        spans[0].style.transform = "translateY(10px) rotate(45deg)";
        spans[1].style.opacity = "0";
        spans[2].style.transform = "translateY(-10px) rotate(-45deg)";
    } else {
        spans.forEach(span => {
            span.style.transform = "";
            span.style.opacity = "";
        });
    }

    burger.classList.toggle("active", isOpen);
}

function toggleMenu(forceState) {
    const menu = document.getElementById("navMenu");
    if (!menu) return;

    const isOpen = typeof forceState === "boolean"
        ? forceState
        : !menu.classList.contains("active");

    menu.classList.toggle("active", isOpen);
    syncHamburgerVisual(isOpen);
}

function initMenuOutsideClick() {
    document.addEventListener("click", (e) => {
        const menu = document.getElementById("navMenu");
        const burger = document.querySelector(".hamburger-glow");

        if (!menu || !burger) return;

        if (menu.classList.contains("active") && !menu.contains(e.target) && !burger.contains(e.target)) {
            toggleMenu(false);
        }
    });
}

/* =========================================================
   [6] تأثيرات عامة
   ========================================================= */

function initCursorEffects() {
    const cursorDot = document.querySelector(".cursor-dot");
    const cursorOutline = document.querySelector(".cursor-outline");
    if (!cursorDot || !cursorOutline) return;
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;

    let lastX = 0;
    let lastY = 0;
    let ticking = false;

    window.addEventListener("mousemove", (e) => {
        lastX = e.clientX;
        lastY = e.clientY;

        if (ticking) return;
        ticking = true;

        requestAnimationFrame(() => {
            cursorDot.style.left = `${lastX}px`;
            cursorDot.style.top = `${lastY}px`;
            cursorOutline.animate(
                { left: `${lastX}px`, top: `${lastY}px` },
                { duration: 180, fill: "forwards" }
            );
            ticking = false;
        });
    });
}

function initShootingStars() {
    const container = document.getElementById("starsContainer");
    if (!container || container.dataset.ready === "1") return;
    container.dataset.ready = "1";

    for (let i = 0; i < 120; i++) {
        const star = document.createElement("div");
        star.className = "star";
        const size = Math.random() * 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.setProperty("--d", `${Math.random() * 3 + 2}s`);
        container.appendChild(star);
    }

    setInterval(() => {
        const meteor = document.createElement("div");
        meteor.className = "shooting-star";
        meteor.style.top = `${Math.random() * 60}%`;
        meteor.style.left = `${Math.random() * 80}%`;
        meteor.style.animation = `star-move ${Math.random() * 2 + 1}s linear forwards`;
        container.appendChild(meteor);
        setTimeout(() => meteor.remove(), 4000);
    }, 3000);
}

function initTilt() {
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;

    const cards = document.querySelectorAll(".tilt-card");
    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -3;
            const rotateY = ((x - centerX) / centerX) * 3;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
        });
    });
}

function setupScrollReveal() {
    const items = document.querySelectorAll(".scroll-reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
        items.forEach(el => el.classList.add("visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.18 });

    items.forEach(el => observer.observe(el));
}

/* =========================================================
   [7] الإحصائيات والأرشيف
   ========================================================= */

function toggleRadarMode(mode, element) {
    const pitchView = document.getElementById("pitch-view");
    const statsView = document.getElementById("stats-view");

    if (mode === "pitch") {
        if (pitchView) pitchView.style.display = "block";
        if (statsView) statsView.style.display = "none";
    } else {
        if (pitchView) pitchView.style.display = "none";
        if (statsView) statsView.style.display = "block";
        renderStats();
    }

    const btns = document.querySelectorAll(".radar-controls .radar-btn");
    btns.forEach(btn => btn.classList.remove("active"));
    if (element) element.classList.add("active");
}

function renderStats() {
    const eliteBody = document.getElementById("eliteTableBody");
    const challengeBody = document.getElementById("challengeTableBody");

    const createRows = (data) => data.map(p => `
        <tr>
            <td style="font-weight:bold; color:var(--gold); text-align:right;">${safeText(p.name)}</td>
            <td>${p.g}</td>
            <td>${p.a}</td>
            <td>${p.g + p.a}</td>
            <td style="color:#ffd700;">
                <i class="fas fa-star" style="font-size:0.7rem; margin-left:3px;"></i>${p.r.toFixed(1)}
            </td>
        </tr>
    `).join("");

    if (eliteBody) eliteBody.innerHTML = createRows(statsElite);
    if (challengeBody) challengeBody.innerHTML = createRows(statsChallenge);

    updateFieldIcons();
}

function updateFieldIcons() {
    const allPlayers = document.querySelectorAll(".player-node, .player-token");
    if (!allPlayers.length) return;

    const allStats = [...statsElite, ...statsChallenge];
    const mvpElite = statsElite.reduce((prev, curr) => (curr.r > prev.r ? curr : prev), statsElite[0]);
    const mvpChallenge = statsChallenge.reduce((prev, curr) => (curr.r > prev.r ? curr : prev), statsChallenge[0]);

    allPlayers.forEach(token => {
        const playerName = token.getAttribute("data-name") || token.dataset.name || "";
        const pData = allStats.find(p => p.name === playerName);

        token.classList.remove("mvp-glow");
        token.querySelectorAll(".goal-badge, .assist-badge").forEach(b => b.remove());

        if (!pData) return;

        if (playerName === mvpElite.name || playerName === mvpChallenge.name) {
            token.classList.add("mvp-glow");
        }

    });
}

function renderMatches() {
    const archiveContainer = document.getElementById("matchHistoryContainer");
    if (!archiveContainer) return;

    archiveContainer.innerHTML = matchHistoryArchive.map(m => `
        <div class="tilt-card" style="display:flex; justify-content:space-between; align-items:center; background: rgba(0, 10, 26, 0.7); border-color: rgba(255,255,255,0.1); margin-bottom: 15px;">
            <div style="text-align:center; flex:1;">
                <i class="fas fa-shield-alt" style="display:block; font-size:1.8rem; margin-bottom:8px; color:#a0aec0;"></i>
                <span style="font-weight:bold; font-size:1.1rem;">${safeText(m.t1)}</span>
            </div>
            <div style="text-align:center; padding: 0 20px; flex:2;">
                <div style="font-family:'Orbitron'; font-size:2.2rem; color:var(--accent-cyan); text-shadow: 0 0 15px rgba(0,242,254,0.5); font-weight:900;">${safeText(m.s)}</div>
                <div style="font-size:0.9rem; color:${m.st === "انتهت" ? "#cbd5e0" : "var(--gold)"}; margin-top:5px; font-weight:bold;">${safeText(m.st)}</div>
                <div style="font-size:0.8rem; opacity:0.7; margin-top:4px;">${safeText(m.d)}</div>
            </div>
            <div style="text-align:center; flex:1;">
                <i class="fas fa-tshirt" style="display:block; font-size:1.8rem; margin-bottom:8px; color:#a0aec0;"></i>
                <span style="font-weight:bold; font-size:1.1rem;">${safeText(m.t2)}</span>
            </div>
        </div>
    `).join("");
}

/* =========================================================
   [8] مواقيت الصلاة
   ========================================================= */

function timeStringToMinutes(timeString) {
    const parts = String(timeString || "").split(":").map(Number);
    if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return null;
    return parts[0] * 60 + parts[1];
}

function renderPrayerCards(activeId = "") {
    const container = document.getElementById("prayersContainer");
    if (!container) return;

    if (!globalPrayerData.length) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML = globalPrayerData.map(p => {
        const activeClass = (p.id === activeId || p.isNext)
            ? (p.id === "Maghrib" ? "active-maghrib" : "active-next")
            : "";

        const iconClass = prayerIconsMap[p.id] || "fa-clock";

        return `
            <div class="prayer-unit ${activeClass}" id="card-${p.id}">
                <div class="prayer-icon-wrapper">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div style="font-size:0.9rem; color:#aaa; font-weight:bold; margin-bottom:5px;">${safeText(p.name)}</div>
                <div style="font-size:1.6rem; font-weight:900; color:var(--gold); font-family:'Orbitron';">${safeText(p.time)}</div>
            </div>
        `;
    }).join("");
}

async function initPrayersSystem() {
    const lat = 31.5326;
    const long = 35.0998;

    try {
        const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${long}&method=1`);
        const data = await res.json();

        const timings = data?.data?.timings;
        const hijri = data?.data?.date?.hijri;

        const hijriDisplay = document.getElementById("hijriDate");
        if (hijriDisplay && hijri) {
            hijriDisplay.innerText = `${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`;
        }

        const prayers = [
            { id: "Fajr", name: "الفجر", time: timings?.Fajr || "--:--" },
            { id: "Sunrise", name: "الشروق", time: timings?.Sunrise || "--:--" },
            { id: "Dhuhr", name: "الظهر", time: timings?.Dhuhr || "--:--" },
            { id: "Asr", name: "العصر", time: timings?.Asr || "--:--" },
            { id: "Maghrib", name: "المغرب", time: timings?.Maghrib || "--:--" },
            { id: "Isha", name: "العشاء", time: timings?.Isha || "--:--" }
        ];

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        let nextFound = false;

        globalPrayerData = prayers.map(p => {
            const prayerMinutes = timeStringToMinutes(p.time);
            p.isNext = false;

            if (!nextFound && prayerMinutes !== null && prayerMinutes > currentMinutes) {
                p.isNext = true;
                nextFound = true;
            }

            return p;
        });

        if (!nextFound && globalPrayerData.length) {
            globalPrayerData[0].isNext = true;
        }

        renderPrayerCards();
        startDynamicPrayerCountdown();
    } catch (error) {
        console.error("Omar System Error - Prayers API:", error);
        globalPrayerData = [
            { id: "Fajr", name: "الفجر", time: "--:--", isNext: true },
            { id: "Sunrise", name: "الشروق", time: "--:--", isNext: false },
            { id: "Dhuhr", name: "الظهر", time: "--:--", isNext: false },
            { id: "Asr", name: "العصر", time: "--:--", isNext: false },
            { id: "Maghrib", name: "المغرب", time: "--:--", isNext: false },
            { id: "Isha", name: "العشاء", time: "--:--", isNext: false }
        ];
        renderPrayerCards();
        const counterEl = document.getElementById("dynamicPrayerCounter");
        const labelEl = document.getElementById("nextPrayerNameLabel");
        if (counterEl) counterEl.innerText = "--:--:--";
        if (labelEl) labelEl.innerText = "تعذر تحديث المواقيت الآن";
    }
}

function startDynamicPrayerCountdown() {
    if (currentPrayerInterval) clearInterval(currentPrayerInterval);

    currentPrayerInterval = setInterval(() => {
        if (!globalPrayerData.length) return;

        const now = new Date();
        let nextPrayer = null;
        let targetDate = new Date();

        for (const p of globalPrayerData) {
            const mins = timeStringToMinutes(p.time);
            if (mins === null) continue;

            const pt = new Date();
            pt.setHours(Math.floor(mins / 60), mins % 60, 0, 0);

            if (now < pt) {
                nextPrayer = p;
                targetDate = pt;
                break;
            }
        }

        if (!nextPrayer) {
            nextPrayer = globalPrayerData[0];
            const mins = timeStringToMinutes(nextPrayer.time);

            if (mins !== null) {
                targetDate.setDate(targetDate.getDate() + 1);
                targetDate.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
            } else {
                const counterEl = document.getElementById("dynamicPrayerCounter");
                const labelEl = document.getElementById("nextPrayerNameLabel");
                if (counterEl) counterEl.innerText = "--:--:--";
                if (labelEl) labelEl.innerText = "تعذر حساب العد التنازلي";
                return;
            }
        }

        renderPrayerCards(nextPrayer.id);

        const diff = Math.max(0, targetDate - now);
        const hh = String(Math.floor(diff / 3600000)).padStart(2, "0");
        const mm = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
        const ss = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");

        const counterEl = document.getElementById("dynamicPrayerCounter");
        const labelEl = document.getElementById("nextPrayerNameLabel");
        const sectionEl = document.getElementById("dynamicTimerSection");

        if (counterEl) counterEl.innerText = `${hh}:${mm}:${ss}`;

        if (labelEl) {
            labelEl.innerText = nextPrayer.id === "Maghrib"
                ? `الوقت المتبقي لرفع أذان ${nextPrayer.name}`
                : `الوقت المتبقي لصلاة ${nextPrayer.name}`;
        }

        if (sectionEl) {
            sectionEl.classList.toggle("maghrib-active", nextPrayer.id === "Maghrib");
        }
    }, 1000);
}

/* =========================================================
   [9] الحجز والنفحات
   ========================================================= */

function updateBookingTimer() {
    const now = new Date();
    const day = now.getDay();      // الجمعة = 5
    const hour = now.getHours();

    const countdownEl = document.getElementById("match-countdown");
    const badgeEl = document.getElementById("booking-badge");
    const timerTextEl = document.getElementById("booking-timer-text");

    const isBookingOpen = day === 5 && hour >= 17 && hour < 18;
    if (isBookingOpen) {
        if (badgeEl) {
            badgeEl.innerText = "مفتوح الآن";
            badgeEl.style.background = "#2ecc71";
            badgeEl.style.color = "#000";
        }
        if (timerTextEl) {
            timerTextEl.innerText = "الحجز مفتوح الآن حتى الساعة 6 مساءً";
        }
        if (countdownEl) {
            countdownEl.innerText = "00:00:00:00";
        }
        return;
    }

    let target = new Date();
    const dayDiff = (5 - now.getDay() + 7) % 7;
    target.setDate(now.getDate() + dayDiff);
    target.setHours(20, 0, 0, 0);

    if (dayDiff === 0 && now > target) {
        target.setDate(target.getDate() + 7);
    }

    const diff = Math.max(0, target - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, "0");
    const mins = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0");
    const secs = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, "0");

    if (countdownEl) countdownEl.innerText = `${days}d ${hours}:${mins}:${secs}`;

    if (badgeEl) {
        badgeEl.innerText = "قادمة";
        badgeEl.style.background = "#d2ff20";
        badgeEl.style.color = "#000";
    }

    if (timerTextEl) {
        timerTextEl.innerText = "الحجز يفتح كل جمعة من 8:00 إلى 9:00 مساءً";
    }
}

function updateHomeBookingTimer() {
    updateBookingTimer();
}

function rotateDhikr() {
    const displays = document.querySelectorAll(".dhikr-display");
    if (!displays.length) return;

    const shuffled = [...dhikrList].sort(() => Math.random() - 0.5);

    displays.forEach((el, index) => {
        const text = shuffled[index % shuffled.length];
        el.style.opacity = "0";
        setTimeout(() => {
            el.textContent = text;
            el.style.opacity = "1";
        }, 220);
    });
}

function updateHomeStats() {
    const topScorerEl = document.getElementById("top-scorer");
    const bestTeamEl = document.getElementById("best-team");

    const allPlayers = [...statsElite, ...statsChallenge];
    const topScorer = allPlayers.reduce((best, current) => (current.g > best.g ? current : best), allPlayers[0]);

    const eliteScore = statsElite.reduce((sum, p) => sum + p.g + p.a, 0);
    const challengeScore = statsChallenge.reduce((sum, p) => sum + p.g + p.a, 0);
    const bestTeam = eliteScore >= challengeScore ? "فريق النخبة A" : "فريق التحدي B";

    if (topScorerEl) topScorerEl.innerText = `${topScorer.name} (${topScorer.g} هدف)`;
    if (bestTeamEl) bestTeamEl.innerText = bestTeam;

    const systemStatus = document.getElementById("system-status");
    if (systemStatus) systemStatus.innerHTML = `<i class="fas fa-check-circle"></i> النظام مفعل`;
}

/* =========================================================
   [10] الطقس
   ========================================================= */

async function updateWeatherSystem() {
    const lat = "31.5326";
    const lon = "35.0998";
    const apiKey = "95213cb0c3d0aeb490b82a58075a8999";

    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}&lang=ar`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}&lang=ar`;

    try {
        const resCurr = await fetch(currentUrl);
        const dataCurr = await resCurr.json();

        if (Number(dataCurr.cod) === 200) {
            const temp = Math.round(dataCurr.main.temp);
            const wTemp = document.getElementById("w-temp");
            const wDesc = document.getElementById("w-desc");
            const wWind = document.getElementById("w-wind");
            const wHum = document.getElementById("w-hum");
            const wDate = document.getElementById("w-date");
            const weatherStatus = document.getElementById("weather-status");

            if (wTemp) wTemp.innerText = `${temp}°C`;
            if (wDesc) wDesc.innerText = dataCurr.weather?.[0]?.description || "";
            if (wWind) wWind.innerText = `${dataCurr.wind?.speed ?? 0} م/ث`;
            if (wHum) wHum.innerText = `${dataCurr.main?.humidity ?? 0}%`;
            if (wDate) {
                const options = { weekday: "long", month: "long", day: "numeric" };
                wDate.innerText = new Date().toLocaleDateString("ar-EG", options);
            }

            if (weatherStatus) {
                weatherStatus.innerHTML = `<i class="fas fa-location-dot"></i> الخليل: ${temp}°C`;
            }
        }

        const resFore = await fetch(forecastUrl);
        const dataFore = await resFore.json();

        const wrapper = document.getElementById("hourly-wrapper");
        if (wrapper && Array.isArray(dataFore.list)) {
            wrapper.innerHTML = "";
            dataFore.list.slice(0, 16).forEach(hour => {
                const time = `${new Date(hour.dt * 1000).getHours()}:00`;
                const temp = Math.round(hour.main.temp);
                const icon = hour.weather?.[0]?.icon || "01d";

                wrapper.innerHTML += `
                    <div class="hourly-item">
                        <span class="h-time">${time}</span>
                        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather">
                        <span class="h-temp">${temp}°</span>
                    </div>
                `;
            });
        }
    } catch (e) {
        console.error("Omar System Error - Weather API:", e);
        const wDesc = document.getElementById("w-desc");
        if (wDesc) wDesc.innerText = "تعذر تحديث الطقس الآن";
    }
}

/* =========================================================
   [11] المحرك التكتيكي
   ========================================================= */

class FutsalTacticalEngine {
    constructor() {
        this.pitch = document.getElementById("tactical-futsal-pitch");
        this.wrapper = document.getElementById("tactical-pitch-wrapper");
        this.viewToggle = document.getElementById("tactical-view-toggle");
        this.coordBox = document.getElementById("live-coord");
        this.coordLabel = document.getElementById("coord-label");

        this.draggedElement = null;
        this.dragPointerId = null;
        this.selectedPlayer = null;
        this.is3D = true;
        this.activeMenu = null;
        this.teamSwitchMenu = null;
        this.captainByTeam = { home: null, away: null};

        if (this.pitch) this.init();
    }

    init() {
        this.setupPlayers();
        this.buildTeamSwitchButton();
        this.bindEvents();
    }

    getPlayerStorageKey(id, field) {
        return `player-${field}-${id}`;
    }

    getSavedPlayerState(id) {
        return {
            name: localStorage.getItem(this.getPlayerStorageKey(id, "name")) || "",
            role: localStorage.getItem(this.getPlayerStorageKey(id, "role")) || "",
            instr: localStorage.getItem(this.getPlayerStorageKey(id, "instr")) || "",
            captain: localStorage.getItem(this.getPlayerStorageKey(id, "captain")) === "1",
            team: localStorage.getItem(this.getPlayerStorageKey(id, "team")) || ""
        };
    }

    savePlayerState(id, data = {}) {
        if ("name" in data) localStorage.setItem(this.getPlayerStorageKey(id, "name"), data.name || "");
        if ("role" in data) localStorage.setItem(this.getPlayerStorageKey(id, "role"), data.role || "");
        if ("instr" in data) localStorage.setItem(this.getPlayerStorageKey(id, "instr"), data.instr || "");
        if ("captain" in data) localStorage.setItem(this.getPlayerStorageKey(id, "captain"), data.captain ? "1" : "0");
        if ("team" in data) localStorage.setItem(this.getPlayerStorageKey(id, "team"), data.team || "");
    }

    clearPlayerState(id) {
        localStorage.removeItem(this.getPlayerStorageKey(id, "name"));
        localStorage.removeItem(this.getPlayerStorageKey(id, "role"));
        localStorage.removeItem(this.getPlayerStorageKey(id, "instr"));
        localStorage.removeItem(this.getPlayerStorageKey(id, "captain"));
        localStorage.removeItem(this.getPlayerStorageKey(id, "team"));
    }

    getTeamClass(team) {
        if (team === "home") return "team-red";
        if (team === "away") return "team-blue";
    }

    getPlayerNumber(playerId) {
        const match = String(playerId).match(/\d+/);
        if (!match) return 1;
        return clamp(parseInt(match[0], 10), 1, 5);
    }

    getDefaultPositionForTeam(team, playerId) {
        const index = this.getPlayerNumber(playerId) - 1;

        const home = [
            { x: 8, y: 50 },
            { x: 25, y: 25 },
            { x: 25, y: 75 },
            { x: 40, y: 30 },
            { x: 45, y: 70 }
        ];

        const away = [
            { x: 92, y: 50 },
            { x: 75, y: 25 },
            { x: 75, y: 75 },
            { x: 60, y: 30 },
            { x: 55, y: 70 }
        ];

        if (team === "home") return home[index] || home[0];
        if (team === "away") return away[index] || away[0];
    }

    applyTeamVisual(playerNode, team) {
        playerNode.classList.remove("team-red", "team-blue");
        playerNode.classList.add(this.getTeamClass(team));

    }

    setupPlayers() {
        const teamA = [
            { id: "R1", name: "محمد علي", x: 8, y: 50, color: "team-red", team: "home" },
            { id: "R2", name: "مؤيد", x: 25, y: 25, color: "team-red", team: "home" },
            { id: "R3", name: "هاني", x: 25, y: 75, color: "team-red", team: "home" },
            { id: "R4", name: "عمر", x: 40, y: 30, color: "team-red", team: "home" },
            { id: "R5", name: "يوسف", x: 45, y: 70, color: "team-red", team: "home" }
        ];

        const teamB = [
            { id: "B1", name: "محمد", x: 92, y: 50, color: "team-blue", team: "away" },
            { id: "B2", name: "سنقرط", x: 75, y: 25, color: "team-blue", team: "away" },
            { id: "B3", name: "احمد", x: 75, y: 75, color: "team-blue", team: "away" },
            { id: "B4", name: "كريم", x: 60, y: 30, color: "team-blue", team: "away" },
            { id: "B5", name: "خضر", x: 55, y: 70, color: "team-blue", team: "away" }
        ];

        [...teamA, ...teamB].forEach(p => this.createPlayer(p));
    }

    createPlayer(config) {
        const saved = this.getSavedPlayerState(config.id);

        if (saved.name) config.name = saved.name;
        if (saved.team) config.team = saved.team;

        const node = document.createElement("div");
        node.className = `player-node player-token ${this.getTeamClass(config.team)}`;
        node.id = config.id;
        node.dataset.team = config.team;
        node.dataset.playerId = config.id;
        node.dataset.name = config.name;
        node.dataset.defaultName = config.name;
        node.style.left = `${config.x}%`;
        node.style.top = `${config.y}%`;

        node.innerHTML = `
            <div class="team-role-top-right" id="team-role-${config.id}" style="display:none;"></div>
            <div class="instruction-top-left" id="instr-${config.id}" style="display:none;"></div>
            <div class="player-name-center" id="name-${config.id}">${safeText(config.name)}</div>
            <div class="role-badge-bottom" id="role-${config.id}">--</div>
            <div class="captain-badge" id="captain-${config.id}" style="display:none;">C</div>
        `;

        node.addEventListener("dblclick", (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showAdvancedMenu(e.clientX, e.clientY, node);
        });

        node.addEventListener("pointerdown", (e) => this.onStart(e, node));

        this.pitch.appendChild(node);

        this.applySavedState(node);
        this.applyTeamVisual(node, node.dataset.team);
        this.updateTacticalRole(node, config.x, config.y);
    }

    applySavedState(playerNode) {
        const playerId = playerNode.id;
        const saved = this.getSavedPlayerState(playerId);

        const nameEl = playerNode.querySelector(`#name-${playerId}`);
        const roleEl = playerNode.querySelector(`#team-role-${playerId}`);
        const instrEl = playerNode.querySelector(`#instr-${playerId}`);
        const captainEl = playerNode.querySelector(`#captain-${playerId}`);

        if (saved.team) {
            playerNode.dataset.team = saved.team;
            this.applyTeamVisual(playerNode, saved.team);
        }

        if (saved.name && nameEl) {
            nameEl.textContent = saved.name;
            playerNode.dataset.name = saved.name;
        }

        if (saved.role && roleEl) {
            roleEl.textContent = saved.role;
            roleEl.style.display = "block";
        }

        if (saved.instr && instrEl) {
            instrEl.textContent = saved.instr;
            instrEl.style.display = "block";
        }

        if (saved.captain && captainEl) {
            captainEl.style.display = "flex";
            if (playerNode.dataset.team === "home" || playerNode.dataset.team === "away") {
                this.captainByTeam[playerNode.dataset.team] = playerId;
            }
        } else if (captainEl) {
            captainEl.style.display = "none";
        }
    }

    buildTeamSwitchButton() {
        if (!this.wrapper || document.getElementById("team-switch-fab")) return;

        const btn = document.createElement("button");
        btn.id = "team-switch-fab";
        btn.type = "button";

        btn.addEventListener("click", () => {
            if (!this.selectedPlayer) {
                alert("حدّد لاعباً أولاً.");
                return;
            }
            const rect = btn.getBoundingClientRect();
            this.openTeamSwitchMenu(this.selectedPlayer, rect.right, rect.bottom);
        });

        this.wrapper.style.position = this.wrapper.style.position || "relative";
        this.wrapper.appendChild(btn);
    }

    openTeamSwitchMenu(playerNode, x, y) {
        this.closeTeamSwitchMenu();

        const playerId = playerNode.id;
        const menu = document.createElement("div");
        menu.id = "team-switch-menu";
        menu.style.position = "fixed";
        menu.style.zIndex = "100001";
        menu.style.minWidth = "230px";
        menu.style.padding = "12px";
        menu.style.borderRadius = "16px";
        menu.style.background = "rgba(8,12,22,.96)";
        menu.style.border = "1px solid rgba(255,255,255,.12)";
        menu.style.boxShadow = "0 18px 45px rgba(0,0,0,.45)";
        menu.style.color = "#fff";
        menu.style.backdropFilter = "blur(14px)";

        menu.innerHTML = `
            <div style="font-weight:800; margin-bottom:10px; color:#ffd86a;">نقل اللاعب: ${safeText(playerId)}</div>
            <button type="button" data-team="home" style="width:100%; margin-bottom:8px;">إلى النخبة</button>
            <button type="button" data-team="away" style="width:100%; margin-bottom:8px;">إلى التحدي</button>
        `;

        menu.querySelectorAll("button").forEach(btn => {
            btn.style.cssText += `
                display:block;
                width:100%;
                padding:10px 12px;
                border:0;
                border-radius:12px;
                cursor:pointer;
                background: rgba(255,255,255,.08);
                color:#fff;
                font-weight:700;
                transition: background .16s ease, transform .16s ease;
            `;
            btn.addEventListener("mouseenter", () => btn.style.background = "rgba(255,255,255,.14)");
            btn.addEventListener("mouseleave", () => btn.style.background = "rgba(255,255,255,.08)");
            btn.addEventListener("click", () => {
                this.movePlayerToTeam(playerNode, btn.dataset.team);
                this.closeTeamSwitchMenu();
            });
        });

        document.body.appendChild(menu);
        this.teamSwitchMenu = menu;
        this.clampMenuPosition(x + 8, y + 8, menu);

        setTimeout(() => {
            const onBodyClick = (ev) => {
                if (!menu.contains(ev.target) && ev.target.id !== "team-switch-fab") {
                    this.closeTeamSwitchMenu();
                    document.body.removeEventListener("click", onBodyClick);
                }
            };
            document.body.addEventListener("click", onBodyClick);
        }, 0);
    }

    closeTeamSwitchMenu() {
        if (this.teamSwitchMenu) {
            this.teamSwitchMenu.remove();
            this.teamSwitchMenu = null;
        }
    }

    movePlayerToTeam(playerNode, newTeam) {
        const playerId = playerNode.id;
        const oldTeam = playerNode.dataset.team;
        if (oldTeam === newTeam) return;

        const oldWasCaptain = this.captainByTeam[oldTeam] === playerId;
        const savedBeforeMove = this.getSavedPlayerState(playerId);
        const target = this.getDefaultPositionForTeam(newTeam, playerId);

        if ((newTeam === "home" || newTeam === "away") && this.captainByTeam[newTeam] && this.captainByTeam[newTeam] !== playerId) {
            alert("هذا الفريق يملك كابتن بالفعل. انقل الكابتن الحالي أولاً.");
            return;
        }

        if (oldWasCaptain) {
            this.captainByTeam[oldTeam] = null;
            this.savePlayerState(playerId, { captain: false });
            const oldCaptainBadge = playerNode.querySelector(`#captain-${playerId}`);
            if (oldCaptainBadge) oldCaptainBadge.style.display = "none";
        }

        playerNode.dataset.team = newTeam;
        this.applyTeamVisual(playerNode, newTeam);
        this.savePlayerState(playerId, { team: newTeam });

        playerNode.style.transition = "left 420ms cubic-bezier(.2,.9,.2,1), top 420ms cubic-bezier(.2,.9,.2,1), transform 220ms ease, filter 220ms ease";
        playerNode.style.left = `${target.x}%`;
        playerNode.style.top = `${target.y}%`;

        playerNode.classList.remove("switch-pop");
        void playerNode.offsetWidth;
        playerNode.classList.add("switch-pop");

        if ((newTeam === "home" || newTeam === "away") && savedBeforeMove.captain) {
            this.captainByTeam[newTeam] = playerId;
            const captainBadge = playerNode.querySelector(`#captain-${playerId}`);
            if (captainBadge) captainBadge.style.display = "flex";
            this.savePlayerState(playerId, { captain: true });
        }

        this.updateTacticalRole(playerNode, target.x, target.y);
        pulseElement(playerNode, 1.03, 260);

        setTimeout(() => {
            playerNode.style.transition = "";
        }, 500);
    }

    clampMenuPosition(x, y, menu) {
        const padding = 12;
        const menuWidth = menu.offsetWidth || 320;
        const menuHeight = menu.offsetHeight || 420;

        const maxX = window.innerWidth - menuWidth - padding;
        const maxY = window.innerHeight - menuHeight - padding;

        menu.style.left = `${Math.max(padding, Math.min(x, maxX))}px`;
        menu.style.top = `${Math.max(padding, Math.min(y, maxY))}px`;
    }

    closeAdvancedMenu() {
        if (this.activeMenu) {
            this.activeMenu.remove();
            this.activeMenu = null;
        }
    }

    showAdvancedMenu(x, y, playerNode) {
        this.closeAdvancedMenu();

        const playerId = playerNode.id;
        const teamKey = playerNode.dataset.team;

        const nameEl = playerNode.querySelector(`#name-${playerId}`);
        const teamRoleEl = playerNode.querySelector(`#team-role-${playerId}`);
        const instrEl = playerNode.querySelector(`#instr-${playerId}`);
        const captainBadgeEl = playerNode.querySelector(`#captain-${playerId}`);

        const currentName = nameEl ? nameEl.textContent : "";
        const currentRole = teamRoleEl && teamRoleEl.textContent ? teamRoleEl.textContent : "";
        const currentInstr = instrEl && instrEl.textContent ? instrEl.textContent : "";

        const menu = document.createElement("div");
        menu.id = "tactical-advanced-menu";
        menu.className = "tactical-advanced-menu";
        menu.style.position = "fixed";
        menu.style.zIndex = "99999";
        menu.style.maxWidth = "340px";
        menu.style.width = "min(340px, calc(100vw - 24px))";
        menu.style.backdropFilter = "blur(16px)";
        menu.style.background = "rgba(8, 12, 22, 0.96)";
        menu.style.border = "1px solid rgba(255,255,255,0.12)";
        menu.style.borderRadius = "18px";
        menu.style.boxShadow = "0 20px 60px rgba(0,0,0,.45)";
        menu.style.padding = "14px";
        menu.style.color = "#fff";

        menu.innerHTML = `
            <div class="tam-header" style="font-weight:800; margin-bottom:12px; color:#ffd86a; font-size:1rem;">
                إعدادات ${teamKey === "home" ? "النخبة" : teamKey === "away" ? "التحدي" : "الاحتياط"} - ${safeText(playerId)}
            </div>

            <div class="tam-group" style="margin-bottom:10px;">
                <label style="display:block; margin-bottom:6px; font-size:.9rem; opacity:.9;">اسم اللاعب:</label>
                <input
                    id="tam-player-name"
                    type="text"
                    value="${safeText(currentName)}"
                    placeholder="اكتب الاسم الجديد"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:10px 12px;
                        border-radius:12px;
                        border:1px solid rgba(255,255,255,0.14);
                        background:rgba(255,255,255,0.06);
                        color:#fff;
                        outline:none;
                        font-size:.95rem;
                    "
                />
            </div>

            <div class="tam-group" style="margin-bottom:10px;">
                <label style="display:block; margin-bottom:6px; font-size:.9rem; opacity:.9;">دور اللاعب في الفريق:</label>
                <select id="tam-team-role" style="
                    width:100%;
                    box-sizing:border-box;
                    padding:10px 12px;
                    border-radius:12px;
                    border:1px solid rgba(255,255,255,0.14);
                    background:rgba(255,255,255,0.06);
                    color:#fff;
                    outline:none;
                    font-size:.95rem;
                ">
                    <option value="">بدون دور محدد</option>
                    <option value="كابتن" ${currentRole === "كابتن" ? "selected" : ""}>كابتن</option>
                    <option value="قائد الدفاع" ${currentRole === "قائد الدفاع" ? "selected" : ""}>قائد الدفاع</option>
                    <option value="قائد الهجوم" ${currentRole === "قائد الهجوم" ? "selected" : ""}>قائد الهجوم</option>
                    <option value="منفذ الركلات الثابتة" ${currentRole === "منفذ الركلات الثابتة" ? "selected" : ""}>منفذ الركلات الثابتة</option>
                    <option value="منفذ ركلات الجزاء" ${currentRole === "منفذ ركلات الجزاء" ? "selected" : ""}>منفذ ركلات الجزاء</option>
                    <option value="لاعب حر" ${currentRole === "لاعب حر" ? "selected" : ""}>لاعب حر</option>
                    <option value="صانع ألعاب رئيسي" ${currentRole === "صانع ألعاب رئيسي" ? "selected" : ""}>صانع ألعاب رئيسي</option>
                </select>
            </div>

            <div class="tam-group" style="margin-bottom:12px;">
                <label style="display:block; margin-bottom:6px; font-size:.9rem; opacity:.9;">تعليمات تكتيكية خاصة:</label>
                <select id="tam-instr" style="
                    width:100%;
                    box-sizing:border-box;
                    padding:10px 12px;
                    border-radius:12px;
                    border:1px solid rgba(255,255,255,0.14);
                    background:rgba(255,255,255,0.06);
                    color:#fff;
                    outline:none;
                    font-size:.95rem;
                ">
                    <option value="">بدون تعليمات</option>
                    <option value="يضغط للأمام" ${currentInstr === "يضغط للأمام" ? "selected" : ""}>يضغط للأمام</option>
                    <option value="يغطي الظهير" ${currentInstr === "يغطي الظهير" ? "selected" : ""}>يغطي الظهير</option>
                    <option value="يسقط للخلف" ${currentInstr === "يسقط للخلف" ? "selected" : ""}>يسقط للخلف</option>
                    <option value="يثبت في العمق" ${currentInstr === "يثبت في العمق" ? "selected" : ""}>يثبت في العمق</option>
                    <option value="يتحرك بين الخطوط" ${currentInstr === "يتحرك بين الخطوط" ? "selected" : ""}>يتحرك بين الخطوط</option>
                    <option value="يفتح على الخط" ${currentInstr === "يفتح على الخط" ? "selected" : ""}>يفتح على الخط</option>
                    <option value="يدخل للعمق" ${currentInstr === "يدخل للعمق" ? "selected" : ""}>يدخل للعمق</option>
                </select>
            </div>

            <div class="tam-actions" style="display:flex; gap:8px; flex-wrap:wrap;">
                <button type="button" class="tam-btn tam-save" style="flex:1; min-width:72px;">حفظ</button>
                <button type="button" class="tam-btn tam-clear" style="flex:1; min-width:72px;">مسح</button>
                <button type="button" class="tam-btn tam-close" style="flex:1; min-width:72px;">إغلاق</button>
            </div>
        `;

        document.body.appendChild(menu);
        this.activeMenu = menu;
        this.clampMenuPosition(x + 10, y + 10, menu);

        const saveBtn = menu.querySelector(".tam-save");
        const clearBtn = menu.querySelector(".tam-clear");
        const closeBtn = menu.querySelector(".tam-close");
        const switchBtn = menu.querySelector(".tam-switch-team");
        const nameInput = menu.querySelector("#tam-player-name");
        const roleInput = menu.querySelector("#tam-team-role");
        const instrInput = menu.querySelector("#tam-instr");

        const updateCaptainState = (newRole) => {

            if (newRole === "كابتن") {
                const currentCaptainId = this.captainByTeam[teamKey];
                if (currentCaptainId && currentCaptainId !== playerId) return false;
                this.captainByTeam[teamKey] = playerId;
                if (captainBadgeEl) captainBadgeEl.style.display = "flex";
                this.savePlayerState(playerId, { captain: true });
            } else {
                if (this.captainByTeam[teamKey] === playerId) this.captainByTeam[teamKey] = null;
                if (captainBadgeEl) captainBadgeEl.style.display = "none";
                this.savePlayerState(playerId, { captain: false });
            }

            return true;
        };

        saveBtn.addEventListener("click", () => {
            const newName = nameInput ? nameInput.value.trim() : "";
            const roleText = roleInput ? roleInput.value.trim() : "";
            const instrText = instrInput ? instrInput.value.trim() : "";

            if (newName && nameEl) {
                nameEl.textContent = newName;
                playerNode.dataset.name = newName;
                this.savePlayerState(playerId, { name: newName });
            }

            const captainOk = updateCaptainState(roleText);
            if (!captainOk) {
                roleInput.value = teamRoleEl && teamRoleEl.textContent ? teamRoleEl.textContent : "";
                return;
            }

            if (teamRoleEl) {
                if (roleText) {
                    teamRoleEl.textContent = roleText;
                    teamRoleEl.style.display = "block";
                } else {
                    teamRoleEl.textContent = "";
                    teamRoleEl.style.display = "none";
                }
            }

            if (instrEl) {
                if (instrText) {
                    instrEl.textContent = instrText;
                    instrEl.style.display = "block";
                } else {
                    instrEl.textContent = "";
                    instrEl.style.display = "none";
                }
            }

            this.savePlayerState(playerId, { role: roleText, instr: instrText });
            this.closeAdvancedMenu();
            pulseElement(playerNode, 1.03, 250);
        });

        switchBtn.addEventListener("click", () => {
            this.closeAdvancedMenu();
            this.openTeamSwitchMenu(playerNode, x + 12, y + 12);
        });

        clearBtn.addEventListener("click", () => {
            const wasCaptain = this.captainByTeam[teamKey] === playerId;

            if (nameEl) {
                const defaultName = playerNode.dataset.defaultName || playerId;
                nameEl.textContent = defaultName;
                playerNode.dataset.name = defaultName;
                this.savePlayerState(playerId, { name: "" });
            }

            if (teamRoleEl) {
                teamRoleEl.textContent = "";
                teamRoleEl.style.display = "none";
            }

            if (instrEl) {
                instrEl.textContent = "";
                instrEl.style.display = "none";
            }

            if (captainBadgeEl) captainBadgeEl.style.display = "none";
            if (wasCaptain) this.captainByTeam[teamKey] = null;

            this.savePlayerState(playerId, {
                role: "",
                instr: "",
                captain: false
            });

            if (roleInput) roleInput.value = "";
            if (instrInput) instrInput.value = "";
            if (nameInput) nameInput.value = playerNode.dataset.defaultName || playerId;
        });

        closeBtn.addEventListener("click", () => this.closeAdvancedMenu());

        setTimeout(() => {
            const onBodyClick = (ev) => {
                if (!menu.contains(ev.target) && !playerNode.contains(ev.target) && ev.target.id !== "team-switch-fab") {
                    this.closeAdvancedMenu();
                    document.body.removeEventListener("click", onBodyClick);
                }
            };
            document.body.addEventListener("click", onBodyClick);
        }, 0);
    }

    bindEvents() {
        window.addEventListener("pointermove", (e) => this.onMove(e));
        window.addEventListener("pointerup", () => this.onEnd());

        if (this.viewToggle) {
            this.viewToggle.addEventListener("click", () => {
                this.is3D = !this.is3D;
                this.pitch.classList.toggle("is-2d", !this.is3D);
            });
        }
    }

    onStart(e, el) {
        if (e.button !== 0) return;

        e.preventDefault();
        this.draggedElement = el;
        this.selectedPlayer = el;
        this.dragPointerId = e.pointerId;

        try {
            el.setPointerCapture(e.pointerId);
        } catch (_) {}

        el.classList.add("is-dragging");
        el.style.zIndex = "10000";
        el.style.transition = "none";
        el.style.transform = "translate(-50%, -50%) scale(1.12)";

        if (this.coordBox) this.coordBox.style.display = "block";
    }

    onMove(e) {
        if (!this.draggedElement) return;

        const rect = this.pitch.getBoundingClientRect();
        let x = ((e.clientX - rect.left) / rect.width) * 100;
        let y = ((e.clientY - rect.top) / rect.height) * 100;

        x = clamp(x, 2, 98);
        y = clamp(y, 4, 96);

        this.draggedElement.style.left = `${x}%`;
        this.draggedElement.style.top = `${y}%`;
        this.draggedElement.style.transform = "translate(-50%, -50%) scale(1.12)";

        this.updateTacticalRole(this.draggedElement, x, y);
    }

    animateDropReturn(el) {
        try {
            el.animate([
                { transform: "translate(-50%, -50%) scale(1.12) translateY(0px)" },
                { transform: "translate(-50%, -50%) scale(.96) translateY(-18px)" },
                { transform: "translate(-50%, -50%) scale(1.03) translateY(10px)" },
                { transform: "translate(-50%, -50%) scale(1) translateY(0px)" }
            ], {
                duration: 620,
                easing: "cubic-bezier(.2,.95,.2,1)",
                fill: "forwards"
            });
        } catch (_) {}
    }

    onEnd() {
        if (!this.draggedElement) {
            if (this.coordBox) this.coordBox.style.display = "none";
            return;
        }

        const el = this.draggedElement;
        el.classList.remove("is-dragging");
        el.style.zIndex = "";
        el.style.transition = "none";

        this.animateDropReturn(el);

        setTimeout(() => {
            el.style.transition = "";
            el.style.transform = "translate(-50%, -50%) scale(1)";
        }, 650);

        try {
            if (this.dragPointerId !== null) {
                el.releasePointerCapture(this.dragPointerId);
            }
        } catch (_) {}

        this.draggedElement = null;
        this.dragPointerId = null;

        if (this.coordBox) this.coordBox.style.display = "none";
    }

    updateTacticalRole(el, x, y) {
        const team = el.dataset.team;
        const badge = el.querySelector(".role-badge-bottom");


        let role = "";

        const depthFromOwnGoal = team === "home" ? x : (100 - x);
        const laneY = y;

        const inGKZone = depthFromOwnGoal < 8;
        const inDefZone = depthFromOwnGoal >= 8 && depthFromOwnGoal < 28;
        const inCDMZone = depthFromOwnGoal >= 28 && depthFromOwnGoal < 40;
        const inCMZone = depthFromOwnGoal >= 40 && depthFromOwnGoal < 65;
        const inCAMZone = depthFromOwnGoal >= 65 && depthFromOwnGoal < 80;
        const inSTZone = depthFromOwnGoal >= 80;

        const farLeft = laneY < 22;
        const farRight = laneY > 78;

        if (inGKZone && laneY > 30 && laneY < 70) {
            role = "GK";
        } else if (inDefZone) {
            if (farLeft) role = "LB";
            else if (farRight) role = "RB";
            else role = "CB";
        } else if (inCDMZone) {
            role = "CDM";
        } else if (inCMZone) {
            if (farLeft) role = "LM";
            else if (farRight) role = "RM";
            else role = "CM";
        } else if (inCAMZone) {
            if (farLeft) role = "LW";
            else if (farRight) role = "RW";
            else role = "CAM";
        } else if (inSTZone) {
            if (farLeft) role = "LW";
            else if (farRight) role = "RW";
            else role = "ST";
        }

        if (!role) role = "CM";

        if (badge && badge.innerText !== role) {
            badge.innerText = role;
            badge.classList.add("role-glow");
            setTimeout(() => badge.classList.remove("role-glow"), 600);
        }

        const arabicRoleMap = {
            GK: "حارس",
            CB: "قلب دفاع",
            RB: "ظهير أيمن",
            LB: "ظهير أيسر",
            CDM: "محور دفاعي",
            CM: "وسط مركزي",
            CAM: "صانع ألعاب",
            LM: "وسط أيسر",
            RM: "وسط أيمن",
            LW: "جناح أيسر",
            RW: "جناح أيمن",
            ST: "مهاجم"
        };

        const arabicRole = arabicRoleMap[role] || role;
        if (this.coordLabel) {
            this.coordLabel.innerText = `المركز: ${arabicRole} (${Math.round(x)}%, ${Math.round(y)}%)`;
        }
    }
}

/* =========================================================
   [12] التشكيلات والمكتبة
   ========================================================= */

function openTacticsLibrary() {
    const modal = document.getElementById("library-modal");
    const grid = document.getElementById("tacticGrid");

    if (!modal || !grid) return;

    grid.innerHTML = futsalTactics.map(t => `
        <div class="tactic-card" onclick="prepareTactic('${t.id}')">
            <div style="font-size: 2.5rem; margin-bottom:10px;">${t.icon}</div>
            <strong style="color:#ffcc00; font-size:1.1rem; display:block;">${safeText(t.name)}</strong>
        </div>
    `).join("");

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeLibrary() {
    const modal = document.getElementById("library-modal");
    if (modal) modal.style.display = "none";
    document.body.style.overflow = "";
}

function prepareTactic(id) {
    activeSelectedTactic = futsalTactics.find(t => t.id === id);

    const insText = document.getElementById("instruction-text");
    const insBox = document.getElementById("tactic-instructions");

    if (activeSelectedTactic && insText && insBox) {
        insText.innerText = activeSelectedTactic.ins;
        insBox.style.display = "block";
    }

    setTimeout(() => {
        closeLibrary();
        const teamSelector = document.getElementById("team-selector-modal");
        if (teamSelector) teamSelector.style.display = "flex";
        document.body.style.overflow = "hidden";
    }, 900);
}

function closeTeamSelector() {
    const modal = document.getElementById("team-selector-modal");
    if (modal) modal.style.display = "none";
    document.body.style.overflow = "";
}

function applyTacticToTeam(teamTag) {
    if (!activeSelectedTactic) return;

    const prefix = teamTag === "A" ? "R" : "B";
    const isAway = teamTag === "B";

    for (let i = 1; i <= 5; i++) {
        const player = document.getElementById(`${prefix}${i}`);
        if (!player) continue;

        const posData = activeSelectedTactic.pos[`p${i}`];
        if (!posData) continue;

        const finalTop = posData.t;
        const finalLeft = isAway ? (100 - posData.l) : posData.l;

        player.style.transition = "left 0.9s cubic-bezier(0.22, 1, 0.36, 1), top 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.35s ease";
        player.style.left = `${finalLeft}%`;
        player.style.top = `${finalTop}%`;

        pulseElement(player, 1.06, 280);

        setTimeout(() => {
            player.style.transition = "";
            player.style.transform = "translate(-50%, -50%) scale(1)";
        }, 1000);
    }

    closeTeamSelector();
    showNotification("radar", `تم تطبيق التكتيك على فريق ${teamTag} بنجاح! ⚽`, {
        icon: "fa-futbol"
    });
}

function takeScreenshot() {
    const wrapper = document.getElementById("tactical-pitch-wrapper");
    const btn = document.querySelector(".screenshot-btn");
    if (!wrapper) return;

    const originalText = btn ? btn.innerHTML : "";
    if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';

    html2canvas(wrapper, {
        backgroundColor: "#14532d",
        useCORS: true,
        scale: 2
    }).then(canvas => {
        const link = document.createElement("a");
        const ts = new Date();
        link.download = `Taamen2026-Tactics-${ts.getTime()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        if (btn) {
            btn.innerHTML = '<i class="fas fa-check"></i> تم الحفظ!';
            setTimeout(() => { btn.innerHTML = originalText; }, 1800);
        }
    }).catch(err => {
        console.error("Screenshot error:", err);
        if (btn) btn.innerHTML = '<i class="fas fa-times"></i> خطأ بالحفظ';
    });
}

/* =========================================================
   [13] وظائف إضافية
   ========================================================= */

function format12Hour(hours) {
    const ampm = hours >= 12 ? "مساءً" : "صباحاً";
    let h = hours % 12;
    h = h ? h : 12;
    return { hours: h, ampm };
}

function updateHeaderClock() {
    const clockEl = document.getElementById("header-clock");
    if (!clockEl) return;

    const now = new Date();
    const timeInfo = format12Hour(now.getHours());
    const mins = String(now.getMinutes()).padStart(2, "0");
    const secs = String(now.getSeconds()).padStart(2, "0");

    clockEl.innerText = `${timeInfo.hours}:${mins}:${secs} ${timeInfo.ampm}`;
}

function initHeaderScrollEffect() {
    window.addEventListener("scroll", () => {
        const header = document.getElementById("topHeader");
        if (!header) return;
        header.classList.toggle("scrolled", window.scrollY > 50);
    });
}

function initKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeAllOverlays();
        }
    });
}

function initAppPageFromStorage() {
    const savedPage = localStorage.getItem("taamen-last-page") || location.hash.replace("#", "") || "home";
    navigate(savedPage, null, false);
}

/* =========================================================
   [14] التشغيل
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    console.log("%c TAAMEN 2026 PLATINUM SYSTEM ONLINE ", "background:#ffd700;color:#000;font-weight:bold;font-size:14px;");

    applyDynamicTheme();
    setupScrollReveal();
    initCursorEffects();
    initShootingStars();
    initTilt();
    initMenuOutsideClick();
    initHeaderScrollEffect();
    initKeyboardShortcuts();

    tacticalEngine = new FutsalTacticalEngine();

    renderStats();
    renderMatches();
    updateHomeStats();
    updateHeaderClock();
    updateBookingTimer();

    initPrayersSystem();
    updateWeatherSystem();

    rotateDhikr();
    setInterval(rotateDhikr, 9000);

    setInterval(updateHeaderClock, 1000);
    setInterval(updateBookingTimer, 1000);
    setInterval(updateWeatherSystem, 20 * 60 * 1000);

    initAppPageFromStorage();
});

/**
 * ============================================================================
 * 🏆 تأمين 2026 | الإصدار الرمضاني البلاتيني (GDMi)
 * 👨‍💻 المطور: عمر (Omar System)
 * ⚙️ الوصف: محرك المنصة الرئيسي (التكتيكات، الطقس، المواقيت، الأرشيف، الإحصائيات)
 * 🛠️ التحديث الأخير: تمت إزالة شريط التنقل السفلي والاعتماد على הـ Header العلوي فقط
 * ============================================================================
 */

function safeText(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function debounce(fn, delay = 120) {
    let t = null;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function pulseElement(el, scale = 1.04, duration = 220) {
    if (!el) return;
    try {
        el.animate([
            { transform: 'scale(1)' },
            { transform: `scale(${scale})` },
            { transform: 'scale(1)' }
        ], {
            duration,
            easing: 'ease-out'
        });
    } catch (_) {}
}

function showTransientState(el, text, className = '') {
    if (!el) return;
    const original = el.innerHTML;
    el.innerHTML = text;
    if (className) el.classList.add(className);
    setTimeout(() => {
        el.innerHTML = original;
        if (className) el.classList.remove(className);
    }, 1600);
}
// ==========================================
// [1] قاعدة بيانات الإشعارات (NOTIFICATIONS DATABASE)
// ==========================================
const systemMessages = {
    'home': [
        "أهلاً بعودتك أيها البطل! 🏆",
        "هل أنت مستعد للمجد اليوم؟ 🔥",
        "انت مجدداً؟",
        "الملعب يشتاق لأقدام الأبطال ⚽",
        "ركّز على هدفك، النصر قادم ✨",
        "تأمين 2026: حيث تولد الأساطير ⚔️"
    ],
    'cannon': [
        "لا تنسى صلاتك!",
        "تقبل الله منا ومنكم صالح الأعمال 🤲",
        "الوقت يمضي.. استغله في الطاعات ⏳",
        "لا تنس الدعاء لي ولك 🌙",
        "قيام الليل هو أجمل لحظات اليوم ❤️",
        "مواقيت الخليل دقيقة عبر الأقمار الصناعية 🛰️"
    ],
    'radar': [
        "الأرقام لا تكذب أبداً 📊",
        "ادرس خصمك جيداً قبل المباراة 🧐",
        "التمركز الصحيح هو مفتاح الفوز 🔑",
        "هل أنت ضمن تشكيلة النخبة؟ ⭐",
        "حلل أداءك لترتفع بمستواك 📈",
        "استخدم وضع التكتيكات لتطوير لعبك 🛡️"
    ],
    'matches': [
        "التاريخ يكتبه المنتصرون 📜",
        "تعلم من الهزيمة لتصنع النصر 🛡️",
        "سجلات المجد خالدة هنا 💎",
        "راجع نتائجك وحسن أخطاءك 🔄",
        "مباريات لا تنسى في الذاكرة 🧠"
    ],
    'weather': [
        "الجو في ملعب الخليل مناسب جداً اليوم ☁️",
        "لا أعذار.. العب في كل الظروف 🌧️",
        "تحقق من الرياح لتضبط تسديداتك 💨",
        "احذر من البرد، وسخن جيداً 🔥",
        "السماء صافية والملعب جاهز ☀️"
    ],
    'elite': [
        "مرحباً بك في مجلس الكبار 👑",
        "استرح قليلاً وتناول القهوة ☕",
        "مجتمع النخبة يرحب بك 🤝",
        "تواصل معنا لأي اقتراحات 📩",
        "الراحة جزء من التدريب 🛋️"
    ]
};

// ==========================================
// [2] قاعدة بيانات الإحصائيات والأرشيف (DATABASE)
// ==========================================
const statsElite = [
    { name: "عمر", g: 8, a: 3, r: 9.9 },
    { name: "هاني", g: 5, a: 6, r: 9.7 },
    { name: "جعبري", g: 2, a: 4, r: 8.9 },
    { name: "عبد نيروخ", g: 1, a: 2, r: 8.8 },
    { name: "محمد ناصر الدين", g: 0, a: 1, r: 7.9 },
];

const statsChallenge = [
    { name: "كريم", g: 7, a: 2, r: 9.8 },
    { name: "يوسف", g: 4, a: 5, r: 9.5 },
    { name: "ابو عيشة", g: 1, a: 3, r: 8.7 },
    { name: "مؤيد", g: 1, a: 1, r: 8.1 },
    { name: "محمد زغير", g: 0, a: 2, r: 8.0 },
];

const statsbase = [
    { name: "خضر", g: 7, a: 2, r: 9.8 },
    { name: "محمد علي", g: 4, a: 5, r: 9.5 },
    { name: "مصطفى", g: 1, a: 3, r: 8.7 },
    { name: "عمرو", g: 1, a: 1, r: 8.1 },
    { name: "أرقم", g: 0, a: 2, r: 8.0 },
];


const matchHistoryArchive = [
  	                        {t1: "كريم", t2: "عمر", s: "6 - 9", st: "انتهت", d: "الجمعه 16 يناير"},
	                        {t1: "عمر", t2: "كريم", s: "7 - 10", st: "انتهت", d: "الجمعه 23 يناير"},
	                        {t1: "كريم التميمي", t2: "عمر & كريم", s: "8 - 7", st: "انتهت", d: "الجمعه 30 يناير"},
	                        {t1: "خضر", t2: "عمر & كريم", s: "4 - 5", st: "انتهت", d: "الجمعه 13 فبراير"},
	                        {t1: "كريم", t2: "عمر", s: "3 - 3", st: "انتهت", d: "الجمعه 20 فبراير"},      
	                        {t1: "عمر", t2: "كريم", s: "6 - 8", st: "انتهت", d: "الجمعه 27 فبراير"},
	                        {t1: "خضر", t2: "كريم", s: "13 - 7", st: "انتهت", d: "الجمعه 6 مارس"},
	                        {t1: "عمر", t2: "كريم", s: "5 - 7", st: "انتهت", d: " (ودية) الخميس 12 مارس"},
  	                        {t1: "عمر & كريم", t2: "كريم التميمي", s: "9 - 7", st: "انتهت", d: "الجمعه 13 مارس"},
                            {t1: "كريم", t2: "عمر & خضر", s: "4 - 7", st: "انتهت", d: "الجمعه 3 مارس"},
  	                        {t1: "عمر & كريم", t2: "خضر", s: "4 - 5", st: "انتهت", d: "الجمعه 3 مارس"},


];

const dhikrList = [
    "اللهم إنك عفو تحب العفو فاعف عنا",
    "سبحان الله وبحمده، عدد خلقه ورضا نفسه",
    "لا إله إلا الله وحده لا شريك له",
    "أستغفر الله العظيم وأتوب إليه",
    "اللهم صل وسلم على نبينا محمد",
    "اللهم آتنا في الدنيا حسنة وفي الآخرة حسنة"
];

// ==========================================
// [3] مكتبة التكتيكات الخماسية الجاهزة (TACTICS DATA)
// ==========================================
const futsalTactics = [
    { 
        id: 'diamond', name: 'الماسة (1-2-1)', icon: '💎', 
        ins: 'تكتيك متوازن، الجناحين يفتحوا الملعب، والمهاجم يسحب الدفاع للخلف.', 
        pos: {p1:{t:80, l:50}, p2:{t:50, l:20}, p3:{t:50, l:80}, p4:{t:25, l:50}, p5:{t:92, l:50}} 
    },
    { 
        id: 'square', name: 'المربع (2-2)', icon: '⬛', 
        ins: 'إغلاق العمق تماماً، الاعتماد على الهجمات المرتدة السريعة فور قطع الكرة.', 
        pos: {p1:{t:75, l:30}, p2:{t:75, l:70}, p3:{t:35, l:30}, p4:{t:35, l:70}, p5:{t:92, l:50}} 
    },
    { 
        id: 'pyramid', name: 'الهرم (2-1-1)', icon: '📐', 
        ins: 'لاعب الارتكاز هو المحرك الأساسي، كل الهجمات تبدأ من عنده.', 
        pos: {p1:{t:78, l:35}, p2:{t:78, l:65}, p3:{t:52, l:50}, p4:{t:22, l:50}, p5:{t:92, l:50}} 
    },
    { 
        id: 'y-form', name: 'هجوم Y', icon: '🚀', 
        ins: 'ضغط عالي رجل لرجل في مناطق الخصم لإجباره على ارتكاب الأخطاء.', 
        pos: {p1:{t:85, l:50}, p2:{t:45, l:25}, p3:{t:45, l:75}, p4:{t:18, l:50}, p5:{t:92, l:50}} 
    }
];

let activeSelectedTactic = null;

// ==========================================
// [4] نظام التوجيه والإشعارات (NAVIGATION & NOTIFICATIONS)
// ==========================================
function showNotification(pageId, customMessage = null, options = {}) {
    const containerId = 'notification-container';
    let container = document.getElementById(containerId);

    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        document.body.appendChild(container);
    }

    const messages = systemMessages[pageId] || ['مرحباً بك في تأمين 26'];
    const randomMsg = customMessage || messages[Math.floor(Math.random() * messages.length)];
    const icon = options.icon || 'fa-bolt-lightning';
    const duration = options.duration || 3600;

    const toast = document.createElement('div');
    toast.className = 'glass-toast fade-in-up';
    toast.innerHTML = `
        <i class="fas ${icon} toast-icon" style="color:#ffd700;"></i>
        <span>${safeText(randomMsg)}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 400);
    }, duration);
}
// دالة التنقل المصلحة
function navigate(pageId, element) {
    try {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
            page.style.display = 'none';
        });

        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            targetPage.style.display = 'block';
            targetPage.classList.add('fade-in-up');
            setTimeout(() => targetPage.classList.remove('fade-in-up'), 350);
        }

        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        if (element) element.classList.add('active');
    } catch (error) {
        console.error('Navigation Error:', error);
    }
}
// ==========================================
// [5] نظام الثيم الذكي (DAY / NIGHT THEME)
// ==========================================
function toggleTheme() {
    const body = document.body;
    const btnIcon = document.querySelector('#themeBtn i');

    const toDay = body.classList.contains('night-mode');

    body.classList.toggle('day-mode', toDay);
    body.classList.toggle('night-mode', !toDay);

    if (btnIcon) {
        btnIcon.classList.toggle('fa-sun', toDay);
        btnIcon.classList.toggle('fa-moon', !toDay);
    }

    localStorage.setItem('taamen-theme', toDay ? 'day' : 'night');
    showNotification('home', toDay ? 'تم تفعيل الوضع النهاري' : 'تم تفعيل الوضع الليلي', {
        icon: toDay ? 'fa-sun' : 'fa-moon'
    });
}

function applyDynamicTheme() {
    const savedTheme = localStorage.getItem('taamen-theme');
    const body = document.body;
    const btnIcon = document.querySelector('#themeBtn i');

    if (savedTheme === 'day') {
        body.classList.remove('night-mode');
        body.classList.add('day-mode');
        if (btnIcon) btnIcon.className = 'fas fa-sun';
        return;
    }

    if (savedTheme === 'night') {
        body.classList.remove('day-mode');
        body.classList.add('night-mode');
        if (btnIcon) btnIcon.className = 'fas fa-moon';
        return;
    }

    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) {
        body.classList.remove('night-mode');
        body.classList.add('day-mode');
        if (btnIcon) btnIcon.className = 'fas fa-sun';
    } else {
        body.classList.remove('day-mode');
        body.classList.add('night-mode');
        if (btnIcon) btnIcon.className = 'fas fa-moon';
    }
}
// ==========================================
// [6] التأثيرات البصرية (CURSOR, STARS, TILT)
// ==========================================
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (cursorDot && cursorOutline) {
    let lastX = 0;
    let lastY = 0;
    let ticking = false;

    window.addEventListener('mousemove', (e) => {
        lastX = e.clientX;
        lastY = e.clientY;
        if (!ticking) {
            window.requestAnimationFrame(() => {
                cursorDot.style.left = `${lastX}px`;
                cursorDot.style.top = `${lastY}px`;
                cursorOutline.animate({ left: `${lastX}px`, top: `${lastY}px` }, { duration: 160, fill: 'forwards' });
                ticking = false;
            });
            ticking = true;
        }
    });
}
function initShootingStars() {
    const container = document.getElementById('starsContainer');
    if (!container) return;

    for (let i = 0; i < 120; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.setProperty('--d', `${Math.random() * 3 + 2}s`);
        container.appendChild(star);
    }

    setInterval(() => {
        const meteor = document.createElement('div');
        meteor.className = 'shooting-star';
        meteor.style.top = `${Math.random() * 60}%`;
        meteor.style.left = `${Math.random() * 80}%`;
        meteor.style.animation = `shoot ${Math.random() * 2 + 1}s linear`;
        container.appendChild(meteor);
        setTimeout(() => meteor.remove(), 4000);
    }, 3000);
}

function initTilt() {
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -3;
            const rotateY = ((x - centerX) / centerX) * 3;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

// ==========================================
// [7] نظام الإحصائيات والأرشيف (RENDERING)
// ==========================================
function toggleRadarMode(mode, element) {
    const pitchView = document.getElementById('pitch-view');
    const statsView = document.getElementById('stats-view');
    
    if (mode === 'pitch') {
        if(pitchView) pitchView.style.display = 'block';
        if(statsView) statsView.style.display = 'none';
    } else {
        if(pitchView) pitchView.style.display = 'none';
        if(statsView) statsView.style.display = 'block';
    }

    const btns = document.querySelectorAll('.radar-controls .radar-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    }
}

function renderStats() {
    const eliteBody = document.getElementById('eliteTableBody');
    const challengeBody = document.getElementById('challengeTableBody');
    
    // بناء الصفوف
    const createRows = (data) => data.map(p => `
        <tr>
            <td style="font-weight:bold; color:var(--ramadan-gold); text-align:right;">${p.name}</td>
            <td style="color: #fff;">${p.g}</td>
            <td style="color: #fff;">${p.a}</td>
            <td style="color: #fff;">${p.g + p.a}</td> 
            <td style="color: #ffd700;">
                <i class="fas fa-star" style="font-size:0.7rem; margin-left:3px;"></i>${p.r}
            </td>
        </tr>
    `).join('');

    if (eliteBody) eliteBody.innerHTML = createRows(statsElite);
    if (challengeBody) challengeBody.innerHTML = createRows(statsChallenge);

    // نداء الدالة بالاسم الجديد والموحد
    updateFieldIcons(); 
    
    console.log("Omar System: Stats & Field Synchronized! ✅");
}

// الدالة اللي بتوزع الأيقونات وتعمل التوهج
function updateFieldIcons() {
    const mvpElite = statsElite.reduce((prev, curr) => (curr.r > prev.r ? curr : prev));
    const mvpChallenge = statsChallenge.reduce((prev, curr) => (curr.r > prev.r ? prev : curr));

    document.querySelectorAll('.player-token').forEach(token => {
        const playerName = token.getAttribute('data-name');
        const pData = [...statsElite, ...statsChallenge].find(p => p.name === playerName);

        if (!pData) return;

        token.classList.remove('mvp-glow');
        token.querySelectorAll('.goal-badge, .assist-badge').forEach(b => b.remove());

        if (playerName === mvpElite.name || playerName === mvpChallenge.name) {
            token.classList.add('mvp-glow');
        }

        if (pData.g > 0) {
            const gBadge = document.createElement('span');
            gBadge.className = 'goal-badge';
            gBadge.innerHTML = '⚽';
            token.appendChild(gBadge);
        }

        if (pData.a > 0) {
            const aBadge = document.createElement('span');
            aBadge.className = 'assist-badge';
            aBadge.innerHTML = '🦶';
            token.appendChild(aBadge);
        }
    });
}// دالة فرعية لتحديث أيقونات الملعب والتوهج

function renderMatches() {
    const archiveContainer = document.getElementById('matchHistoryContainer');
    if (!archiveContainer) return;

    archiveContainer.innerHTML = matchHistoryArchive.map(m => `
        <div class="tilt-card" style="display:flex; justify-content:space-between; align-items:center; background: rgba(0, 10, 26, 0.7); border-color: rgba(255,255,255,0.1); margin-bottom: 15px;">
            <div style="text-align:center; flex:1;">
                <i class="fas fa-shield-alt" style="display:block; font-size:1.8rem; margin-bottom:8px; color:#a0aec0;"></i>
                <span style="font-weight:bold; font-size:1.1rem;">${safeText(m.t1)}</span>
            </div>
            <div style="text-align:center; padding: 0 20px; flex:2;">
                <div style="font-family:'Orbitron'; font-size:2.2rem; color:var(--accent-cyan); text-shadow: 0 0 15px rgba(0,242,254,0.5); font-weight:900;">${safeText(m.s)}</div>
                <div style="font-size:0.9rem; color:${m.st === 'انتهت' ? '#cbd5e0' : 'var(--ramadan-gold)'}; margin-top:5px; font-weight:bold;">${safeText(m.st)}</div>
                <div style="font-size:0.8rem; opacity:0.7; margin-top:4px;">${safeText(m.d)}</div>
            </div>
            <div style="text-align:center; flex:1;">
                <i class="fas fa-tshirt" style="display:block; font-size:1.8rem; margin-bottom:8px; color:#a0aec0;"></i>
                <span style="font-weight:bold; font-size:1.1rem;">${safeText(m.t2)}</span>
            </div>
        </div>
    `).join('');
}
// ==========================================
// [8] نظام المواقيت والعد التنازلي للصلاة (PRAYER SYSTEM)
// ==========================================
let currentPrayerInterval = null;
let globalPrayerData = [];

async function initPrayersSystem() {
    const lat = 31.5326;
    const long = 35.0998;

    try {
        const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${long}&method=1`);
        const data = await res.json();

        const timings = data.data.timings;
        const hijri = data.data.date.hijri;

        const hijriDisplay = document.getElementById('hijriDate');
        if (hijriDisplay) {
            hijriDisplay.innerText = `${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`;
        }

        const prayers = [
            { id: 'Fajr', name: 'الفجر', time: timings.Fajr },
            { id: 'Sunrise', name: 'الشروق', time: timings.Sunrise },
            { id: 'Dhuhr', name: 'الظهر', time: timings.Dhuhr },
            { id: 'Asr', name: 'العصر', time: timings.Asr },
            { id: 'Maghrib', name: 'المغرب', time: timings.Maghrib },
            { id: 'Isha', name: 'العشاء', time: timings.Isha }
        ];

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        let nextFound = false;

        globalPrayerData = prayers.map(p => {
            const [h, m] = p.time.split(':').map(Number);
            const prayerMinutes = h * 60 + m;
            p.isNext = false;

            if (!nextFound && prayerMinutes > currentMinutes) {
                p.isNext = true;
                nextFound = true;
            }
            return p;
        });

        if (!nextFound) globalPrayerData[0].isNext = true;

        renderPrayerCards();
        startDynamicPrayerCountdown();
    } catch (error) {
        console.error('Omar System Error - Prayers API:', error);
    }
}

// 1. خريطة الأيقونات (حطها في بداية الملف أو فوق الدالة)
const prayerIconsMap = {
    'Fajr': 'fa-cloud-moon',
    'Sunrise': 'fa-sun',
    'Dhuhr': 'fa-sun-plant-wilt',
    'Asr': 'fa-clover',
    'Maghrib': 'fa-moon',
    'Isha': 'fa-star-and-crescent'
};

// 2. الدالة المعدلة بالكامل
function renderPrayerCards(activeId = '') {
    const container = document.getElementById('prayersContainer');
    if(!container) return;
    
    container.innerHTML = globalPrayerData.map(p => {
        let activeClass = '';
        if (p.id === activeId || p.isNext) {
            activeClass = p.id === 'Maghrib' ? 'active-maghrib' : 'active-next';
        }
        
        // نجيب الأيقونة من الخريطة بناءً على الـ ID
        const iconClass = prayerIconsMap[p.id] || 'fa-clock';
        
        return `
            <div class="prayer-unit ${activeClass}" id="card-${p.id}">
                <div class="prayer-icon-wrapper" style="margin-bottom: 10px; font-size: 1.8rem; color: var(--ramadan-gold);">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div style="font-size:0.9rem; color:#aaa; font-weight:bold; margin-bottom:5px;">${p.name}</div>
                <div style="font-size:1.6rem; font-weight:900; color:var(--ramadan-gold); font-family:'Orbitron';">${p.time}</div>
            </div>
        `;
    }).join('');
}
function startDynamicPrayerCountdown() {
    if (currentPrayerInterval) clearInterval(currentPrayerInterval);

    currentPrayerInterval = setInterval(() => {
        if (!globalPrayerData.length) return;

        const now = new Date();
        let nextPrayer = null;
        let targetDate = new Date();

        for (let i = 0; i < globalPrayerData.length; i++) {
            const p = globalPrayerData[i];
            const [h, m] = p.time.split(':').map(Number);
            const pt = new Date();
            pt.setHours(h, m, 0, 0);

            if (now < pt) {
                nextPrayer = p;
                targetDate = pt;
                break;
            }
        }

        if (!nextPrayer) {
            nextPrayer = globalPrayerData[0];
            const [h, m] = nextPrayer.time.split(':').map(Number);
            targetDate.setDate(targetDate.getDate() + 1);
            targetDate.setHours(h, m, 0, 0);
        }

        const diff = Math.max(0, targetDate - now);
        const hh = String(Math.floor(diff / 3600000)).padStart(2, '0');
        const mm = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        const ss = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');

        const counterEl = document.getElementById('dynamicPrayerCounter');
        const labelEl = document.getElementById('nextPrayerNameLabel');
        const sectionEl = document.getElementById('dynamicTimerSection');

        if (counterEl) counterEl.innerText = `${hh}:${mm}:${ss}`;

        if (labelEl) {
            labelEl.innerText = nextPrayer.id === 'Maghrib'
                ? `الوقت المتبقي لرفع أذان ${nextPrayer.name}`
                : `الوقت المتبقي لصلاة ${nextPrayer.name}`;
        }

        if (sectionEl) {
            sectionEl.classList.toggle('maghrib-active', nextPrayer.id === 'Maghrib');
        }
    }, 1000);
}

// ==========================================
// [9] نظام العد التنازلي للحجز والنفحات
// ==========================================
function updateBookingTimer() {
    const countdownEl = document.getElementById('match-countdown');
    const badgeEl = document.getElementById('booking-badge');
    const bookingCard = document.getElementById('bookingTimerCard');
    const title = document.getElementById('bookingTitle');
    const timerContainer = document.getElementById('timerContainer');

    if (!countdownEl && (!bookingCard || !title || !timerContainer)) return;

    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    const isBookingWindow = day === 5 && hour >= 20 && hour < 21;

    if (bookingCard && title && timerContainer) {
        if (isBookingWindow) {
            if (!bookingCard.classList.contains('booking-active')) {
                bookingCard.classList.add('booking-active');
                title.innerHTML = '<span style="font-size: 2rem;">🔥 الحجز مفتوح الآن!</span>';
                title.style.color = 'var(--success-green)';
                timerContainer.innerHTML = '<div class="booking-open-text" style="font-size:2rem; color:#2ecc71; font-weight:bold;">سارع بحجز مكانك!</div>';
            }
            if (badgeEl) {
                badgeEl.innerText = 'مفتوح';
                badgeEl.style.background = '#2ecc71';
                badgeEl.style.color = '#000';
            }
            return;
        }

        if (bookingCard.classList.contains('booking-active')) {
            bookingCard.classList.remove('booking-active');
            title.innerText = 'العد التنازلي للحجز (الجمعة 20:00 - 21:00)';
            title.style.color = 'var(--accent-cyan)';
            timerContainer.innerHTML = `
                <div class="w-item"><span id="b-days" style="font-size: 2.5rem;">00</span><small>يوم</small></div>
                <div class="w-item"><span id="b-hours" style="font-size: 2.5rem;">00</span><small>ساعة</small></div>
                <div class="w-item"><span id="b-mins" style="font-size: 2.5rem;">00</span><small>دقيقة</small></div>
                <div class="w-item"><span id="b-secs" style="font-size: 2.5rem;">00</span><small>ثانية</small></div>
            `;
        }
    }

    let target = new Date();
    target.setDate(now.getDate() + (5 + 7 - now.getDay()) % 7);
    target.setHours(20, 0, 0, 0);

    if (now > target) target.setDate(target.getDate() + 7);

    const diff = target - now;
    const dEl = document.getElementById('b-days');
    const hEl = document.getElementById('b-hours');
    const mEl = document.getElementById('b-mins');
    const sEl = document.getElementById('b-secs');

    if (countdownEl) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
}
}
// ==========================================
// [10] نظام الطقس المربوط بالخليل (WEATHER SYSTEM)
// ==========================================
async function updateWeatherSystem() {
    const lat = '31.5326';
    const lon = '35.0998';
    const apiKey = '95213cb0c3d0aeb490b82a58075a8999';

    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}&lang=ar`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}&lang=ar`;

    try {
        const resCurr = await fetch(currentUrl);
        const dataCurr = await resCurr.json();

        if (dataCurr && dataCurr.cod === 200) {
            const temp = Math.round(dataCurr.main.temp);
            const wTemp = document.getElementById('w-temp');
            const wDesc = document.getElementById('w-desc');
            const wWind = document.getElementById('w-wind');
            const wHum = document.getElementById('w-hum');
            const wDate = document.getElementById('w-date');
            const weatherStatus = document.getElementById('weather-status');

            if (wTemp) wTemp.innerText = `${temp}°C`;
            if (wDesc) wDesc.innerText = dataCurr.weather?.[0]?.description || '';
            if (wWind) wWind.innerText = `${dataCurr.wind?.speed ?? 0} م/ث`;
            if (wHum) wHum.innerText = `${dataCurr.main?.humidity ?? 0}%`;
            if (wDate) {
                const options = { weekday: 'long', month: 'long', day: 'numeric' };
                wDate.innerText = new Date().toLocaleDateString('ar-EG', options);
            }
            if (weatherStatus) {
                weatherStatus.innerHTML = `<i class="fas fa-location-dot"></i> الخليل: ${temp}°C`;
            }
        }

        const resFore = await fetch(forecastUrl);
        const dataFore = await resFore.json();
        const wrapper = document.getElementById('hourly-wrapper');

        if (wrapper && dataFore?.list?.length) {
            wrapper.innerHTML = dataFore.list.slice(0, 16).map(hour => {
                const time = `${new Date(hour.dt * 1000).getHours()}:00`;
                const temp = Math.round(hour.main.temp);
                const icon = hour.weather?.[0]?.icon || '01d';
                return `
                    <div class="hourly-item">
                        <span class="h-time">${time}</span>
                        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather">
                        <span class="h-temp">${temp}°</span>
                    </div>
                `;
            }).join('');
        }
    } catch (e) {
        console.error('Omar System Error - Weather API:', e);
    }
}

// /**
// ==========================================
// [11] المحرك التكتيكي المتطور (FUTSAL TACTICAL ENGINE)
// ==========================================
class FutsalTacticalEngine {
    constructor() {
        this.pitch = document.getElementById('tactical-futsal-pitch');
        this.wrapper = document.getElementById('tactical-pitch-wrapper');
        this.viewToggle = document.getElementById('tactical-view-toggle');
        this.coordBox = document.getElementById('live-coord');
        this.coordLabel = document.getElementById('coord-label');

        this.draggedElement = null;
        this.selectedPlayer = null;
        this.is3D = true;
        this.activeMenu = null;
        this.teamSwitchMenu = null;

        // كابتن واحد لكل فريق أساسي
        this.captainByTeam = { home: null, away: null, bench: null };

        this.teamLayouts = {
            home: [
                { x: 8,  y: 50 },
                { x: 25, y: 25 },
                { x: 25, y: 75 },
                { x: 40, y: 30 },
                { x: 45, y: 70 }
            ],
            away: [
                { x: 92, y: 50 },
                { x: 75, y: 25 },
                { x: 75, y: 75 },
                { x: 60, y: 30 },
                { x: 55, y: 70 }
            ],
            bench: [
                { x: 18, y: 7 },
                { x: 34, y: 7 },
                { x: 50, y: 7 },
                { x: 66, y: 7 },
                { x: 82, y: 7 }
            ]
        };

        this.injectEngineStyles();

        if (this.pitch) this.init();
    }

    injectEngineStyles() {
        if (document.getElementById('tactical-engine-inline-styles')) return;

        const style = document.createElement('style');
        style.id = 'tactical-engine-inline-styles';
        style.textContent = `
            .player-node {
                position: absolute;
                transform: translate(-50%, -50%);
                transform-origin: center center;
                will-change: left, top, transform, filter, opacity;
                touch-action: none;
                user-select: none;
            }

            .player-node.is-dragging {
                z-index: 10000 !important;
                cursor: grabbing !important;
                filter: saturate(1.08) brightness(1.08);
            }

            .player-node.is-dragging .role-badge-bottom {
                box-shadow: 0 0 0 2px rgba(255,255,255,.18), 0 0 18px rgba(255,215,0,.25);
            }

            .player-node.team-bench {
                opacity: .94;
                filter: saturate(.8) brightness(.95);
                box-shadow: 0 8px 18px rgba(0,0,0,.28);
            }

            .player-node.team-bench .role-badge-bottom {
                background: rgba(255,255,255,.08) !important;
                color: #fff !important;
            }

            #team-switch-fab {
                position: absolute;
                z-index: 9999;
                top: 14px;
                right: 14px;
                padding: 10px 14px;
                border-radius: 999px;
                border: 1px solid rgba(255,255,255,.16);
                background: rgba(8, 14, 26, .88);
                color: #fff;
                font-weight: 800;
                cursor: pointer;
                backdrop-filter: blur(12px);
                box-shadow: 0 10px 28px rgba(0,0,0,.28);
                transition: transform .18s ease, background .18s ease, box-shadow .18s ease;
            }

            #team-switch-fab:hover {
                transform: translateY(-1px) scale(1.02);
                background: rgba(14, 22, 38, .94);
                box-shadow: 0 14px 34px rgba(0,0,0,.34);
            }

            #team-switch-menu button,
            .tactical-advanced-menu button {
                font: inherit;
            }

            #team-switch-menu button {
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
            }

            #team-switch-menu button:hover {
                background: rgba(255,255,255,.14);
                transform: translateY(-1px);
            }

            .player-node.switch-pop {
                animation: switchPop .28s ease-out;
            }

            @keyframes switchPop {
                0%   { transform: translate(-50%, -50%) scale(1); }
                50%  { transform: translate(-50%, -50%) scale(1.12); }
                100% { transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
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
            name: localStorage.getItem(this.getPlayerStorageKey(id, 'name')) || '',
            role: localStorage.getItem(this.getPlayerStorageKey(id, 'role')) || '',
            instr: localStorage.getItem(this.getPlayerStorageKey(id, 'instr')) || '',
            captain: localStorage.getItem(this.getPlayerStorageKey(id, 'captain')) === '1',
            team: localStorage.getItem(this.getPlayerStorageKey(id, 'team')) || ''
        };
    }

    savePlayerState(id, data = {}) {
        if ('name' in data) {
            localStorage.setItem(this.getPlayerStorageKey(id, 'name'), data.name || '');
        }
        if ('role' in data) {
            localStorage.setItem(this.getPlayerStorageKey(id, 'role'), data.role || '');
        }
        if ('instr' in data) {
            localStorage.setItem(this.getPlayerStorageKey(id, 'instr'), data.instr || '');
        }
        if ('captain' in data) {
            localStorage.setItem(this.getPlayerStorageKey(id, 'captain'), data.captain ? '1' : '0');
        }
        if ('team' in data) {
            localStorage.setItem(this.getPlayerStorageKey(id, 'team'), data.team || '');
        }
    }

    clearPlayerState(id) {
        localStorage.removeItem(this.getPlayerStorageKey(id, 'name'));
        localStorage.removeItem(this.getPlayerStorageKey(id, 'role'));
        localStorage.removeItem(this.getPlayerStorageKey(id, 'instr'));
        localStorage.removeItem(this.getPlayerStorageKey(id, 'captain'));
        localStorage.removeItem(this.getPlayerStorageKey(id, 'team'));
    }

    getPlayerNumber(playerId) {
        const match = String(playerId).match(/\d+/);
        return match ? Math.max(1, Math.min(5, parseInt(match[0], 10))) : 1;
    }

    getDefaultPositionForTeam(team, playerId) {
        const number = this.getPlayerNumber(playerId) - 1;

        if (team === 'home') {
            return this.teamLayouts.home[number] || this.teamLayouts.home[0];
        }
        if (team === 'away') {
            return this.teamLayouts.away[number] || this.teamLayouts.away[0];
        }
        if (team === 'bench') {
            return this.teamLayouts.bench[number] || this.teamLayouts.bench[0];
        }

        return { x: 50, y: 50 };
    }

    getTeamClass(team) {
        if (team === 'home') return 'team-red';
        if (team === 'away') return 'team-blue';
        return 'team-bench';
    }

    applyTeamVisual(playerNode, team) {
        playerNode.classList.remove('team-red', 'team-blue', 'team-bench');
        playerNode.classList.add(this.getTeamClass(team));

        if (team === 'bench') {
            playerNode.style.filter = 'saturate(.8) brightness(.95)';
            playerNode.style.opacity = '0.94';
        } else {
            playerNode.style.filter = '';
            playerNode.style.opacity = '';
        }
    }

    setupPlayers() {
        const teamA = [
            { id: 'R1', name: 'محمد علي', x: 8,  y: 50, color: 'team-red',  team: 'home' },
            { id: 'R2', name: 'كريم',      x: 25, y: 25, color: 'team-red',  team: 'home' },
            { id: 'R3', name: 'يوسف',      x: 25, y: 75, color: 'team-red',  team: 'home' },
            { id: 'R4', name: 'عمر',       x: 40, y: 30, color: 'team-red',  team: 'home' },
            { id: 'R5', name: 'هاني',      x: 45, y: 70, color: 'team-red',  team: 'home' }
        ];

        const teamB = [
            { id: 'B1', name: 'فتحي',      x: 92, y: 50, color: 'team-blue', team: 'away' },
            { id: 'B2', name: 'عمر',       x: 75, y: 25, color: 'team-blue', team: 'away' },
            { id: 'B3', name: 'كريم',      x: 75, y: 75, color: 'team-blue', team: 'away' },
            { id: 'B4', name: 'مناصرة',    x: 60, y: 30, color: 'team-blue', team: 'away' },
            { id: 'B5', name: 'احمد',      x: 55, y: 70, color: 'team-blue', team: 'away' }
        ];

        const teamC = [
            { id: 'S1', name: 'بديل 1', x: 18, y: 7, color: 'team-bench', team: 'bench' },
            { id: 'S2', name: 'بديل 2', x: 34, y: 7, color: 'team-bench', team: 'bench' },
            { id: 'S3', name: 'بديل 3', x: 50, y: 7, color: 'team-bench', team: 'bench' }
        ];

        [...teamA, ...teamB, ...teamC].forEach(p => this.createPlayer(p));
    }

    createPlayer(config) {
        const saved = this.getSavedPlayerState(config.id);

        if (saved.name) config.name = saved.name;
        if (saved.team) config.team = saved.team;

        const node = document.createElement('div');
        node.className = `player-node ${config.color}`;
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
            <div class="player-name-center" id="name-${config.id}">${config.name}</div>
            <div class="role-badge-bottom" id="role-${config.id}">--</div>
            <div class="captain-badge" id="captain-${config.id}" style="display:none;">C</div>
        `;

        node.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showAdvancedMenu(e.clientX, e.clientY, node);
        });

        node.addEventListener('pointerdown', (e) => this.onStart(e, node));

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
            roleEl.style.display = 'block';
        }

        if (saved.instr && instrEl) {
            instrEl.textContent = saved.instr;
            instrEl.style.display = 'block';
        }

        if (saved.captain && captainEl) {
            captainEl.style.display = 'flex';
            if (playerNode.dataset.team === 'home' || playerNode.dataset.team === 'away') {
                this.captainByTeam[playerNode.dataset.team] = playerId;
            }
        } else if (captainEl) {
            captainEl.style.display = 'none';
        }
    }

    buildTeamSwitchButton() {
        if (!this.wrapper || document.getElementById('team-switch-fab')) return;

        const btn = document.createElement('button');
        btn.id = 'team-switch-fab';
        btn.type = 'button';
        btn.textContent = 'تبديل الفريق';

        btn.addEventListener('click', () => {
            if (!this.selectedPlayer) {
                alert('حدّد لاعباً أولاً.');
                return;
            }
            const rect = btn.getBoundingClientRect();
            this.openTeamSwitchMenu(this.selectedPlayer, rect.right, rect.bottom);
        });

        this.wrapper.style.position = this.wrapper.style.position || 'relative';
        this.wrapper.appendChild(btn);
    }

    openTeamSwitchMenu(playerNode, x, y) {
        this.closeTeamSwitchMenu();

        const playerId = playerNode.id;

        const menu = document.createElement('div');
        menu.id = 'team-switch-menu';
        menu.style.position = 'fixed';
        menu.style.zIndex = '100001';
        menu.style.minWidth = '230px';
        menu.style.padding = '12px';
        menu.style.borderRadius = '16px';
        menu.style.background = 'rgba(5,10,18,.95)';
        menu.style.border = '1px solid rgba(255,255,255,.12)';
        menu.style.boxShadow = '0 18px 45px rgba(0,0,0,.45)';
        menu.style.color = '#fff';
        menu.style.backdropFilter = 'blur(14px)';

        menu.innerHTML = `
            <div style="font-weight:800; margin-bottom:10px; color:#ffd86a;">نقل اللاعب: ${playerId}</div>
            <button type="button" data-team="home">إلى النخبة</button>
            <div style="height:8px;"></div>
            <button type="button" data-team="away">إلى التحدي</button>
            <div style="height:8px;"></div>
            <button type="button" data-team="bench">إلى الاحتياط</button>
        `;

        menu.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.movePlayerToTeam(playerNode, btn.dataset.team);
                this.closeTeamSwitchMenu();
            });
        });

        document.body.appendChild(menu);
        this.teamSwitchMenu = menu;
        this.clampMenuPosition(x + 10, y + 10, menu);

        setTimeout(() => {
            const onBodyClick = (ev) => {
                if (!menu.contains(ev.target) && ev.target.id !== 'team-switch-fab') {
                    this.closeTeamSwitchMenu();
                    document.body.removeEventListener('click', onBodyClick);
                }
            };
            document.body.addEventListener('click', onBodyClick);
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

        // لا يوجد كابتن مزدوج على نفس الفريق
        const currentCaptain = this.captainByTeam[newTeam];
        if ((newTeam === 'home' || newTeam === 'away') && currentCaptain && currentCaptain !== playerId) {
            alert('هذا الفريق يملك كابتن بالفعل. انقل الكابتن الحالي أولاً.');
            return;
        }

        // إلغاء الكابتنية من الفريق القديم إذا كان هذا اللاعب كابتن
        if ((oldTeam === 'home' || oldTeam === 'away') && this.captainByTeam[oldTeam] === playerId) {
            this.captainByTeam[oldTeam] = null;
            this.savePlayerState(playerId, { captain: false });
            const oldCaptainBadge = playerNode.querySelector(`#captain-${playerId}`);
            if (oldCaptainBadge) oldCaptainBadge.style.display = 'none';
        }

        playerNode.dataset.team = newTeam;
        this.applyTeamVisual(playerNode, newTeam);
        this.savePlayerState(playerId, { team: newTeam });

        const target = this.getDefaultPositionForTeam(newTeam, playerId);

        playerNode.style.transition = 'left 420ms cubic-bezier(.2,.9,.2,1), top 420ms cubic-bezier(.2,.9,.2,1), transform 220ms ease, filter 220ms ease';
        playerNode.style.left = `${target.x}%`;
        playerNode.style.top = `${target.y}%`;

        playerNode.classList.remove('switch-pop');
        void playerNode.offsetWidth;
        playerNode.classList.add('switch-pop');
        setTimeout(() => playerNode.classList.remove('switch-pop'), 320);

        if (newTeam === 'home' || newTeam === 'away') {
            const saved = this.getSavedPlayerState(playerId);
            if (saved.captain) {
                this.captainByTeam[newTeam] = playerId;
                const captainBadge = playerNode.querySelector(`#captain-${playerId}`);
                if (captainBadge) captainBadge.style.display = 'flex';
            }
        }

        setTimeout(() => {
            playerNode.style.transition = '';
        }, 480);
    }

    closeAdvancedMenu() {
        if (this.activeMenu) {
            this.activeMenu.remove();
            this.activeMenu = null;
        }
    }

    clampMenuPosition(x, y, menu) {
        const padding = 12;
        const menuWidth = menu.offsetWidth || 320;
        const menuHeight = menu.offsetHeight || 420;

        const maxX = window.innerWidth - menuWidth - padding;
        const maxY = window.innerHeight - menuHeight - padding;

        const fx = Math.max(padding, Math.min(x, maxX));
        const fy = Math.max(padding, Math.min(y, maxY));

        menu.style.left = `${fx}px`;
        menu.style.top = `${fy}px`;
    }

    showAdvancedMenu(x, y, playerNode) {
        this.closeAdvancedMenu();

        const playerId = playerNode.id;
        const teamKey = playerNode.dataset.team;

        const nameEl = playerNode.querySelector(`#name-${playerId}`);
        const teamRoleEl = playerNode.querySelector(`#team-role-${playerId}`);
        const instrEl = playerNode.querySelector(`#instr-${playerId}`);
        const captainBadgeEl = playerNode.querySelector(`#captain-${playerId}`);

        const currentName = nameEl ? nameEl.textContent : '';
        const currentRole = teamRoleEl && teamRoleEl.textContent ? teamRoleEl.textContent : '';
        const currentInstr = instrEl && instrEl.textContent ? instrEl.textContent : '';

        const menu = document.createElement('div');
        menu.id = 'tactical-advanced-menu';
        menu.className = 'tactical-advanced-menu';
        menu.style.position = 'fixed';
        menu.style.zIndex = '99999';
        menu.style.maxWidth = '340px';
        menu.style.width = 'min(340px, calc(100vw - 24px))';
        menu.style.backdropFilter = 'blur(16px)';
        menu.style.background = 'rgba(5, 10, 18, 0.92)';
        menu.style.border = '1px solid rgba(255,255,255,0.12)';
        menu.style.borderRadius = '18px';
        menu.style.boxShadow = '0 20px 60px rgba(0,0,0,.45)';
        menu.style.padding = '14px';
        menu.style.color = '#fff';

        menu.innerHTML = `
            <div class="tam-header" style="font-weight:800; margin-bottom:12px; color:#ffd86a; font-size:1rem;">
                إعدادات ${teamKey === 'home' ? 'النخبة' : teamKey === 'away' ? 'التحدي' : 'الاحتياط'} - ${playerId}
            </div>

            <div class="tam-group" style="margin-bottom:10px;">
                <label style="display:block; margin-bottom:6px; font-size:.9rem; opacity:.9;">اسم اللاعب:</label>
                <input
                    id="tam-player-name"
                    type="text"
                    value="${currentName.replace(/"/g, '&quot;')}"
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
                    <option value="كابتن" ${currentRole === 'كابتن' ? 'selected' : ''}>كابتن</option>
                    <option value="قائد الدفاع" ${currentRole === 'قائد الدفاع' ? 'selected' : ''}>قائد الدفاع</option>
                    <option value="قائد الهجوم" ${currentRole === 'قائد الهجوم' ? 'selected' : ''}>قائد الهجوم</option>
                    <option value="منفذ الركلات الثابتة" ${currentRole === 'منفذ الركلات الثابتة' ? 'selected' : ''}>منفذ الركلات الثابتة</option>
                    <option value="منفذ ركلات الجزاء" ${currentRole === 'منفذ ركلات الجزاء' ? 'selected' : ''}>منفذ ركلات الجزاء</option>
                    <option value="لاعب حر" ${currentRole === 'لاعب حر' ? 'selected' : ''}>لاعب حر</option>
                    <option value="صانع ألعاب رئيسي" ${currentRole === 'صانع ألعاب رئيسي' ? 'selected' : ''}>صانع ألعاب رئيسي</option>
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
                    <option value="يضغط للأمام" ${currentInstr === 'يضغط للأمام' ? 'selected' : ''}>يضغط للأمام</option>
                    <option value="يغطي الظهير" ${currentInstr === 'يغطي الظهير' ? 'selected' : ''}>يغطي الظهير</option>
                    <option value="يسقط للخلف" ${currentInstr === 'يسقط للخلف' ? 'selected' : ''}>يسقط للخلف</option>
                    <option value="يثبت في العمق" ${currentInstr === 'يثبت في العمق' ? 'selected' : ''}>يثبت في العمق</option>
                    <option value="يتحرك بين الخطوط" ${currentInstr === 'يتحرك بين الخطوط' ? 'selected' : ''}>يتحرك بين الخطوط</option>
                    <option value="يفتح على الخط" ${currentInstr === 'يفتح على الخط' ? 'selected' : ''}>يفتح على الخط</option>
                    <option value="يدخل للعمق" ${currentInstr === 'يدخل للعمق' ? 'selected' : ''}>يدخل للعمق</option>
                </select>
            </div>

            <div class="tam-actions" style="display:flex; gap:8px; flex-wrap:wrap;">
                <button type="button" class="tam-btn tam-save" style="flex:1; min-width:72px;">حفظ</button>
                <button type="button" class="tam-btn tam-switch-team" style="flex:1; min-width:72px;">تبديل الفريق</button>
                <button type="button" class="tam-btn tam-clear" style="flex:1; min-width:72px;">مسح</button>
                <button type="button" class="tam-btn tam-close" style="flex:1; min-width:72px;">إغلاق</button>
            </div>
        `;

        document.body.appendChild(menu);
        this.activeMenu = menu;
        this.clampMenuPosition(x + 10, y + 10, menu);

        const saveBtn = menu.querySelector('.tam-save');
        const clearBtn = menu.querySelector('.tam-clear');
        const closeBtn = menu.querySelector('.tam-close');
        const switchBtn = menu.querySelector('.tam-switch-team');
        const nameInput = menu.querySelector('#tam-player-name');
        const roleInput = menu.querySelector('#tam-team-role');
        const instrInput = menu.querySelector('#tam-instr');

        const updateCaptainState = (newRole) => {
            if (teamKey === 'bench' && newRole === 'كابتن') {
                return false;
            }

            if (newRole === 'كابتن') {
                const currentCaptainId = this.captainByTeam[teamKey];
                if (currentCaptainId && currentCaptainId !== playerId) {
                    return false;
                }
                this.captainByTeam[teamKey] = playerId;
                if (captainBadgeEl) captainBadgeEl.style.display = 'flex';
                this.savePlayerState(playerId, { captain: true });
            } else {
                if (this.captainByTeam[teamKey] === playerId) {
                    this.captainByTeam[teamKey] = null;
                }
                if (captainBadgeEl) captainBadgeEl.style.display = 'none';
                this.savePlayerState(playerId, { captain: false });
            }
            return true;
        };

        saveBtn.addEventListener('click', () => {
            const newName = nameInput ? nameInput.value.trim() : '';
            const roleText = roleInput ? roleInput.value.trim() : '';
            const instrText = instrInput ? instrInput.value.trim() : '';

            if (newName && nameEl) {
                nameEl.textContent = newName;
                playerNode.dataset.name = newName;
                this.savePlayerState(playerId, { name: newName });
            }

            const captainOk = updateCaptainState(roleText);
            if (!captainOk) {
                alert(teamKey === 'bench'
                    ? 'لا يمكن تعيين كابتن للاحتياط.'
                    : 'هذا الفريق يملك كابتن بالفعل. أزل الكابتن الحالي أولاً ثم عيّن لاعباً جديداً.'
                );
                roleInput.value = teamRoleEl && teamRoleEl.textContent ? teamRoleEl.textContent : '';
                return;
            }

            if (teamRoleEl) {
                if (roleText) {
                    teamRoleEl.textContent = roleText;
                    teamRoleEl.style.display = 'block';
                } else {
                    teamRoleEl.textContent = '';
                    teamRoleEl.style.display = 'none';
                }
            }

            if (instrEl) {
                if (instrText) {
                    instrEl.textContent = instrText;
                    instrEl.style.display = 'block';
                } else {
                    instrEl.textContent = '';
                    instrEl.style.display = 'none';
                }
            }

            this.savePlayerState(playerId, {
                role: roleText,
                instr: instrText
            });

            this.closeAdvancedMenu();
        });

        switchBtn.addEventListener('click', () => {
            this.closeAdvancedMenu();
            this.openTeamSwitchMenu(playerNode, x + 12, y + 12);
        });

        clearBtn.addEventListener('click', () => {
            const wasCaptain = this.captainByTeam[teamKey] === playerId;

            if (nameEl) {
                const defaultName = playerNode.dataset.defaultName || playerId;
                nameEl.textContent = defaultName;
                playerNode.dataset.name = defaultName;
                this.savePlayerState(playerId, { name: '' });
            }

            if (teamRoleEl) {
                teamRoleEl.textContent = '';
                teamRoleEl.style.display = 'none';
            }

            if (instrEl) {
                instrEl.textContent = '';
                instrEl.style.display = 'none';
            }

            if (captainBadgeEl) {
                captainBadgeEl.style.display = 'none';
            }

            if (wasCaptain) {
                this.captainByTeam[teamKey] = null;
            }

            this.savePlayerState(playerId, {
                role: '',
                instr: '',
                captain: false
            });

            if (roleInput) roleInput.value = '';
            if (instrInput) instrInput.value = '';
            if (nameInput) nameInput.value = playerNode.dataset.defaultName || playerId;
        });

        closeBtn.addEventListener('click', () => {
            this.closeAdvancedMenu();
        });

        setTimeout(() => {
            const onBodyClick = (ev) => {
                if (!menu.contains(ev.target) && !playerNode.contains(ev.target) && ev.target.id !== 'team-switch-fab') {
                    this.closeAdvancedMenu();
                    document.body.removeEventListener('click', onBodyClick);
                }
            };
            document.body.addEventListener('click', onBodyClick);
        }, 0);
    }

    bindEvents() {
        window.addEventListener('pointermove', (e) => this.onMove(e));
        window.addEventListener('pointerup', () => this.onEnd());

        if (this.viewToggle) {
            this.viewToggle.addEventListener('click', () => {
                this.is3D = !this.is3D;
                if (this.is3D) this.pitch.classList.remove('is-2d');
                else this.pitch.classList.add('is-2d');
            });
        }
    }

    onStart(e, el) {
        if (e.button !== 0) return;

        this.draggedElement = el;
        this.selectedPlayer = el;

        el.setPointerCapture(e.pointerId);
        el.classList.add('is-dragging');
        el.style.zIndex = '10000';
        el.style.transition = 'none';
        el.style.transform = 'translate(-50%, -50%) scale(1.12)';

        if (this.coordBox) this.coordBox.style.display = 'block';
    }

    onMove(e) {
        if (!this.draggedElement) return;

        const rect = this.pitch.getBoundingClientRect();
        let x = ((e.clientX - rect.left) / rect.width) * 100;
        let y = ((e.clientY - rect.top) / rect.height) * 100;

        x = Math.max(2, Math.min(98, x));
        y = Math.max(4, Math.min(96, y));

        this.draggedElement.style.left = `${x}%`;
        this.draggedElement.style.top = `${y}%`;
        this.draggedElement.style.transform = 'translate(-50%, -50%) scale(1.12) rotate(-1deg)';

        this.updateTacticalRole(this.draggedElement, x, y);
    }

    animateDropReturn(el) {
        try {
            el.animate(
                [
                    { transform: 'translate(-50%, -50%) scale(1.12) translateY(0px)' },
                    { transform: 'translate(-50%, -50%) scale(.95) translateY(-18px)' },
                    { transform: 'translate(-50%, -50%) scale(1.04) translateY(12px)' },
                    { transform: 'translate(-50%, -50%) scale(1) translateY(0px)' }
                ],
                {
                    duration: 620,
                    easing: 'cubic-bezier(.2, .95, .2, 1)',
                    fill: 'forwards'
                }
            );
        } catch (_) {
            setTimeout(() => {
                el.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 50);
        }
    }

    onEnd() {
        if (!this.draggedElement) {
            if (this.coordBox) this.coordBox.style.display = 'none';
            return;
        }

        const el = this.draggedElement;

        el.classList.remove('is-dragging');
        el.style.zIndex = '';
        el.style.transition = 'none';

        this.animateDropReturn(el);

        setTimeout(() => {
            el.style.transition = '';
            el.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 650);

        this.draggedElement = null;
        if (this.coordBox) this.coordBox.style.display = 'none';
    }

    updateTacticalRole(el, x, y) {
        const team = el.dataset.team;
        const badge = el.querySelector('.role-badge-bottom');

        if (team === 'bench') {
            if (badge && badge.innerText !== 'SUB') {
                badge.innerText = 'SUB';
                badge.classList.add('role-glow');
                setTimeout(() => badge.classList.remove('role-glow'), 500);
            }
            if (this.coordLabel) {
                this.coordLabel.innerText = `المركز: احتياط (${Math.round(x)}%, ${Math.round(y)}%)`;
            }
            return;
        }

        let role = '';

        const depthFromOwnGoal = (team === 'home') ? x : (100 - x);
        const laneY = y;

        const inGKZone  = depthFromOwnGoal < 8;
        const inDefZone = depthFromOwnGoal >= 8  && depthFromOwnGoal < 28;
        const inCDMZone = depthFromOwnGoal >= 28 && depthFromOwnGoal < 40;
        const inCMZone  = depthFromOwnGoal >= 40 && depthFromOwnGoal < 65;
        const inCAMZone = depthFromOwnGoal >= 65 && depthFromOwnGoal < 80;
        const inSTZone  = depthFromOwnGoal >= 80;

        const farLeft   = laneY < 22;
        const farRight  = laneY > 78;

        if (inGKZone && laneY > 30 && laneY < 70) {
            role = 'GK';
        } else if (inDefZone) {
            if (farLeft) role = 'LB';
            else if (farRight) role = 'RB';
            else role = 'CB';
        } else if (inCDMZone) {
            role = 'CDM';
        } else if (inCMZone) {
            if (farLeft) role = 'LM';
            else if (farRight) role = 'RM';
            else role = 'CM';
        } else if (inCAMZone) {
            if (farLeft) role = 'LW';
            else if (farRight) role = 'RW';
            else role = 'CAM';
        } else if (inSTZone) {
            if (farLeft) role = 'LW';
            else if (farRight) role = 'RW';
            else role = 'ST';
        }

        if (!role) role = 'CM';

        if (badge && badge.innerText !== role) {
            badge.innerText = role;
            badge.classList.add('role-glow');
            setTimeout(() => badge.classList.remove('role-glow'), 600);
        }

        const arabicRoleMap = {
            GK: 'حارس',
            CB: 'قلب دفاع',
            RB: 'ظهير أيمن',
            LB: 'ظهير أيسر',
            CDM: 'محور دفاعي',
            CM: 'وسط مركزي',
            CAM: 'صانع ألعاب',
            LM: 'وسط أيسر',
            RM: 'وسط أيمن',
            LW: 'جناح أيسر',
            RW: 'جناح أيمن',
            ST: 'مهاجم'
        };

        const arabicRole = arabicRoleMap[role] || role;
        if (this.coordLabel) {
            this.coordLabel.innerText = `المركز: ${arabicRole} (${Math.round(x)}%, ${Math.round(y)}%)`;
        }
    }
}

// أخذ لقطة شاشة للملعب وحفظها كصورة
function takeScreenshot() {
    const wrapper = document.getElementById('tactical-pitch-wrapper');
    const btn = document.querySelector('.screenshot-btn');
    if (!wrapper || !btn) return;

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';

    html2canvas(wrapper, {
        backgroundColor: '#14532d',
        useCORS: true,
        scale: 2
    }).then(canvas => {
        const link = document.createElement('a');
        const ts = new Date();
        link.download = `Taamen2026-Tactics-${ts.getTime()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        btn.innerHTML = '<i class="fas fa-check"></i> تم الحفظ!';
        setTimeout(() => { btn.innerHTML = originalText; }, 2000);
    }).catch(err => {
        console.error('Screenshot error:', err);
        btn.innerHTML = '<i class="fas fa-times"></i> خطأ بالحفظ';
    });
}

// ==========================================
// [12] مكتبة التكتيكات (TACTICS LIBRARY MODALS)
// ==========================================
function openTacticsLibrary() {
    const modal = document.getElementById('library-modal');
    const grid = document.getElementById('tacticGrid');

    if (!modal || !grid) {
        console.error("الـ IDs غير موجودة: library-modal / tacticGrid");
        return;
    }

    grid.innerHTML = futsalTactics.map(t => `
        <div class="tactic-card" onclick="prepareTactic('${t.id}')">
            <div style="font-size: 2.5rem; margin-bottom:10px;">${t.icon}</div>
            <strong style="color:#ffcc00; font-size:1.1rem; display:block;">${t.name}</strong>
        </div>
    `).join('');

    modal.style.setProperty('display', 'flex', 'important');
}

function closeLibrary() {
    const modal = document.getElementById('library-modal');
    if (modal) modal.style.display = 'none';
}

function prepareTactic(id) {
    activeSelectedTactic = futsalTactics.find(t => t.id === id);

    const insText = document.getElementById('instruction-text');
    const insBox = document.getElementById('tactic-instructions');

    if (activeSelectedTactic && insText && insBox) {
        insText.innerText = activeSelectedTactic.ins;
        insBox.style.display = 'block';
    }

    setTimeout(() => {
        closeLibrary();
        const teamSelector = document.getElementById('team-selector-modal');
        if (teamSelector) teamSelector.style.display = 'flex';
    }, 1500);
}

function applyTacticToTeam(teamTag) {
    if (!activeSelectedTactic) return;

    const prefix = teamTag === 'A' ? 'R' : 'B';
    const isAway = teamTag === 'B';

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

        try {
            player.animate(
                [
                    { transform: 'translate(-50%, -50%) scale(1)' },
                    { transform: 'translate(-50%, -50%) scale(1.08)' },
                    { transform: 'translate(-50%, -50%) scale(1)' }
                ],
                { duration: 420, easing: 'ease-out' }
            );
        } catch (_) {}

        setTimeout(() => { player.style.transition = ""; }, 1100);
    }

    closeTeamSelector();
    showNotification('radar', `تم تطبيق التكتيك على فريق ${teamTag} بنجاح! ⚽`);
}

function closeTeamSelector() {
    const modal = document.getElementById('team-selector-modal');
    if (modal) modal.style.display = 'none';
}
// ==========================================
// [13] أخذ لقطة الشاشة (SCREENSHOT)
// ==========================================
function takeScreenshot() {
    const wrapper = document.getElementById('tactical-pitch-wrapper');
    const btn = document.querySelector('.screenshot-btn');
    if (!wrapper || !btn) return;

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';

    html2canvas(wrapper, {
        backgroundColor: '#14532d',
        useCORS: true,
        scale: 2
    }).then(canvas => {
        const link = document.createElement('a');
        const ts = new Date();
        link.download = `Taamen2026-Tactics-${ts.getTime()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        btn.innerHTML = '<i class="fas fa-check"></i> تم الحفظ!';
        setTimeout(() => { btn.innerHTML = originalText; }, 2000);
    }).catch(err => {
        console.error('Screenshot error:', err);
        btn.innerHTML = '<i class="fas fa-times"></i> خطأ بالحفظ';
    });
}

//--------------------------------
// 1. نظام الظهور عند السكرول (Scroll Reveal)
const observerOptions = { threshold: 0.2 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

// 2. تعبئة بيانات الصفحة الرئيسية (مثال)
function updateHomeStats() {
    // هون بنجيب أول لاعب من جدول الإحصائيات
    const topScorerEl = document.getElementById('top-scorer');
    const bestTeamEl = document.getElementById('best-team');
    
    if(topScorerEl) topScorerEl.innerText = "عمر الخليل (12 هدف)"; 
    if(bestTeamEl) bestTeamEl.innerText = "فريق النخبة A";
}

// 3. عداد الحجز المبسط
function updateHomeBookingTimer() {
    const countdownEl = document.getElementById('match-countdown');
    const badgeEl = document.getElementById('booking-badge');
    
    // مثال: موعد المباراة القادمة
    const nextMatch = new Date();
    nextMatch.setHours(22, 0, 0); // الساعة 10 بالليل

    const now = new Date();
    const diff = nextMatch - now;

    if (diff > 0) {
        const hh = String(Math.floor(diff / 3600000)).padStart(2, '0');
        const mm = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        if(countdownEl) countdownEl.innerText = `${hh}:${mm}:00`;
        if(badgeEl) {
            badgeEl.innerText = "قادمة";
            badgeEl.style.background = "#d2ff20";
            badgeEl.style.color = "#000000";
        }
    }
}

// تشغيل الوظائف عند التحميل
window.addEventListener('DOMContentLoaded', () => {
    updateHomeStats();
    setInterval(updateHomeBookingTimer, 1000);
});

//----------------
function toggleMenu() {
    const menu = document.getElementById('navMenu');
    menu.classList.toggle('active');
    
    // أنيميشن خفيف لزر الهامبرغر نفسه (اختياري)
    const spans = document.querySelectorAll('.hamburger span');
    // بتقدر تضيف هون كود يخلي الزر يصير X لما يفتح
}

// إغلاق القائمة لو ضغط المستخدم بره المنيو
document.addEventListener('click', (e) => {
    const menu = document.getElementById('navMenu');
    const hamburger = document.querySelector('.hamburger');
if (menu && hamburger && !menu.contains(e.target) && !hamburger.contains(e.target) && menu.classList.contains('active')) {        menu.classList.remove('active');
    }
});
//________________________________________
function injectGlobalUIStyles() {
    if (document.getElementById('taamen-global-ui-styles')) return;

    const style = document.createElement('style');
    style.id = 'taamen-global-ui-styles';
    style.textContent = `
        .glass-panel,
        .glass-toast,
        .tactic-card,
        .prayer-unit,
        .tilt-card,
        .hourly-item {
            border-radius: 18px;
            backdrop-filter: blur(14px);
            transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, opacity .18s ease;
        }

        .glass-panel:hover,
        .tactic-card:hover,
        .prayer-unit:hover,
        .tilt-card:hover,
        .hourly-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 16px 40px rgba(0,0,0,.24);
        }

        .soft-focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(255,215,0,.15);
        }

        .fade-in-up {
            animation: fadeInUp .28s ease-out;
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
}
// ==========================================
// [14] التهيئة والتشغيل الأساسي (INITIALIZATION)
// ==========================================
window.onload = () => {window.addEventListener('DOMContentLoaded', () => {
    injectGlobalUIStyles();
    updateHomeStats();
    renderStats();
    renderMatches();
    applyDynamicTheme();
    initShootingStars();
    initTilt();
    initPrayersSystem();
    updateWeatherSystem();
    updateFieldIcons();
    updateHeaderClock();
    updateBookingTimer();

    setInterval(updateHeaderClock, 1000);
    setInterval(updateBookingTimer, 1000);
});
    // تشغيل فوري عشان ما ننتظر ثانية
    updateHeaderClock();
    updateBookingTimer();
    
    // 3. تعبئة الجداول والأرشيف
    renderStats();
    renderMatches();
    
    // 4. تأثير الهيدر العلوي عند النزول
    window.addEventListener('scroll', () => {
        const header = document.getElementById('topHeader');
        if (header) {
            if (window.scrollY > 50) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        }
    });

    // 5. تفعيل حركة الماوس للبطاقة التفاعلية (اللي طلبته)
    const mouseCard = document.getElementById('mouse-move-card');
    if (mouseCard) {
        window.addEventListener('mousemove', (e) => {
            let x = (window.innerWidth / 2 - e.pageX) / 25;
            let y = (window.innerHeight / 2 - e.pageY) / 25;
            mouseCard.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
        });
    }
};

// 1. دالة تنسيق الوقت (بتحول من نظام 24 لنظام 12 ساعة بالعربي)
function format12Hour(hours) {
    const ampm = hours >= 12 ? 'مساءً' : 'صباحاً';
    let h = hours % 12;
    h = h ? h : 12; // إذا كانت الساعة 0 (نص الليل) بخليها 12
    return { hours: h, ampm: ampm };
}

// 2. دالة تحديث الساعة العلوية (اللي بتناديها من الـ setInterval)
function updateHeaderClock() {
    const clockEl = document.getElementById('header-clock');
    if (!clockEl) return;

    const now = new Date();
    const timeInfo = format12Hour(now.getHours());
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    
    // هيك بتطلع مثلاً: 10:30:05 مساءً
    clockEl.innerText = `${timeInfo.hours}:${mins}:${secs} ${timeInfo.ampm}`;
}

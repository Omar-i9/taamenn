/**
 * ============================================================================
 * 🏆 تأمين 2026 | الإصدار الرمضاني البلاتيني (GDMi)
 * 👨‍💻 المطور: عمر (Omar System)
 * ⚙️ الوصف: محرك المنصة الرئيسي (التكتيكات، الطقس، المواقيت، الأرشيف، الإحصائيات)
 * 🛠️ التحديث الأخير: تمت إزالة شريط التنقل السفلي والاعتماد على הـ Header العلوي فقط
 * ============================================================================
 */

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
function showNotification(pageId) {
    // 1. بندور على الحاوية، إذا مش موجودة بنعملها فوراً
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }

    // 2. بنجيب رسالة عشوائية من مصفوفة الرسائل عندك
    const messages = systemMessages[pageId] || ["مرحباً بك في تأمين 26"];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    
    // 3. بنعمل "الكارد الزجاجي"
    const toast = document.createElement('div');
    toast.className = 'glass-toast'; // هاد الكلاس اللي عطيته لك بالـ CSS
    toast.innerHTML = `
        <i class="fas fa-bolt-lightning toast-icon" style="color:#ffd700;"></i>
        <span>${randomMsg}</span>
    `;
    
    container.appendChild(toast);

    // 4. الحركات (تظهر وتختفي)
    setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(0)'; }, 100);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => { toast.remove(); }, 500); 
    }, 4000);
}
// دالة التنقل المصلحة
function navigate(pageId, element) {
    try {
        // 1. إخفاء كل الصفحات
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
            page.style.display = 'none';
        });

        // 2. إظهار الصفحة المطلوبة
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            targetPage.style.display = 'block';
        }

        // 3. تحديث شكل الأزرار
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        if (element) element.classList.add('active');

    } catch (error) {
        console.error("Navigation Error: ", error);
    }
}
// ==========================================
// [5] نظام الثيم الذكي (DAY / NIGHT THEME)
// ==========================================
function toggleTheme() {
    const body = document.body;
    const btnIcon = document.querySelector('#themeBtn i');
    
    if (body.classList.contains('day-mode')) {
        body.classList.remove('day-mode');
        body.classList.add('night-mode');
        if (btnIcon) {
            btnIcon.classList.remove('fa-sun');
            btnIcon.classList.add('fa-moon');
        }
        showNotification('home', "تم تفعيل الوضع الليلي 🌙"); // خدعة صغيرة لعرض إشعار
    } else {
        body.classList.remove('night-mode');
        body.classList.add('day-mode');
        if (btnIcon) {
            btnIcon.classList.remove('fa-moon');
            btnIcon.classList.add('fa-sun');
        }
    }
}

function applyDynamicTheme() {
    const hour = new Date().getHours();
    const body = document.body;
    const btnIcon = document.querySelector('#themeBtn i');

    // تفعيل وضع النهار من الساعة 6 صباحاً حتى 6 مساءً
    if (hour >= 6 && hour < 18) {
        body.classList.remove('night-mode');
        body.classList.add('day-mode');
        if(btnIcon) btnIcon.className = 'fas fa-sun';
        console.log("Omar System: Day Mode Activated 🌞");
    } else {
        body.classList.remove('day-mode');
        body.classList.add('night-mode');
        if(btnIcon) btnIcon.className = 'fas fa-moon';
        console.log("Omar System: Night Mode Activated 🌙");
    }
}

// ==========================================
// [6] التأثيرات البصرية (CURSOR, STARS, TILT)
// ==========================================
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (cursorDot && cursorOutline) {
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 200, fill: "forwards" });
    });
}

function initShootingStars() {
    const container = document.getElementById('starsContainer');
    if (!container) return;
    
    for (let i = 0; i < 150; i++) {
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
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
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
    // تحديد الـ MVP من كل فريق بناءً على التقييم r
    const mvpElite = statsElite.reduce((prev, current) => (prev.r > current.r) ? prev : current);
    const mvpChallenge = statsChallenge.reduce((prev, current) => (prev.r > current.r) ? prev : current);

    document.querySelectorAll('.player-token').forEach(token => {
        const playerName = token.getAttribute('data-name');
        const pData = [...statsElite, ...statsChallenge].find(p => p.name === playerName);

        if (pData) {
            // تنظيف قديم
            token.classList.remove('mvp-glow');
            token.querySelectorAll('.goal-badge, .assist-badge').forEach(b => b.remove());

            // إضافة توهج الـ MVP
            if (playerName === mvpElite.name || playerName === mvpChallenge.name) {
                token.classList.add('mvp-glow');
            }

            // أيقونة الأهداف أعلى اليمين
            if (pData.g > 0) {
                const gBadge = document.createElement('span');
                gBadge.className = 'goal-badge';
                gBadge.innerHTML = '⚽';
                token.appendChild(gBadge);
            }

            // أيقونة الأسيست أعلى اليسار
            if (pData.a > 0) {
                const aBadge = document.createElement('span');
                aBadge.className = 'assist-badge';
                aBadge.innerHTML = '🦶';
                token.appendChild(aBadge);
            }
        }
    });
}
// دالة فرعية لتحديث أيقونات الملعب والتوهج
function updateFieldIcons() {
    const mvpElite = statsElite.reduce((prev, curr) => (curr.r > prev.r ? curr : prev));
    const mvpChallenge = statsChallenge.reduce((prev, curr) => (curr.r > prev.r ? curr : prev));

    document.querySelectorAll('.player-token').forEach(token => {
        const playerName = token.getAttribute('data-name');
        const pData = [...statsElite, ...statsChallenge].find(p => p.name === playerName);

        if (pData) {
            // تنظيف أي أيقونات قديمة مضافة "داخل" التوكن
            token.classList.remove('mvp-glow');
            token.querySelectorAll('.goal-badge, .assist-badge').forEach(b => b.remove());

            // إضافة التوهج للـ MVP
            if (playerName === mvpElite.name || playerName === mvpChallenge.name) {
                token.classList.add('mvp-glow');
            }

            // إضافة أيقونة الأهداف ⚽ داخل اللاعب
            if (pData.g > 0) {
                const gBadge = document.createElement('span');
                gBadge.className = 'goal-badge';
                gBadge.innerHTML = '⚽';
                token.appendChild(gBadge); // هون السر: ضفناها للتوكن نفسه
            }

            // إضافة أيقونة الأسيست 🦶 داخل اللاعب
            if (pData.a > 0) {
                const aBadge = document.createElement('span');
                aBadge.className = 'assist-badge';
                aBadge.innerHTML = '🦶';
                token.appendChild(aBadge); // هيك رح تلحق اللاعب وين ما تحركه
            }
        }
    });
}

function renderMatches() {
    const archiveContainer = document.getElementById('matchHistoryContainer');
    if (!archiveContainer) return;

    archiveContainer.innerHTML = matchHistoryArchive.map(m => `
        <div class="tilt-card" style="display:flex; justify-content:space-between; align-items:center; background: rgba(0, 10, 26, 0.7); border-color: rgba(255,255,255,0.1); margin-bottom: 15px;">
            <div style="text-align:center; flex:1;">
                <i class="fas fa-shield-alt" style="display:block; font-size:1.8rem; margin-bottom:8px; color:#a0aec0;"></i>
                <span style="font-weight:bold; font-size:1.1rem;">${m.t1}</span>
            </div>
            <div style="text-align:center; padding: 0 20px; flex:2;">
                <div style="font-family:'Orbitron'; font-size:2.2rem; color:var(--accent-cyan); text-shadow: 0 0 15px rgba(0,242,254,0.5); font-weight:900;">${m.s}</div>
                <div style="font-size:0.9rem; color:${m.st === 'انتهت' ? '#cbd5e0' : 'var(--ramadan-gold)'}; margin-top:5px; font-weight:bold;">${m.st}</div>
                <div style="font-size:0.8rem; opacity:0.7; margin-top:4px;">${m.d}</div>
            </div>
            <div style="text-align:center; flex:1;">
                <i class="fas fa-tshirt" style="display:block; font-size:1.8rem; margin-bottom:8px; color:#a0aec0;"></i>
                <span style="font-weight:bold; font-size:1.1rem;">${m.t2}</span>
            </div>
        </div>
    `).join('');
    console.log("Omar System: Archive Matches Rendered Successfully 🏆");
}

// ==========================================
// [8] نظام المواقيت والعد التنازلي للصلاة (PRAYER SYSTEM)
// ==========================================
let currentPrayerInterval = null;
let globalPrayerData = [];

async function initPrayersSystem() {
    const lat = 31.5326; // الخليل
    const long = 35.0998;
    
    try {
        const date = new Date();
        const timestamp = Math.floor(date.getTime() / 1000);
const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${long}&method=1`);        const data = await res.json();
        
        const timings = data.data.timings;
        const hijri = data.data.date.hijri;
        
        const hijriDisplay = document.getElementById('hijriDate');
        if (hijriDisplay) {
            hijriDisplay.innerText = `${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`;
        }
        
        let prayers = [
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

        // إذا الوقت بعد العشاء
        if (!nextFound) globalPrayerData[0].isNext = true;

        renderPrayerCards(); 
        startDynamicPrayerCountdown();

    } catch (error) {
        console.error("Omar System Error - Prayers API:", error);
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
        const now = new Date();
        let nextPrayer = null;
        let targetDate = new Date();

        for (let i = 0; i < globalPrayerData.length; i++) {
            const p = globalPrayerData[i];
            const [h, m] = p.time.split(':');
            const pt = new Date();
            pt.setHours(h, m, 0, 0);
            
            if (now < pt) {
                nextPrayer = p;
                targetDate = pt;
                break;
            }
        }

        if (!nextPrayer) {
            nextPrayer = globalPrayerData[0]; // الفجر
            const [h, m] = nextPrayer.time.split(':');
            targetDate.setDate(targetDate.getDate() + 1);
            targetDate.setHours(h, m, 0, 0);
        }

        const diff = targetDate - now;
        const hh = String(Math.floor(diff / 3600000)).padStart(2, '0');
        const mm = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        const ss = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
        
        const counterEl = document.getElementById('dynamicPrayerCounter');
        const labelEl = document.getElementById('nextPrayerNameLabel');
        const sectionEl = document.getElementById('dynamicTimerSection');
        
        if(counterEl) counterEl.innerText = `${hh}:${mm}:${ss}`;
        
        if(labelEl) {
            labelEl.innerText = `الوقت المتبقي لصلاة ${nextPrayer.name}`;
            if(nextPrayer.id === 'Maghrib' && sectionEl) {
                sectionEl.classList.add('maghrib-active');
                labelEl.innerText = `الوقت المتبقي لرفع أذان ${nextPrayer.name}`;
            } else if (sectionEl) {
                sectionEl.classList.remove('maghrib-active');
            }
        }
        
    }, 1000);
}

// ==========================================
// [9] نظام العد التنازلي للحجز والنفحات
// ==========================================
function updateBookingTimer() {
    const now = new Date();
    const day = now.getDay(); 
    const hour = now.getHours();
    const bookingCard = document.getElementById('bookingTimerCard');
    const title = document.getElementById('bookingTitle');
    const timerContainer = document.getElementById('timerContainer');
    
    if (!bookingCard || !title || !timerContainer) return;

    if (day === 5 && hour >= 20 && hour < 21) {
        if (!bookingCard.classList.contains('booking-active')) {
            bookingCard.classList.add('booking-active');
            title.innerHTML = '<span style="font-size: 2rem;">🔥 الحجز مفتوح الآن!</span>';
            title.style.color = "var(--success-green)";
            timerContainer.innerHTML = '<div class="booking-open-text" style="font-size:2rem; color:#2ecc71; font-weight:bold;">سارع بحجز مكانك!</div>';
        }
        return;
    }

    if (bookingCard.classList.contains('booking-active')) {
        bookingCard.classList.remove('booking-active');
        title.innerText = "العد التنازلي للحجز (الجمعة 20:00 - 21:00)";
        title.style.color = "var(--accent-cyan)";
        timerContainer.innerHTML = `
            <div class="w-item"><span id="b-days" style="font-size: 2.5rem;">00</span><small>يوم</small></div>
            <div class="w-item"><span id="b-hours" style="font-size: 2.5rem;">00</span><small>ساعة</small></div>
            <div class="w-item"><span id="b-mins" style="font-size: 2.5rem;">00</span><small>دقيقة</small></div>
            <div class="w-item"><span id="b-secs" style="font-size: 2.5rem;">00</span><small>ثانية</small></div>
        `;
    }

    let target = new Date();
    target.setDate(now.getDate() + (5 + 7 - now.getDay()) % 7);
    target.setHours(20, 0, 0, 0);
    
    if (now > target) {
         target.setDate(target.getDate() + 7);
    }

    const diff = target - now;
    const dEl = document.getElementById('b-days');
    if(dEl) {
        dEl.innerText = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
        document.getElementById('b-hours').innerText = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        document.getElementById('b-mins').innerText = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        document.getElementById('b-secs').innerText = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
    }
}

function rotateDhikr() {
    const el = document.getElementById('dhikrDisplay');
    if (el) {
        el.style.opacity = '0';
        setTimeout(() => {
            el.innerText = dhikrList[Math.floor(Math.random() * dhikrList.length)];
            el.style.opacity = '1';
        }, 500);
    }
}

// ==========================================
// [10] نظام الطقس المربوط بالخليل (WEATHER SYSTEM)
// ==========================================
async function updateWeatherSystem() {
    const lat = "31.5326"; 
    const lon = "35.0998";
    const apiKey = "95213cb0c3d0aeb490b82a58075a8999"; 
    
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}&lang=ar`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}&lang=ar`;

    try {
        const resCurr = await fetch(currentUrl);
        const dataCurr = await resCurr.json();
        
        if(dataCurr.cod === 200) {
            const temp = Math.round(dataCurr.main.temp);
            document.getElementById('w-temp').innerText = `${temp}°C`;
            document.getElementById('w-desc').innerText = dataCurr.weather[0].description;
            document.getElementById('w-wind').innerText = `${dataCurr.wind.speed} م/ث`;
            document.getElementById('w-hum').innerText = `${dataCurr.main.humidity}%`;
            
            // تحديث الشريط العلوي (Status Bar) إن وجد
            const weatherStatus = document.getElementById('weather-status');
            if(weatherStatus) {
                weatherStatus.innerHTML = `<i class="fas fa-location-dot"></i> الخليل: ${temp}°C`;
            }

            const options = { weekday: 'long', month: 'long', day: 'numeric' };
            document.getElementById('w-date').innerText = new Date().toLocaleDateString('ar-EG', options);
        }

        const resFore = await fetch(forecastUrl);
        const dataFore = await resFore.json();

        const wrapper = document.getElementById('hourly-wrapper');
        if (wrapper && dataFore.list) {
            wrapper.innerHTML = '';
            dataFore.list.slice(0, 16).forEach(hour => {
                const time = new Date(hour.dt * 1000).getHours() + ":00";
                const temp = Math.round(hour.main.temp);
                const icon = hour.weather[0].icon;
                
                wrapper.innerHTML += `
                    <div class="hourly-item">
                        <span class="h-time">${time}</span>
                        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather">
                        <span class="h-temp">${temp}°</span>
                    </div>
                `;
            });
        }
        console.log("Omar System: Weather Synced (Hebron) ✅");
    } catch (e) {
        console.error("Omar System Error - Weather API:", e);
    }
}

// ==========================================
// [11] المحرك التكتيكي المتطور (FUTSAL TACTICAL ENGINE)
// ==========================================
class FutsalTacticalEngine {
    constructor() {
        this.pitch = document.getElementById('tactical-futsal-pitch');
        this.viewToggle = document.getElementById('tactical-view-toggle');
        this.coordBox = document.getElementById('live-coord');
        this.coordLabel = document.getElementById('coord-label');

        this.draggedElement = null;
        this.is3D = true;
        this.activeMenu = null;

        // كابتن واحد لكل فريق
        this.captainByTeam = { home: null, away: null };

        if (this.pitch) this.init();
    }

    init() {
        this.setupPlayers();
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
            captain: localStorage.getItem(this.getPlayerStorageKey(id, 'captain')) === '1'
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
    }

    clearPlayerState(id) {
        localStorage.removeItem(this.getPlayerStorageKey(id, 'name'));
        localStorage.removeItem(this.getPlayerStorageKey(id, 'role'));
        localStorage.removeItem(this.getPlayerStorageKey(id, 'instr'));
        localStorage.removeItem(this.getPlayerStorageKey(id, 'captain'));
    }

    setupPlayers() {
        const teamA = [
            { id: 'R1', name: 'محمد علي', x: 8, y: 50, color: 'team-red', team: 'home' },
            { id: 'R2', name: 'كريم', x: 25, y: 25, color: 'team-red', team: 'home' },
            { id: 'R3', name: 'يوسف', x: 25, y: 75, color: 'team-red', team: 'home' },
            { id: 'R4', name: 'عمر', x: 40, y: 30, color: 'team-red', team: 'home' },
            { id: 'R5', name: 'هاني', x: 45, y: 70, color: 'team-red', team: 'home' }
        ];

        const teamB = [
            { id: 'B1', name: 'فتحي', x: 92, y: 50, color: 'team-blue', team: 'away' },
            { id: 'B2', name: 'عمر', x: 75, y: 25, color: 'team-blue', team: 'away' },
            { id: 'B3', name: 'كريم', x: 75, y: 75, color: 'team-blue', team: 'away' },
            { id: 'B4', name: 'مناصرة', x: 60, y: 30, color: 'team-blue', team: 'away' },
            { id: 'B5', name: 'احمد', x: 55, y: 70, color: 'team-blue', team: 'away' }
        ];

        [...teamA, ...teamB].forEach(p => this.createPlayer(p));
    }

    createPlayer(config) {
        const saved = this.getSavedPlayerState(config.id);

        if (saved.name) config.name = saved.name;

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

        // استرجاع الاسم/الدور/التعليمات/الكابتن إن كانت محفوظة
        this.applySavedState(node);

        this.updateTacticalRole(node, config.x, config.y);
    }

    applySavedState(playerNode) {
        const playerId = playerNode.id;
        const saved = this.getSavedPlayerState(playerId);

        const nameEl = playerNode.querySelector(`#name-${playerId}`);
        const roleEl = playerNode.querySelector(`#team-role-${playerId}`);
        const instrEl = playerNode.querySelector(`#instr-${playerId}`);
        const captainEl = playerNode.querySelector(`#captain-${playerId}`);
        const roleBadge = playerNode.querySelector(`#role-${playerId}`);

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
            this.captainByTeam[playerNode.dataset.team] = playerId;
        } else {
            if (captainEl) captainEl.style.display = 'none';
        }

        if (roleBadge && roleBadge.innerText === '--') {
            // لا شيء
        }
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
                إعدادات ${teamKey === 'home' ? 'النخبة' : 'التحدي'} - ${playerId}
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
        const nameInput = menu.querySelector('#tam-player-name');
        const roleInput = menu.querySelector('#tam-team-role');
        const instrInput = menu.querySelector('#tam-instr');

        const updateCaptainState = (newRole) => {
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
                alert('هذا الفريق يملك كابتن بالفعل. أزل الكابتن الحالي أولاً ثم عيّن لاعباً جديداً.');
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

            roleInput.value = '';
            instrInput.value = '';
            nameInput.value = playerNode.dataset.defaultName || playerId;
        });

        closeBtn.addEventListener('click', () => {
            this.closeAdvancedMenu();
        });

        setTimeout(() => {
            const onBodyClick = (ev) => {
                if (!menu.contains(ev.target) && !playerNode.contains(ev.target)) {
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
        // منع السحب بزر الفأرة الأيمن
        if (e.button !== 0) return;

        this.draggedElement = el;
        el.setPointerCapture(e.pointerId);

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

        this.updateTacticalRole(this.draggedElement, x, y);
    }

    updateTacticalRole(el, x, y) {
        const team = el.dataset.team;
        const badge = el.querySelector('.role-badge-bottom');
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

    onEnd() {
        if (this.draggedElement) this.draggedElement = null;
        if (this.coordBox) this.coordBox.style.display = 'none';
    }
}

// أخذ لقطة شاشة للملعب وحفظها كصورة
function takeScreenshot() {
    const wrapper = document.getElementById('tactical-pitch-wrapper');
    if (!wrapper) return;

    html2canvas(wrapper, {
        backgroundColor: null,
        useCORS: true,
        scale: 2
    }).then(canvas => {
        const link = document.createElement('a');
        const ts = new Date();
        const name = `tamin-formation-${ts.getFullYear()}-${ts.getMonth() + 1}-${ts.getDate()}-${ts.getHours()}${ts.getMinutes()}${ts.getSeconds()}.png`;
        link.download = name;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }).catch(err => {
        console.error('Screenshot error', err);
    });
}
// ==========================================
// [12] مكتبة التكتيكات (TACTICS LIBRARY MODALS)
// ==========================================
// دالة فتح المكتبة - عمر ديزاين 2026
function openTacticsLibrary() {
    const modal = document.getElementById('library-modal');
    const grid = document.getElementById('tacticGrid');

    if (!modal || !grid) return;

    // بناء الكروت من المصفوفة الموجودة في أول السكربت
    grid.innerHTML = futsalTactics.map(t => `
        <div class="tactic-card" onclick="prepareTactic('${t.id}')">
            <div style="font-size: 2.5rem;">${t.icon}</div>
            <div style="color: gold; font-weight: bold; margin-top: 5px;">${t.name}</div>
        </div>
    `).join('');

    // إظهار المودال بقوة
    modal.style.display = 'flex';
}

function closeLibrary() {
    const modal = document.getElementById('library-modal');
    if (modal) {
        modal.style.display = 'none';
        // إذا كنت بتعمل غبش لعناصر تانية (زي الهيدر أو المين) شيله هون
        document.body.style.overflow = 'auto'; // يرجع السكرول للشاشة
    }
}
function openTacticsLibrary() {
    // 1. لازم نعرّف المتغيرات أول شي عشان السكربت ما يضيع
    const modal = document.getElementById('library-modal'); 
    const grid = document.getElementById('tacticGrid');

    // 2. فحص أمان (عشان لو الـ IDs غلط ما يضرب السكربت)
    if (!modal || !grid) {
        console.error("يا عمر، الـ IDs مش موجودة بالـ HTML! شيك على library-modal و tacticGrid");
        return;
    }

    // 3. بناء المحتوى من مصفوفة التكتيكات
    grid.innerHTML = futsalTactics.map(t => `
        <div class="tactic-card" onclick="prepareTactic('${t.id}')">
            <div style="font-size: 2.5rem; margin-bottom:10px;">${t.icon}</div>
            <strong style="color:#ffcc00; font-size:1.1rem; display:block;">${t.name}</strong>
        </div>
    `).join('');
    
    // 4. إظهار المودال (استخدمنا المتغير modal اللي عرفناه فوق)
    modal.style.setProperty('display', 'flex', 'important');
}
function prepareTactic(id) {
    activeSelectedTactic = futsalTactics.find(t => t.id === id);
    const insText = document.getElementById('instruction-text');
    const insBox = document.getElementById('tactic-instructions');
    
    if (insText && insBox) {
        insText.innerText = activeSelectedTactic.ins;
        insBox.style.display = 'block';
    }
    
    // إغلاق المكتبة وفتح اختيار الفريق بعد ثانية ليقرأ التعليمات
    setTimeout(() => {
        closeLibrary();
        document.getElementById('team-selector-modal').style.display = 'flex';
    }, 1500);
}

function applyTacticToTeam(teamTag) {
    if (!activeSelectedTactic) return;

    // teamTag سيكون 'A' (فريق النخبة/الأحمر) أو 'B' (فريق التحدي/الأزرق)
    // معرفات اللاعبين هي R1..R5 للفريق A ، و B1..B5 للفريق B
    const prefix = teamTag === 'A' ? 'R' : 'B';
    const isAway = teamTag === 'B';

    for (let i = 1; i <= 5; i++) {
        const player = document.getElementById(`${prefix}${i}`);
        if (player) {
            let posData = activeSelectedTactic.pos[`p${i}`];
            
            // حساب الإحداثيات (قلب الملعب لفريق B)
            let finalTop = posData.t;
            let finalLeft = isAway ? (100 - posData.l) : posData.l;

            player.style.transition = "all 0.8s cubic-bezier(0.25, 1, 0.5, 1)";
            player.style.top = `${finalTop}%`;
            player.style.left = `${finalLeft}%`;
            
            setTimeout(() => { player.style.transition = ""; }, 1000);
        }
    }
    
    closeTeamSelector();
    showNotification('radar', `تم تطبيق التكتيك على فريق ${teamTag} بنجاح! ⚽`);
}

function closeLibrary() { 
    const modal = document.getElementById('library-modal');
    if(modal) modal.style.display = 'none'; 
}

function closeTeamSelector() { 
    const modal = document.getElementById('team-selector-modal');
    if(modal) modal.style.display = 'none'; 
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

// ==========================================
// [14] التهيئة والتشغيل الأساسي (INITIALIZATION)
// ==========================================
window.onload = () => {
    console.log("%c TAAMEN 2026 PLATINUM SYSTEM ONLINE ", "background: #ffd700; color: #000; font-weight: bold; font-size: 14px;");

    // 1. تشغيل المحركات الأساسية
    new FutsalTacticalEngine();
    initShootingStars();
    initTilt();
    initPrayersSystem(); 
    updateWeatherSystem();
    applyDynamicTheme();
    updateFieldIcons();

    // 2. تحديثات الساعة والحجز (النظام الجديد الموحد)
    // ملاحظة: شطبنا نظام setInterval القديم اللي كان تحت في "رقم 4"
    setInterval(updateHeaderClock, 1000); // الساعة اللي فوق (نظام 12 ساعة)
    setInterval(updateBookingTimer, 1000); // عداد الجمعة
    
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

// 3. دالة حساب وقت الحجز (كل يوم جمعة الساعة 5 مساءً)
function updateBookingTimer() {
    const countdownEl = document.getElementById('match-countdown');
    if (!countdownEl) return;

    const now = new Date();
    let target = new Date();
    
    // حساب كم يوم باقي للجمعة (الجمعة ترتيبها 5 في أيام الأسبوع)
    let dayDiff = (5 - now.getDay() + 7) % 7;
    
    target.setDate(now.getDate() + dayDiff);
    target.setHours(17, 0, 0, 0); // الساعة 5 مساءً (توقيت الحجز)

    // إذا إحنا يوم جمعة والساعة صارت بعد 5، نحسب للجمعة الجاي
    if (dayDiff === 0 && now > target) {
        target.setDate(target.getDate() + 7);
    }

    const diff = target - now;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
    const mins = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    const secs = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');

    // عرض العداد: أيام : ساعات : دقائق : ثواني
    countdownEl.innerText = `${days}d ${hours}:${mins}:${secs}`;
};

	                // ==========================================
	                // [1] DATABASE OF NOTIFICATIONS (رسائل عشوائية)
	                // ==========================================
	                const pageMessages = {
	                    'home': [
	                        "أهلاً بعودتك أيها البطل! 🏆",
	                        "هل أنت مستعد للمجد اليوم؟ 🔥",
	                        "رمضان شهر العبادة.. والرياضة! 🌙",
	                        "الملعب يشتاق لأقدام الأبطال ⚽",
	                        "ركّز على هدفك، النصر قادم ✨"
	                    ],
	                    'cannon': [
	                        "صم وافطر على خير 🍲",
	                        "تقبل الله منا ومنكم صالح الأعمال 🤲",
	                        "الوقت يمضي.. استغله في الطاعات ⏳",
	                        "لا تنس الدعاء عند الإفطار 🌙",
	                        "أذان المغرب هو أجمل لحظات اليوم ❤️"
	                    ],
	                    'booking': [
	                        "لا تتأخر.. الحجز في موعده! ⏰",
	                        "الجمعة تجمعنا على التحدي 🔥",
	                        "تأكد من جاهزيتك البدنية 💪",
	                        "المنافسة ستكون شرسة هذا الأسبوع! ⚔️",
	                        "هل حذائك جاهز للمعركة؟ 👟"
	                    ],
	                    'radar': [
	                        "الأرقام لا تكذب أبداً 📊",
	                        "ادرس خصمك جيداً قبل المباراة 🧐",
	                        "التمركز الصحيح هو مفتاح الفوز 🔑",
	                        "هل أنت ضمن تشكيلة النخبة؟ ⭐",
	                        "حلل أداءك لترتفع بمستواك 📈"
	                    ],
	                    'matches': [
	                        "التاريخ يكتبه المنتصرون 📜",
	                        "تعلم من الهزيمة لتصنع النصر 🛡️",
	                        "سجلات المجد خالدة هنا 💎",
	                        "راجع نتائجك وحسن أخطاءك 🔄",
	                        "مباريات لا تنسى في الذاكرة 🧠"
	                    ],
	                    'weather': [
	                        "الجو مناسب جداً للعب اليوم ☁️",
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
	                // [2] NOTIFICATION LOGIC
	                // ==========================================
	                function showNotification(pageId) {
	                    const container = document.getElementById('notification-container');
	                    const messages = pageMessages[pageId] || ["مرحباً بك في تأمين 2026"];
	                    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
	                    const toast = document.createElement('div');
	                    toast.className = 'toast-notification';
	                    toast.innerHTML = `
	                        <i class="fas fa-bell toast-icon"><\/i>
	                        <span>${randomMsg}<\/span>
	                    `;
	                    container.appendChild(toast);

	                    setTimeout(() => { toast.classList.add('show'); }, 100);
	                    setTimeout(() => {
	                        toast.classList.remove('show');
	                        setTimeout(() => { toast.remove(); }, 500); 
	                    }, 4000);
	                }

	                // ==========================================
	                // [3] SYSTEM INIT & WELCOME SCREEN
	                // ==========================================
	                function enterSite() {
	                    const screen = document.getElementById('welcome-screen');
	                    screen.style.opacity = '0';
	                    screen.style.transform = 'scale(1.1)';
	                    setTimeout(() => {
	                        screen.style.display = 'none';
	                        navigate('home'); 
	                    }, 1000);
	                }

	                // ==========================================
	                // [4] NAVIGATION SYSTEM (UPDATED WITH NOTIFICATIONS)
	                // ==========================================
	                function navigate(pageId, btnElement = null) {
	                    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
	                    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

	                    const targetPage = document.getElementById(pageId);
	                    if (targetPage) {
	                        targetPage.classList.add('active');
	                        window.scrollTo({ top: 0, behavior: 'smooth' });
	                        showNotification(pageId);
	                    }

	                    if (btnElement) {
	                        btnElement.classList.add('active');
	                    } else {
	                        const correspondingBtn = document.querySelector(`.nav-item[onclick*="'${pageId}'"]`);
	                        if (correspondingBtn) correspondingBtn.classList.add('active');
	                    }
	                }

	                // ==========================================
	                // [5] CUSTOM CURSOR LOGIC
	                // ==========================================
	                const cursorDot = document.querySelector('.cursor-dot');
	                const cursorOutline = document.querySelector('.cursor-outline');

	                window.addEventListener('mousemove', (e) => {
	                    const posX = e.clientX;
	                    const posY = e.clientY;
	                    cursorDot.style.left = `${posX}px`;
	                    cursorDot.style.top = `${posY}px`;
	                    cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 200, fill: "forwards" });
	                });

	                // ==========================================
	                // [6] SHOOTING STARS GENERATOR
	                // ==========================================
	                function initShootingStars() {
	                    const container = document.getElementById('starsContainer');
	                    for (let i = 0; i < 150; i++) {
	                        const star = document.createElement('div');
	                        star.className = 'star';
	                        const size = Math.random() * 3;
	                        star.style.width = `${size}px`; star.style.height = `${size}px`;
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

	                // ==========================================
	                // [7] SMOOTH TILT EFFECT
	                // ==========================================
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
	                // [8] RADAR TOGGLE & DATA POPULATION
	                // ==========================================
	         // نظام التبديل الذكي - لا يتأثر بعدد الأزرار المضافة
	         function toggleRadarMode(mode, element) {
	            const pitchView = document.getElementById('pitch-view');
	            const statsView = document.getElementById('stats-view');
	            
	            // 1. التبديل بين الحاويات
	            if (mode === 'pitch') {
	                if(pitchView) pitchView.style.display = 'block';
	                if(statsView) statsView.style.display = 'none';
	            } else {
	                if(pitchView) pitchView.style.display = 'none';
	                if(statsView) statsView.style.display = 'block';
	            }

	            // 2. تحديث شكل الأزرار (إزالة active من الجميع وإضافته للمضغوط فقط)
	            // نطبق هذا فقط على أزرار التبديل وليس زر المنظور
	            const btns = document.querySelectorAll('.radar-controls .radar-btn');
	            btns.forEach(btn => btn.classList.remove('active'));
	            
	            if (element) {
	                element.classList.add('active');
	            }
	         }

                 const statsElite = [
	                    { name: "عمر", g: 1, a: 4, r: 9.7 },
	                    { name: "يوسف", g: 5, a: 0, r: 10.0 },
	                    { name: "ارقم", g: 0, a: 0, r: 7.9 },
	                    { name: "مؤيد", g: 0, a: 0, r: 8.8 },
	                    { name: "هاني", g: 0, a: 1, r: 8.9 }
	                ];
	                const statsChallenge = [
	                    { name: "كريم", g: 2, a: 3, r: 9.8 },
	                    { name: "سنقرط", g: 0, a: 1, r: 8.7 },
	                    { name: "محمد", g: 0, a: 1, r: 8.0 },
	                    { name: "خضر", g: 5, a: 2, r: 10.0 },
	                    { name: "احمد", g: 0, a: 0, r: 8.1 }
	                ];
	                
	                function renderStats() {
	                    const createRows = (data) => data.map(p => `
	                        <tr>
	                            <td style="font-weight:bold; color:var(--ramadan-gold);">${p.name}<\/td>
	                            <td>${p.g}<\/td>
	                            <td>${p.a}<\/td>
	                            <td>${p.g + p.a}<\/td>
	                            <td><i class="fas fa-star" style="color:orange; font-size:0.7rem;"><\/i> ${p.r}<\/td>
	                        <\/tr>
	                    `).join('');
	                    document.getElementById('eliteTableBody').innerHTML = createRows(statsElite);
	                    document.getElementById('challengeTableBody').innerHTML = createRows(statsChallenge);
	                }

	                // ==========================================
	                // [9] DYNAMIC PRAYER TIMES SYSTEM (NEXT PRAYER LOGIC)
	                // ==========================================
	                let currentPrayerInterval = null;
	                let globalPrayerData = [];

	                async function initPrayersSystem() {
	                    // تثبيت إحداثيات الخليل، فلسطين كما طلبت
	                    const lat = 31.5326; 
	                    const long = 35.0998;
	                    
try {
    const date = new Date();
    const timestamp = Math.floor(date.getTime() / 1000);
    // جلب المواقيت للخليل
    const res = await fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${long}&method=1`);
    const data = await res.json();
    
    const timings = data.data.timings;
    const hijri = data.data.date.hijri;
    document.getElementById('hijriDate').innerText = `${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`;
    
    // 1. تخزين أوقات الصلاة
    let prayers = [
        { id: 'Fajr', name: 'الفجر', time: timings.Fajr },
        { id: 'Sunrise', name: 'الشروق', time: timings.Sunrise },
        { id: 'Dhuhr', name: 'الظهر', time: timings.Dhuhr },
        { id: 'Asr', name: 'العصر', time: timings.Asr },
        { id: 'Maghrib', name: 'المغرب', time: timings.Maghrib },
        { id: 'Isha', name: 'العشاء', time: timings.Isha }
    ];

    // 2. منطق التمييز الذكي (Next Prayer)
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    let nextFound = false;

    globalPrayerData = prayers.map(p => {
        const [h, m] = p.time.split(':').map(Number);
        const prayerMinutes = h * 60 + m;
        
        // تصفير أي تمييز سابق
        p.isNext = false; 

        // أول صلاة وقتها أكبر من وقتنا الحالي هي "الجاي"
        if (!nextFound && prayerMinutes > currentMinutes) {
            p.isNext = true;
            nextFound = true;
        }
        return p;
    });

    // حالة خاصة: إذا الوقت بعد العشاء، الصلاة الجاي هي الفجر
    if (!nextFound) {
        globalPrayerData[0].isNext = true;
    }

    // 3. رسم البطاقات وبدء العد التنازلي
    renderPrayerCards(); 
    startDynamicPrayerCountdown();

} catch (error) {
    console.error("حدث خطأ في جلب البيانات:", error);
}						 
	                }

	                function renderPrayerCards(activeId = '') {
	                    const container = document.getElementById('prayersContainer');
	                    if(!container) return;
	                    
	                    container.innerHTML = globalPrayerData.map(p => {
	                        let activeClass = '';
	                        if (p.id === activeId) {
	                            activeClass = p.id === 'Maghrib' ? 'active-maghrib' : 'active-next';
	                        }
	                        
	                        return `
	                            <div class="prayer-unit ${activeClass}" id="card-${p.id}">
	                                <div style="font-size:0.8rem; color:#888;">${p.name}<\/div>
	                                <div style="font-size:1.4rem; font-weight:bold; color:var(--ramadan-gold);">${p.time}<\/div>
	                            <\/div>
	                        `;
	                    }).join('');
	                }

	                function startDynamicPrayerCountdown() {
	                    if (currentPrayerInterval) clearInterval(currentPrayerInterval);
	                    
	                    currentPrayerInterval = setInterval(() => {
	                        const now = new Date();
	                        let nextPrayer = null;
	                        let targetDate = new Date();

	                        // البحث عن أول صلاة لم يحن وقتها بعد اليوم
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

	                        // إذا مرت العشاء، فالصلاة القادمة هي الفجر في اليوم التالي
	                        if (!nextPrayer) {
	                            nextPrayer = globalPrayerData[0]; // الفجر
	                            const [h, m] = nextPrayer.time.split(':');
	                            targetDate.setDate(targetDate.getDate() + 1);
	                            targetDate.setHours(h, m, 0, 0);
	                        }

	                        // تحديث واجهة المستخدم
	                        updateDynamicUI(nextPrayer, targetDate, now);
	                        
	                    }, 1000);
	                }

	                function updateDynamicUI(nextPrayer, targetDate, now) {
	                    const diff = targetDate - now;
	                    const hh = String(Math.floor(diff / 3600000)).padStart(2, '0');
	                    const mm = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
	                    const ss = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
	                    
	                    const counterEl = document.getElementById('dynamicPrayerCounter');
	                    const labelEl = document.getElementById('nextPrayerNameLabel');
	                    const sectionEl = document.getElementById('dynamicTimerSection');
	                    
	                    if(counterEl) counterEl.innerText = `${hh}:${mm}:${ss}`;
	                    
	                    if(labelEl) {
	                        if(nextPrayer.id === 'Maghrib') {
	                            labelEl.innerText = `الوقت المتبقي لرفع أذان ${nextPrayer.name}`;
	                            sectionEl.classList.remove('maghrib-active');
	                        }
	                    }
	                    
	                    // تحديث إبراز البطاقة في الشبكة السفلية
	                    renderPrayerCards(nextPrayer.id);
	                }

	                // ==========================================
	                // [10] BOOKING TIMER & DHIKR (UPDATED FOR 8-9 PM & ACTIVE STATE)
	                // ==========================================
	                function updateBookingTimer() {
	                    const now = new Date();
	                    const day = now.getDay(); 
	                    const hour = now.getHours();
	                    const bookingCard = document.getElementById('bookingTimerCard');
	                    const title = document.getElementById('bookingTitle');
	                    const timerContainer = document.getElementById('timerContainer');
	                    
	                    if (day === 5 && hour >= 20 && hour < 21) {
	                        if (!bookingCard.classList.contains('booking-active')) {
	                            bookingCard.classList.add('booking-active');
	                            title.innerHTML = '<span style="font-size: 2rem;">🔥 الحجز مفتوح الآن!<\/span>';
	                            title.style.color = "var(--success-green)";
	                            timerContainer.innerHTML = '<div class="booking-open-text">سارع بحجز مكانك!<\/div>';
	                        }
	                        return;
	                    }

	                    if (bookingCard.classList.contains('booking-active')) {
	                        bookingCard.classList.remove('booking-active');
	                        title.innerText = "العد التنازلي للحجز (الجمعة 20:00 - 21:00)";
	                        title.style.color = "var(--accent-cyan)";
	                        timerContainer.innerHTML = `
	                            <div class="w-item"><span id="b-days" style="font-size: 2.5rem;">00<\/span><small>يوم<\/small><\/div>
	                            <div class="w-item"><span id="b-hours" style="font-size: 2.5rem;">00<\/span><small>ساعة<\/small><\/div>
	                            <div class="w-item"><span id="b-mins" style="font-size: 2.5rem;">00<\/span><small>دقيقة<\/small><\/div>
	                            <div class="w-item"><span id="b-secs" style="font-size: 2.5rem;">00<\/span><small>ثانية<\/small><\/div>
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

	                const dhikrs = [
	                    "اللهم إنك عفو تحب العفو فاعف عنا",
	                    "سبحان الله وبحمده، عدد خلقه ورضا نفسه",
	                    "لا إله إلا الله وحده لا شريك له",
	                    "أستغفر الله العظيم وأتوب إليه",
	                    "اللهم صل وسلم على نبينا محمد"
	                ];
	                function rotateDhikr() {
	                    document.getElementById('dhikrDisplay').innerText = dhikrs[Math.floor(Math.random() * dhikrs.length)];
	                }

	                // ==========================================
	                // [11] WEATHER API (HARDCODED TO HEBRON)
	                // ==========================================
async function updateWeatherSystem() {
    const lat = "31.5326"; 
    const lon = "35.0998";
    const apiKey = "95213cb0c3d0aeb490b82a58075a8999"; // مفتاحك الجديد
    
    // روابط البيانات (الحالي + التوقعات)
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}&lang=ar`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}&lang=ar`;

    try {
        // 1. جلب وتحديث البطاقة الكبيرة (Current Weather)
        const resCurrent = await fetch(currentUrl);
        const dataCurr = await resCurrent.json();
        
        if(dataCurr.cod === 200) {
            document.querySelector('.temp-main').innerText = `${Math.round(dataCurr.main.temp)}°`;
            document.querySelector('.weather-desc').innerText = dataCurr.weather[0].description;
            document.querySelector('.humidity-val').innerText = `${dataCurr.main.humidity}%`;
            document.querySelector('.wind-val').innerText = `${dataCurr.wind.speed} م/ث`;
            // تحديث الأيقونة الكبيرة
            const bigIcon = dataCurr.weather[0].icon;
            document.querySelector('.big-weather-icon').src = `https://openweathermap.org/img/wn/${bigIcon}@4x.png`;
        }

        // 2. جلب وتحديث شريط الساعات (Hourly Forecast)
        const resForecast = await fetch(forecastUrl);
        const dataFore = await resForecast.json();

        const wrapper = document.getElementById('hourly-wrapper');
        if (wrapper && dataFore.list) {
            wrapper.innerHTML = '';
            // عرض أول 15 ساعة لتفعيل خاصية السحب
            dataFore.list.slice(0, 15).forEach(hour => {
                const time = new Date(hour.dt * 1000).getHours() + ":00";
                const temp = Math.round(hour.main.temp);
                const icon = hour.weather[0].icon;
                
                wrapper.innerHTML += `
                    <div class="hourly-item">
                        <span class="h-time">${time}</span>
                        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="icon">
                        <span class="h-temp">${temp}°</span>
                    </div>
                `;
            });
        }
        console.log("Omar System: All Weather Data Synced! ✅");
    } catch (error) {
        console.error("Weather Update Failed:", error);
    }
}

                    // ==========================================
	                // [12] MATCH HISTORY
	                // ==========================================
	                function renderMatches() {
	                    const matches = [
	                        {t1: "كريم", t2: "عمر", s: "6 - 9", st: "انتهت", d: "الجمعه 16 يناير"},
	                        {t1: "عمر", t2: "كريم", s: "7 - 10", st: "انتهت", d: "الجمعه 23 يناير"},
	                        {t1: "كريم التميمي", t2: "عمر & كريم", s: "8 - 7", st: "انتهت", d: "الجمعه 30 يناير"},
	                        {t1: "خضر", t2: "عمر & كريم", s: "4 - 5", st: "انتهت", d: "الجمعه 13 فبراير"},
	                        {t1: "كريم", t2: "عمر", s: "3 - 3", st: "انتهت", d: "الجمعه 20 فبراير"},      
	                        {t1: "عمر", t2: "كريم", s: "6 - 8", st: "انتهت", d: "الجمعه 27 فبراير"},
	                        {t1: "خضر", t2: "كريم", s: "13 - 7", st: "انتهت", d: "الجمعه 6 مارس"},
	                                      {t1: "عمر", t2: "كريم", s: "-  -", st: "محتملة", d: "الجمعه 13 مارس"},

	                    ];
	                    document.getElementById('matchHistoryContainer').innerHTML = matches.map(m => `
	                        <div class="tilt-card" style="display:flex; justify-content:space-between; align-items:center; background: rgba(0, 10, 26, 0.7); border-color: rgba(255,255,255,0.1);">
	                            <div style="text-align:center;">
	                                <i class="fas fa-shield-alt" style="display:block; font-size:1.5rem; margin-bottom:5px; color:var(--cl-dark-silver);"><\/i>
	                                <span style="font-weight:bold;">${m.t1}<\/span>
	                            <\/div>
	                            <div style="text-align:center; padding: 0 15px;">
	                                <div style="font-family:'Orbitron'; font-size:1.8rem; color:var(--cl-highlight); text-shadow: 0 0 10px rgba(255,255,255,0.5);">${m.s}<\/div>
	                                <div style="font-size:0.8rem; color:${m.st === 'انتهت' ? 'var(--cl-dark-silver)' : 'var(--ramadan-gold)'}; margin-top:5px; font-weight:bold;">${m.st}<\/div>
	                                <div style="font-size:0.75rem; opacity:0.6; margin-top:2px;">${m.d}<\/div>
	                            <\/div>
	                            <div style="text-align:center;">
	                                <i class="fas fa-tshirt" style="display:block; font-size:1.5rem; margin-bottom:5px; color:var(--cl-dark-silver);"><\/i>
	                                <span style="font-weight:bold;">${m.t2}<\/span>
	                            <\/div>
	                        <\/div>
	                    `).join('');
	                }

	         // ==========================================
	         // المحرك التكتيكي الجديد (FutsalTacticalEngine)
	         // ==========================================
	         class FutsalTacticalEngine {
	            constructor() {
	                this.pitch = document.getElementById('tactical-futsal-pitch');
	                this.viewToggle = document.getElementById('tactical-view-toggle');
	                this.coordBox = document.getElementById('live-coord');
	                this.coordLabel = document.getElementById('coord-label');
	                this.draggedElement = null;
	                this.is3D = true;
	                // لتتبع كابتن كل فريق (home / away)
	                this.captainByTeam = { home: null, away: null };
	                
	                if(this.pitch) this.init();
	            }

	            init() {
	                this.setupPlayers();
	                this.bindEvents();
	            }

	            setupPlayers() {
	                // يمكنك تعديل الأسماء والمراكز المبدئية هنا
	                const teamA = [
	                    { id: 'R1', name: 'ارقم', x: 8, y: 50, color: 'team-red', team: 'home' },
	                    { id: 'R2', name: 'مؤيد', x: 25, y: 25, color: 'team-red', team: 'home' },
	                    { id: 'R3', name: 'هاني', x: 25, y: 75, color: 'team-red', team: 'home' },
	                    { id: 'R4', name: 'عمر', x: 40, y: 30, color: 'team-red', team: 'home' },
	                    { id: 'R5', name: 'يوسف', x: 45, y: 70, color: 'team-red', team: 'home' },
	                ];
	                const teamB = [
	                    { id: 'B1', name: 'محمد', x: 92, y: 50, color: 'team-blue', team: 'away' },
	                    { id: 'B2', name: 'سنقرط', x: 75, y: 25, color: 'team-blue', team: 'away' },
	                    { id: 'B3', name: 'احمد', x: 75, y: 75, color: 'team-blue', team: 'away' },
	                    { id: 'B4', name: 'كريم', x: 60, y: 30, color: 'team-blue', team: 'away' },
	                    { id: 'B5', name: 'خضر', x: 55, y: 70, color: 'team-blue', team: 'away' },
	                ];
	                [...teamA, ...teamB].forEach(p => this.createPlayer(p));
	            }

	            createPlayer(config) {
	                const node = document.createElement('div');
	                node.className = `player-node ${config.color}`;
	                node.id = config.id;
	                node.dataset.team = config.team;
	                node.style.left = `${config.x}%`;
	                node.style.top = `${config.y}%`;

	                // هيكل اللاعب مع مربعات الدور والتعليمات فوق بعض
	                node.innerHTML = `
	                    <div class="team-role-top-right" id="team-role-${config.id}" style="display:none;"><\/div>
	                    <div class="instruction-top-left" id="instr-${config.id}" style="display:none;"><\/div>
	                    <div class="player-name-center">${config.name}<\/div>
	                    <div class="role-badge-bottom" id="role-${config.id}">--<\/div>
	                    <div class="captain-badge" id="captain-${config.id}" style="display:none;">C<\/div>
	                `;

	                // ضغط مزدوج لفتح قائمة متقدمة
	                node.addEventListener('dblclick', (e) => {
	                    e.stopPropagation();
	                    this.showAdvancedMenu(e.pageX, e.pageY, node);
	                });

	                // سحب اللاعب
	                node.addEventListener('pointerdown', (e) => this.onStart(e, node));

	                this.pitch.appendChild(node);
	                this.updateTacticalRole(node, config.x, config.y);
	            }

	            // قائمة لاختيار أدوار وتعليمات جاهزة عند الضغط المزدوج
	            showAdvancedMenu(x, y, playerNode) {
	                // إزالة أي قائمة سابقة
	                const oldMenu = document.getElementById('tactical-advanced-menu');
	                if (oldMenu) oldMenu.remove();

	                const menu = document.createElement('div');
	                menu.id = 'tactical-advanced-menu';
	                menu.className = 'tactical-advanced-menu';
	                menu.style.left = `${x}px`;
	                menu.style.top = `${y}px`;

	                const playerId = playerNode.id;
	                const teamRoleEl = playerNode.querySelector(`#team-role-${playerId}`);
	                const instrEl = playerNode.querySelector(`#instr-${playerId}`);
	                const captainBadgeEl = playerNode.querySelector(`#captain-${playerId}`);

	                const currentRole = teamRoleEl && teamRoleEl.textContent ? teamRoleEl.textContent : '';
	                const currentInstr = instrEl && instrEl.textContent ? instrEl.textContent : '';

	                menu.innerHTML = `
	                    <div class="tam-header">إعدادات ${playerNode.dataset.team === 'home' ? 'النخبة' : 'التحدي'} - ${playerId}<\/div>
	                    <div class="tam-group">
	                        <label>دور اللاعب في الفريق:<\/label>
	                        <select id="tam-team-role">
	                            <option value="">بدون دور محدد<\/option>
	                            <option value="كابتن" ${currentRole === 'كابتن' ? 'selected' : ''}>كابتن<\/option>
	                            <option value="قائد الدفاع" ${currentRole === 'قائد الدفاع' ? 'selected' : ''}>قائد الدفاع<\/option>
	                            <option value="قائد الهجوم" ${currentRole === 'قائد الهجوم' ? 'selected' : ''}>قائد الهجوم<\/option>
	                            <option value="منفذ الركلات الثابتة" ${currentRole === 'منفذ الركلات الثابتة' ? 'selected' : ''}>منفذ الركلات الثابتة<\/option>
	                            <option value="منفذ ركلات الجزاء" ${currentRole === 'منفذ ركلات الجزاء' ? 'selected' : ''}>منفذ ركلات الجزاء<\/option>
	                            <option value="لاعب حر" ${currentRole === 'لاعب حر' ? 'selected' : ''}>لاعب حر<\/option>
	                            <option value="صانع ألعاب رئيسي" ${currentRole === 'صانع ألعاب رئيسي' ? 'selected' : ''}>صانع ألعاب رئيسي<\/option>
	                        <\/select>
	                    <\/div>
	                    <div class="tam-group">
	                        <label>تعليمات تكتيكية خاصة:<\/label>
	                        <select id="tam-instr">
	                            <option value="">بدون تعليمات<\/option>
	                            <option value="يضغط للأمام" ${currentInstr === 'يضغط للأمام' ? 'selected' : ''}>يضغط للأمام<\/option>
	                            <option value="يغطي الظهير" ${currentInstr === 'يغطي الظهير' ? 'selected' : ''}>يغطي الظهير<\/option>
	                            <option value="يسقط للخلف" ${currentInstr === 'يسقط للخلف' ? 'selected' : ''}>يسقط للخلف<\/option>
	                            <option value="يثبت في العمق" ${currentInstr === 'يثبت في العمق' ? 'selected' : ''}>يثبت في العمق<\/option>
	                            <option value="يتحرك بين الخطوط" ${currentInstr === 'يتحرك بين الخطوط' ? 'selected' : ''}>يتحرك بين الخطوط<\/option>
	                            <option value="يفتح على الخط" ${currentInstr === 'يفتح على الخط' ? 'selected' : ''}>يفتح على الخط<\/option>
	                            <option value="يدخل للعمق" ${currentInstr === 'يدخل للعمق' ? 'selected' : ''}>يدخل للعمق<\/option>
	                        <\/select>
	                    <\/div>
	                    <div class="tam-actions">
	                        <button type="button" class="tam-btn tam-save">حفظ<\/button>
	                        <button type="button" class="tam-btn tam-clear">مسح<\/button>
	                        <button type="button" class="tam-btn tam-close">إغلاق<\/button>
	                    <\/div>
	                `;

	                document.body.appendChild(menu);

	                const saveBtn = menu.querySelector('.tam-save');
	                const clearBtn = menu.querySelector('.tam-clear');
	                const closeBtn = menu.querySelector('.tam-close');
	                const roleInput = menu.querySelector('#tam-team-role');
	                const instrInput = menu.querySelector('#tam-instr');

	                saveBtn.addEventListener('click', () => {
	                    const roleText = roleInput.value;
	                    const instrText = instrInput.value;
	                    const teamKey = playerNode.dataset.team; // home or away

	                    // منطق الكابتن: لاعب واحد فقط لكل فريق
	                    if (roleText === 'كابتن') {
	                        const currentCaptainId = this.captainByTeam[teamKey];
	                        if (currentCaptainId && currentCaptainId !== playerId) {
	                            // يوجد كابتن آخر في نفس الفريق
	                            alert('هذا الفريق يملك كابتن بالفعل. قم بإزالة دور الكابتن عنه أولاً ثم عيّنه للاعب جديد.');
	                            roleInput.value = teamRoleEl && teamRoleEl.textContent ? teamRoleEl.textContent : '';
	                            return;
	                        }
	                        this.captainByTeam[teamKey] = playerId;
	                        if (captainBadgeEl) captainBadgeEl.style.display = 'flex';
	                    } else {
	                        // إذا كان هذا اللاعب هو الكابتن الحالي وتم تغيير دوره، أزل الكابتن من الفريق
	                        if (this.captainByTeam[teamKey] === playerId) {
	                            this.captainByTeam[teamKey] = null;
	                        }
	                        if (captainBadgeEl) captainBadgeEl.style.display = 'none';
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

	                    menu.remove();
	                });

	                clearBtn.addEventListener('click', () => {
	                    const teamKey = playerNode.dataset.team;
	                    const wasCaptain = (this.captainByTeam[teamKey] === playerId);

	                    roleInput.value = '';
	                    instrInput.value = '';
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
	                });

	                closeBtn.addEventListener('click', () => {
	                    menu.remove();
	                });

	                // إغلاق عند الضغط خارج القائمة
	                setTimeout(() => {
	                    const onBodyClick = (ev) => {
	                        if (!menu.contains(ev.target)) {
	                            menu.remove();
	                            document.body.removeEventListener('click', onBodyClick);
	                        }
	                    };
	                    document.body.addEventListener('click', onBodyClick);
	                }, 0);
	            }

	            bindEvents() {
	                window.addEventListener('pointermove', (e) => this.onMove(e));
	                window.addEventListener('pointerup', () => this.onEnd());
	                if(this.viewToggle) {
	                    this.viewToggle.addEventListener('click', () => {
	                        this.is3D = !this.is3D;
	                        if(this.is3D) this.pitch.classList.remove('is-2d');
	                        else this.pitch.classList.add('is-2d');
	                    });
	                }
	            }

	            onStart(e, el) {
	                this.draggedElement = el;
	                el.setPointerCapture(e.pointerId);
	                this.coordBox.style.display = 'block';
	            }

	            onMove(e) {
	                if (!this.draggedElement) return;
	                const rect = this.pitch.getBoundingClientRect();
	                let x = ((e.clientX - rect.left) / rect.width) * 100;
	                let y = ((e.clientY - rect.top) / rect.height) * 100;
	                x = Math.max(2, Math.min(98, x)); y = Math.max(4, Math.min(96, y));
	                this.draggedElement.style.left = `${x}%`; this.draggedElement.style.top = `${y}%`;
	                this.updateTacticalRole(this.draggedElement, x, y);
	            }

updateTacticalRole(el, x, y) {
    const team = el.dataset.team;
    const badge = el.querySelector('.role-badge-bottom');
    let role = "";

    // حساب البعد عن مرمى الفريق نفسه
    const depthFromOwnGoal = (team === 'home') ? x : (100 - x);
    const laneY = y;

    // تقسيم طولي
    const inGKZone  = depthFromOwnGoal < 8;          // عند المرمى
    const inDefZone = depthFromOwnGoal >= 8  && depthFromOwnGoal < 28; // دفاع
    const inCDMZone = depthFromOwnGoal >= 28 && depthFromOwnGoal < 40; // محور دفاعي
    const inCMZone  = depthFromOwnGoal >= 40 && depthFromOwnGoal < 65; // وسط
    const inCAMZone = depthFromOwnGoal >= 65 && depthFromOwnGoal < 80; // وسط هجومي
    const inSTZone  = depthFromOwnGoal >= 80;                         // هجوم

    // تقسيم عرضي
    const farLeft   = laneY < 22;
    const farRight  = laneY > 78;

    // 1) حارس
    if (inGKZone && laneY > 30 && laneY < 70) {
        role = "GK";
    }
    // 2) دفاع: CB / LB / RB
    else if (inDefZone) {
        if (farLeft)        role = "LB";
        else if (farRight)  role = "RB";
        else                role = "CB";
    }
    // 3) محور دفاعي
    else if (inCDMZone) {
        role = "CDM";
    }
    // 4) وسط: CM / LM / RM
    else if (inCMZone) {
        if (farLeft)        role = "LM";
        else if (farRight)  role = "RM";
        else                role = "CM";
    }
    // 5) وسط هجومي + أجنحة: CAM / LW / RW
    else if (inCAMZone) {
        if (farLeft)        role = "LW";
        else if (farRight)  role = "RW";
        else                role = "CAM";
    }
    // 6) هجوم أمامي: ST + LW/RW
    else if (inSTZone) {
        if (farLeft)        role = "LW";
        else if (farRight)  role = "RW";
        else                role = "ST";
    }

    if (!role) role = "CM"; // احتياطي

    if (badge && badge.innerText !== role) {
        badge.innerText = role;
        badge.classList.add('role-glow');
        setTimeout(() => badge.classList.remove('role-glow'), 600);
    }

    const arabicRoleMap = {
        GK: "حارس",
        CB: "قلب دفاع",
        RB: "ظهير أيمن",
        LB: "ظـهير أيسر",
        CDM:"محور دفاعي",
        CM: "وسط مركزي",
        CAM:"صانع ألعاب",
        LM: "وسط أيسر",
        RM: "وسط أيمن",
        LW: "جناح أيسر",
        RW: "جناح أيمن",
        ST: "مهاجم"
    };

    const arabicRole = arabicRoleMap[role] || role;
    this.coordLabel.innerText = `المركز: ${arabicRole} (${Math.round(x)}%, ${Math.round(y)}%)`;
}

	            onEnd() {
	                if (this.draggedElement) this.draggedElement = null;
	                this.coordBox.style.display = 'none';
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
                    const name = `tamin-formation-${ts.getFullYear()}-${ts.getMonth()+1}-${ts.getDate()}-${ts.getHours()}${ts.getMinutes()}${ts.getSeconds()}.png`;
                    link.download = name;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                }).catch(err => {
                    console.error('Screenshot error', err);
                });
             }

	                // ==========================================
	                // [MAIN] EXECUTION
	                // ==========================================
	         window.onload = () => {

				function applyDynamicTheme() {
    const hour = new Date().getHours();
    const body = document.body;

    // من الـ 6 الصبح (6) لحد الـ 6 المغرب (18)
    if (hour >= 6 && hour < 18) {
        body.classList.remove('night-mode');
        body.classList.add('day-mode');
        console.log("Omar System: Day Mode Activated 🌞");
    } else {
        body.classList.remove('day-mode');
        body.classList.add('night-mode');
        console.log("Omar System: Night Mode Activated 🌙");
    }
}

	            // 2. تشغيل محركات وأنظمة الموقع (الأكواد الأصلية)
	            new FutsalTacticalEngine();
	            initShootingStars();
	            initTilt();
	            initPrayersSystem(); 
              updateWeatherSystem();
              applyDynamicTheme();
	            renderStats();
	            renderMatches();
	            
	            setInterval(updateBookingTimer, 1000);
	            updateBookingTimer();
	            setInterval(rotateDhikr, 10000);
	            
	            console.log("Omar System: Truck Preloader & Site Engine Resurrected!");
	         };

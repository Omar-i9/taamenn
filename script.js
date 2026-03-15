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
	         }        const statsElite = [
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
	                        
	                        // تخزين أوقات الصلاة في مصفوفة مرتبة
	                        globalPrayerData = [
	                            { id: 'Fajr', name: 'الفجر', time: timings.Fajr },
	                            { id: 'Sunrise', name: 'الشروق', time: timings.Sunrise }, // الشروق ليس صلاة لكنه وقت مهم
	                            { id: 'Dhuhr', name: 'الظهر', time: timings.Dhuhr },
	                            { id: 'Asr', name: 'العصر', time: timings.Asr },
	                            { id: 'Maghrib', name: 'المغرب', time: timings.Maghrib },
	                            { id: 'Isha', name: 'العشاء', time: timings.Isha }
	                        ];

	                        // رسم البطاقات
	                        renderPrayerCards();
	                        
	                        // بدء دورة حساب الصلاة القادمة
	                        startDynamicPrayerCountdown();

	                    } catch (e) {
	                        console.error("Prayer API Error", e);
	                        document.getElementById('hijriDate').innerText = "خطأ في الاتصال بالخادم";
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
	                            labelEl.innerText = `الوقت المتبقي لرفع أذان المغرب (الإفطار)`;
	                            sectionEl.classList.add('maghrib-active');
	                        } else {
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
	                async function fetchWeather() {
	                    // تثبيت إحداثيات مدينة الخليل كما طلبت
	                    const lat = 31.5326; 
	                    const long = 35.0998;
	                    
	                    try {
	                        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max&timezone=auto`);
	                        const data = await res.json();
	                        
	                        const curr = data.current;
	                        document.getElementById('w-temp').innerText = `${Math.round(curr.temperature_2m)}°C`;
	                        document.getElementById('w-wind').innerText = `${curr.wind_speed_10m} km/h`;
	                        document.getElementById('w-hum').innerText = `${curr.relative_humidity_2m}%`;
	                        
	                        const code = curr.weather_code;
	                        const desc = code < 3 ? "سماء صافية / غيوم متفرقة" : (code < 50 ? "ضباب خفيف" : "أجواء ماطرة / عاصفة");
	                        document.getElementById('w-desc').innerText = desc;

	                        const daily = data.daily;
	                        let html = '';
	                        for(let i=0; i<5; i++) {
	                            const d = new Date(daily.time[i]);
	                            const dayName = d.toLocaleDateString('ar-EG', {weekday:'short'});
	                            html += `
	                                <div class="w-item" style="min-width:70px;">
	                                    <div style="font-size:0.8rem; opacity:0.7;">${dayName}<\/div>
	                                    <div style="font-weight:bold; font-size:1.2rem; color:var(--ramadan-gold);">${Math.round(daily.temperature_2m_max[i])}°<\/div>
	                                <\/div>
	                            `;
	                        }
	                        document.getElementById('forecast-container').innerHTML = html;
	                        document.getElementById('w-date').innerText = new Date().toLocaleDateString('ar-EG', {weekday:'long', day:'numeric', month:'long'});
	                    } catch(e) { 
	                        console.log("Weather error:", e);
	                        document.getElementById('w-desc').innerText = "تعذر جلب بيانات الطقس";
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
// [13] نظام التقاط الشاشة (SCREENSHOT)
// ==========================================
function takeScreenshot() {
    const pitchElement = document.getElementById('tactical-pitch-wrapper');
    if(!pitchElement) return alert("الملعب غير موجود!");

    // تغيير نص الزر أثناء التصوير
    const btn = document.querySelector('.radar-btn .fa-camera').parentElement;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التصوير...';

    html2canvas(pitchElement, {
        backgroundColor: '#14532d', // لون أرضية الملعب لتجنب الخلفية الشفافة
        scale: 2,
        useCORS: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'تشكيلة_فريق_تأمين.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        btn.innerHTML = originalText; // إرجاع شكل الزر
    }).catch(err => {
        console.error("Screenshot Error: ", err);
        btn.innerHTML = originalText;
        alert("حدث خطأ أثناء حفظ التشكيلة.");
    });
}

// ==========================================
// [14] المحرك التكتيكي المطور (FutsalTacticalEngine)
// ==========================================
class FutsalTacticalEngine {
    constructor() {
        this.teamStrategy = 'balanced'; 
        this.pitch = document.getElementById('tactical-futsal-pitch');
        this.viewToggle = document.getElementById('tactical-view-toggle');
        this.coordBox = document.getElementById('live-coord');
        this.coordLabel = document.getElementById('coord-label');
        this.draggedElement = null;
        this.is3D = true;

        if(this.pitch) this.init();
    }

    init() {
        this.setupPlayers();
        this.bindEvents();
    }

    setupPlayers() {
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

        // الهيكل الجديد: اسم في الوسط، مركز بالأسفل، دور فوق يمين، تعليمات فوق يسار
        node.innerHTML = `
            <div class="team-role-top-right" id="team-role-${config.id}" style="display:none;"></div>
            <div class="instruction-top-left" id="instr-${config.id}" style="display:none;"></div>
            <div class="player-name-center">${config.name}</div>
            <div class="role-badge-bottom" id="role-${config.id}">--</div>
        `;

        // حدث الضغط مرتين لفتح القائمة المتقدمة
        node.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.showAdvancedMenu(e.pageX, e.pageY, node);
        });

        node.addEventListener('pointerdown', (e) => this.onStart(e, node));
        this.pitch.appendChild(node);
        this.updateTacticalRole(node, config.x, config.y);
    }

    showAdvancedMenu(x, y, playerEl) {
        const oldMenu = document.getElementById('player-adv-menu');
        if(oldMenu) oldMenu.remove();

        const menu = document.createElement('div');
        menu.id = 'player-adv-menu';
        menu.style = `position:absolute; top:${y}px; left:${x}px; background:rgba(5, 10, 31, 0.98); color:white; border:1px solid gold; padding:12px; z-index:10000; border-radius:12px; font-family:Tajawal; min-width:160px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); backdrop-filter: blur(10px); text-align:right;`;

        // 1. خيارات دور اللاعب في الفريق
        let html = `<div style="color:gold; font-size:0.75rem; margin-bottom:8px; border-bottom:1px solid #333; padding-bottom:4px;">مهام الفريق</div>`;
        const teamRoles = ['كابتن', 'ركلات جزاء', 'ركلات حرة', 'ركنية'];
        teamRoles.forEach(r => {
            html += `<div class="menu-item" onclick="updatePlayerTag('${playerEl.id}', 'team', '${r}')" style="padding:6px; cursor:pointer; font-size:0.8rem; border-radius:4px; transition:0.2s;">• ${r}</div>`;
        });

        // 2. خيارات التعليمات التكتيكية
        html += `<div style="color:#00f2ff; font-size:0.75rem; margin:10px 0 8px; border-bottom:1px solid #333; padding-bottom:4px;">تعليمات تكتيكية</div>`;
        const instructions = ['يضغط', 'يساند الهجوم', 'يساند الدفاع', 'تمركز ثابت'];
        instructions.forEach(i => {
            html += `<div class="menu-item" onclick="updatePlayerTag('${playerEl.id}', 'instr', '${i}')" style="padding:6px; cursor:pointer; font-size:0.8rem; border-radius:4px; transition:0.2s;">• ${i}</div>`;
        });

        menu.innerHTML = html;
        document.body.appendChild(menu);

        setTimeout(() => {
            document.addEventListener('click', () => { if(document.getElementById('player-adv-menu')) menu.remove(); }, {once:true});
        }, 10);
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
        if(this.coordBox) this.coordBox.style.display = 'block';
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
        let role = "";
        const isInsideDZone = (team === 'home' && x < 15 && y > 30 && y < 70) || (team === 'away' && x > 85 && y > 30 && y < 70);

        if (isInsideDZone) role = "GK";
        else {
            const isMyHalf = (team === 'home' && x <= 50) || (team === 'away' && x >= 50);
            if (isMyHalf) {
                if (y < 30) role = (team === 'home' ? "LB" : "RB");
                else if (y > 70) role = (team === 'home' ? "RB" : "LB");
                else role = "CB";
            } else {
                if (y < 35) role = (team === 'home' ? "LW" : "RW");
                else if (y > 65) role = (team === 'home' ? "RW" : "LW");
                else { const depth = team === 'home' ? x : (100 - x); role = depth > 80 ? "ST" : "CAM"; }
            }
        }

        if (badge && badge.innerText !== role) {
            badge.innerText = role; 
        }
        
        const arabicRole = {"GK":"حارس","CB":"دفاع","LB":"ظ.أيسر","RB":"ظ.أيمن","LW":"ج.أيسر","RW":"ج.أيمن","CAM":"صانع","ST":"مهاجم"}[role] || role;
        if(this.coordLabel) this.coordLabel.innerText = `المركز: ${arabicRole} (${Math.round(x)}%, ${Math.round(y)}%)`;
    }

    onEnd() {
        if (this.draggedElement) this.draggedElement = null;
        if(this.coordBox) this.coordBox.style.display = 'none';
    }

    applyPreset(formation) {
        const presets = {
            'diamond': [{id:'R1', x:10, y:50}, {id:'R2', x:30, y:20}, {id:'R3', x:30, y:80}, {id:'R4', x:45, y:50}, {id:'R5', x:15, y:50}],
            'square': [{id:'R1', x:10, y:50}, {id:'R2', x:25, y:30}, {id:'R3', x:25, y:70}, {id:'R4', x:45, y:30}, {id:'R5', x:45, y:70}]
        };
        const players = presets[formation];
        if(players) {
            players.forEach(p => {
                const el = document.getElementById(p.id);
                if(el) {
                    el.style.left = p.x + '%';
                    el.style.top = p.y + '%';
                    this.updateTacticalRole(el, p.x, p.y);
                }
            });
        }
    }
}

// دالة عالمية لتحديث التاجات فوق اللاعب
window.updatePlayerTag = function(playerId, type, value) {
    const player = document.getElementById(playerId);
    if(!player) return;

    if(type === 'team') {
        const tag = player.querySelector('.team-role-top-right');
        tag.innerText = value;
        tag.style.display = 'block';
    } else {
        const tag = player.querySelector('.instruction-top-left');
        tag.innerText = value;
        tag.style.display = 'block';
    }
};

// ==========================================
// [MAIN] EXECUTION
// ==========================================
window.onload = () => {
    setTimeout(() => {
        const preloader = document.getElementById('master-truck-preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            setTimeout(() => preloader.remove(), 800);
        }
    }, 4000);

    new FutsalTacticalEngine();
    if(typeof initShootingStars === 'function') initShootingStars();
    if(typeof initTilt === 'function') initTilt();
    if(typeof initPrayersSystem === 'function') initPrayersSystem();
    if(typeof fetchWeather === 'function') fetchWeather();
    if(typeof renderStats === 'function') renderStats();
    if(typeof renderMatches === 'function') renderMatches();
    
    setInterval(() => { if(typeof updateBookingTimer === 'function') updateBookingTimer(); }, 1000);
    setInterval(() => { if(typeof rotateDhikr === 'function') rotateDhikr(); }, 10000);
    
    console.log("Omar System: Full Tactical Integration Complete.");
};
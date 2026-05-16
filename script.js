/**
 * VIVI CAVALCANTE — Landing Page Scripts
 * Webview detection + Scroll reveal + Year + CTA tracking
 */

/* ==================================================
   WEBVIEW DETECTION (Instagram, Facebook, TikTok, Messenger)
================================================== */

function isInAppWebview() {
    var ua = navigator.userAgent || '';
    return /Instagram|FBAN|FBAV|TikTok|musical_ly|MessengerForiOS/i.test(ua);
}

function isAndroid() {
    return /Android/i.test(navigator.userAgent || '');
}

function showWebviewBanner() {
    var banner = document.getElementById('webview-banner');
    if (!banner) return;
    banner.style.display = 'flex';
    document.body.classList.add('has-webview-banner');

    // Show Chrome button only on Android
    var chromeBtn = document.getElementById('webview-chrome-btn');
    if (chromeBtn && isAndroid()) {
        chromeBtn.style.display = 'inline-block';
    }

    adjustHeaderOffset();
}

function hideWebviewBanner() {
    var banner = document.getElementById('webview-banner');
    if (!banner) return;
    banner.style.display = 'none';
    document.body.classList.remove('has-webview-banner');
    adjustHeaderOffset();
}

function initWebviewBanner() {
    if (!isInAppWebview()) return;

    showWebviewBanner();

    // Close button — hides banner but re-shows on CTA click
    var closeBtn = document.getElementById('webview-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            hideWebviewBanner();
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {

    // 0. Webview detection + banner
    initWebviewBanner();

    // 1. Orchestrated Page Load — Hero elements
    var heroElements = document.querySelectorAll('.hero .fade-in, .header');
    setTimeout(function () {
        heroElements.forEach(function (el) { el.classList.add('is-visible'); });
    }, 80);

    // 2. Scroll Reveal (IntersectionObserver)
    var observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    };

    var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var children = entry.target.querySelectorAll('.fade-in');
                if (entry.target.classList.contains('fade-in')) {
                    entry.target.classList.add('is-visible');
                }
                children.forEach(function (child) { child.classList.add('is-visible'); });
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(function (section) {
        observer.observe(section);
    });

    // 3. Footer Year
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // 4. CTA Click Tracking (data-event)
    // Fires a custom event for each CTA click so Meta Pixel / GA4
    // can be wired up later without touching this code.
    // Also re-shows webview banner if user is still in webview.
    document.querySelectorAll('[data-event]').forEach(function (el) {
        el.addEventListener('click', function () {
            var eventName = this.getAttribute('data-event');

            // dataLayer (GTM / GA4)
            if (typeof window.dataLayer !== 'undefined') {
                window.dataLayer.push({
                    event: eventName,
                    eventCategory: 'WhatsApp CTA',
                    eventAction: 'click',
                    eventLabel: this.id || eventName
                });
            }

            // Meta Pixel
            if (typeof window.fbq !== 'undefined') {
                window.fbq('trackCustom', eventName);
            }

            // Re-show webview banner if still in webview
            if (isInAppWebview()) {
                showWebviewBanner();
            }

            // Console log for debugging
            console.log('[CTA Track]', eventName);
        });
    });

    // 5. Testimonial Carousel
    initCarousel();

    // 6. Urgency bar + Toast notifications
    initUrgencySystem();

    // 7. Sticky header offset (below urgency bar)
    adjustHeaderOffset();
    window.addEventListener('resize', adjustHeaderOffset);
});

function adjustHeaderOffset() {
    var bar = document.getElementById('urgency-bar');
    var header = document.querySelector('.header');
    var banner = document.getElementById('webview-banner');
    if (bar && header) {
        var bannerHeight = (banner && banner.style.display !== 'none') ? banner.offsetHeight : 0;
        bar.style.top = bannerHeight + 'px';
        header.style.top = (bannerHeight + bar.offsetHeight) + 'px';
    }
}


function initCarousel() {
    const track = document.getElementById('carousel-track');
    const dotsContainer = document.getElementById('carousel-dots');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    if (!track || !dotsContainer || !prevBtn || !nextBtn) return;

    const slides = Array.from(track.children);
    const totalSlides = slides.length;
    let currentIndex = 0;
    let autoPlayTimer = null;
    const AUTO_PLAY_MS = 5000;

    // Determine how many slides are visible based on CSS flex-basis
    function getVisibleCount() {
        if (!slides[0]) return 1;
        const basis = getComputedStyle(slides[0]).flexBasis;
        const pct = parseFloat(basis);
        if (pct <= 34) return 3;
        if (pct <= 51) return 2;
        return 1;
    }

    // Max index so we don't scroll past the last set
    function getMaxIndex() {
        return Math.max(0, totalSlides - getVisibleCount());
    }

    // Build dots
    function buildDots() {
        dotsContainer.innerHTML = '';
        const pages = getMaxIndex() + 1;
        for (let i = 0; i < pages; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === currentIndex ? ' active' : '');
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
            dot.setAttribute('aria-label', `Depoimento ${i + 1}`);
            dot.addEventListener('click', () => goTo(i));
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots() {
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((d, i) => {
            d.classList.toggle('active', i === currentIndex);
            d.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
        });
    }

    function goTo(index) {
        const max = getMaxIndex();
        currentIndex = index;
        if (currentIndex > max) currentIndex = 0;   // loop
        if (currentIndex < 0) currentIndex = max;     // loop backward

        const slideWidth = 100 / getVisibleCount();
        track.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
        updateDots();
    }

    function next() { goTo(currentIndex + 1); }
    function prev() { goTo(currentIndex - 1); }

    // Auto-play
    function startAutoPlay() {
        stopAutoPlay();
        autoPlayTimer = setInterval(next, AUTO_PLAY_MS);
    }

    function stopAutoPlay() {
        if (autoPlayTimer) {
            clearInterval(autoPlayTimer);
            autoPlayTimer = null;
        }
    }

    // Events
    prevBtn.addEventListener('click', () => { prev(); startAutoPlay(); });
    nextBtn.addEventListener('click', () => { next(); startAutoPlay(); });

    // Pause on hover / touch
    const carousel = track.closest('.carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);
        carousel.addEventListener('touchstart', stopAutoPlay, { passive: true });
        carousel.addEventListener('touchend', () => {
            // Resume after short delay
            setTimeout(startAutoPlay, 2000);
        }, { passive: true });
    }

    // Keyboard navigation
    carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { prev(); startAutoPlay(); }
        if (e.key === 'ArrowRight') { next(); startAutoPlay(); }
    });

    // Recalculate on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (currentIndex > getMaxIndex()) currentIndex = getMaxIndex();
            goTo(currentIndex);
            buildDots();
        }, 200);
    });

    // Init
    buildDots();
    goTo(0);
    startAutoPlay();
}

/* ==================================================
   URGENCY SYSTEM — Counter + WhatsApp Toast Notifications
   
   NOMES DO POOL SÃO TEMPLATES.
   [SUBSTITUIR POR NOMES REAIS COM CONSENTIMENTO]
================================================== */

function initUrgencySystem() {
    const bar = document.getElementById('urgency-bar');
    const textEl = document.getElementById('urgency-text');
    const counterEl = document.getElementById('vagas-restantes');
    const container = document.getElementById('toast-container');

    if (!bar || !textEl || !counterEl || !container) return;

    let count = 11;
    let lastName = '';

    // Name pool — [SUBSTITUIR POR NOMES REAIS COM CONSENTIMENTO]
    const namePool = [
        'Camila R.', 'Fernanda L.', 'Juliana A.', 'Roberta T.',
        'Aline P.', 'Tatiane O.', 'Bianca C.', 'Renata F.',
        'Letícia B.', 'Daniela K.', 'Carolina M.', 'Vanessa H.',
        'Priscila G.', 'Mariana D.', 'Adriana V.'
    ];

    // Initial 3 fixed notifications
    const initialSequence = [
        { name: 'Sueli L.', delayMs: 12000 },
        { name: 'Marina S.', delayMs: 38000 },
        { name: 'Patrícia M.', delayMs: 85000 }
    ];

    function updateBar() {
        if (count <= 0) {
            bar.classList.remove('urgency-critical');
            bar.classList.add('urgency-esgotado');
            textEl.textContent = 'Lote desta semana esgotado. Próximo lote em breve — entre no grupo para ser avisada.';
        } else if (count <= 3) {
            bar.classList.add('urgency-critical');
            textEl.innerHTML = '🔥 ÚLTIMAS <strong id="vagas-restantes">' + count + '</strong> peças do lote — encerrando hoje';
        } else {
            textEl.innerHTML = '⚡ LOTE DA SEMANA: restam <strong id="vagas-restantes">' + count + '</strong> peças com até 80% OFF — só no grupo';
        }
    }

    function getRandomName() {
        let available = namePool.filter(n => n !== lastName);
        const picked = available[Math.floor(Math.random() * available.length)];
        lastName = picked;
        return picked;
    }

    function triggerEntry(name) {
        if (count <= 0) return;
        count--;
        updateBar();
        adjustHeaderOffset();
        showToast(container, name);
    }

    // Schedule initial 3
    initialSequence.forEach(entry => {
        setTimeout(() => triggerEntry(entry.name), entry.delayMs);
    });

    // Random loop starting at ~2 minutes
    function scheduleNext() {
        if (count <= 1) {
            // Hold at 1 for 90 seconds before final decrement
            if (count === 1) {
                setTimeout(() => {
                    triggerEntry(getRandomName());
                }, 90000);
            }
            return;
        }
        const delay = 45000 + Math.floor(Math.random() * 45000); // 45-90s
        setTimeout(() => {
            triggerEntry(getRandomName());
            scheduleNext();
        }, delay);
    }

    // Start random loop after initial 3 are done (~2 min mark)
    setTimeout(scheduleNext, 120000);
}

function showToast(container, name) {
    // Remove any existing toast
    const old = container.querySelector('.toast');
    if (old) {
        old.classList.add('toast-exit');
        setTimeout(() => old.remove(), 300);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="toast-wa-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.694-1.347A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.239 0-4.326-.726-6.02-1.956l-.42-.316-2.791.801.832-2.724-.344-.443A9.963 9.963 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
        </div>
        <div class="toast-body">
            <div class="toast-header">WhatsApp · Grupo Vivi Cavalcante</div>
            <div class="toast-message">${name} acabou de entrar no grupo</div>
            <div class="toast-time">agora</div>
        </div>
    `;

    container.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

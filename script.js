/**
 * VIVI CAVALCANTE — Landing Page Scripts
 * Scroll reveal + Year + CTA tracking
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Orchestrated Page Load — Hero elements
    const heroElements = document.querySelectorAll('.hero .fade-in, .header');
    setTimeout(() => {
        heroElements.forEach(el => el.classList.add('is-visible'));
    }, 80);

    // 2. Scroll Reveal (IntersectionObserver)
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const children = entry.target.querySelectorAll('.fade-in');
                if (entry.target.classList.contains('fade-in')) {
                    entry.target.classList.add('is-visible');
                }
                children.forEach(child => child.classList.add('is-visible'));
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(section => {
        observer.observe(section);
    });

    // 3. Footer Year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // 4. CTA Click Tracking (data-event)
    // Fires a custom event for each CTA click so Meta Pixel / GA4
    // can be wired up later without touching this code.
    document.querySelectorAll('[data-event]').forEach(el => {
        el.addEventListener('click', function () {
            const eventName = this.getAttribute('data-event');

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

            // Console log for debugging
            console.log('[CTA Track]', eventName);
        });
    });

    // 5. Testimonial Carousel
    initCarousel();
});

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

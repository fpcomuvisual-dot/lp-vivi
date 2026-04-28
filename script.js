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
});

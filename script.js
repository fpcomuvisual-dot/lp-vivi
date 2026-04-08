/**
 * VIVI CAVALCANTE - Distinctive Frontend Scripts
 * Orchestrated Motion & Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    lucide.createIcons();

    // 2. Orchestrated Page Load (Hero Section & Nav)
    // We trigger the hero elements immediately upon load to guarantee the choreography.
    const initialElements = document.querySelectorAll('.hero .fade-in, .nav.fade-in');
    
    // Slight delay to ensure CSS is ready and give a smooth start
    setTimeout(() => {
        initialElements.forEach(el => {
            el.classList.add('is-visible');
        });
    }, 100);

    // 3. Scroll Reveal Choreography (Intersection Observer)
    // Elements outside the hero section will fade in as they scroll into view.
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px', // Trigger slightly before the bottom
        threshold: 0.1 // Trigger when 10% is visible
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Find all animated elements within the intersecting section
                const animatedChildren = entry.target.querySelectorAll('.fade-in');
                
                // If the section itself is an animated element
                if (entry.target.classList.contains('fade-in')) {
                    entry.target.classList.add('is-visible');
                }
                
                // Trigger children
                animatedChildren.forEach(child => {
                    child.classList.add('is-visible');
                });
                
                // Unobserve to only animate once
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all sections configured for scroll animation
    const scrollSections = document.querySelectorAll('.animate-on-scroll');
    scrollSections.forEach(section => {
        sectionObserver.observe(section);
    });

    // 4. Update Footer Year
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// Theme toggle with persistence
function setTheme(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    const button = document.querySelector('.theme-toggle');
    if (button) {
        button.textContent = isDark ? '☀️' : '🌙';
    }
    try {
        localStorage.setItem('cow_theme', isDark ? 'dark' : 'light');
    } catch (_) {}
}

function toggleTheme() {
    const isDark = !document.body.classList.contains('dark-mode');
    setTheme(isDark);
}

// Initialize theme on load
document.addEventListener('DOMContentLoaded', () => {
    try {
        const saved = localStorage.getItem('cow_theme');
        if (saved) {
            setTheme(saved === 'dark');
        }
    } catch (_) {}
    init3DTilt();
    initFilters();
    initSlider('#heroSlider');
    initHeroBackgroundSlider('#heroBgSlider');
});

// Filter functionality (initialized after DOM ready)
function initFilters() {
    const tabs = Array.from(document.querySelectorAll('.filter-tab'));
    if (!tabs.length) return;
    const applyFilter = (filter) => {
        document.querySelectorAll('.award-card').forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.style.display = 'block';
                requestAnimationFrame(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 250);
            }
        });
    };
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            applyFilter(tab.dataset.filter);
        });
    });
    // Ensure initial filter shows all
    applyFilter('all');
}

// Card hover effects
function init3DTilt() {
    document.querySelectorAll('.award-card').forEach(card => {
        const image3d = card.querySelector('.image-3d');
        const img = card.querySelector('.card-img');
        if (!image3d || !img) return;

        const resetTransform = () => {
            image3d.style.transform = 'rotateX(0deg) rotateY(0deg)';
            img.style.transform = 'translateZ(60px) scale(1)';
            card.style.filter = 'none';
        };

        let animationFrame = null;
        const onMove = (e) => {
            const rect = card.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            const percentX = (x / rect.width) - 0.5;
            const percentY = (y / rect.height) - 0.5;
            const rotateY = percentX * 22;
            const rotateX = -percentY * 22;

            if (animationFrame) cancelAnimationFrame(animationFrame);
            animationFrame = requestAnimationFrame(() => {
                image3d.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                img.style.transform = 'translateZ(100px) scale(1.06)';
                card.style.filter = 'drop-shadow(0 25px 45px rgba(0,0,0,0.28))';
            });
        };

        card.addEventListener('mousemove', onMove);
        card.addEventListener('touchmove', onMove, { passive: true });
        card.addEventListener('mouseenter', () => card.classList.add('hover'));
        card.addEventListener('mouseleave', () => { card.classList.remove('hover'); resetTransform(); });
        card.addEventListener('touchend', resetTransform);
    });
}

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation to cards
document.querySelectorAll('.award-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, index * 100 + 500);
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = document.body.classList.contains('dark-mode') 
            ? 'rgba(0, 0, 0, 0.98)' 
            : 'rgba(255, 255, 255, 0.98)';
    } else {
        header.style.background = document.body.classList.contains('dark-mode') 
            ? 'rgba(0, 0, 0, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)';
    }
});

// Slider logic
function initSlider(selector) {
    const root = document.querySelector(selector);
    if (!root) return;
    const track = root.querySelector('.slides');
    const slides = Array.from(root.querySelectorAll('.slide'));
    const btnPrev = root.querySelector('.prev');
    const btnNext = root.querySelector('.next');
    const dotsWrap = root.querySelector('.slider-dots');
    let index = 0;
    let autoplayId = null;

    const adjustHeight = () => {
        const currentSlide = slides[index];
        if (!currentSlide) return;
        const img = currentSlide.querySelector('img');
        if (!img) return;
        const set = () => {
            const h = currentSlide.getBoundingClientRect().height || img.getBoundingClientRect().height;
            if (h) {
                root.style.height = h + 'px';
            }
        };
        if (img.complete) {
            set();
        } else {
            img.addEventListener('load', set, { once: true });
        }
    };

    const update = () => {
        const offset = -index * root.clientWidth;
        track.style.transform = `translateX(${offset}px)`;
        dotsWrap.querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', i === index));
        adjustHeight();
    };

    const go = (to) => {
        index = (to + slides.length) % slides.length;
        update();
    };

    // Dots
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.setAttribute('aria-label', `Go to slide ${i+1}`);
        dot.addEventListener('click', () => {
            stopAutoplay();
            go(i);
        });
        dotsWrap.appendChild(dot);
    });

    // Ensure height adjusts when any slide image loads
    slides.forEach(slide => {
        const img = slide.querySelector('img');
        if (!img) return;
        if (img.complete) return; // will be handled by initial adjustHeight
        img.addEventListener('load', () => {
            if (slides[index] === slide) adjustHeight();
        });
    });

    // Buttons
    btnPrev.addEventListener('click', () => { stopAutoplay(); go(index - 1); });
    btnNext.addEventListener('click', () => { stopAutoplay(); go(index + 1); });

    // Resize handling
    window.addEventListener('resize', update);

    // Touch/drag swipe
    let startX = 0; let isDragging = false;
    const onStart = (e) => { isDragging = true; startX = (e.touches ? e.touches[0].clientX : e.clientX); stopAutoplay(); };
    const onMove = (e) => {
        if (!isDragging) return;
        const currentX = (e.touches ? e.touches[0].clientX : e.clientX);
        const dx = currentX - startX;
        track.style.transform = `translateX(${-index * root.clientWidth + dx}px)`;
    };
    const onEnd = (e) => {
        if (!isDragging) return;
        const endX = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX);
        const dx = endX - startX;
        if (Math.abs(dx) > 60) {
            go(index + (dx < 0 ? 1 : -1));
        } else {
            update();
        }
        isDragging = false;
        startAutoplay();
    };
    track.addEventListener('mousedown', onStart);
    track.addEventListener('mousemove', onMove);
    track.addEventListener('mouseup', onEnd);
    track.addEventListener('mouseleave', onEnd);
    track.addEventListener('touchstart', onStart, { passive: true });
    track.addEventListener('touchmove', onMove, { passive: true });
    track.addEventListener('touchend', onEnd);

    // Autoplay
    function startAutoplay() {
        stopAutoplay();
        autoplayId = setInterval(() => go(index + 1), 3500);
    }
    function stopAutoplay() { if (autoplayId) clearInterval(autoplayId); autoplayId = null; }

    // Init
    go(0);
    adjustHeight();
    startAutoplay();
}

// Hero background fading slider
function initHeroBackgroundSlider(selector) {
    const root = document.querySelector(selector);
    if (!root) return;
    const slides = Array.from(root.querySelectorAll('.hero-slide'));
    if (slides.length === 0) return;
    let index = 0;
    const show = (i) => {
        slides.forEach((s, n) => s.classList.toggle('active', n === i));
    };
    const step = () => {
        index = (index + 1) % slides.length;
        show(index);
    };
    show(0);
    setInterval(step, 4000);
}

// Mobile menu controls
function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    if (!menu) return;
    menu.classList.toggle('open');
}

function closeMenu() {
    const menu = document.getElementById('mobileMenu');
    if (!menu) return;
    menu.classList.remove('open');
}
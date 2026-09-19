/**
 * Sri Lakshmi Jewellers — Premium Jewellery Hero Carousel
 * Editorial split-layout: large jewellery image + content panel
 * Auto-play 5s, pause on hover, touch/swipe, keyboard, reduced-motion
 */
(function () {
    'use strict';

    var SLIDES = [
        {
            src: 'images/hero/bridal-collection.jpg',
            alt: '1 Gram Gold Bridal Necklace Set — Sri Lakshmi Jewellers',
            bg: '#1a0c06',
            eyebrow: 'BRIDAL COLLECTION',
            headline: 'TIMELESS BRIDAL<br>ELEGANCE',
            sub: 'Traditional 1-gram jewellery for unforgettable celebrations.',
            ctaLabel: 'EXPLORE BRIDAL',
            ctaHref: 'bridal.html',
            accent: '#c5a059'
        },
        {
            src: 'images/hero/new-arrivals.jpg',
            alt: '1 Gram Gold Necklace with Earrings — Sri Lakshmi Jewellers',
            bg: '#0e1208',
            eyebrow: 'NEW ARRIVALS',
            headline: 'THE NEW<br>GOLDEN EDIT',
            sub: 'Discover our latest lightweight jewellery designs.',
            ctaLabel: 'SHOP NEW ARRIVALS',
            ctaHref: 'jewellery.html?sort=newest',
            accent: '#c5a059'
        },
        {
            src: 'images/hero/jhumkas.jpg',
            alt: '1 Gram Gold Jhumka Earrings — Sri Lakshmi Jewellers',
            bg: '#120a06',
            eyebrow: 'JHUMKAS',
            headline: 'ICONIC<br>JHUMKAS',
            sub: 'Traditional silhouettes with intricate detailing.',
            ctaLabel: 'SHOP JHUMKAS',
            ctaHref: 'jewellery.html?category=Jhumkas',
            accent: '#c5a059'
        },
        {
            src: 'images/hero/daily-wear.jpg',
            alt: '1 Gram Gold Pendant — Sri Lakshmi Jewellers',
            bg: '#0e100a',
            eyebrow: 'DAILY WEAR',
            headline: 'EVERYDAY<br>GOLDEN ELEGANCE',
            sub: 'Lightweight designs made for everyday occasions.',
            ctaLabel: 'SHOP DAILY WEAR',
            ctaHref: 'jewellery.html?occasion=Daily',
            accent: '#c5a059'
        },
        {
            src: 'images/hero/traditional.jpg',
            alt: '1 Gram Gold Temple Necklace — Sri Lakshmi Jewellers',
            bg: '#100e08',
            eyebrow: 'TRADITIONAL',
            headline: 'ROOTED IN<br>TRADITION',
            sub: 'Temple-inspired jewellery with timeless appeal.',
            ctaLabel: 'EXPLORE COLLECTION',
            ctaHref: 'jewellery.html?style=Temple',
            accent: '#c5a059'
        }
    ];

    var INTERVAL = 5000;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var carousel, track, dotsContainer, prevBtn, nextBtn;
    var currentIndex = 0;
    var timer = null;
    var touchStartX = 0;
    var touchEndX = 0;

    function buildSlide(data, index) {
        var slide = document.createElement('div');
        slide.className = 'hc-slide' + (index === 0 ? ' active' : '');
        slide.setAttribute('data-index', index);
        slide.setAttribute('aria-hidden', index !== 0 ? 'true' : 'false');
        slide.style.setProperty('--slide-bg', data.bg);

        // Image panel (right side — 65% visual weight)
        var imgPanel = document.createElement('div');
        imgPanel.className = 'hc-img-panel';

        var imgEl = document.createElement('img');
        imgEl.src = data.src;
        imgEl.alt = data.alt;
        imgEl.className = 'hc-product-img';
        imgEl.loading = index === 0 ? 'eager' : 'lazy';
        imgEl.setAttribute('fetchpriority', index === 0 ? 'high' : 'auto');

        imgPanel.appendChild(imgEl);
        slide.appendChild(imgPanel);

        // Content panel (left side — 35%)
        var contentPanel = document.createElement('div');
        contentPanel.className = 'hc-content-panel';

        var inner = document.createElement('div');
        inner.className = 'hc-content-inner';

        var tag = document.createElement('span');
        tag.className = 'hc-tag';
        tag.textContent = data.eyebrow;

        var divider = document.createElement('div');
        divider.className = 'hc-divider';

        var headline = document.createElement('h1');
        headline.className = 'hc-headline';
        headline.innerHTML = data.headline;

        var sub = document.createElement('p');
        sub.className = 'hc-sub';
        sub.textContent = data.sub;

        var cta = document.createElement('a');
        cta.className = 'hc-cta';
        cta.href = data.ctaHref;
        cta.textContent = data.ctaLabel;

        inner.appendChild(tag);
        inner.appendChild(divider);
        inner.appendChild(headline);
        inner.appendChild(sub);
        inner.appendChild(cta);
        contentPanel.appendChild(inner);
        slide.appendChild(contentPanel);

        return slide;
    }

    function buildDot(index) {
        var btn = document.createElement('button');
        btn.className = 'hc-dot' + (index === 0 ? ' active' : '');
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        btn.setAttribute('aria-label', 'Go to slide ' + (index + 1));
        btn.addEventListener('click', function () { stopTimer(); goTo(index); startTimer(); });
        return btn;
    }

    function goTo(index) {
        var slides = track.querySelectorAll('.hc-slide');
        var dots = dotsContainer.querySelectorAll('.hc-dot');

        slides[currentIndex].classList.remove('active');
        slides[currentIndex].setAttribute('aria-hidden', 'true');
        dots[currentIndex].classList.remove('active');
        dots[currentIndex].setAttribute('aria-selected', 'false');

        currentIndex = (index + slides.length) % slides.length;

        slides[currentIndex].classList.add('active');
        slides[currentIndex].setAttribute('aria-hidden', 'false');
        dots[currentIndex].classList.add('active');
        dots[currentIndex].setAttribute('aria-selected', 'true');
    }

    function next() { goTo(currentIndex + 1); }
    function prev() { goTo(currentIndex - 1); }

    function startTimer() {
        if (reducedMotion) return;
        clearInterval(timer);
        timer = setInterval(next, INTERVAL);
    }

    function stopTimer() { clearInterval(timer); }

    function init() {
        carousel = document.getElementById('heroCarousel');
        if (!carousel) return;

        track = document.getElementById('hcTrack');
        dotsContainer = carousel.querySelector('.hc-dots');
        prevBtn = carousel.querySelector('.hc-prev');
        nextBtn = carousel.querySelector('.hc-next');

        // Clear and rebuild all slides
        track.innerHTML = '';
        dotsContainer.innerHTML = '';

        SLIDES.forEach(function (data, i) {
            track.appendChild(buildSlide(data, i));
            dotsContainer.appendChild(buildDot(i));
        });

        // Arrow buttons
        prevBtn.addEventListener('click', function () { stopTimer(); prev(); startTimer(); });
        nextBtn.addEventListener('click', function () { stopTimer(); next(); startTimer(); });

        // Pause on hover
        carousel.addEventListener('mouseenter', stopTimer);
        carousel.addEventListener('mouseleave', startTimer);

        // Touch / swipe
        carousel.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].clientX;
        }, { passive: true });
        carousel.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].clientX;
            var diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                stopTimer();
                if (diff > 0) { next(); } else { prev(); }
                startTimer();
            }
        }, { passive: true });

        // Keyboard
        document.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') { stopTimer(); prev(); startTimer(); }
            if (e.key === 'ArrowRight') { stopTimer(); next(); startTimer(); }
        });

        startTimer();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());

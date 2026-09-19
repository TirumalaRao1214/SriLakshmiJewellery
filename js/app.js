/**
 * Sri Lakshmi Jewellers - Main Application Script
 * Global UI initializations, carousels, mobile navigation, toast alerts, product loaders
 */

// Toast notification helper
function showToast(message, duration = 3000) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c5a059" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ─── Mobile Navigation Drawer ────────────────────────────────────────────────

// Track scroll position to prevent iOS jump when body becomes position:fixed
var _menuScrollY = 0;

function openMobileMenu() {
    const drawer = document.getElementById('mobNavDrawer');
    const overlay = document.getElementById('mobNavOverlay');
    if (!drawer) return;

    // Save scroll position before locking body (iOS fix)
    _menuScrollY = window.scrollY || window.pageYOffset;
    document.body.style.top = '-' + _menuScrollY + 'px';

    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
}

function closeMobileMenu() {
    const drawer = document.getElementById('mobNavDrawer');
    const overlay = document.getElementById('mobNavOverlay');
    if (!drawer) return;

    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (overlay) overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');

    // Restore scroll position (iOS fix)
    document.body.style.top = '';
    window.scrollTo(0, _menuScrollY);
}

// Legacy alias — hamburger button in HTML calls toggleMobileMenu()
function toggleMobileMenu() {
    const drawer = document.getElementById('mobNavDrawer');
    if (drawer && drawer.classList.contains('is-open')) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

// ─── Mobile Accordion (Jewellery top-level) ───────────────────────────────────

function initMobileAccordions() {
    // Top-level Jewellery accordion
    const jewBtn = document.getElementById('mobJewelleryBtn');
    const jewPanel = document.getElementById('mobJewelleryPanel');

    if (jewBtn && jewPanel) {
        jewBtn.addEventListener('click', function () {
            const isOpen = jewBtn.getAttribute('aria-expanded') === 'true';
            jewBtn.setAttribute('aria-expanded', String(!isOpen));
            if (isOpen) {
                jewPanel.hidden = true;
            } else {
                jewPanel.hidden = false;
            }
        });
    }

    // Sub-accordions (Category / By Style / By Occasion / By Price)
    const subTriggers = document.querySelectorAll('.mob-sub-trigger');
    subTriggers.forEach(function (trigger) {
        trigger.addEventListener('click', function () {
            const panel = trigger.nextElementSibling;
            if (!panel) return;
            const isOpen = trigger.getAttribute('aria-expanded') === 'true';

            // Close all other sub-panels first (single-open behaviour)
            subTriggers.forEach(function (t) {
                if (t !== trigger) {
                    t.setAttribute('aria-expanded', 'false');
                    const p = t.nextElementSibling;
                    if (p) p.hidden = true;
                }
            });

            trigger.setAttribute('aria-expanded', String(!isOpen));
            panel.hidden = isOpen;
        });
    });

    // Overlay click closes drawer
    const overlay = document.getElementById('mobNavOverlay');
    if (overlay) {
        overlay.addEventListener('click', closeMobileMenu);
    }

    // Close button
    const closeBtn = document.getElementById('mobNavClose');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMobileMenu);
    }

    // Escape key closes drawer
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMobileMenu();
    });

    // All simple links inside drawer close menu on navigation
    const drawerLinks = document.querySelectorAll('#mobNavDrawer .mob-nav-link--simple, #mobNavDrawer .mob-sub-panel a');
    drawerLinks.forEach(function (link) {
        link.addEventListener('click', closeMobileMenu);
    });
}

// Carousel Scroll Navigation Helper
function scrollCarousel(trackId, direction) {
    const track = document.getElementById(trackId);
    if (!track) return;
    const scrollAmount = track.clientWidth * 0.75;
    track.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}

// Setup sticky header scroll listener
function initStickyHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Populate Homepage Sections
function initHomePage() {
    // 1. Shop Our Collection — premium product carousel
    initCollectionCarousel();

    // 2. Discover Our Edit Carousel
    const featuredTrack = document.getElementById('featuredEditTrack');
    if (featuredTrack) {
        const featured = getFeaturedProducts(8);
        featuredTrack.innerHTML = featured.map(p => `
            <div class="carousel-slide">
                ${createProductCardHTML(p)}
            </div>
        `).join('');
    }

    // 3. Trending Now Section
    const trendingGrid = document.getElementById('trendingProductsGrid');
    if (trendingGrid) {
        const trending = getTrendingProducts(8);
        trendingGrid.innerHTML = trending.map(p => `
            <div class="carousel-slide">
                ${createProductCardHTML(p)}
            </div>
        `).join('');
    }

    // 4. Bridal Collections Strip
    const bridalStrip = document.getElementById('bridalStripTrack');
    if (bridalStrip) {
        const bridal = getBridalProducts(8);
        bridalStrip.innerHTML = bridal.map(p => `
            <div class="carousel-slide">
                ${createProductCardHTML(p)}
            </div>
        `).join('');
    }
}

/**
 * Build a premium product card for the "Shop Our Collection" carousel.
 * Uses products.js data — does NOT create a new product database.
 */
function buildCollectionCard(product) {
    const hoverImg = product.hoverImage || product.image;
    const discountPct = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;
    const badge = product.newArrival
        ? `<span class="col-product-badge new">NEW</span>`
        : discountPct >= 15
            ? `<span class="col-product-badge">−${discountPct}%</span>`
            : '';

    const waMsg = encodeURIComponent(
        `Hi! I'm interested in "${product.name}" (${product.id}) priced at ₹${product.price.toLocaleString('en-IN')}. Please share more details.`
    );
    const waLink = `https://wa.me/${typeof WHATSAPP_CONFIG !== 'undefined' ? WHATSAPP_CONFIG.phone : '919876543210'}?text=${waMsg}`;

    return `
        <article class="col-product-card" data-category="${product.category}" data-id="${product.id}">
            <div class="col-product-media">
                ${badge}
                <a href="product.html?id=${product.id}">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <img src="${hoverImg}" alt="${product.name} alternate" class="col-hover-img" loading="lazy">
                </a>
            </div>
            <div class="col-product-info">
                <span class="col-product-type">1 Gram Jewellery</span>
                <h3 class="col-product-name">${product.name}</h3>
                <div class="col-product-price-row">
                    <span class="col-product-price">₹${product.price.toLocaleString('en-IN')}</span>
                    ${product.originalPrice ? `<span class="col-product-orig-price">₹${product.originalPrice.toLocaleString('en-IN')}</span>` : ''}
                </div>
            </div>
            <div class="col-product-actions">
                <a href="product.html?id=${product.id}" class="col-btn-view">View Details</a>
                <a href="${waLink}" target="_blank" rel="noopener" class="col-btn-wa" aria-label="Enquire on WhatsApp">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </a>
            </div>
        </article>
    `;
}

/**
 * Initialize the "Shop Our Collection" product carousel
 * with filter pills and swipe/arrow navigation.
 */
function initCollectionCarousel() {
    const track = document.getElementById('collectionTrack');
    const filterBar = document.getElementById('collectionFilterBar');
    const prevBtn = document.getElementById('colNavPrev');
    const nextBtn = document.getElementById('colNavNext');

    if (!track) return;

    let currentFilter = 'all';

    function getFilteredProducts() {
        const all = getAllProducts();
        if (currentFilter === 'all') return all;
        return all.filter(p => p.category === currentFilter);
    }

    function render() {
        const products = getFilteredProducts();
        if (products.length === 0) {
            track.innerHTML = `<div style="padding:40px; color:#6b655f; font-size:0.9rem;">No products found in this category.</div>`;
            return;
        }
        track.innerHTML = products.map(p => buildCollectionCard(p)).join('');
        track.scrollLeft = 0;
    }

    // Filter pill clicks
    if (filterBar) {
        filterBar.addEventListener('click', function (e) {
            const btn = e.target.closest('.col-filter-btn');
            if (!btn) return;
            filterBar.querySelectorAll('.col-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter || 'all';
            render();
        });
    }

    // Arrow scroll
    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            const cardWidth = track.querySelector('.col-product-card');
            const scrollAmount = cardWidth ? cardWidth.offsetWidth + 20 : 280;
            track.scrollBy({ left: -scrollAmount * 2, behavior: 'smooth' });
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            const cardWidth = track.querySelector('.col-product-card');
            const scrollAmount = cardWidth ? cardWidth.offsetWidth + 20 : 280;
            track.scrollBy({ left: scrollAmount * 2, behavior: 'smooth' });
        });
    }

    render();
}

// Populate Bridal Collection Page
function initBridalPage() {
    const bridalGrid = document.getElementById('bridalProductsGrid');
    if (bridalGrid) {
        const bridalItems = getBridalProducts(16);
        bridalGrid.innerHTML = bridalItems.map(p => createProductCardHTML(p)).join('');
    }
}

// Populate Product Detail Page
function initProductDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id') || 'SLJ001';
    const product = getProductById(productId) || getProductById('SLJ001');

    if (!product) return;

    document.title = `${product.name} | Sri Lakshmi Jewellers Guntur`;

    const crumbCategory = document.getElementById('detailCrumbCategory');
    const crumbTitle = document.getElementById('detailCrumbTitle');
    if (crumbCategory) {
        crumbCategory.textContent = product.category;
        crumbCategory.href = `jewellery.html?category=${encodeURIComponent(product.category)}`;
    }
    if (crumbTitle) crumbTitle.textContent = product.name;

    const mainImg = document.getElementById('detailMainImage');
    const thumbsWrap = document.getElementById('detailThumbnails');
    const zoomContainer = document.getElementById('detailZoomBox');

    if (mainImg) {
        mainImg.src = product.image;
        mainImg.alt = product.name;
    }

    if (thumbsWrap && product.gallery) {
        thumbsWrap.innerHTML = product.gallery.map((imgSrc, idx) => `
            <div class="thumbnail-item ${idx === 0 ? 'active' : ''}" onclick="switchDetailImage('${imgSrc}', this)">
                <img src="${imgSrc}" alt="${product.name} view ${idx + 1}">
            </div>
        `).join('');
    }

    // Desktop Image Zoom Interaction
    if (zoomContainer && mainImg) {
        zoomContainer.addEventListener('mousemove', (e) => {
            if (window.innerWidth < 992) return;
            const { left, top, width, height } = zoomContainer.getBoundingClientRect();
            const x = ((e.clientX - left) / width) * 100;
            const y = ((e.clientY - top) / height) * 100;
            mainImg.style.transformOrigin = `${x}% ${y}%`;
            mainImg.style.transform = "scale(1.8)";
        });

        zoomContainer.addEventListener('mouseleave', () => {
            mainImg.style.transform = "scale(1)";
        });
    }

    // Populate Details Information
    const titleEl = document.getElementById('detailTitle');
    const skuEl = document.getElementById('detailSku');
    const priceEl = document.getElementById('detailPrice');
    const origPriceEl = document.getElementById('detailOriginalPrice');
    const descEl = document.getElementById('detailDescription');
    const catEl = document.getElementById('detailCategory');
    const styleEl = document.getElementById('detailStyle');
    const occEl = document.getElementById('detailOccasion');
    const matEl = document.getElementById('detailMaterial');
    const finishEl = document.getElementById('detailFinish');
    const weightEl = document.getElementById('detailWeight');

    if (titleEl) titleEl.textContent = product.name;
    if (skuEl) skuEl.textContent = product.id;
    if (priceEl) priceEl.textContent = `₹${product.price.toLocaleString('en-IN')}`;
    if (origPriceEl) {
        if (product.originalPrice) {
            origPriceEl.textContent = `₹${product.originalPrice.toLocaleString('en-IN')}`;
            origPriceEl.style.display = 'inline';
        } else {
            origPriceEl.style.display = 'none';
        }
    }
    if (descEl) descEl.textContent = product.description;
    if (catEl) catEl.textContent = product.category;
    if (styleEl) styleEl.textContent = product.style;
    if (occEl) occEl.textContent = product.occasion;
    if (matEl) matEl.textContent = product.material || 'Premium Gold Micro Polish Alloy';
    if (finishEl) finishEl.textContent = product.finish || '1-Gram Micron Matte Gold Plating';
    if (weightEl) weightEl.textContent = product.weight || 'Lightweight';

    // Quantity Counter Handlers
    let currentQty = 1;
    const qtySpan = document.getElementById('detailQuantity');
    const minusBtn = document.getElementById('detailQtyMinus');
    const plusBtn = document.getElementById('detailQtyPlus');

    if (minusBtn && plusBtn && qtySpan) {
        minusBtn.addEventListener('click', () => {
            if (currentQty > 1) {
                currentQty--;
                qtySpan.textContent = currentQty;
            }
        });
        plusBtn.addEventListener('click', () => {
            currentQty++;
            qtySpan.textContent = currentQty;
        });
    }

    // Add To Bag Button
    const addBagBtn = document.getElementById('detailAddBagBtn');
    if (addBagBtn) {
        addBagBtn.addEventListener('click', () => {
            addToCart(product.id, currentQty);
        });
    }

    // WhatsApp Direct Enquiry Button
    const waEnquireBtn = document.getElementById('detailWhatsAppBtn');
    if (waEnquireBtn) {
        waEnquireBtn.addEventListener('click', () => {
            openSingleProductEnquiry(product.id);
        });
    }

    // Size Selection Handlers
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Populate Related Products
    const relatedGrid = document.getElementById('relatedProductsGrid');
    if (relatedGrid) {
        const related = getAllProducts()
            .filter(p => p.category === product.category && p.id !== product.id)
            .slice(0, 4);
        
        if (related.length < 4) {
            const extra = getAllProducts().filter(p => p.id !== product.id && !related.includes(p)).slice(0, 4 - related.length);
            related.push(...extra);
        }

        relatedGrid.innerHTML = related.map(p => createProductCardHTML(p)).join('');
    }
}

// Switch Detail Gallery Image
function switchDetailImage(src, thumbElement) {
    const mainImg = document.getElementById('detailMainImage');
    if (mainImg) mainImg.src = src;

    document.querySelectorAll('.thumbnail-item').forEach(el => el.classList.remove('active'));
    if (thumbElement) thumbElement.classList.add('active');
}

// Toggle Product Accordion
function toggleAccordion(headerEl) {
    const item = headerEl.parentElement;
    item.classList.toggle('active');
}

// Universal initialization on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initStickyHeader();
    updateCartBadge();
    updateWishlistUI();

    // Mobile Navigation Drawer & Accordions
    initMobileAccordions();

    // Close modals on outside click
    document.addEventListener('click', (e) => {
        const searchModal = document.getElementById('searchModal');
        if (e.target === searchModal) closeSearchModal();

        const cartOverlay = document.getElementById('cartDrawerOverlay');
        if (e.target === cartOverlay) closeCartDrawer();

        const checkoutModal = document.getElementById('checkoutModal');
        if (e.target === checkoutModal) closeCheckoutModal();

        const filterOverlay = document.getElementById('filterDrawerOverlay');
        if (e.target === filterOverlay) closeFilterDrawer();
    });
});

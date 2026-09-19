/**
 * Sri Lakshmi Jewellers - Filter and Sort Management Engine
 * Dynamic multi-criteria filtering for jewellery catalogue with clean editorial product cards
 */

const activeFilters = {
    category: [],
    style: [],
    occasion: [],
    collection: [],
    priceRange: null,
    searchQuery: '',
    sortBy: 'featured'
};

// Parse URL query parameters on load
function initFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('category')) {
        activeFilters.category = [params.get('category')];
    }
    if (params.get('style')) {
        activeFilters.style = [params.get('style')];
    }
    if (params.get('occasion')) {
        activeFilters.occasion = [params.get('occasion')];
    }
    if (params.get('collection')) {
        activeFilters.collection = [params.get('collection')];
    }
    if (params.get('search')) {
        activeFilters.searchQuery = params.get('search');
    }
    if (params.get('sort')) {
        activeFilters.sortBy = params.get('sort');
    }
}

// Apply multi-faceted filtering & sorting logic
function filterProducts() {
    let result = getAllProducts();

    // 1. Search Query Filter
    if (activeFilters.searchQuery && activeFilters.searchQuery.trim() !== '') {
        const q = activeFilters.searchQuery.toLowerCase().trim();
        result = result.filter(p => 
            p.name.toLowerCase().includes(q) ||
            p.id.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.style.toLowerCase().includes(q) ||
            p.occasion.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
    }

    // 2. Category Filter
    if (activeFilters.category.length > 0) {
        result = result.filter(p => activeFilters.category.includes(p.category));
    }

    // 3. Style Filter
    if (activeFilters.style.length > 0) {
        result = result.filter(p => activeFilters.style.includes(p.style));
    }

    // 4. Occasion Filter
    if (activeFilters.occasion.length > 0) {
        result = result.filter(p => activeFilters.occasion.includes(p.occasion));
    }

    // 5. Collection Filter
    if (activeFilters.collection.length > 0) {
        result = result.filter(p => activeFilters.collection.includes(p.collection));
    }

    // 6. Price Range Filter
    if (activeFilters.priceRange) {
        switch (activeFilters.priceRange) {
            case 'under_1000':
                result = result.filter(p => p.price < 1000);
                break;
            case '1000_2500':
                result = result.filter(p => p.price >= 1000 && p.price <= 2500);
                break;
            case '2500_5000':
                result = result.filter(p => p.price > 2500 && p.price <= 5000);
                break;
            case '5000_10000':
                result = result.filter(p => p.price > 5000 && p.price <= 10000);
                break;
            case 'above_10000':
                result = result.filter(p => p.price > 10000);
                break;
        }
    }

    // 7. Sorting Logic
    switch (activeFilters.sortBy) {
        case 'price_low':
            result.sort((a, b) => a.price - b.price);
            break;
        case 'price_high':
            result.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            result.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
            break;
        case 'featured':
        default:
            result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
            break;
    }

    return result;
}

// Generate Universal Clean Editorial Product Card HTML
function createProductCardHTML(product) {
    const wishlist = getWishlist();
    const isWishlisted = wishlist.includes(product.id);
    const hoverImg = product.hoverImage || product.image;

    return `
        <article class="product-card" data-product-id="${product.id}">
            <div class="product-media">
                ${product.newArrival ? `<span class="product-badge">New</span>` : (product.featured ? `<span class="product-badge">Featured</span>` : '')}
                <button type="button" class="product-wishlist-btn ${isWishlisted ? 'active' : ''}" data-id="${product.id}" onclick="toggleWishlist('${product.id}')" aria-label="Add to Wishlist">
                    ${isWishlisted ? '♥' : '♡'}
                </button>
                <a href="product.html?id=${product.id}">
                    <img src="${product.image}" alt="${product.name}" class="product-primary-img" loading="lazy">
                    <img src="${hoverImg}" alt="${product.name} alternate view" class="product-hover-img" loading="lazy">
                </a>
                <a href="product.html?id=${product.id}" class="product-quick-view">View Details</a>
            </div>
            <div class="product-content">
                <div class="product-category-tag">${product.category} • ${product.style}</div>
                <h3 class="product-title">
                    <a href="product.html?id=${product.id}">${product.name}</a>
                </h3>
                <div class="product-pricing">
                    <span class="product-price-current">₹${product.price.toLocaleString('en-IN')}</span>
                    ${product.originalPrice ? `<span class="product-price-original">₹${product.originalPrice.toLocaleString('en-IN')}</span>` : ''}
                </div>
            </div>
        </article>
    `;
}

// Render Catalogue Grid and update counts & chips
function renderCatalogue() {
    const grid = document.getElementById('catalogueGrid');
    const countDisplay = document.getElementById('catalogueCount');
    const chipsBar = document.getElementById('activeFilterChips');

    if (!grid) return;

    const filtered = filterProducts();

    if (countDisplay) {
        countDisplay.innerHTML = `Showing <strong>${filtered.length}</strong> of <strong>${getAllProducts().length}</strong> Designs`;
    }

    // Render Filter Chips
    if (chipsBar) {
        let chipsHTML = [];
        
        if (activeFilters.searchQuery) {
            chipsHTML.push(`<span class="filter-chip">Search: "${activeFilters.searchQuery}" <span class="filter-chip-remove" onclick="removeFilter('search')">&times;</span></span>`);
        }
        activeFilters.category.forEach(cat => {
            chipsHTML.push(`<span class="filter-chip">${cat} <span class="filter-chip-remove" onclick="removeFilter('category', '${cat}')">&times;</span></span>`);
        });
        activeFilters.style.forEach(st => {
            chipsHTML.push(`<span class="filter-chip">${st} Style <span class="filter-chip-remove" onclick="removeFilter('style', '${st}')">&times;</span></span>`);
        });
        activeFilters.occasion.forEach(occ => {
            chipsHTML.push(`<span class="filter-chip">${occ} <span class="filter-chip-remove" onclick="removeFilter('occasion', '${occ}')">&times;</span></span>`);
        });
        activeFilters.collection.forEach(col => {
            chipsHTML.push(`<span class="filter-chip">${col} <span class="filter-chip-remove" onclick="removeFilter('collection', '${col}')">&times;</span></span>`);
        });
        if (activeFilters.priceRange) {
            let label = activeFilters.priceRange.replace('_', ' - ₹').replace('under_', 'Under ₹').replace('above_', 'Above ₹');
            chipsHTML.push(`<span class="filter-chip">${label} <span class="filter-chip-remove" onclick="removeFilter('price')">&times;</span></span>`);
        }

        chipsBar.innerHTML = chipsHTML.join('');
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="no-results-state">
                <div class="no-results-icon">💎</div>
                <h3>No Matching Jewellery Found</h3>
                <p>Try clearing some filters or searching for another style or collection.</p>
                <button type="button" class="btn btn-primary" onclick="clearAllFilters()">Clear All Filters</button>
            </div>
        `;
    } else {
        grid.innerHTML = filtered.map(product => createProductCardHTML(product)).join('');
    }
}

// Remove individual filter chip
function removeFilter(type, value) {
    if (type === 'search') {
        activeFilters.searchQuery = '';
    } else if (type === 'category') {
        activeFilters.category = activeFilters.category.filter(c => c !== value);
        uncheckFilterCheckbox('filter-category', value);
    } else if (type === 'style') {
        activeFilters.style = activeFilters.style.filter(s => s !== value);
        uncheckFilterCheckbox('filter-style', value);
    } else if (type === 'occasion') {
        activeFilters.occasion = activeFilters.occasion.filter(o => o !== value);
        uncheckFilterCheckbox('filter-occasion', value);
    } else if (type === 'collection') {
        activeFilters.collection = activeFilters.collection.filter(c => c !== value);
        uncheckFilterCheckbox('filter-collection', value);
    } else if (type === 'price') {
        activeFilters.priceRange = null;
        document.querySelectorAll('input[name="filter-price"]').forEach(el => el.checked = false);
    }
    renderCatalogue();
}

function uncheckFilterCheckbox(className, value) {
    document.querySelectorAll(`.${className}`).forEach(cb => {
        if (cb.value === value) cb.checked = false;
    });
}

// Clear all active filters
function clearAllFilters() {
    activeFilters.category = [];
    activeFilters.style = [];
    activeFilters.occasion = [];
    activeFilters.collection = [];
    activeFilters.priceRange = null;
    activeFilters.searchQuery = '';
    
    document.querySelectorAll('.filter-drawer input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('.filter-drawer input[type="radio"]').forEach(rb => rb.checked = false);
    
    renderCatalogue();
}

// Open/Close filter drawer
function openFilterDrawer() {
    const drawer = document.getElementById('filterDrawer');
    const overlay = document.getElementById('filterDrawerOverlay');
    if (drawer && overlay) {
        drawer.classList.add('open');
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeFilterDrawer() {
    const drawer = document.getElementById('filterDrawer');
    const overlay = document.getElementById('filterDrawerOverlay');
    if (drawer && overlay) {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }
}

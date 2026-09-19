/**
 * Sri Lakshmi Jewellers - Client-Side Search Engine
 * Search across Title, SKU, Category, Style, Occasion, Description
 */

function performClientSearch(query) {
    if (!query || query.trim() === '') return [];
    
    const cleanQuery = query.toLowerCase().trim();
    const allProducts = getAllProducts();

    return allProducts.filter(product => {
        const titleMatch = product.name.toLowerCase().includes(cleanQuery);
        const idMatch = product.id.toLowerCase().includes(cleanQuery);
        const catMatch = product.category.toLowerCase().includes(cleanQuery);
        const styleMatch = product.style.toLowerCase().includes(cleanQuery);
        const occMatch = product.occasion.toLowerCase().includes(cleanQuery);
        const descMatch = product.description.toLowerCase().includes(cleanQuery);

        return titleMatch || idMatch || catMatch || styleMatch || occMatch || descMatch;
    });
}

// Open Search Modal
function openSearchModal(initialQuery = '') {
    const modal = document.getElementById('searchModal');
    const input = document.getElementById('modalSearchInput');
    if (!modal) return;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    if (input) {
        input.value = initialQuery;
        setTimeout(() => input.focus(), 150);
        handleSearchInputChange(initialQuery);
    }
}

// Close Search Modal
function closeSearchModal() {
    const modal = document.getElementById('searchModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// Handle dynamic input typing in modal
function handleSearchInputChange(query) {
    const resultsContainer = document.getElementById('modalSearchResults');
    const tagSection = document.getElementById('searchPopularTags');
    
    if (!resultsContainer) return;

    if (!query || query.trim().length === 0) {
        resultsContainer.innerHTML = '';
        if (tagSection) tagSection.style.display = 'block';
        return;
    }

    if (tagSection) tagSection.style.display = 'none';

    const matches = performClientSearch(query);

    if (matches.length === 0) {
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--color-text-muted);">
                <p style="font-size: 1.1rem; margin-bottom: 8px;">No jewellery found matching "<strong>${query}</strong>"</p>
                <p style="font-size: 0.85rem;">Try searching for "Haram", "Jhumka", "Bridal", or "Temple"</p>
            </div>
        `;
        return;
    }

    resultsContainer.innerHTML = `
        <div style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 12px;">
            Showing <strong>${matches.length}</strong> designs found:
        </div>
        <div class="search-results-grid">
            ${matches.map(item => `
                <a href="product.html?id=${item.id}" class="search-result-item" onclick="closeSearchModal()">
                    <img src="${item.image}" alt="${item.name}" class="search-result-img">
                    <div class="search-result-info">
                        <h6>${item.name}</h6>
                        <div style="font-size: 0.75rem; color: var(--color-gold-dark); margin-bottom: 2px;">${item.category} • ${item.style}</div>
                        <div class="search-result-price">₹${item.price.toLocaleString('en-IN')}</div>
                    </div>
                </a>
            `).join('')}
        </div>
    `;
}

// Initialize search bindings
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('modalSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            handleSearchInputChange(e.target.value);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeSearchModal();
            if (e.key === 'Enter') {
                e.preventDefault();
                const q = searchInput.value.trim();
                if (q) {
                    window.location.href = `jewellery.html?search=${encodeURIComponent(q)}`;
                }
            }
        });
    }

    // Bind all search modal open triggers
    document.querySelectorAll('.open-search-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openSearchModal();
        });
    });
});

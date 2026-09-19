/**
 * Sri Lakshmi Jewellers - Client-Side Cart Management (localStorage)
 */

const CART_STORAGE_KEY = 'slj_jewellery_cart';
const WISHLIST_STORAGE_KEY = 'slj_jewellery_wishlist';

// Get Cart from localStorage
function getCart() {
    try {
        const data = localStorage.getItem(CART_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Could not read cart from localStorage", e);
        return [];
    }
}

// Save Cart to localStorage
function saveCart(cart) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        updateCartBadge();
        renderCartDrawer();
    } catch (e) {
        console.error("Could not save cart to localStorage", e);
    }
}

// Add Item to Cart
function addToCart(productId, quantity = 1) {
    const product = getProductById(productId);
    if (!product) {
        showToast("Product not found");
        return;
    }

    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.id.toUpperCase() === product.id.toUpperCase());

    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            quantity: quantity
        });
    }

    saveCart(cart);
    showToast(`Added "${product.name}" to Bag!`);
    openCartDrawer();
}

// Remove Item from Cart
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id.toUpperCase() !== productId.toUpperCase());
    saveCart(cart);
    showToast("Item removed from Bag");
}

// Update Item Quantity
function updateCartItemQty(productId, newQty) {
    let cart = getCart();
    const index = cart.findIndex(item => item.id.toUpperCase() === productId.toUpperCase());

    if (index > -1) {
        if (newQty <= 0) {
            cart.splice(index, 1);
        } else {
            cart[index].quantity = newQty;
        }
        saveCart(cart);
    }
}

// Clear entire Cart
function clearCart() {
    saveCart([]);
    showToast("Bag emptied");
}

// Compute Subtotal
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Update Cart Badge Count in Header & Bottom Bar
function updateCartBadge() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    document.querySelectorAll('.cart-badge-count').forEach(el => {
        el.textContent = totalCount;
        el.style.display = totalCount > 0 ? 'flex' : 'none';
    });
}

// Open & Close Cart Drawer
function openCartDrawer() {
    renderCartDrawer();
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartDrawerOverlay');
    if (drawer && overlay) {
        drawer.classList.add('open');
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartDrawerOverlay');
    if (drawer && overlay) {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// Render Cart Drawer HTML
function renderCartDrawer() {
    const cartContainer = document.getElementById('cartDrawerItems');
    const subtotalEl = document.getElementById('cartSubtotal');
    const footerEl = document.getElementById('cartDrawerFooter');

    if (!cartContainer) return;

    const cart = getCart();
    const total = getCartTotal();

    if (subtotalEl) {
        subtotalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
    }

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="cart-empty-state">
                <div class="cart-empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                </div>
                <h4 style="font-family: var(--font-heading); font-size: 1.2rem; margin-bottom: 8px;">Your Shopping Bag is Empty</h4>
                <p style="font-size: 0.88rem; color: var(--color-text-muted); margin-bottom: 20px;">Explore our handcrafted collections and add your favorite jewellery pieces.</p>
                <a href="jewellery.html" class="btn btn-primary" onclick="closeCartDrawer()">Explore Collection</a>
            </div>
        `;
        if (footerEl) footerEl.style.display = 'none';
    } else {
        if (footerEl) footerEl.style.display = 'block';

        cartContainer.innerHTML = `
            <div class="cart-items-list">
                ${cart.map(item => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                        <div class="cart-item-details">
                            <h6><a href="product.html?id=${item.id}">${item.name}</a></h6>
                            <div class="cart-item-sku">SKU: ${item.id}</div>
                            <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
                            <div class="cart-qty-control">
                                <button type="button" class="qty-btn" onclick="updateCartItemQty('${item.id}', ${item.quantity - 1})">-</button>
                                <span class="qty-count">${item.quantity}</span>
                                <button type="button" class="qty-btn" onclick="updateCartItemQty('${item.id}', ${item.quantity + 1})">+</button>
                            </div>
                        </div>
                        <button type="button" class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Remove item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Wishlist Functionality
function getWishlist() {
    try {
        const data = localStorage.getItem(WISHLIST_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function toggleWishlist(productId) {
    let wishlist = getWishlist();
    const index = wishlist.indexOf(productId);

    if (index > -1) {
        wishlist.splice(index, 1);
        showToast("Removed from Wishlist");
    } else {
        wishlist.push(productId);
        showToast("Added to Wishlist ♡");
    }

    try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
        updateWishlistUI();
    } catch (e) {
        console.error(e);
    }
}

function updateWishlistUI() {
    const wishlist = getWishlist();
    document.querySelectorAll('.wishlist-badge-count').forEach(el => {
        el.textContent = wishlist.length;
        el.style.display = wishlist.length > 0 ? 'flex' : 'none';
    });

    document.querySelectorAll('.product-wishlist-btn').forEach(btn => {
        const pid = btn.dataset.id;
        if (pid && wishlist.includes(pid)) {
            btn.classList.add('active');
            btn.innerHTML = '♥';
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '♡';
        }
    });
}

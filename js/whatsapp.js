/**
 * Sri Lakshmi Jewellers - WhatsApp Integration & Customer Details Form
 * Structured pre-filled enquiry generator with clean customer modal
 */

const WHATSAPP_CONFIG = {
    phone: "919876543210", // Configurable showroom WhatsApp contact number
    storeName: "Sri Lakshmi Jewellers",
    location: "Guntur, Andhra Pradesh"
};

// Open Enquiry modal for single product
function openSingleProductEnquiry(productId) {
    const product = getProductById(productId);
    if (!product) return;

    const modal = document.getElementById('checkoutModal');
    if (!modal) return;

    modal.dataset.enquiryType = "single";
    modal.dataset.productId = productId;
    
    const modalTitle = modal.querySelector('.checkout-modal-title');
    if (modalTitle) {
        modalTitle.textContent = `Enquire on WhatsApp`;
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

// Open Enquiry modal for entire cart
function openCartEnquiry() {
    const cart = getCart();
    if (cart.length === 0) {
        showToast("Your shopping bag is empty! Please add pieces to enquire.");
        return;
    }

    const modal = document.getElementById('checkoutModal');
    if (!modal) return;

    modal.dataset.enquiryType = "cart";
    
    const modalTitle = modal.querySelector('.checkout-modal-title');
    if (modalTitle) {
        modalTitle.textContent = `Enquire on Bag (${cart.length} items)`;
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

// Close Enquiry modal
function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// Build and dispatch the structured WhatsApp message
function handleWhatsAppSubmission(e) {
    if (e) e.preventDefault();

    const name = document.getElementById('custName')?.value.trim();
    const phone = document.getElementById('custPhone')?.value.trim();
    const city = document.getElementById('custCity')?.value.trim() || 'Guntur';
    const pincode = document.getElementById('custPin')?.value.trim() || '';
    const address = document.getElementById('custAddress')?.value.trim() || '';
    const note = document.getElementById('custNotes')?.value.trim() || '';

    if (!name || !phone) {
        showToast("Please provide your name and mobile number.");
        return;
    }

    const modal = document.getElementById('checkoutModal');
    const enquiryType = modal?.dataset.enquiryType || 'cart';
    let message = "";

    if (enquiryType === 'single') {
        const productId = modal?.dataset.productId;
        const product = getProductById(productId);
        const qty = parseInt(document.getElementById('detailQuantity')?.textContent || '1', 10);

        if (!product) {
            showToast("Product not found!");
            return;
        }

        message = `Hello ${WHATSAPP_CONFIG.storeName},

I am interested in:

*Product:* ${product.name}
*Product ID:* ${product.id}
*Price:* ₹${product.price.toLocaleString('en-IN')}
*Quantity:* ${qty}

*Customer:* ${name}
*Mobile:* ${phone}
*City:* ${city}
${pincode ? `*Pincode:* ${pincode}\n` : ''}${address ? `*Address:* ${address}\n` : ''}${note ? `*Note:* ${note}\n` : ''}
Please confirm availability and final details.

Thank you.`;

    } else {
        // Cart Enquiry
        const cart = getCart();
        const total = getCartTotal();

        let itemsText = cart.map((item, idx) => {
            return `${idx + 1}. *${item.name}* (ID: ${item.id})\n   Qty: ${item.quantity} × ₹${item.price.toLocaleString('en-IN')} = ₹${(item.price * item.quantity).toLocaleString('en-IN')}`;
        }).join('\n\n');

        message = `Hello ${WHATSAPP_CONFIG.storeName},

I would like to enquire about my shopping bag:

🛍️ *SELECTED ITEMS*
${itemsText}

💰 *TOTAL ESTIMATE:* ₹${total.toLocaleString('en-IN')}

👤 *CUSTOMER DETAILS*
*Name:* ${name}
*Mobile:* ${phone}
*City:* ${city}
${pincode ? `*Pincode:* ${pincode}\n` : ''}${address ? `*Address:* ${address}\n` : ''}${note ? `*Note:* ${note}\n` : ''}
Please confirm availability, dispatch timelines, and payment options.

Thank you.`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_CONFIG.phone}?text=${encodedMessage}`;

    closeCheckoutModal();
    window.open(whatsappUrl, '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('customerEnquiryForm');
    if (form) {
        form.addEventListener('submit', handleWhatsAppSubmission);
    }
});

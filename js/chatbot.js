/**
 * Sri Lakshmi Jewellers — Jewellery Shopping Assistant (Chatbot)
 * Rule-based, fully static, no external dependencies.
 * Supports both cb-open and open class names for backwards compatibility.
 */
(function () {
    'use strict';

    // ─── Configuration ───────────────────────────────────────────────────────
    var CFG = {
        whatsappNumber: '919876543210',
        storeName: 'Sri Lakshmi Jewellers',
        storeCity: 'Guntur, Andhra Pradesh',
        storeAddress: 'Main Bazaar Road, Near Old Bus Stand, Guntur, AP – 522001',
        storePhone: '+91 98765 43210',
        mapsUrl: 'https://maps.google.com/?q=Sri+Lakshmi+Jewellers+Guntur'
    };

    // ─── State ────────────────────────────────────────────────────────────────
    var isOpen = false;
    var isMinimized = false;

    // ─── DOM Refs ─────────────────────────────────────────────────────────────
    var fab, win, body, input;

    // ─── Helpers ─────────────────────────────────────────────────────────────
    function qs(sel) { return document.querySelector(sel); }

    function scrollBottom() {
        if (body) body.scrollTop = body.scrollHeight;
    }

    function fmt(n) {
        return '₹' + n.toLocaleString('en-IN');
    }

    // ─── Product Filtering ───────────────────────────────────────────────────
    function getProducts() {
        if (typeof getAllProducts === 'function') return getAllProducts();
        if (typeof PRODUCTS !== 'undefined') return PRODUCTS;
        return [];
    }

    function filterProducts(filters) {
        var results = getProducts();
        if (filters.category) {
            results = results.filter(function (p) {
                return p.category && p.category.toLowerCase().indexOf(filters.category.toLowerCase()) !== -1;
            });
        }
        if (filters.occasion) {
            results = results.filter(function (p) {
                return (p.occasion && p.occasion.toLowerCase().indexOf(filters.occasion.toLowerCase()) !== -1) ||
                       (p.collection && p.collection.toLowerCase().indexOf(filters.occasion.toLowerCase()) !== -1);
            });
        }
        if (filters.style) {
            results = results.filter(function (p) {
                return p.style && p.style.toLowerCase().indexOf(filters.style.toLowerCase()) !== -1;
            });
        }
        if (filters.maxPrice != null) {
            results = results.filter(function (p) { return p.price <= filters.maxPrice; });
        }
        if (filters.minPrice != null) {
            results = results.filter(function (p) { return p.price >= filters.minPrice; });
        }
        if (filters.newArrival) {
            results = results.filter(function (p) { return p.newArrival; });
        }
        return results;
    }

    // ─── Message Rendering ───────────────────────────────────────────────────
    function addUserMsg(text) {
        var div = document.createElement('div');
        div.className = 'cb-msg cb-msg--user';
        div.textContent = text;
        body.appendChild(div);
        scrollBottom();
    }

    function renderProductCards(products, totalCount, allHref) {
        if (!products.length) return '';
        var html = '<div class="cb-products">';
        products.slice(0, 3).forEach(function (p) {
            var waText = encodeURIComponent(
                'Namaste ' + CFG.storeName + ',\n\nI am interested in:\nProduct: ' +
                p.name + '\nID: ' + p.id + '\nPrice: ' + fmt(p.price) +
                '\n\nPlease share more details. Thank you.'
            );
            var waHref = 'https://wa.me/' + CFG.whatsappNumber + '?text=' + waText;
            html += '<div class="cb-product-card">' +
                '<img src="' + p.image + '" alt="' + p.name + '" class="cb-product-img" loading="lazy">' +
                '<div class="cb-product-info">' +
                '<div class="cb-product-name">' + p.name + '</div>' +
                '<div class="cb-product-price">' + fmt(p.price) + '</div>' +
                '<div class="cb-product-actions">' +
                '<a href="product.html?id=' + p.id + '" class="cb-btn cb-btn--sm">View</a>' +
                '<a href="' + waHref + '" target="_blank" rel="noopener noreferrer" class="cb-btn cb-btn--sm cb-btn--wa">WhatsApp</a>' +
                '</div>' +
                '</div>' +
                '</div>';
        });
        html += '</div>';
        if (totalCount > 3 && allHref) {
            html += '<a href="' + allHref + '" class="cb-view-all">View all ' + totalCount + ' results →</a>';
        }
        return html;
    }

    function addBotMsg(text, quickReplies, productsHTML) {
        var wrap = document.createElement('div');
        wrap.className = 'cb-msg cb-msg--bot';

        var bubble = document.createElement('div');
        bubble.className = 'cb-bubble';
        bubble.innerHTML = text;

        if (productsHTML) {
            var pDiv = document.createElement('div');
            pDiv.innerHTML = productsHTML;
            bubble.appendChild(pDiv);
        }

        wrap.appendChild(bubble);

        if (quickReplies && quickReplies.length) {
            var qr = document.createElement('div');
            qr.className = 'cb-quick-replies';
            quickReplies.forEach(function (reply) {
                var btn = document.createElement('button');
                btn.className = 'cb-qr-btn';
                btn.textContent = reply.label;
                btn.addEventListener('click', function () {
                    addUserMsg(reply.label);
                    if (reply.action) {
                        reply.action();
                    } else {
                        processMsg(reply.value || reply.label);
                    }
                });
                qr.appendChild(btn);
            });
            wrap.appendChild(qr);
        }

        body.appendChild(wrap);
        scrollBottom();
    }

    // ─── Quick Reply Helpers ─────────────────────────────────────────────────
    function mainMenuReplies() {
        return [
            { label: 'Bridal Jewellery', value: 'bridal' },
            { label: 'Necklaces', value: 'necklace' },
            { label: 'Earrings', value: 'earrings' },
            { label: 'Under ₹2,500', value: 'under 2500' },
            { label: 'Daily Wear', value: 'daily wear' },
            { label: 'New Arrivals', value: 'new arrivals' },
            { label: 'WhatsApp Us', action: openWhatsApp }
        ];
    }

    function budgetReplies() {
        return [
            { label: 'Under ₹1,000', value: 'under 1000' },
            { label: '₹1,000–₹2,500', value: '1000 to 2500' },
            { label: '₹2,500–₹5,000', value: '2500 to 5000' },
            { label: '₹5,000–₹10,000', value: '5000 to 10000' },
            { label: 'Above ₹10,000', value: 'above 10000' }
        ];
    }

    function afterResultsReplies(allHref) {
        var replies = [
            { label: 'Try Another Style', value: 'help' },
            { label: 'Change Budget', value: 'budget' },
            { label: 'WhatsApp Us', action: openWhatsApp }
        ];
        if (allHref) {
            replies.unshift({
                label: 'View More',
                action: function () { window.location.href = allHref; }
            });
        }
        return replies;
    }

    // ─── WhatsApp Action ─────────────────────────────────────────────────────
    function openWhatsApp() {
        var text = encodeURIComponent('Namaste ' + CFG.storeName + ',\n\nI would like to enquire about your jewellery collection.\n\nThank you.');
        window.open('https://wa.me/' + CFG.whatsappNumber + '?text=' + text, '_blank', 'noopener');
    }

    // ─── Message Processing ──────────────────────────────────────────────────
    function processMsg(raw) {
        var t = (raw || '').toLowerCase().trim();

        // Greeting
        if (/^(hi|hello|hey|namaste|helo|hai)/.test(t)) {
            addBotMsg(
                'Namaste! 🙏 How can I help you today?<br>Browse by category, occasion or budget.',
                mainMenuReplies()
            );
            return;
        }

        // Bridal
        if (/bridal|wedding|bride|muhurtham|shaadi|vivah/.test(t)) {
            var bridalFilters = { occasion: 'Bridal' };
            var bridalAll = filterProducts(bridalFilters);
            addBotMsg(
                '👑 <strong>Bridal Collection</strong><br>We have ' + bridalAll.length + ' exquisite bridal pieces. Here are some highlights:',
                afterResultsReplies('bridal.html'),
                renderProductCards(bridalAll, bridalAll.length, 'bridal.html')
            );
            return;
        }

        // Necklace / Haram
        if (/haram|harams|long necklace/.test(t)) {
            var hAll = filterProducts({ category: 'Harams' });
            addBotMsg(
                '📿 <strong>Harams</strong><br>Grand statement necklaces for special occasions.',
                afterResultsReplies('jewellery.html?category=Harams'),
                renderProductCards(hAll, hAll.length, 'jewellery.html?category=Harams')
            );
            return;
        }
        if (/necklace|necklaces|haar|mala|choker/.test(t)) {
            var nAll = filterProducts({ category: 'Necklaces' });
            addBotMsg(
                '📿 <strong>Necklaces</strong><br>We have ' + nAll.length + ' necklace styles — traditional, temple, contemporary and more.',
                afterResultsReplies('jewellery.html?category=Necklaces'),
                renderProductCards(nAll, nAll.length, 'jewellery.html?category=Necklaces')
            );
            return;
        }

        // Jhumka
        if (/jhumka|jhumkas|jhumki/.test(t)) {
            var jAll = filterProducts({ category: 'Jhumkas' });
            addBotMsg(
                '✨ <strong>Jhumkas</strong><br>Classic South Indian drops in temple, antique and lightweight styles.',
                afterResultsReplies('jewellery.html?category=Jhumkas'),
                renderProductCards(jAll, jAll.length, 'jewellery.html?category=Jhumkas')
            );
            return;
        }

        // Earrings
        if (/earring|earrings|ear/.test(t)) {
            var eAll = filterProducts({ category: 'Earrings' });
            var jAll2 = filterProducts({ category: 'Jhumkas' });
            var earAll = eAll.concat(jAll2);
            addBotMsg(
                '✨ <strong>Earrings &amp; Jhumkas</strong><br>' + earAll.length + ' styles available.',
                afterResultsReplies('jewellery.html?category=Earrings'),
                renderProductCards(earAll, earAll.length, 'jewellery.html?category=Earrings')
            );
            return;
        }

        // Bangles
        if (/bangle|bangles|kangan|kada/.test(t)) {
            var bAll = filterProducts({ category: 'Bangles' });
            addBotMsg(
                '💛 <strong>Bangles</strong><br>Stacking sets and standalone kadas in gold finish.',
                afterResultsReplies('jewellery.html?category=Bangles'),
                renderProductCards(bAll, bAll.length, 'jewellery.html?category=Bangles')
            );
            return;
        }

        // Rings
        if (/\bring\b|rings|anguthi/.test(t)) {
            var rAll = filterProducts({ category: 'Rings' });
            addBotMsg(
                '💍 <strong>Rings</strong><br>Statement and stacking rings in traditional and contemporary styles.',
                afterResultsReplies('jewellery.html?category=Rings'),
                renderProductCards(rAll, rAll.length, 'jewellery.html?category=Rings')
            );
            return;
        }

        // Chains
        if (/chain|chains/.test(t)) {
            var cAll = filterProducts({ category: 'Chains' });
            addBotMsg(
                '🔗 <strong>Chains</strong><br>Delicate and bold chains in micro gold finish.',
                afterResultsReplies('jewellery.html?category=Chains'),
                renderProductCards(cAll, cAll.length, 'jewellery.html?category=Chains')
            );
            return;
        }

        // New arrivals
        if (/new arriv|latest|just arrived/.test(t)) {
            var newAll = filterProducts({ newArrival: true });
            addBotMsg(
                '🌟 <strong>New Arrivals</strong><br>Just in from our ateliers.',
                afterResultsReplies('jewellery.html?sort=newest'),
                renderProductCards(newAll, newAll.length, 'jewellery.html?sort=newest')
            );
            return;
        }

        // Budget — budget selector
        if (/budget|price range|how much|affordabl|cheap/.test(t) && !/under|below|\d/.test(t)) {
            addBotMsg(
                '💰 What is your budget? Select a range:',
                budgetReplies()
            );
            return;
        }

        // Price ranges
        if (/under 1000|below 1000|upto 1000/.test(t)) {
            var p1 = filterProducts({ maxPrice: 1000 });
            addBotMsg(
                '💰 <strong>Under ₹1,000</strong><br>' + (p1.length || 'Some') + ' designs found.',
                afterResultsReplies('jewellery.html?price=under_1000'),
                renderProductCards(p1, p1.length, 'jewellery.html?price=under_1000')
            );
            return;
        }
        if (/1000.*2500|under 2500|below 2500|upto 2500/.test(t)) {
            var p2 = filterProducts({ minPrice: 1000, maxPrice: 2500 });
            addBotMsg(
                '💰 <strong>₹1,000 – ₹2,500</strong><br>' + p2.length + ' designs found.',
                afterResultsReplies('jewellery.html?price=1000_2500'),
                renderProductCards(p2, p2.length, 'jewellery.html?price=1000_2500')
            );
            return;
        }
        if (/2500.*5000|under 5000|below 5000|upto 5000/.test(t)) {
            var p3 = filterProducts({ minPrice: 2500, maxPrice: 5000 });
            addBotMsg(
                '💰 <strong>₹2,500 – ₹5,000</strong><br>' + p3.length + ' designs found.',
                afterResultsReplies('jewellery.html?price=2500_5000'),
                renderProductCards(p3, p3.length, 'jewellery.html?price=2500_5000')
            );
            return;
        }
        if (/5000.*10000|under 10000|below 10000|upto 10000/.test(t)) {
            var p4 = filterProducts({ minPrice: 5000, maxPrice: 10000 });
            addBotMsg(
                '💰 <strong>₹5,000 – ₹10,000</strong><br>' + p4.length + ' designs found.',
                afterResultsReplies('jewellery.html?price=5000_10000'),
                renderProductCards(p4, p4.length, 'jewellery.html?price=5000_10000')
            );
            return;
        }
        if (/above 10000|over 10000|premium|luxury/.test(t)) {
            var p5 = filterProducts({ minPrice: 10000 });
            addBotMsg(
                '💎 <strong>Premium Collection (Above ₹10,000)</strong><br>' + p5.length + ' designs found.',
                afterResultsReplies('jewellery.html?price=above_10000'),
                renderProductCards(p5, p5.length, 'jewellery.html?price=above_10000')
            );
            return;
        }

        // Occasion
        if (/daily wear|everyday|office|casual|regular/.test(t)) {
            var dAll = filterProducts({ occasion: 'Daily' });
            addBotMsg(
                '🌸 <strong>Daily Wear</strong><br>Lightweight pieces designed for all-day comfort.',
                afterResultsReplies('jewellery.html?occasion=Daily'),
                renderProductCards(dAll, dAll.length, 'jewellery.html?occasion=Daily')
            );
            return;
        }
        if (/festive|festival|puja|pooja|diwali|navratri|ugadi/.test(t)) {
            var fAll = filterProducts({ occasion: 'Festive' });
            addBotMsg(
                '🪔 <strong>Festive Collection</strong><br>Traditional temple and antique designs for poojas and celebrations.',
                afterResultsReplies('jewellery.html?occasion=Festive'),
                renderProductCards(fAll, fAll.length, 'jewellery.html?occasion=Festive')
            );
            return;
        }
        if (/party|cocktail|function/.test(t)) {
            var paAll = filterProducts({ occasion: 'Party' });
            addBotMsg(
                '🎉 <strong>Party &amp; Occasion</strong><br>Statement pieces for cocktail parties and functions.',
                afterResultsReplies('jewellery.html?occasion=Party'),
                renderProductCards(paAll, paAll.length, 'jewellery.html?occasion=Party')
            );
            return;
        }
        if (/gift|gifting|present/.test(t)) {
            var gAll = filterProducts({ occasion: 'Gifting' });
            addBotMsg(
                '🎁 <strong>Gifting</strong><br>Thoughtfully curated jewellery gifts presented in signature packaging.',
                afterResultsReplies('jewellery.html?occasion=Gifting'),
                renderProductCards(gAll, gAll.length, 'jewellery.html?occasion=Gifting')
            );
            return;
        }

        // Style
        if (/temple|nakshi/.test(t)) {
            var tAll = filterProducts({ style: 'Temple' });
            addBotMsg(
                '🛕 <strong>Temple Nakshi</strong><br>Intricate god motif carvings with authentic matte gold finish.',
                afterResultsReplies('jewellery.html?style=Temple'),
                renderProductCards(tAll, tAll.length, 'jewellery.html?style=Temple')
            );
            return;
        }
        if (/antique|traditional|vintage/.test(t)) {
            var aAll = filterProducts({ style: 'Antique' });
            addBotMsg(
                '🏺 <strong>Antique &amp; Traditional</strong><br>Heritage-inspired jewellery with oxidised finishes.',
                afterResultsReplies('jewellery.html?style=Antique'),
                renderProductCards(aAll, aAll.length, 'jewellery.html?style=Antique')
            );
            return;
        }

        // Location
        if (/where|location|address|store|shop|showroom|find us/.test(t)) {
            addBotMsg(
                '📍 <strong>' + CFG.storeName + '</strong><br>' +
                CFG.storeAddress + '<br><br>' +
                '⏰ Mon–Sat: 10AM–8:30PM | Sun: 11AM–6PM',
                [
                    { label: 'Get Directions', action: function () { window.open(CFG.mapsUrl, '_blank', 'noopener'); } },
                    { label: 'Call Us', action: function () { window.location.href = 'tel:' + CFG.storePhone.replace(/\s/g, ''); } },
                    { label: 'WhatsApp Us', action: openWhatsApp }
                ]
            );
            return;
        }

        // Contact / Phone / WhatsApp
        if (/call|phone|contact|number|whatsapp|wa|reach/.test(t)) {
            addBotMsg(
                '📞 You can reach us at:<br>' +
                '<strong>' + CFG.storePhone + '</strong><br>' +
                'Or chat with us on WhatsApp for instant assistance.',
                [
                    { label: 'Call Us', action: function () { window.location.href = 'tel:' + CFG.storePhone.replace(/\s/g, ''); } },
                    { label: 'WhatsApp Us', action: openWhatsApp }
                ]
            );
            return;
        }

        // Browse all / help
        if (/help|assist|support|what can you|browse all/.test(t)) {
            addBotMsg(
                'I can help you with:<br>' +
                '• Find jewellery by <strong>category</strong><br>' +
                '• Shop by <strong>occasion</strong><br>' +
                '• Filter by <strong>budget</strong><br>' +
                '• Discover <strong>bridal collections</strong><br>' +
                '• Connect on <strong>WhatsApp</strong>',
                mainMenuReplies()
            );
            return;
        }

        // Budget keyword shortcut
        if (/budget/.test(t)) {
            addBotMsg('What is your budget? Choose a range:', budgetReplies());
            return;
        }

        // Fallback
        addBotMsg(
            'I didn\'t quite catch that. 🙏<br>Would you like to browse our jewellery collections?',
            mainMenuReplies()
        );
    }

    // ─── Send Message ────────────────────────────────────────────────────────
    function sendMsg() {
        if (!input) return;
        var text = input.value.trim();
        if (!text) return;
        input.value = '';
        addUserMsg(text);
        processMsg(text);
    }

    // ─── Toggle / Open / Close ───────────────────────────────────────────────
    window.toggleChatbot = function () {
        if (isOpen && !isMinimized) {
            closeChatbot();
        } else {
            openChatbot();
        }
    };

    window.openChatbot = function () {
        if (!win) return;
        isOpen = true;
        isMinimized = false;
        win.classList.add('cb-open');
        win.classList.add('open');   /* backwards compat */
        win.removeAttribute('aria-hidden');
        fab.classList.add('cb-fab--active');
        if (input) input.focus();
        scrollBottom();
    };

    window.closeChatbot = function () {
        if (!win) return;
        isOpen = false;
        isMinimized = false;
        win.classList.remove('cb-open');
        win.classList.remove('open');
        win.setAttribute('aria-hidden', 'true');
        fab.classList.remove('cb-fab--active');
    };

    window.minimizeChatbot = function () {
        if (!win) return;
        isMinimized = true;
        win.classList.remove('cb-open');
        win.classList.remove('open');
        fab.classList.remove('cb-fab--active');
    };

    window.handleChatInput = function (e) {
        if (e.key === 'Enter') { sendMsg(); }
    };

    window.sendChatMessage = function () { sendMsg(); };

    // ─── Init ─────────────────────────────────────────────────────────────────
    function init() {
        fab = document.getElementById('chatbotFab');
        win = document.getElementById('chatbotWindow');
        body = document.getElementById('chatbotBody');
        input = document.getElementById('chatbotInput');

        if (!fab || !win || !body) return;

        // Welcome message
        addBotMsg(
            'Namaste! 👋 Welcome to <strong>' + CFG.storeName + '</strong>.<br><br>' +
            'I\'m your jewellery assistant. I can help you find jewellery by category, occasion or budget.',
            mainMenuReplies()
        );
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
